import { and, count, eq, isNull, sql, desc, avg } from 'drizzle-orm'
import type { ErrTag, OperatorDecision, RoleType, Severity } from '@oreset/shared'
import { db } from '../../db/client'
import {
  clientQueueItems,
  operatorReviewDecisions,
  consensusPairs,
  clientTickets,
  users,
} from '../../db/schema'
import { writeAuditLog } from '../../lib/audit'
import { fireWebhooksForItem } from '../../lib/webhooks'
import { HttpError } from '../../middleware/error-handler'

// ---------------------------------------------------------------------------
// Agreement scoring (same 60/20/20 weights as calibration)
// ---------------------------------------------------------------------------

function computeAgreementScore(
  d1: { decision: string; errTag: string | null; severity: string | null },
  d2: { decision: string; errTag: string | null; severity: string | null },
): number {
  let score = 0
  if (d1.decision === d2.decision) score += 0.6
  if (d1.errTag === d2.errTag) score += 0.2
  if (d1.severity === d2.severity) score += 0.2
  return score
}

// ---------------------------------------------------------------------------
// Enable dual-solve on a queue item
// ---------------------------------------------------------------------------

export async function enableDualSolve(itemId: string) {
  const item = await db.query.clientQueueItems.findFirst({
    where: eq(clientQueueItems.id, itemId),
  })
  if (!item) throw new HttpError(404, 'not_found', 'Queue item not found.')
  if (item.status !== 'pending') {
    throw new HttpError(409, 'invalid_state', 'Only pending items can be marked for dual-solve.')
  }

  const [updated] = await db
    .update(clientQueueItems)
    .set({ requiresDualSolve: true })
    .where(eq(clientQueueItems.id, itemId))
    .returning()

  return updated
}

export async function enableDualSolveBulk() {
  const result = await db
    .update(clientQueueItems)
    .set({ requiresDualSolve: true })
    .where(and(eq(clientQueueItems.status, 'pending'), eq(clientQueueItems.requiresDualSolve, false)))
    .returning({ id: clientQueueItems.id })

  return { count: result.length }
}

// ---------------------------------------------------------------------------
// Dual-solve decision (called from operator.service.decide when item needs it)
// ---------------------------------------------------------------------------

export async function handleDualSolveDecision(input: {
  itemId: string
  operatorId: string
  operatorRole: RoleType
  decision: OperatorDecision
  errTag?: ErrTag
  severity?: Severity
  notes?: string
  correctedTranscript?: string
  correctedIntent?: string
  correctedOutcome?: string
  reviewTimeMs?: number
}) {
  const item = await db.query.clientQueueItems.findFirst({
    where: eq(clientQueueItems.id, input.itemId),
  })
  if (!item) throw new HttpError(404, 'not_found', 'Queue item not found.')
  if (item.status !== 'pending' && item.status !== 'in_review') {
    throw new HttpError(409, 'invalid_state', 'This item is not awaiting review.')
  }

  const existingPair = await db.query.consensusPairs.findFirst({
    where: and(
      eq(consensusPairs.clientItemId, input.itemId),
      eq(consensusPairs.status, 'awaiting_reviews'),
    ),
  })

  if (existingPair && existingPair.reviewerOneId === input.operatorId) {
    throw new HttpError(409, 'already_reviewed', 'You have already reviewed this item.')
  }

  const [decision] = await db
    .insert(operatorReviewDecisions)
    .values({
      operatorId: input.operatorId,
      clientItemId: item.externalRef,
      clientItemSnapshot: { content: item.content, clientName: item.clientName, traceData: item.traceData },
      decision: input.decision,
      errTag: input.errTag,
      severity: input.severity,
      notes: input.notes,
      correctedTranscript: input.correctedTranscript,
      correctedIntent: input.correctedIntent,
      correctedOutcome: input.correctedOutcome,
      reviewTimeMs: input.reviewTimeMs,
    })
    .returning()

  await writeAuditLog({
    actorId: input.operatorId,
    actorLabel: input.operatorId,
    actorRole: input.operatorRole,
    action: `operator.decision.${input.decision}`,
    resourceType: 'client_queue_item',
    resourceId: item.id,
    metadata: { errTag: input.errTag, severity: input.severity, dualSolve: true },
  })

  if (!existingPair) {
    await db.insert(consensusPairs).values({
      clientItemId: input.itemId,
      reviewerOneId: input.operatorId,
      decisionOneId: decision.id,
      status: 'awaiting_reviews',
    })

    await db
      .update(clientQueueItems)
      .set({ status: 'in_review' })
      .where(eq(clientQueueItems.id, input.itemId))

    return {
      item: { ...item, status: 'in_review' as const },
      decision,
      consensus: { status: 'awaiting_second_review' },
    }
  }

  // Second reviewer submitting
  const [updatedPair] = await db
    .update(consensusPairs)
    .set({
      reviewerTwoId: input.operatorId,
      decisionTwoId: decision.id,
    })
    .where(eq(consensusPairs.id, existingPair.id))
    .returning()

  const decisionOne = await db.query.operatorReviewDecisions.findFirst({
    where: eq(operatorReviewDecisions.id, existingPair.decisionOneId!),
  })

  const agreementScore = computeAgreementScore(
    { decision: decisionOne!.decision, errTag: decisionOne!.errTag, severity: decisionOne!.severity },
    { decision: input.decision, errTag: input.errTag ?? null, severity: input.severity ?? null },
  )

  const agreed = decisionOne!.decision === input.decision

  if (agreed) {
    await db
      .update(consensusPairs)
      .set({
        status: 'agreed',
        finalDecision: input.decision,
        finalErrTag: input.errTag,
        finalSeverity: input.severity,
        agreementScore,
      })
      .where(eq(consensusPairs.id, existingPair.id))

    await db
      .update(clientQueueItems)
      .set({ status: input.decision })
      .where(eq(clientQueueItems.id, input.itemId))

    if (input.decision === 'escalated') {
      await db.insert(clientTickets).values({
        operatorReviewDecisionId: decision.id,
        clientName: item.clientName,
        externalRef: item.externalRef,
        errTag: input.errTag,
        severity: input.severity,
        notes: input.notes,
      })
    }

    const webhookEvent = input.decision === 'escalated' ? 'case.escalated' as const : 'case.completed' as const
    fireWebhooksForItem(input.itemId, webhookEvent, {
      decision: input.decision,
      errTag: input.errTag ?? null,
      severity: input.severity ?? null,
      consensusAgreed: true,
      agreementScore: Math.round(agreementScore * 100),
    })

    return {
      item: { ...item, status: input.decision },
      decision,
      consensus: { status: 'agreed', agreementScore: Math.round(agreementScore * 100) },
    }
  }

  // Disagreement: route to adjudication
  await db
    .update(consensusPairs)
    .set({ status: 'disagreed', agreementScore })
    .where(eq(consensusPairs.id, existingPair.id))

  await db
    .update(clientQueueItems)
    .set({ status: 'consensus_split' })
    .where(eq(clientQueueItems.id, input.itemId))

  fireWebhooksForItem(input.itemId, 'case.consensus_split', {
    agreementScore: Math.round(agreementScore * 100),
  })

  return {
    item: { ...item, status: 'consensus_split' as const },
    decision,
    consensus: { status: 'disagreed', agreementScore: Math.round(agreementScore * 100) },
  }
}

