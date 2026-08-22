import { eq, and } from 'drizzle-orm'
import type { AuthUser } from '@oreset/shared'
import { db } from '../../db/client'
import { users, datasets, type User } from '../../db/schema'
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

  const items = await Promise.all(
    dataset.items.map(async (i) => ({
      id: i.submission.id,
      mediaType: i.submission.mediaType,
      mimeType: i.submission.mimeType,
      durationSeconds: i.submission.durationSeconds,
      downloadUrl: i.submission.fileDeletedAt ? null : await getDownloadUrl(i.submission.storageKey),
    })),
  )

  return { ...dataset, items }
}
