import { and, eq, isNull, lt } from 'drizzle-orm'
import { db } from '../../db/client'
import { submissions } from '../../db/schema'
import { env } from '../../config/env'
import { deleteFile } from '../uploads/uploads.service'
import { writeAuditLog } from '../../lib/audit'

// Purges the PII-bearing file payload while the submissions row survives
// as the audit record — the standard GDPR "delete the data, keep the
// trail" pattern, and the only option here anyway: the write-once trigger
// physically prevents nulling storageKey.
export async function runSweep(): Promise<{ deletedCount: number }> {
  const cutoff = new Date(Date.now() - env.MEDIA_RETENTION_DAYS * 24 * 60 * 60 * 1000)
  const due = await db.query.submissions.findMany({
    where: and(lt(submissions.createdAt, cutoff), isNull(submissions.fileDeletedAt)),
  })

  for (const submission of due) {
    await deleteFile(submission.storageKey)
    await db.update(submissions).set({ fileDeletedAt: new Date() }).where(eq(submissions.id, submission.id))
    await writeAuditLog({
      actorId: null,
      actorLabel: 'retention-svc',
      actorRole: 'System',
      action: 'submission.media_deleted',
      resourceType: 'submission',
      resourceId: submission.id,
    })
  }

  return { deletedCount: due.length }
}
