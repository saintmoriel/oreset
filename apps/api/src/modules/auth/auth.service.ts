import { randomInt, randomBytes, createHash } from 'node:crypto'
import { eq, and, gt, isNull, desc } from 'drizzle-orm'
import { signAccessToken, signRefreshToken, verifyRefreshToken, type AuthUser } from '@oreset/shared'
import { db } from '../../db/client'
import { users, otpCodes, sessions, passwordResets, type User } from '../../db/schema'
import { env } from '../../config/env'
import { sendMail } from '../../lib/mail'
import { ACCESS_TOKEN_TTL, REFRESH_TOKEN_TTL } from '../../config/cookies'
import { hashPassword, verifyPassword } from '../../lib/password'
import { writeAuditLog } from '../../lib/audit'
import { HttpError } from '../../middleware/error-handler'
import { DevConsoleOtpProvider, type OtpProvider } from './otp.provider'
import {
  decryptSecret,
  encryptSecret,
  generateRecoveryCodes,
  generateSecret,
  hashRecoveryCode,
  otpauthUrl,
  signMfaToken,
  verifyCode,
  verifyMfaToken,
} from '../../lib/totp'

const OTP_TTL_MS = 5 * 60 * 1000
const OTP_MAX_REQUESTS_PER_WINDOW = 3
const OTP_REQUEST_WINDOW_MS = 10 * 60 * 1000
const OTP_MAX_ATTEMPTS = 5

const otpProvider: OtpProvider = new DevConsoleOtpProvider()

function hashCode(code: string): string {
  return createHash('sha256').update(code).digest('hex')
}

export function toAuthUser(user: User): AuthUser {
  return {
    id: user.id,
    role: user.role,
    staffRole: user.staffRole,
    displayName: user.displayName,
    status: user.status,
    operatorCode: user.operatorCode,
    payoutDetails: (user.payoutDetails as Record<string, unknown> | null) ?? null,
    phone: user.phone,
    email: user.email,
    createdAt: user.createdAt.toISOString(),
    twoFactorEnabled: user.totpEnabledAt !== null && user.totpEnabledAt !== undefined,
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

export type LoginResult =
  | { mfaRequired: false; user: AuthUser; accessToken: string; refreshToken: string }
  | { mfaRequired: true; mfaToken: string }

export async function loginWithPassword(
  email: string,
  password: string,
  context: { userAgent?: string; ip?: string },
): Promise<LoginResult> {
  const user = await db.query.users.findFirst({ where: eq(users.email, email) })

  // Generic failure message regardless of which check fails — no
  // user-enumeration signal from timing or response shape.
  if (!user || !user.passwordHash || !(await verifyPassword(user.passwordHash, password))) {
    throw new HttpError(401, 'invalid_credentials', 'Invalid email or password.')
  }

  if (user.status === 'suspended') {
    throw new HttpError(403, 'account_suspended', 'This account has been suspended. Contact your administrator.')
  }

  // Password is right; if the account has an authenticator, stop here and
  // hand back a short-lived token for the code step. No session yet.
  if (user.totpEnabledAt) {
    return { mfaRequired: true, mfaToken: signMfaToken(user.id) }
  }

  return finishLogin(user, context, 'auth.login')
}

async function finishLogin(
  user: User,
  context: { userAgent?: string; ip?: string },
  action: string,
): Promise<{ mfaRequired: false; user: AuthUser; accessToken: string; refreshToken: string }> {
  const tokens = await issueSession(user, context)
  await Promise.all([
    db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, user.id)),
    writeAuditLog({
      actorId: user.id,
      actorLabel: user.email ?? user.id,
      actorRole: user.role === 'staff' ? (user.staffRole ?? 'staff') : user.role,
      action,
    }),
  ])

  return { mfaRequired: false, user: toAuthUser(user), ...tokens }
}

// ---------------------------------------------------------------------------
// Two-factor authentication (authenticator app)
// ---------------------------------------------------------------------------

function mfaActor(user: User) {
  return { actorId: user.id, actorLabel: user.email ?? user.id, actorRole: user.role === 'staff' ? (user.staffRole ?? 'staff') : user.role }
}

