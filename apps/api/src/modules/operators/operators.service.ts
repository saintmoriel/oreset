import { randomInt } from 'node:crypto'
import { eq } from 'drizzle-orm'
import type { AuthUser } from '@oreset/shared'
import { db } from '../../db/client'
import { users, operatorApplications, type User } from '../../db/schema'
import { hashPassword } from '../../lib/password'
import { writeAuditLog } from '../../lib/audit'
import { HttpError } from '../../middleware/error-handler'
import { issueSession, toAuthUser } from '../auth/auth.service'

type LanguageRow = { language: string; fluency: string }

type ApplyInput = {
  name: string
  email: string
  phone: string
  password: string
  location: string
  languages: LanguageRow[]
  dialect?: string
  academicBackground: string
  englishProficiency: string
  availability?: string[]
  experience?: string
}

async function generateOperatorCode(): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = `OP-${randomInt(1000, 9999)}`
    const existing = await db.query.users.findFirst({ where: eq(users.operatorCode, code) })
    if (!existing) return code
  }
  throw new HttpError(500, 'internal_error', 'Could not allocate an operator code.')
}

// No session issued here — the applicant signs in separately later via
// /operator once their application exists (no invite-email infra in this
// codebase to auto-sign-them-in).
export async function apply(input: ApplyInput): Promise<{ user: AuthUser }> {
  const existing = await db.query.users.findFirst({ where: eq(users.email, input.email) })
  if (existing) throw new HttpError(409, 'email_taken', 'An account with that email already exists.')

  const operatorCode = await generateOperatorCode()
  const passwordHash = await hashPassword(input.password)

  let user: User
  try {
    ;[user] = await db
      .insert(users)
      .values({
        role: 'operator',
        status: 'pending',
        email: input.email,
        phone: input.phone,
        passwordHash,
        operatorCode,
        displayName: input.name,
      })
      .returning()
  } catch (err: unknown) {
    // Backstop for the check-then-insert race (two concurrent applications,
    // same email) — translate the unique violation into the same clean 409
    // instead of a raw 500 leaking a Postgres constraint name.
    if ((err as { code?: string })?.code === '23505') {
      throw new HttpError(409, 'email_taken', 'An account with that email already exists.')
    }
    throw err
  }

  await db.insert(operatorApplications).values({
    userId: user.id,
    location: input.location,
    languages: input.languages,
    dialect: input.dialect,
    academicBackground: input.academicBackground,
    englishProficiency: input.englishProficiency,
    availability: input.availability,
    experience: input.experience,
  })

  await writeAuditLog({
    actorId: user.id,
    actorLabel: user.email ?? user.id,
    actorRole: 'operator',
    action: 'operator.applied',
  })

  return { user: toAuthUser(user) }
}

export async function certify(
  userId: string,
  context: { userAgent?: string; ip?: string },
): Promise<{ user: AuthUser; accessToken: string; refreshToken: string }> {
  const user = await db.query.users.findFirst({ where: eq(users.id, userId) })
  if (!user) throw new HttpError(401, 'unauthenticated', 'Sign-in required.')
  if (user.status !== 'pending') {
    throw new HttpError(409, 'invalid_state', 'This account is not awaiting certification.')
  }

  const [updated] = await db
    .update(users)
    .set({ status: 'active', updatedAt: new Date() })
    .where(eq(users.id, userId))
    .returning()

  await writeAuditLog({
    actorId: updated.id,
    actorLabel: updated.email ?? updated.id,
    actorRole: 'operator',
    action: 'operator.certified',
  })

  // Re-issue immediately so the response's cookies reflect status:'active'
  // right away, rather than leaving the client to wait out the old
  // token's ~15-minute TTL before the stricter /operator proxy gate opens.
  const tokens = await issueSession(updated, context)
  return { user: toAuthUser(updated), ...tokens }
}
