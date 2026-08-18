import { eq } from 'drizzle-orm'
import { db } from '../../db/client'
import { batches, type Batch } from '../../db/schema'

export async function listAvailableBatches(): Promise<Batch[]> {
  return db.query.batches.findMany({ where: eq(batches.status, 'available') })
}

export async function getBatchById(id: string): Promise<Batch | null> {
  const batch = await db.query.batches.findFirst({ where: eq(batches.id, id) })
  return batch ?? null
}