// Second step of sign-in: the code from the app, or a recovery code.
export async function completeMfaLogin(
  mfaToken: string,
  code: string,
  context: { userAgent?: string; ip?: string },
): Promise<{ mfaRequired: false; user: AuthUser; accessToken: string; refreshToken: string }> {
  const claims = verifyMfaToken(mfaToken)
  if (!claims) throw new HttpError(401, 'mfa_expired', 'That sign-in attempt expired. Enter your password again.')
  const user = await db.query.users.findFirst({ where: eq(users.id, claims.sub) })
  if (!user || !user.totpEnabledAt || !user.totpSecret) throw new HttpError(401, 'mfa_expired', 'That sign-in attempt expired. Enter your password again.')
  if (user.status === 'suspended') throw new HttpError(403, 'account_suspended', 'This account has been suspended.')

  if (verifyCode(decryptSecret(user.totpSecret), code)) {
    return finishLogin(user, context, 'auth.login.mfa')
  }

  // Recovery code: single use, removed on success.
  const hashes = Array.isArray(user.totpRecoveryCodes) ? (user.totpRecoveryCodes as string[]) : []
  const attempt = hashRecoveryCode(code)
  if (hashes.includes(attempt)) {
    const remaining = hashes.filter((h) => h !== attempt)
    await db.update(users).set({ totpRecoveryCodes: remaining }).where(eq(users.id, user.id))
    await writeAuditLog({ ...mfaActor(user), action: 'auth.mfa.recovery_used', metadata: { remaining: remaining.length } })
    return finishLogin(user, context, 'auth.login.mfa_recovery')
  }

  await writeAuditLog({ ...mfaActor(user), action: 'auth.mfa.failed' })
  throw new HttpError(401, 'mfa_invalid', 'That code is not right. Codes change every 30 seconds; try the current one.')
}

// Step 1 of enrolment: create a secret and show it. Not enabled until a
// code is confirmed, so a half-finished setup never locks anyone out.
export async function beginMfaSetup(userId: string): Promise<{ secret: string; otpauthUrl: string }> {
  const user = await db.query.users.findFirst({ where: eq(users.id, userId) })
  if (!user) throw new HttpError(404, 'not_found', 'Account not found.')
  if (user.totpEnabledAt) throw new HttpError(409, 'mfa_already_enabled', 'Two-factor is already on for this account. Turn it off first to set up a new device.')
  const secret = generateSecret()
  await db.update(users).set({ totpSecret: encryptSecret(secret) }).where(eq(users.id, userId))
  return { secret, otpauthUrl: otpauthUrl(secret, user.email ?? user.displayName ?? 'Oreset account') }
}

// Step 2: confirm with a code from the app. Returns recovery codes once.
export async function enableMfa(userId: string, code: string): Promise<{ recoveryCodes: string[] }> {
  const user = await db.query.users.findFirst({ where: eq(users.id, userId) })
  if (!user || !user.totpSecret) throw new HttpError(400, 'mfa_not_started', 'Start setup first.')
  if (user.totpEnabledAt) throw new HttpError(409, 'mfa_already_enabled', 'Two-factor is already on.')
  if (!verifyCode(decryptSecret(user.totpSecret), code)) {
    throw new HttpError(400, 'mfa_invalid', 'That code did not match. Scan the QR again if you are unsure, then enter the current code.')
  }
  const recoveryCodes = generateRecoveryCodes()
  await db
    .update(users)
    .set({ totpEnabledAt: new Date(), totpRecoveryCodes: recoveryCodes.map(hashRecoveryCode) })
    .where(eq(users.id, userId))
  await writeAuditLog({ ...mfaActor(user), action: 'auth.mfa.enabled' })
  return { recoveryCodes }
}

// Turning it off requires a current code (or a recovery code) plus the
// password, so a hijacked open session cannot quietly remove the lock.
export async function disableMfa(userId: string, code: string, password: string): Promise<void> {
  const user = await db.query.users.findFirst({ where: eq(users.id, userId) })
  if (!user || !user.totpEnabledAt || !user.totpSecret) throw new HttpError(400, 'mfa_not_enabled', 'Two-factor is not on.')
  if (!user.passwordHash || !(await verifyPassword(user.passwordHash, password))) throw new HttpError(401, 'invalid_credentials', 'Password is not right.')
  const hashes = Array.isArray(user.totpRecoveryCodes) ? (user.totpRecoveryCodes as string[]) : []
  const ok = verifyCode(decryptSecret(user.totpSecret), code) || hashes.includes(hashRecoveryCode(code))
  if (!ok) throw new HttpError(401, 'mfa_invalid', 'That code is not right.')
  await db.update(users).set({ totpSecret: null, totpEnabledAt: null, totpRecoveryCodes: null }).where(eq(users.id, userId))
  await writeAuditLog({ ...mfaActor(user), action: 'auth.mfa.disabled' })
}

export async function regenerateRecoveryCodes(userId: string, code: string): Promise<{ recoveryCodes: string[] }> {
  const user = await db.query.users.findFirst({ where: eq(users.id, userId) })
  if (!user || !user.totpEnabledAt || !user.totpSecret) throw new HttpError(400, 'mfa_not_enabled', 'Two-factor is not on.')
  if (!verifyCode(decryptSecret(user.totpSecret), code)) throw new HttpError(401, 'mfa_invalid', 'That code is not right.')
  const recoveryCodes = generateRecoveryCodes()
  await db.update(users).set({ totpRecoveryCodes: recoveryCodes.map(hashRecoveryCode) }).where(eq(users.id, userId))
  await writeAuditLog({ ...mfaActor(user), action: 'auth.mfa.recovery_regenerated' })
  return { recoveryCodes }
}

