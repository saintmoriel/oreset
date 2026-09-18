import { eq } from 'drizzle-orm'
import { db } from '../../db/client'
import { users, sessions } from '../../db/schema'
import { env } from '../../config/env'
import { sendMail } from '../../lib/mail'
import { writeAuditLog } from '../../lib/audit'
import { HttpError } from '../../middleware/error-handler'

// A human approves every tester before they see client attack data. This
// replaces the old self-certification quiz.

type Actor = { id: string; role: string }

export async function approveApplication(actor: Actor, userId: string) {
  const user = await db.query.users.findFirst({ where: eq(users.id, userId) })
  if (!user || user.role !== 'operator') throw new HttpError(404, 'not_found', 'Applicant not found.')
  if (user.status !== 'pending') throw new HttpError(409, 'invalid_state', 'This applicant is not awaiting approval.')

  const [updated] = await db.update(users).set({ status: 'active', updatedAt: new Date() }).where(eq(users.id, userId)).returning()

  await writeAuditLog({
    actorId: actor.id,
    actorLabel: actor.id,
    actorRole: actor.role,
    action: 'operator.approved',
    resourceType: 'user',
    resourceId: userId,
  })

  if (user.email) {
    void sendMail({
      to: user.email,
      subject: 'You are approved for the Oreset Red Team',
      text: [
        `Hi ${user.displayName?.split(' ')[0] ?? 'there'},`,
        '',
        'Your application has been approved. Before you can take live scenarios you need to:',
        '',
        '1. Sign the NDA, code of conduct, and data handling policy (Settings, Agreements).',
        '2. Pass two calibration scenarios (Calibration in the sidebar).',
        '',
        `Sign in: ${env.WEB_PUBLIC_URL}/operator`,
        `Your tester code is ${user.operatorCode ?? 'shown in your profile'}.`,
        '',
        'Welcome aboard.',
        'Oreset Red Team',
      ].join('\n'),
    })
  }

  return updated
}

export async function rejectApplication(actor: Actor, userId: string, reason?: string) {
  const user = await db.query.users.findFirst({ where: eq(users.id, userId) })
  if (!user || user.role !== 'operator') throw new HttpError(404, 'not_found', 'Applicant not found.')
  if (user.status !== 'pending') throw new HttpError(409, 'invalid_state', 'This applicant is not awaiting a decision.')

  const [updated] = await db.update(users).set({ status: 'suspended', updatedAt: new Date() }).where(eq(users.id, userId)).returning()
  await db.delete(sessions).where(eq(sessions.userId, userId))

  await writeAuditLog({
    actorId: actor.id,
    actorLabel: actor.id,
    actorRole: actor.role,
    action: 'operator.rejected',
    resourceType: 'user',
    resourceId: userId,
    metadata: reason ? { reason } : undefined,
  })

  if (user.email) {
    void sendMail({
      to: user.email,
      subject: 'Your Oreset Red Team application',
      text: [
        `Hi ${user.displayName?.split(' ')[0] ?? 'there'},`,
        '',
        'Thank you for applying to the Oreset Red Team. We are not able to take your application forward at this time.',
        reason ? `\n${reason}\n` : '',
        'We keep applications on file and will reach out if that changes.',
        '',
        'Oreset',
      ].join('\n'),
    })
  }

  return updated
}