// ---------------------------------------------------------------------------
// Admin: adjudicate a split consensus
// ---------------------------------------------------------------------------

export async function adjudicate(input: {
  pairId: string
  adjudicatorId: string
  adjudicatorRole: RoleType
  finalDecision: OperatorDecision
  finalErrTag?: ErrTag
  finalSeverity?: Severity
  notes?: string
}) {
  const pair = await db.query.consensusPairs.findFirst({
    where: eq(consensusPairs.id, input.pairId),
  })
  if (!pair) throw new HttpError(404, 'not_found', 'Consensus pair not found.')
  if (pair.status !== 'disagreed') {
    throw new HttpError(409, 'invalid_state', 'Only disagreed pairs can be adjudicated.')
  }

  await db
    .update(consensusPairs)
    .set({
      status: 'adjudicated',
      finalDecision: input.finalDecision,
      finalErrTag: input.finalErrTag,
      finalSeverity: input.finalSeverity,
      adjudicatorId: input.adjudicatorId,
      adjudicatorNotes: input.notes,
      adjudicatedAt: new Date(),
    })
    .where(eq(consensusPairs.id, input.pairId))

  await db
    .update(clientQueueItems)
    .set({ status: input.finalDecision })
    .where(eq(clientQueueItems.id, pair.clientItemId))

  if (input.finalDecision === 'escalated') {
    const item = await db.query.clientQueueItems.findFirst({
      where: eq(clientQueueItems.id, pair.clientItemId),
    })
    if (item) {
      await db.insert(clientTickets).values({
        operatorReviewDecisionId: pair.decisionOneId!,
        clientName: item.clientName,
        externalRef: item.externalRef,
        errTag: input.finalErrTag,
        severity: input.finalSeverity,
        notes: input.notes,
      })
    }
  }

  await writeAuditLog({
    actorId: input.adjudicatorId,
    actorLabel: input.adjudicatorId,
    actorRole: input.adjudicatorRole,
    action: `consensus.adjudicate.${input.finalDecision}`,
    resourceType: 'consensus_pair',
    resourceId: input.pairId,
    metadata: { finalDecision: input.finalDecision, notes: input.notes },
  })

  fireWebhooksForItem(pair.clientItemId, 'case.adjudicated', {
    finalDecision: input.finalDecision,
    finalErrTag: input.finalErrTag ?? null,
    finalSeverity: input.finalSeverity ?? null,
  })

  return { pairId: input.pairId, status: 'adjudicated', finalDecision: input.finalDecision }
}

