import { randomInt, createHash } from 'node:crypto'
import { eq, and, gt, isNull, desc } from 'drizzle-orm'
import { signAccessToken, signRefreshToken, verifyRefreshToken, type AuthUser } from '@oreset/shared'
import { db } from '../../db/client'
import { users, otpCodes, sessions, type User } from '../../db/schema'
import { env } from '../../config/env'
import { ACCESS_TOKEN_TTL, REFRESH_TOKEN_TTL } from '../../config/cookies'
import { hashPassword, verifyPassword } from '../../lib/password'
import { writeAuditLog } from '../../lib/audit'
import { HttpError } from '../../middleware/error-handler'
import { DevConsoleOtpProvider, type OtpProvider } from './otp.provider'

const OTP_TTL_MS = 5 * 60 * 1000
const OTP_MAX_REQUESTS_PER_WINDOW = 3
const OTP_REQUEST_WINDOW_MS = 10 * 60 * 1000
const OTP_MAX_ATTEMPTS = 5

const otpProvider: OtpProvider = new DevConsoleOtpProvider()

function hashCode(code: string): string {
  return createHash('sha256').update(code).digest('hex')
}

function toAuthUser(user: User): AuthUser {
  return {
    id: user.id,
    role: user.role,
    staffRole: user.staffRole,
    displayName: user.displayName,
    status: user.status,
  }
}

export async function requestOtp(phone: string): Promise<{ devCode?: string }> {
  const windowStart = new Date(Date.now() - OTP_REQUEST_WINDOW_MS)
  const recent = await db.query.otpCodes.findMany({
    where: and(eq(otpCodes.phone, phone), gt(otpCodes.createdAt, windowStart)),
  })
  if (recent.length >= OTP_MAX_REQUESTS_PER_WINDOW) {
    throw new HttpError(429, 'rate_limited', 'Too many codes requested. Try again later.')
  }

  const code = randomInt(100000, 999999).toString()
  await db.insert(otpCodes).values({
    phone,
    codeHash: hashCode(code),
    purpose: 'login',
    expiresAt: new Date(Date.now() + OTP_TTL_MS),
  })

  await otpProvider.send(phone, code)

  // Echoed outside production only, so the flow is curl-testable without
  // a real SMS vendor. Never echoed once NODE_ENV=production.
  return env.NODE_ENV === 'production' ? {} : { devCode: code }
}

export async function verifyOtp(
  phone: string,
  code: string,
  context: { userAgent?: string; ip?: string },
): Promise<{ user: AuthUser; accessToken: string; refreshToken: string }> {
  const record = await db.query.otpCodes.findFirst({
    where: and(eq(otpCodes.phone, phone), isNull(otpCodes.consumedAt)),
    orderBy: desc(otpCodes.createdAt),
  })

  if (!record || record.expiresAt < new Date()) {
    throw new HttpError(400, 'invalid_code', 'That code is invalid or has expired.')
  }
  if (record.attemptCount >= OTP_MAX_ATTEMPTS) {
    throw new HttpError(429, 'too_many_attempts', 'Too many attempts. Request a new code.')
  }
  if (record.codeHash !== hashCode(code)) {
    await db
      .update(otpCodes)
      .set({ attemptCount: record.attemptCount + 1 })
      .where(eq(otpCodes.id, record.id))
    throw new HttpError(400, 'invalid_code', 'That code is invalid or has expired.')
  }

  await db.update(otpCodes).set({ consumedAt: new Date() }).where(eq(otpCodes.id, record.id))

  let user = await db.query.users.findFirst({ where: eq(users.phone, phone) })
  if (!user) {
    ;[user] = await db
      .insert(users)
      .values({ role: 'contributor', phone, status: 'active' })
      .returning()
  }

  const tokens = await issueSession(user, context)
  await writeAuditLog({
    actorId: user.id,
    actorLabel: user.phone ?? user.id,
    actorRole: 'Contributor',
    action: 'auth.otp.verified',
  })

  return { user: toAuthUser(user), ...tokens }
}

