import { desc, eq } from 'drizzle-orm'
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

  // Only a pass moves status forward to 'validated' (ready for /qa). A
  // fail leaves it at 'submitted' — there's no distinct "needs retake"
  // status; the contributor's retake produces a new submission row
  // entirely rather than mutating this one.
  const finalStatus = validation.outcome === 'pass' ? 'validated' : submission.status
  if (validation.outcome === 'pass') {
    await db.update(submissions).set({ status: finalStatus }).where(eq(submissions.id, submission.id))
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

  return { submission: { ...submission, status: finalStatus }, validation }
}

export async function listMySubmissions(contributorId: string) {
  const rows = await db.query.submissions.findMany({
    where: eq(submissions.contributorId, contributorId),
    orderBy: desc(submissions.createdAt),
    with: {
      batch: true,
      validationResults: { orderBy: desc(validationResults.createdAt), limit: 1 },
    },
  })

  return rows.map((s) => ({
    id: s.id,
    status: s.status,
    mediaType: s.mediaType,
    createdAt: s.createdAt,
    batch: s.batch,
    latestValidation: s.validationResults[0] ?? null,
  }))
}