// ---------------------------------------------------------------------------
// Admin: adjudication queue (disagreed pairs)
// ---------------------------------------------------------------------------

export async function getAdjudicationQueue() {
  const pairs = await db.query.consensusPairs.findMany({
    where: eq(consensusPairs.status, 'disagreed'),
    orderBy: desc(consensusPairs.createdAt),
    with: {
      clientItem: true,
      decisionOne: true,
      decisionTwo: true,
    },
  })

  return pairs
}

// ---------------------------------------------------------------------------
// Admin: all consensus pairs with status filter
// ---------------------------------------------------------------------------

export async function listPairs(statusFilter?: string) {
  const conditions = statusFilter
    ? [eq(consensusPairs.status, statusFilter as 'awaiting_reviews' | 'agreed' | 'disagreed' | 'adjudicated')]
    : []

  return db.query.consensusPairs.findMany({
    where: conditions.length > 0 ? and(...conditions) : undefined,
    orderBy: desc(consensusPairs.createdAt),
    limit: 100,
    with: {
      clientItem: true,
      decisionOne: true,
      decisionTwo: true,
    },
  })
}

// ---------------------------------------------------------------------------
// Stats: inter-rater reliability
// ---------------------------------------------------------------------------

export async function getConsensusStats() {
  const [total] = await db
    .select({ count: count() })
    .from(consensusPairs)

  const [completed] = await db
    .select({ count: count() })
    .from(consensusPairs)
    .where(sql`${consensusPairs.status} != 'awaiting_reviews'`)

  const [agreed] = await db
    .select({ count: count() })
    .from(consensusPairs)
    .where(eq(consensusPairs.status, 'agreed'))

  const [disagreed] = await db
    .select({ count: count() })
    .from(consensusPairs)
    .where(eq(consensusPairs.status, 'disagreed'))

  const [adjudicated] = await db
    .select({ count: count() })
    .from(consensusPairs)
    .where(eq(consensusPairs.status, 'adjudicated'))

  const [avgAgreement] = await db
    .select({ avg: avg(consensusPairs.agreementScore) })
    .from(consensusPairs)
    .where(sql`${consensusPairs.agreementScore} IS NOT NULL`)

  const completedCount = completed?.count ?? 0
  const agreedCount = agreed?.count ?? 0
  const rawAgreementRate = completedCount > 0 ? Math.round((agreedCount / completedCount) * 100) : null

  // Cohen's kappa: k = (po - pe) / (1 - pe)
  // po = observed agreement rate, pe = expected agreement by chance
  // For pe, we need the marginal distributions of each reviewer's decisions
  let cohensKappa: number | null = null
  if (completedCount >= 5) {
    const pairsWithDecisions = await db.query.consensusPairs.findMany({
      where: sql`${consensusPairs.status} != 'awaiting_reviews'`,
      with: { decisionOne: true, decisionTwo: true },
    })

    const decisions = ['approved', 'corrected', 'rejected', 'escalated', 'declined']
    const n = pairsWithDecisions.length
    if (n > 0) {
      const r1Counts: Record<string, number> = {}
      const r2Counts: Record<string, number> = {}
      let agreements = 0

      for (const p of pairsWithDecisions) {
        const d1 = p.decisionOne?.decision ?? ''
        const d2 = p.decisionTwo?.decision ?? ''
        r1Counts[d1] = (r1Counts[d1] ?? 0) + 1
        r2Counts[d2] = (r2Counts[d2] ?? 0) + 1
        if (d1 === d2) agreements++
      }

      const po = agreements / n
      let pe = 0
      for (const d of decisions) {
        pe += ((r1Counts[d] ?? 0) / n) * ((r2Counts[d] ?? 0) / n)
      }

      cohensKappa = pe < 1 ? Math.round(((po - pe) / (1 - pe)) * 100) / 100 : 1
    }
  }

  return {
    totalPairs: total?.count ?? 0,
    completedPairs: completedCount,
    agreedCount,
    disagreedCount: disagreed?.count ?? 0,
    adjudicatedCount: adjudicated?.count ?? 0,
    pendingAdjudication: disagreed?.count ?? 0,
    rawAgreementRate,
    avgAgreementScore: avgAgreement?.avg ? Math.round(Number(avgAgreement.avg) * 100) : null,
    cohensKappa,
  }
}

// ---------------------------------------------------------------------------
// Check if operator already reviewed a dual-solve item
// ---------------------------------------------------------------------------

export async function hasOperatorReviewed(itemId: string, operatorId: string): Promise<boolean> {
  const pair = await db.query.consensusPairs.findFirst({
    where: and(
      eq(consensusPairs.clientItemId, itemId),
      sql`(${consensusPairs.reviewerOneId} = ${operatorId} OR ${consensusPairs.reviewerTwoId} = ${operatorId})`,
    ),
  })
  return Boolean(pair)
}
