import crypto from 'node:crypto'
import { eq, and, count, desc, inArray, sql } from 'drizzle-orm'
import type { AuthUser } from '@oreset/shared'
import { db } from '../../db/client'
import { users, datasets, datasetDownloadEvents, clientQueueItems, operatorReviewDecisions, webhookConfigs, type User } from '../../db/schema'
import { hashPassword } from '../../lib/password'
import { writeAuditLog } from '../../lib/audit'
import { HttpError } from '../../middleware/error-handler'
import { toAuthUser } from '../auth/auth.service'
import { getDownloadUrl } from '../uploads/uploads.service'
import { ingestSingle, ingestBatch } from '../ingestion/ingestion.service'

export async function provisionBuyer(input: {
  email: string
  password: string
  displayName: string
  provisionedBy: string
}): Promise<{ user: AuthUser }> {
  const existing = await db.query.users.findFirst({ where: eq(users.email, input.email) })
  if (existing) throw new HttpError(409, 'email_taken', 'An account with that email already exists.')

  const passwordHash = await hashPassword(input.password)

  let user: User
  try {
    ;[user] = await db
      .insert(users)
      .values({
        role: 'buyer',
        status: 'active',
        email: input.email,
        passwordHash,
        displayName: input.displayName,
      })
      .returning()
  } catch (err: unknown) {
    // Backstop for the check-then-insert race — same pattern as
    // operators.service.ts's apply().
    if ((err as { code?: string })?.code === '23505') {
      throw new HttpError(409, 'email_taken', 'An account with that email already exists.')
    }
    throw err
  }

  await writeAuditLog({
    actorId: input.provisionedBy,
    actorLabel: input.provisionedBy,
    actorRole: 'staff:admin',
    action: 'buyer.provisioned',
    resourceType: 'user',
    resourceId: user.id,
  })

  return { user: toAuthUser(user) }
}

export async function listBuyers() {
  return db.query.users.findMany({
    where: eq(users.role, 'buyer'),
    columns: { id: true, email: true, displayName: true, createdAt: true },
  })
}

export async function getMyDatasets(buyerId: string) {
  return db.query.datasets.findMany({
    where: and(eq(datasets.buyerId, buyerId), eq(datasets.status, 'delivered')),
    with: { campaign: true, items: true },
  })
}

export async function getMyDatasetDetail(buyerId: string, datasetId: string) {
  const dataset = await db.query.datasets.findFirst({
    where: and(eq(datasets.id, datasetId), eq(datasets.buyerId, buyerId), eq(datasets.status, 'delivered')),
    with: {
      campaign: true,
      items: { with: { submission: true } },
    },
  })
  // 404, not 403 — a buyer probing another dataset's id shouldn't be able
  // to tell "not yours" apart from "doesn't exist."
  if (!dataset) throw new HttpError(404, 'not_found', 'Dataset not found.')

  const downloadEvents = await db.query.datasetDownloadEvents.findMany({
    where: and(eq(datasetDownloadEvents.datasetId, datasetId), eq(datasetDownloadEvents.buyerId, buyerId)),
    orderBy: desc(datasetDownloadEvents.createdAt),
  })
  const lastDownloadedBySubmission = new Map<string, Date>()
  for (const event of downloadEvents) {
    if (!lastDownloadedBySubmission.has(event.submissionId)) {
      lastDownloadedBySubmission.set(event.submissionId, event.createdAt)
    }
  }

  const items = await Promise.all(
    dataset.items.map(async (i) => ({
      id: i.submission.id,
      mediaType: i.submission.mediaType,
      mimeType: i.submission.mimeType,
      durationSeconds: i.submission.durationSeconds,
      downloadUrl: i.submission.fileDeletedAt ? null : await getDownloadUrl(i.submission.storageKey),
      lastDownloadedAt: lastDownloadedBySubmission.get(i.submission.id) ?? null,
    })),
  )

  return { ...dataset, items }
}