export async function mfaStatus(userId: string): Promise<{ enabled: boolean; recoveryCodesLeft: number | null; enabledAt: string | null }> {
  const user = await db.query.users.findFirst({ where: eq(users.id, userId), columns: { totpEnabledAt: true, totpRecoveryCodes: true } })
  if (!user) throw new HttpError(404, 'not_found', 'Account not found.')
  const hashes = Array.isArray(user.totpRecoveryCodes) ? (user.totpRecoveryCodes as string[]) : null
  return { enabled: !!user.totpEnabledAt, recoveryCodesLeft: user.totpEnabledAt ? (hashes?.length ?? 0) : null, enabledAt: user.totpEnabledAt?.toISOString() ?? null }
}

export async function issueSession(
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
    { sub: user.id, role: user.role, staffRole: user.staffRole, status: user.status },
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

// No bulk-revoke helper existed before this — only single-session
// revoke-by-id (logout, refresh rotation). Used by /me/delete-account so
// a previously-valid refresh token stops working immediately, not just
// the response body claiming it does.
export async function revokeAllSessions(userId: string): Promise<void> {
  await db
    .update(sessions)
    .set({ revokedAt: new Date() })
    .where(and(eq(sessions.userId, userId), isNull(sessions.revokedAt)))
}

// ---------------------------------------------------------------------------
// Forgot password
// ---------------------------------------------------------------------------

const RESET_TTL_MS = 30 * 60 * 1000

function portalPathFor(user: Pick<User, 'role'>): string {
  if (user.role === 'buyer') return '/buyer'
  if (user.role === 'operator') return '/operator'
  if (user.role === 'staff') return '/admin'
  return '/'
}

// Always resolves the same way whether or not the email exists, so the
// endpoint cannot be used to discover accounts.
export async function requestPasswordReset(email: string, ip?: string): Promise<void> {
  const user = await db.query.users.findFirst({ where: eq(users.email, email) })
  if (!user || !user.passwordHash || user.status === 'suspended') return

  const token = randomBytes(32).toString('base64url')
  await db.insert(passwordResets).values({
    userId: user.id,
    tokenHash: hashCode(token),
    expiresAt: new Date(Date.now() + RESET_TTL_MS),
    requestedIp: ip,
  })

  const link = `${env.WEB_PUBLIC_URL}/reset-password?token=${token}`
  void sendMail({
    to: user.email!,
    subject: 'Reset your Oreset password',
    text: [
      `Hi ${user.displayName?.split(' ')[0] ?? 'there'},`,
      '',
      'Someone asked to reset the password for this Oreset account. If that was you, use the link below within 30 minutes:',
      '',
      link,
      '',
      'If it was not you, ignore this email. Your password has not changed.',
      '',
      'Oreset',
    ].join('\n'),
  })

  await writeAuditLog({
    actorId: user.id,
    actorLabel: user.email ?? user.id,
    actorRole: user.role === 'staff' ? (user.staffRole ?? 'staff') : user.role,
    action: 'auth.password_reset_requested',
  })
}

export async function resetPasswordWithToken(
  token: string,
  newPassword: string,
): Promise<{ portalPath: string }> {
  const record = await db.query.passwordResets.findFirst({
    where: and(
      eq(passwordResets.tokenHash, hashCode(token)),
      isNull(passwordResets.consumedAt),
      gt(passwordResets.expiresAt, new Date()),
    ),
  })
  if (!record) {
    throw new HttpError(400, 'invalid_or_expired_token', 'This reset link is invalid or has expired. Request a new one.')
  }

  const user = await db.query.users.findFirst({ where: eq(users.id, record.userId) })
  if (!user) throw new HttpError(400, 'invalid_or_expired_token', 'This reset link is invalid or has expired. Request a new one.')

  const passwordHash = await hashPassword(newPassword)
  await Promise.all([
    db.update(users).set({ passwordHash, updatedAt: new Date() }).where(eq(users.id, user.id)),
    db.update(passwordResets).set({ consumedAt: new Date() }).where(eq(passwordResets.id, record.id)),
    // A reset means the old credential may be compromised: end every session.
    db.delete(sessions).where(eq(sessions.userId, user.id)),
  ])

  await writeAuditLog({
    actorId: user.id,
    actorLabel: user.email ?? user.id,
    actorRole: user.role === 'staff' ? (user.staffRole ?? 'staff') : user.role,
    action: 'auth.password_reset_completed',
  })

  void sendMail({
    to: user.email!,
    subject: 'Your Oreset password was changed',
    text: [
      `Hi ${user.displayName?.split(' ')[0] ?? 'there'},`,
      '',
      'Your password was just changed and every other session was signed out.',
      '',
      'If you did not do this, reply to this email immediately.',
      '',
      'Oreset',
    ].join('\n'),
  })

  return { portalPath: portalPathFor(user) }
}
