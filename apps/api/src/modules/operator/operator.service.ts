import { asc, eq } from 'drizzle-orm'
import type { ErrTag, OperatorDecision, RoleType, Severity } from '@oreset/shared'
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
