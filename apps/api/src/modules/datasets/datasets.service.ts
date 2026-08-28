import { createHash } from 'node:crypto'
import { eq, and, inArray } from 'drizzle-orm'
import { db } from '../../db/client'
import { datasets, datasetItems, submissions, batches, users, type Dataset } from '../../db/schema'
import { writeAuditLog } from '../../lib/audit'
import { HttpError } from '../../middleware/error-handler'

export async function listDatasets() {
  return db.query.datasets.findMany({
    with: { campaign: true, buyer: true, items: true },
  })
}

export async function getDataset(id: string) {
  const dataset = await db.query.datasets.findFirst({
    where: eq(datasets.id, id),
    with: {
      campaign: true,
      buyer: true,
      items: { with: { submission: true } },
    },
  })
  if (!dataset) throw new HttpError(404, 'not_found', 'Dataset not found.')
  return dataset
}

export async function createDataset(input: {
  title: string
  campaignId: string
  licenseTerms: string
  createdBy: string
}): Promise<Dataset> {
  const [dataset] = await db
    .insert(datasets)
    .values({
      title: input.title,
      campaignId: input.campaignId,
      licenseTerms: input.licenseTerms,
      createdBy: input.createdBy,
    })
    .returning()

  await writeAuditLog({
    actorId: input.createdBy,
    actorLabel: input.createdBy,
    actorRole: 'staff:admin',
    action: 'dataset.created',
    resourceType: 'dataset',
    resourceId: dataset.id,
  })

  return dataset
}

// qa_approved submissions belonging to this campaign, not yet assembled
// into any dataset (a submission belongs to at most one dataset ever).
export async function listUnassembledSubmissions(campaignId: string) {
  const campaignBatches = await db.query.batches.findMany({
    where: eq(batches.campaignId, campaignId),
    columns: { id: true },
  })
  const batchIds = campaignBatches.map((b) => b.id)
  if (batchIds.length === 0) return []

  const alreadyAssembled = await db.query.datasetItems.findMany({ columns: { submissionId: true } })
  const assembledIds = new Set(alreadyAssembled.map((i) => i.submissionId))

  const candidates = await db.query.submissions.findMany({
    where: and(inArray(submissions.batchId, batchIds), eq(submissions.status, 'qa_approved')),
    with: {
      batch: { columns: { id: true, title: true } },
      // Only what the admin assembly UI needs to show — never the full
      // row (which would otherwise serialize contributor.passwordHash).
      contributor: { columns: { id: true, displayName: true } },
    },
  })

  return candidates.filter((s) => !assembledIds.has(s.id))
}

export async function addItems(datasetId: string, submissionIds: string[]): Promise<{ added: number }> {
  const dataset = await db.query.datasets.findFirst({ where: eq(datasets.id, datasetId) })
  if (!dataset) throw new HttpError(404, 'not_found', 'Dataset not found.')
  if (dataset.status !== 'draft') {
    throw new HttpError(409, 'invalid_state', 'Items can only be added while the dataset is still a draft.')
  }

  const unassembled = await listUnassembledSubmissions(dataset.campaignId)
  const unassembledIds = new Set(unassembled.map((s) => s.id))
  const invalid = submissionIds.filter((id) => !unassembledIds.has(id))
  if (invalid.length > 0) {
    throw new HttpError(
      400,
      'invalid_submissions',
      `These submissions are not eligible (not qa_approved, not in this campaign, or already assembled): ${invalid.join(', ')}`,
    )
  }

  await db.transaction(async (tx) => {
    for (const submissionId of submissionIds) {
      await tx.insert(datasetItems).values({ datasetId, submissionId })
    }
  })

  return { added: submissionIds.length }
}

export async function removeItem(datasetId: string, submissionId: string): Promise<void> {
  const dataset = await db.query.datasets.findFirst({ where: eq(datasets.id, datasetId) })
  if (!dataset) throw new HttpError(404, 'not_found', 'Dataset not found.')
  if (dataset.status !== 'draft') {
    throw new HttpError(409, 'invalid_state', 'Items can only be removed while the dataset is still a draft.')
  }

  await db
    .delete(datasetItems)
    .where(and(eq(datasetItems.datasetId, datasetId), eq(datasetItems.submissionId, submissionId)))
}

export async function sealDataset(datasetId: string, sealedBy: string): Promise<Dataset> {
  const dataset = await db.query.datasets.findFirst({
    where: eq(datasets.id, datasetId),
    with: { items: { with: { submission: true } } },
  })
  if (!dataset) throw new HttpError(404, 'not_found', 'Dataset not found.')
  if (dataset.status !== 'draft') {
    throw new HttpError(409, 'invalid_state', 'Only a draft dataset can be sealed.')
  }
  if (dataset.items.length === 0) {
    throw new HttpError(409, 'empty_dataset', 'A dataset needs at least one item before it can be sealed.')
  }

  const sealedAt = new Date()
  const manifest = {
    datasetId: dataset.id,
    sealedAt: sealedAt.toISOString(),
    items: dataset.items
      .map((i) => ({ submissionId: i.submissionId, consentRecordId: i.submission.consentRecordId }))
      .sort((a, b) => a.submissionId.localeCompare(b.submissionId)),
  }
  const provenanceHash = createHash('sha256').update(JSON.stringify(manifest)).digest('hex')

  const [updated] = await db
    .update(datasets)
    .set({ status: 'sealed', sealedAt, provenanceHash })
    .where(eq(datasets.id, datasetId))
    .returning()

  await writeAuditLog({
    actorId: sealedBy,
    actorLabel: sealedBy,
    actorRole: 'staff:admin',
    action: 'dataset.sealed',
    resourceType: 'dataset',
    resourceId: dataset.id,
    metadata: { provenanceHash, itemCount: dataset.items.length },
  })

  return updated
}

export async function handoffDataset(datasetId: string, buyerId: string, handedOffBy: string): Promise<Dataset> {
  const dataset = await db.query.datasets.findFirst({ where: eq(datasets.id, datasetId) })
  if (!dataset) throw new HttpError(404, 'not_found', 'Dataset not found.')
  if (dataset.status !== 'sealed') {
    throw new HttpError(409, 'invalid_state', 'Only a sealed dataset can be handed off.')
  }

  const buyer = await db.query.users.findFirst({ where: eq(users.id, buyerId) })
  if (!buyer || buyer.role !== 'buyer') {
    throw new HttpError(400, 'invalid_buyer', 'That user is not a buyer account.')
  }

  const deliveredAt = new Date()
  const [updated] = await db
    .update(datasets)
    .set({ status: 'delivered', buyerId, deliveredAt })
    .where(eq(datasets.id, datasetId))
    .returning()

  await writeAuditLog({
    actorId: handedOffBy,
    actorLabel: handedOffBy,
    actorRole: 'staff:admin',
    action: 'dataset.delivered',
    resourceType: 'dataset',
    resourceId: dataset.id,
    metadata: { buyerId },
  })

  return updated
}
