import { and, eq, inArray, desc, gte, sql } from 'drizzle-orm'
import { db } from '../../db/client'
import { clientQueueItems, operatorReviewDecisions } from '../../db/schema'
import { HttpError } from '../../middleware/error-handler'

type TraceUnitInput = {
  clientName: string
  externalRef: string
  content: string
  traceData?: Record<string, unknown>
  requiresDualSolve?: boolean
  submittedBy?: string
}

export async function ingestSingle(input: TraceUnitInput) {
  const [item] = await db
    .insert(clientQueueItems)
    .values({
      clientName: input.clientName,
      externalRef: input.externalRef,
      content: input.content,
      traceData: input.traceData ?? null,
      requiresDualSolve: input.requiresDualSolve ?? false,
      submittedBy: input.submittedBy ?? null,
    })
    .returning()
  return item
}

export async function ingestBatch(inputs: TraceUnitInput[], submittedBy?: string) {
  const items = await db
    .insert(clientQueueItems)
    .values(
      inputs.map((input) => ({
        clientName: input.clientName,
        externalRef: input.externalRef,
        content: input.content,
        traceData: input.traceData ?? null,
        requiresDualSolve: input.requiresDualSolve ?? false,
        submittedBy: submittedBy ?? null,
      })),
    )
    .returning()
  return items
}

export async function getItemStatus(id: string) {
  const item = await db.query.clientQueueItems.findFirst({
    where: eq(clientQueueItems.id, id),
  })
  if (!item) throw new HttpError(404, 'not_found', 'Item not found.')
  return { id: item.id, externalRef: item.externalRef, status: item.status, createdAt: item.createdAt }
}

// ---------------------------------------------------------------------------
// CI/CD Regression Test Export
// ---------------------------------------------------------------------------

type RegressionFilters = {
  clientName?: string
  since?: Date
  limit?: number
}

export async function getRegressionSuite(filters: RegressionFilters) {
  const conditions = [
    inArray(operatorReviewDecisions.decision, ['exploited']),
  ]

  if (filters.since) {
    conditions.push(gte(operatorReviewDecisions.createdAt, filters.since))
  }

  const decisions = await db.query.operatorReviewDecisions.findMany({
    where: and(...conditions),
    orderBy: desc(operatorReviewDecisions.createdAt),
    limit: filters.limit ?? 500,
  })

  const filtered = filters.clientName
    ? decisions.filter((d) => {
        const snapshot = d.clientItemSnapshot as Record<string, unknown> | null
        return snapshot?.clientName === filters.clientName
      })
    : decisions

  return filtered.map((d) => {
    const snapshot = d.clientItemSnapshot as Record<string, unknown> | null
    const traceData = snapshot?.traceData as Record<string, unknown> | null

    const testCase: Record<string, unknown> = {
      test_case_id: `ORT-${d.createdAt.getFullYear()}-${d.id.slice(0, 8).toUpperCase()}`,
      external_ref: d.clientItemId,
      client_name: snapshot?.clientName ?? null,
      domain: traceData?.domain ?? null,
      language: traceData?.language ?? null,
      attack_prompt: snapshot?.content ?? null,
      model_response: traceData?.aiDecision ?? null,
      vuln_tag: d.vulnTag ?? null,
      exploit_status: d.exploitStatus ?? null,
      severity: d.severity ?? null,
      reproduction_steps: d.reproductionSteps ?? null,
      recommended_fix: d.recommendedFix ?? null,
      decision: d.decision,
      reviewer_notes: d.notes ?? null,
      reviewed_at: d.createdAt.toISOString(),
    }

    return testCase
  })
}

export async function getRegressionStats() {
  const [exploited] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(operatorReviewDecisions)
    .where(eq(operatorReviewDecisions.decision, 'exploited'))

  const [defended] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(operatorReviewDecisions)
    .where(eq(operatorReviewDecisions.decision, 'defended'))

  const clientNames = await db
    .select({
      clientName: sql<string>`client_item_snapshot->>'clientName'`,
    })
    .from(operatorReviewDecisions)
    .where(eq(operatorReviewDecisions.decision, 'exploited'))
    .groupBy(sql`client_item_snapshot->>'clientName'`)

  return {
    exploitedCount: exploited?.count ?? 0,
    defendedCount: defended?.count ?? 0,
    totalTestCases: exploited?.count ?? 0,
    clients: clientNames.map((c) => c.clientName).filter(Boolean),
  }
}
