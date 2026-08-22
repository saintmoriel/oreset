import { eq, desc } from 'drizzle-orm'
import { db } from '../../db/client'
import { users, consentRecords, submissions, operatorApplications, payouts } from '../../db/schema'
import { getDownloadUrl, deleteFile } from '../uploads/uploads.service'
import { revokeAllSessions } from '../auth/auth.service'
import { writeAuditLog } from '../../lib/audit'
import { HttpError } from '../../middleware/error-handler'

// Account-lifecycle actions the caller performs on themselves — doesn't
// fit cleanly into auth.ts (session-only) or any existing persona module.
// Mirrors how operators vs operator were split by kind of action in Phase 3.

// Lightweight, display-only list — deliberately not reusing getDataExport,
// which bundles the full GDPR export (submissions + generated download
// URLs + payouts) and would be disproportionate work just to render a
// short "which batches did I consent to, and when" list.
export async function getConsentRecords(userId: string) {
  return db.query.consentRecords.findMany({
    where: eq(consentRecords.contributorId, userId),
    with: { batch: { columns: { title: true } } },
    orderBy: desc(consentRecords.consentedAt),
  })
}

export async function getDataExport(userId: string) {
  const user = await db.query.users.findFirst({ where: eq(users.id, userId) })
  if (!user) throw new HttpError(404, 'not_found', 'User not found.')

  const [ownConsentRecords, ownSubmissions, application, ownPayouts] = await Promise.all([
    db.query.consentRecords.findMany({ where: eq(consentRecords.contributorId, userId) }),
    db.query.submissions.findMany({ where: eq(submissions.contributorId, userId) }),
    db.query.operatorApplications.findFirst({ where: eq(operatorApplications.userId, userId) }),
    db.query.payouts.findMany({ where: eq(payouts.contributorId, userId) }),
  ])

  const { passwordHash: _passwordHash, ...profile } = user

  const submissionsWithUrls = await Promise.all(
    ownSubmissions.map(async (s) => ({
      ...s,
      downloadUrl: s.fileDeletedAt ? null : await getDownloadUrl(s.storageKey),
    })),
  )

  return {
    profile,
    consentRecords: ownConsentRecords,
    submissions: submissionsWithUrls,
    operatorApplication: application ?? null,
    payouts: ownPayouts,
  }
}

// Anonymization, not row deletion. Submissions rows are NOT cascade-deleted
// — that would break QA/audit referential integrity, and each row's
// consent_hash is itself the compliance proof a real consent event
// occurred; erasing it would undermine rather than satisfy compliance.
export async function deleteAccount(userId: string): Promise<void> {
  const user = await db.query.users.findFirst({ where: eq(users.id, userId) })
  if (!user) throw new HttpError(404, 'not_found', 'User not found.')

  await db
    .update(users)
    .set({ phone: null, email: null, displayName: null, payoutDetails: null, updatedAt: new Date() })
    .where(eq(users.id, userId))

  await revokeAllSessions(userId)

  const ownSubmissions = await db.query.submissions.findMany({
    where: eq(submissions.contributorId, userId),
  })
  for (const submission of ownSubmissions) {
    if (submission.fileDeletedAt) continue
    await deleteFile(submission.storageKey)
    await db.update(submissions).set({ fileDeletedAt: new Date() }).where(eq(submissions.id, submission.id))
  }

  await writeAuditLog({
    actorId: userId,
    actorLabel: userId,
    actorRole: user.role,
    action: 'user.account_deleted',
    resourceType: 'user',
    resourceId: userId,
  })
}