export async function getMyStats(buyerId: string) {
  const delivered = await db.query.datasets.findMany({
    where: and(eq(datasets.buyerId, buyerId), eq(datasets.status, 'delivered')),
    with: { items: { columns: { id: true } } },
  })

  const [{ count: downloadsTotal }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(datasetDownloadEvents)
    .where(eq(datasetDownloadEvents.buyerId, buyerId))

  const itemsLicensed = delivered.reduce((sum, d) => sum + d.items.length, 0)
  const lastDeliveredAt = delivered.reduce<Date | null>((latest, d) => {
    if (!d.deliveredAt) return latest
    return !latest || d.deliveredAt > latest ? d.deliveredAt : latest
  }, null)

  return {
    itemsLicensed,
    datasetsDelivered: delivered.length,
    downloadsTotal,
    lastDeliveredAt,
  }
}

export async function getMyDownloadActivity(buyerId: string) {
  return db.query.datasetDownloadEvents.findMany({
    where: eq(datasetDownloadEvents.buyerId, buyerId),
    orderBy: desc(datasetDownloadEvents.createdAt),
    limit: 50,
    with: {
      dataset: { columns: { id: true, title: true } },
      submission: { columns: { id: true, mediaType: true } },
    },
  })
}

// Re-runs the same ownership guard getMyDatasetDetail uses: 404 (not 403)
// on any mismatch, so a buyer probing another buyer's dataset/item ids
// can't distinguish "not yours" from "doesn't exist." 410 if retention has
// already purged the underlying file.
export async function recordDownload(
  buyerId: string,
  datasetId: string,
  submissionId: string,
): Promise<{ url: string }> {
  const dataset = await db.query.datasets.findFirst({
    where: and(eq(datasets.id, datasetId), eq(datasets.buyerId, buyerId), eq(datasets.status, 'delivered')),
    with: { items: { where: (fields, { eq }) => eq(fields.submissionId, submissionId), with: { submission: true } } },
  })
  if (!dataset) throw new HttpError(404, 'not_found', 'Dataset not found.')

  const item = dataset.items[0]
  if (!item) throw new HttpError(404, 'not_found', 'Item not found in this dataset.')
  if (item.submission.fileDeletedAt) {
    throw new HttpError(410, 'file_deleted', 'This file has been removed under the retention policy.')
  }

  await db.insert(datasetDownloadEvents).values({ datasetId, submissionId, buyerId })

  const url = await getDownloadUrl(item.submission.storageKey)
  return { url }
}

// ---------------------------------------------------------------------------
// Verification Cases (Client Portal)
// ---------------------------------------------------------------------------

export async function submitCase(buyerId: string, input: {
  clientName: string
  externalRef: string
  content: string
  traceData?: Record<string, unknown>
  requiresDualSolve?: boolean
}) {
  const item = await ingestSingle({
    ...input,
    submittedBy: buyerId,
  })

  await writeAuditLog({
    actorId: buyerId,
    actorLabel: buyerId,
    actorRole: 'buyer',
    action: 'buyer.case.submitted',
    resourceType: 'client_queue_item',
    resourceId: item.id,
  })

  return item
}

export async function getMyCases(buyerId: string, statusFilter?: string) {
  const conditions = [eq(clientQueueItems.submittedBy, buyerId)]
  if (statusFilter && statusFilter !== 'all') {
    conditions.push(eq(clientQueueItems.status, statusFilter as any))
  }

  return db
    .select()
    .from(clientQueueItems)
    .where(and(...conditions))
    .orderBy(desc(clientQueueItems.createdAt))
    .limit(200)
}

export async function getMyCaseDetail(buyerId: string, caseId: string) {
  const item = await db.query.clientQueueItems.findFirst({
    where: and(eq(clientQueueItems.id, caseId), eq(clientQueueItems.submittedBy, buyerId)),
  })
  if (!item) throw new HttpError(404, 'not_found', 'Case not found.')

  const decisions = await db.query.operatorReviewDecisions.findMany({
    where: eq(operatorReviewDecisions.clientItemId, item.externalRef),
    orderBy: desc(operatorReviewDecisions.createdAt),
  })

  return { item, decisions }
}

export async function getMyCaseStats(buyerId: string) {
  const items = await db
    .select({ status: clientQueueItems.status })
    .from(clientQueueItems)
    .where(eq(clientQueueItems.submittedBy, buyerId))

  const total = items.length
  const pending = items.filter((i) => i.status === 'pending' || i.status === 'in_review').length
  const approved = items.filter((i) => i.status === 'approved').length
  const corrected = items.filter((i) => i.status === 'corrected').length
  const rejected = items.filter((i) => i.status === 'rejected').length
  const escalated = items.filter((i) => i.status === 'escalated').length
  const consensusSplit = items.filter((i) => i.status === 'consensus_split').length

  return { total, pending, approved, corrected, rejected, escalated, consensusSplit }
}

export async function submitCasesBatch(
  buyerId: string,
  cases: Array<{
    clientName: string
    externalRef: string
    content: string
    traceData?: Record<string, unknown>
    requiresDualSolve?: boolean
  }>,
) {
  const items = await ingestBatch(
    cases.map((c) => ({ ...c, submittedBy: buyerId })),
    buyerId,
  )

  await writeAuditLog({
    actorId: buyerId,
    actorLabel: buyerId,
    actorRole: 'buyer',
    action: 'buyer.cases.batch_submitted',
    resourceType: 'client_queue_item',
    metadata: { count: items.length },
  })

  return items
}

export async function exportMyCases(buyerId: string, statusFilter?: string) {
  const conditions = [eq(clientQueueItems.submittedBy, buyerId)]
  if (statusFilter && statusFilter !== 'all') {
    conditions.push(eq(clientQueueItems.status, statusFilter as any))
  }

  const items = await db
    .select()
    .from(clientQueueItems)
    .where(and(...conditions))
    .orderBy(desc(clientQueueItems.createdAt))

  const itemRefs = items.map((i) => i.externalRef)
  const decisions = itemRefs.length > 0
    ? await db.query.operatorReviewDecisions.findMany({
        where: inArray(operatorReviewDecisions.clientItemId, itemRefs),
        orderBy: desc(operatorReviewDecisions.createdAt),
      })
    : []

  const decisionsByRef = new Map<string, typeof decisions>()
  for (const d of decisions) {
    const existing = decisionsByRef.get(d.clientItemId) ?? []
    existing.push(d)
    decisionsByRef.set(d.clientItemId, existing)
  }

  return items.map((item) => {
    const itemDecisions = decisionsByRef.get(item.externalRef) ?? []
    const traceData = item.traceData as Record<string, unknown> | null
    return {
      id: item.id,
      externalRef: item.externalRef,
      clientName: item.clientName,
      status: item.status,
      language: traceData?.language ?? null,
      domain: traceData?.domain ?? null,
      aiDecision: traceData?.aiDecision ?? null,
      aiOutcome: traceData?.aiOutcome ?? null,
      requiresDualSolve: item.requiresDualSolve,
      submittedAt: item.createdAt.toISOString(),
      reviews: itemDecisions.map((d) => ({
        decision: d.decision,
        errTag: d.errTag,
        severity: d.severity,
        notes: d.notes,
        correctedTranscript: d.correctedTranscript,
        correctedIntent: d.correctedIntent,
        correctedOutcome: d.correctedOutcome,
        reviewedAt: d.createdAt.toISOString(),
      })),
    }
  })
}

// ---------------------------------------------------------------------------
// Webhook Configuration
// ---------------------------------------------------------------------------

export async function getMyWebhooks(buyerId: string) {
  return db.query.webhookConfigs.findMany({
    where: eq(webhookConfigs.buyerId, buyerId),
    orderBy: desc(webhookConfigs.createdAt),
  })
}

export async function createWebhook(
  buyerId: string,
  input: { url: string; events: string[]; description?: string },
) {
  const secret = crypto.randomBytes(32).toString('hex')

  const [config] = await db
    .insert(webhookConfigs)
    .values({
      buyerId,
      url: input.url,
      secret,
      events: input.events,
      description: input.description,
    })
    .returning()

  await writeAuditLog({
    actorId: buyerId,
    actorLabel: buyerId,
    actorRole: 'buyer',
    action: 'buyer.webhook.created',
    resourceType: 'webhook_config',
    resourceId: config.id,
  })

  return config
}

export async function updateWebhook(
  buyerId: string,
  webhookId: string,
  input: { url?: string; events?: string[]; description?: string; active?: boolean },
) {
  const existing = await db.query.webhookConfigs.findFirst({
    where: and(eq(webhookConfigs.id, webhookId), eq(webhookConfigs.buyerId, buyerId)),
  })
  if (!existing) throw new HttpError(404, 'not_found', 'Webhook not found.')

  const updates: Record<string, unknown> = { updatedAt: new Date() }
  if (input.url !== undefined) updates.url = input.url
  if (input.events !== undefined) updates.events = input.events
  if (input.description !== undefined) updates.description = input.description
  if (input.active !== undefined) updates.active = input.active

  const [updated] = await db
    .update(webhookConfigs)
    .set(updates)
    .where(eq(webhookConfigs.id, webhookId))
    .returning()

  return updated
}

export async function deleteWebhook(buyerId: string, webhookId: string) {
  const existing = await db.query.webhookConfigs.findFirst({
    where: and(eq(webhookConfigs.id, webhookId), eq(webhookConfigs.buyerId, buyerId)),
  })
  if (!existing) throw new HttpError(404, 'not_found', 'Webhook not found.')

  await db.delete(webhookConfigs).where(eq(webhookConfigs.id, webhookId))

  await writeAuditLog({
    actorId: buyerId,
    actorLabel: buyerId,
    actorRole: 'buyer',
    action: 'buyer.webhook.deleted',
    resourceType: 'webhook_config',
    resourceId: webhookId,
  })
}

export async function rotateWebhookSecret(buyerId: string, webhookId: string) {
  const existing = await db.query.webhookConfigs.findFirst({
    where: and(eq(webhookConfigs.id, webhookId), eq(webhookConfigs.buyerId, buyerId)),
  })
  if (!existing) throw new HttpError(404, 'not_found', 'Webhook not found.')

  const newSecret = crypto.randomBytes(32).toString('hex')

  const [updated] = await db
    .update(webhookConfigs)
    .set({ secret: newSecret, updatedAt: new Date() })
    .where(eq(webhookConfigs.id, webhookId))
    .returning()

  return updated
}

export async function getMyRegressions(buyerId: string) {
  const myItems = await db
    .select({ externalRef: clientQueueItems.externalRef })
    .from(clientQueueItems)
    .where(eq(clientQueueItems.submittedBy, buyerId))

  const refs = myItems.map((i) => i.externalRef)
  if (refs.length === 0) return []

  const decisions = await db.query.operatorReviewDecisions.findMany({
    where: and(
      inArray(operatorReviewDecisions.clientItemId, refs),
      inArray(operatorReviewDecisions.decision, ['rejected', 'corrected']),
    ),
    orderBy: desc(operatorReviewDecisions.createdAt),
    limit: 500,
  })

  return decisions.map((d) => {
    const snapshot = d.clientItemSnapshot as Record<string, unknown> | null
    const traceData = snapshot?.traceData as Record<string, unknown> | null
    return {
      testCaseId: `OMAT-${d.createdAt.getFullYear()}-${d.id.slice(0, 8).toUpperCase()}`,
      externalRef: d.clientItemId,
      domain: traceData?.domain ?? null,
      language: traceData?.language ?? null,
      sourceInput: snapshot?.content ?? null,
      modelOutput: traceData?.aiDecision ?? null,
      groundTruth: d.correctedOutcome ?? null,
      correctedTranscript: d.correctedTranscript ?? null,
      correctedIntent: d.correctedIntent ?? null,
      errTag: d.errTag,
      severity: d.severity,
      decision: d.decision,
      reviewerNotes: d.notes,
      reviewedAt: d.createdAt.toISOString(),
    }
  })
}
