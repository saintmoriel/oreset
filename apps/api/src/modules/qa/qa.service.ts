import { asc, count, desc, eq } from 'drizzle-orm'
import type { ErrTag, QaDecision, StaffRole } from '@oreset/shared'
import { ERR_TAGS } from '@oreset/shared'
import { db } from '../../db/client'
import { submissions, validationResults, qaReviewDecisions } from '../../db/schema'
import { getDownloadUrl } from '../uploads/uploads.service'
import { writeAuditLog } from '../../lib/audit'
import { HttpError } from '../../middleware/error-handler'

export async function getQueue() {
  const rows = await db.query.submissions.findMany({
    where: eq(submissions.status, 'validated'),
    orderBy: asc(submissions.createdAt),
    with: {
      batch: true,
      validationResults: { orderBy: desc(validationResults.createdAt), limit: 1 },
    },
  })

  return Promise.all(
    rows.map(async (s) => ({
      id: s.id,
      mediaType: s.mediaType,
      durationSeconds: s.durationSeconds,
      imageMetadata: s.imageMetadata,
      createdAt: s.createdAt,
      batch: s.batch,
      latestValidation: s.validationResults[0] ?? null,
      downloadUrl: await getDownloadUrl(s.storageKey),
    })),
  )
}

// A real COUNT — deliberately not just `(await getQueue()).length`, which
// would also generate a presigned download URL per row just to throw it
// away.
export async function getQueueCount(): Promise<number> {
  const [row] = await db.select({ value: count() }).from(submissions).where(eq(submissions.status, 'validated'))
  return row?.value ?? 0
}

export async function getMyDecisions(reviewerId: string) {
  return db.query.qaReviewDecisions.findMany({
    where: eq(qaReviewDecisions.reviewerId, reviewerId),
    orderBy: desc(qaReviewDecisions.createdAt),
    limit: 50,
    with: {
      submission: { with: { batch: true } },
    },
  })
}

export async function getMyStats(reviewerId: string) {
  const decisions = await db.query.qaReviewDecisions.findMany({
    where: eq(qaReviewDecisions.reviewerId, reviewerId),
  })

  const today = new Date().toISOString().slice(0, 10)
  const reviewedToday = decisions.filter((d) => d.createdAt.toISOString().slice(0, 10) === today).length
  const approvedAllTime = decisions.filter((d) => d.decision === 'approved').length
  const rejectedAllTime = decisions.filter((d) => d.decision === 'rejected').length
  const reviewedAllTime = decisions.length
  const approvalRate = reviewedAllTime > 0 ? Math.round((approvedAllTime / reviewedAllTime) * 100) : null

  const defectTagBreakdown = Object.fromEntries(ERR_TAGS.map((tag) => [tag, 0])) as Record<ErrTag, number>
  for (const d of decisions) {
    if (d.defectTag) defectTagBreakdown[d.defectTag] += 1
  }

  return {
    queueRemaining: await getQueueCount(),
    reviewedToday,
    reviewedAllTime,
    approvedAllTime,
    rejectedAllTime,
    approvalRate,
    defectTagBreakdown,
  }
}

export async function decide(input: {
  submissionId: string
  reviewerId: string
  reviewerRole: StaffRole | null
  decision: QaDecision
  defectTag?: ErrTag
  notes?: string
}) {
  const submission = await db.query.submissions.findFirst({
    where: eq(submissions.id, input.submissionId),
  })
  if (!submission) throw new HttpError(404, 'not_found', 'Submission not found.')
  // Guards against two reviewers racing the same item, or a stale client
  // re-submitting a decision on an item already decided.
  if (submission.status !== 'validated') {
    throw new HttpError(409, 'invalid_state', 'This submission is not awaiting QA review.')
  }

  const [decision] = await db
    .insert(qaReviewDecisions)
    .values({
      submissionId: input.submissionId,
      reviewerId: input.reviewerId,
      decision: input.decision,
      defectTag: input.defectTag,
      notes: input.notes,
    })
    .returning()

  const nextStatus = input.decision === 'approved' ? 'qa_approved' : 'qa_rejected'
  await db.update(submissions).set({ status: nextStatus }).where(eq(submissions.id, input.submissionId))

  await writeAuditLog({
    actorId: input.reviewerId,
    actorLabel: input.reviewerId,
    actorRole: input.reviewerRole ?? 'staff',
    action: `qa.decision.${input.decision}`,
    resourceType: 'submission',
    resourceId: input.submissionId,
    metadata: { defectTag: input.defectTag, notes: input.notes },
  })

  return { submission: { ...submission, status: nextStatus }, decision }
}
