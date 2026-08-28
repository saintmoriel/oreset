import { eq, and, desc, sql } from 'drizzle-orm'
import type { AuthUser } from '@oreset/shared'
import { db } from '../../db/client'
import { users, datasets, datasetDownloadEvents, type User } from '../../db/schema'
import { hashPassword } from '../../lib/password'
import { writeAuditLog } from '../../lib/audit'
import { HttpError } from '../../middleware/error-handler'
import { toAuthUser } from '../auth/auth.service'
import { getDownloadUrl } from '../uploads/uploads.service'

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
