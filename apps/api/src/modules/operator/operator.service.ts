import { asc, count, desc, eq } from 'drizzle-orm'
import type { ErrTag, OperatorDecision, RoleType, Severity } from '@oreset/shared'
import { ERR_TAGS } from '@oreset/shared'
import { db } from '../../db/client'
import { clientQueueItems, operatorReviewDecisions, clientTickets } from '../../db/schema'
import { writeAuditLog } from '../../lib/audit'
import { HttpError } from '../../middleware/error-handler'

export async function getQueue() {
  return db.query.clientQueueItems.findMany({
    where: eq(clientQueueItems.status, 'pending'),
    orderBy: asc(clientQueueItems.createdAt),
  })
}

// Real COUNT — cheaper than getQueue().length, no per-row cost to throw away.
export async function getQueueCount(): Promise<number> {
  const [row] = await db
    .select({ value: count() })
    .from(clientQueueItems)
    .where(eq(clientQueueItems.status, 'pending'))
  return row?.value ?? 0
}

export async function getMyDecisions(operatorId: string) {
  return db.query.operatorReviewDecisions.findMany({
    where: eq(operatorReviewDecisions.operatorId, operatorId),
    orderBy: desc(operatorReviewDecisions.createdAt),
    limit: 50,
    with: { ticket: true },
  })
}

export async function getMyStats(operatorId: string) {
  const decisions = await db.query.operatorReviewDecisions.findMany({
    where: eq(operatorReviewDecisions.operatorId, operatorId),
    with: { ticket: true },
  })

  const today = new Date().toISOString().slice(0, 10)
  const reviewedToday = decisions.filter((d) => d.createdAt.toISOString().slice(0, 10) === today).length
  const approvedAllTime = decisions.filter((d) => d.decision === 'approved').length
  const escalatedAllTime = decisions.filter((d) => d.decision === 'escalated').length
  const rejectedAllTime = decisions.filter((d) => d.decision === 'rejected').length
  const reviewedAllTime = decisions.length
  const approvalRate = reviewedAllTime > 0 ? Math.round((approvedAllTime / reviewedAllTime) * 100) : null

  const errTagBreakdown = Object.fromEntries(ERR_TAGS.map((tag) => [tag, 0])) as Record<ErrTag, number>
  for (const d of decisions) {
    if (d.errTag) errTagBreakdown[d.errTag] += 1
  }

  const openTicketsFromMe = decisions.filter((d) => d.ticket && d.ticket.status === 'open').length

  return {
    queueRemaining: await getQueueCount(),
    reviewedToday,
    reviewedAllTime,
    approvedAllTime,
    escalatedAllTime,
    rejectedAllTime,
    approvalRate,
    errTagBreakdown,
    openTicketsFromMe,
  }
}

export async function decide(input: {
  itemId: string
  operatorId: string
  operatorRole: RoleType
  decision: OperatorDecision
  errTag?: ErrTag
  severity?: Severity
  notes?: string
}) {
  const item = await db.query.clientQueueItems.findFirst({ where: eq(clientQueueItems.id, input.itemId) })
  if (!item) throw new HttpError(404, 'not_found', 'Queue item not found.')
  if (item.status !== 'pending') {
    throw new HttpError(409, 'invalid_state', 'This item is not awaiting review.')
  }

  const [decision] = await db
    .insert(operatorReviewDecisions)
    .values({
      operatorId: input.operatorId,
      clientItemId: item.externalRef,
      clientItemSnapshot: { content: item.content, clientName: item.clientName },
      decision: input.decision,
      errTag: input.errTag,
      severity: input.severity,
      notes: input.notes,
    })
    .returning()

  // OPERATOR_DECISIONS ('approved'|'escalated'|'rejected') is exactly
  // CLIENT_QUEUE_ITEM_STATUSES minus 'pending' — no status-mapping needed.
  await db.update(clientQueueItems).set({ status: input.decision }).where(eq(clientQueueItems.id, item.id))

  // The real destination for an escalation — before this, escalating just
  // flipped client_queue_items.status and nothing downstream ever
  // surfaced it. One ticket per escalation.
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

  await writeAuditLog({
    actorId: input.operatorId,
    actorLabel: input.operatorId,
    actorRole: input.operatorRole,
    action: `operator.decision.${input.decision}`,
    resourceType: 'client_queue_item',
    resourceId: item.id,
    metadata: { errTag: input.errTag, severity: input.severity, notes: input.notes },
  })

  return { item: { ...item, status: input.decision }, decision }
}
