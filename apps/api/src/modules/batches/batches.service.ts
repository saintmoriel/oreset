import { eq } from 'drizzle-orm'
import { db } from '../../db/client'
import { batches } from '../../db/schema'

export async function listAvailableBatches() {
  return db.query.batches.findMany({
    where: eq(batches.status, 'available'),
    with: { campaign: true },
  })
}

export async function getBatchById(id: string) {
  const batch = await db.query.batches.findFirst({
    where: eq(batches.id, id),
    with: { campaign: true },
  })
  return batch ?? null
}
