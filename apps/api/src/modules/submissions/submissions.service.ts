import { eq } from 'drizzle-orm'
import { db } from '../../db/client'
import { submissions, validationResults, type Submission } from '../../db/schema'
import { validateSubmission } from '../validation/validation.service'
import { writeAuditLog } from '../../lib/audit'
import type { MediaType } from '@oreset/shared'

type CreateSubmissionInput = {
  contributorId: string
  batchId: string
  consentRecordId: string
  mediaType: MediaType
  storageKey: string
  fileSizeBytes: number
  mimeType: string
  durationSeconds?: number
  imageMetadata?: Record<string, unknown>
  capturedAt: Date
  deviceInfo: Record<string, unknown>
  geoLocation?: Record<string, unknown>
}

export async function createSubmission(
  input: CreateSubmissionInput,
): Promise<{ submission: Submission; validation: Awaited<ReturnType<typeof validateSubmission>> }> {
  const [submission] = await db
    .insert(submissions)
    .values({
      contributorId: input.contributorId,
      batchId: input.batchId,
      consentRecordId: input.consentRecordId,
      mediaType: input.mediaType,
      storageKey: input.storageKey,
      fileSizeBytes: input.fileSizeBytes,
      mimeType: input.mimeType,
      durationSeconds: input.durationSeconds?.toString(),
      imageMetadata: input.imageMetadata,
      capturedAt: input.capturedAt,
      deviceInfo: input.deviceInfo,
      geoLocation: input.geoLocation,
      status: 'submitted',
    })
    .returning()

  await writeAuditLog({
    actorId: input.contributorId,
    actorLabel: input.contributorId,
    actorRole: 'Contributor',
    action: 'submission.created',
    resourceType: 'submission',
    resourceId: submission.id,
  })

  const validation = await validateSubmission(submission)

  await db.insert(validationResults).values({
    submissionId: submission.id,
    outcome: validation.outcome,
    reason: validation.reason,
    score: validation.score.toString(),
  })

  // Phase 0 simplification: only a pass moves status forward to
  // 'validated' (ready for /qa). A fail leaves it at 'submitted' rather
  // than introducing a distinct "needs retake" status — Phase 1 (wiring
  // the actual retake loop from the /capture prototype) can revisit this.
  if (validation.outcome === 'pass') {
    await db.update(submissions).set({ status: 'validated' }).where(eq(submissions.id, submission.id))
  }

  await writeAuditLog({
    actorId: null,
    actorLabel: 'validation-svc',
    actorRole: 'System',
    action: `submission.validation.${validation.outcome}`,
    resourceType: 'submission',
    resourceId: submission.id,
    metadata: { reason: validation.reason },
  })

  return { submission, validation }
}