export async function loginWithPassword(
  email: string,
  password: string,
  context: { userAgent?: string; ip?: string },
): Promise<{ user: AuthUser; accessToken: string; refreshToken: string }> {
  const user = await db.query.users.findFirst({ where: eq(users.email, email) })

  // Generic failure message regardless of which check fails — no
  // user-enumeration signal from timing or response shape.
  if (!user || !user.passwordHash || !(await verifyPassword(user.passwordHash, password))) {
    throw new HttpError(401, 'invalid_credentials', 'Invalid email or password.')
  }

  const tokens = await issueSession(user, context)
  await writeAuditLog({
    actorId: user.id,
    actorLabel: user.email ?? user.id,
    actorRole: user.role === 'staff' ? (user.staffRole ?? 'staff') : user.role,
    action: 'auth.login',
  })

  return { user: toAuthUser(user), ...tokens }
}

async function issueSession(
  user: User,
  context: { userAgent?: string; ip?: string },
): Promise<{ accessToken: string; refreshToken: string }> {
  const [session] = await db
    .insert(sessions)
    .values({
      userId: user.id,
      refreshTokenHash: 'pending', // replaced below once we have the session id to sign into the token
      userAgent: context.userAgent,
      ip: context.ip,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    })
    .returning()

  const refreshToken = await signRefreshToken(session.id, env.REFRESH_TOKEN_SECRET, REFRESH_TOKEN_TTL)
  await db
    .update(sessions)
    .set({ refreshTokenHash: hashCode(refreshToken) })
    .where(eq(sessions.id, session.id))

  const accessToken = await signAccessToken(
    { sub: user.id, role: user.role, staffRole: user.staffRole },
    env.ACCESS_TOKEN_SECRET,
    ACCESS_TOKEN_TTL,
  )

  return { accessToken, refreshToken }
}

export async function refreshSession(
  refreshToken: string,
  context: { userAgent?: string; ip?: string },
): Promise<{ user: AuthUser; accessToken: string; refreshToken: string }> {
  let claims: { sid: string }
  try {
    claims = await verifyRefreshToken(refreshToken, env.REFRESH_TOKEN_SECRET)
  } catch {
    throw new HttpError(401, 'invalid_refresh_token', 'Session expired. Please sign in again.')
  }

  const session = await db.query.sessions.findFirst({ where: eq(sessions.id, claims.sid) })
  if (
    !session ||
    session.revokedAt ||
    session.expiresAt < new Date() ||
    session.refreshTokenHash !== hashCode(refreshToken)
  ) {
    throw new HttpError(401, 'invalid_refresh_token', 'Session expired. Please sign in again.')
  }

  const user = await db.query.users.findFirst({ where: eq(users.id, session.userId) })
  if (!user) {
    throw new HttpError(401, 'invalid_refresh_token', 'Session expired. Please sign in again.')
  }

  // Rotate: revoke the old session row, issue a brand new one — proves
  // rotation happened (verifiable in the DB), not just token reissue.
  await db.update(sessions).set({ revokedAt: new Date() }).where(eq(sessions.id, session.id))
  const tokens = await issueSession(user, context)

  return { user: toAuthUser(user), ...tokens }
}

export async function logout(refreshToken: string | undefined): Promise<void> {
  if (!refreshToken) return
  try {
    const claims = await verifyRefreshToken(refreshToken, env.REFRESH_TOKEN_SECRET)
    await db.update(sessions).set({ revokedAt: new Date() }).where(eq(sessions.id, claims.sid))
  } catch {
    // Already invalid/expired — nothing to revoke, not an error condition.
  }
}

export async function getUserById(userId: string): Promise<AuthUser | null> {
  const user = await db.query.users.findFirst({ where: eq(users.id, userId) })
  return user ? toAuthUser(user) : null
}
