import { eq } from 'drizzle-orm'
import { db } from '../../db/client'
import { clientQueueItems } from '../../db/schema'
import { HttpError } from '../../middleware/error-handler'

type TraceUnitInput = {
  clientName: string
  externalRef: string
  content: string
  traceData?: Record<string, unknown>
}

export async function ingestSingle(input: TraceUnitInput) {
  const [item] = await db
    .insert(clientQueueItems)
    .values({
      clientName: input.clientName,
      externalRef: input.externalRef,
      content: input.content,
      traceData: input.traceData ?? null,
    })
    .returning()
  return item
}

export async function ingestBatch(inputs: TraceUnitInput[]) {
  const items = await db
    .insert(clientQueueItems)
    .values(
      inputs.map((input) => ({
        clientName: input.clientName,
        externalRef: input.externalRef,
        content: input.content,
        traceData: input.traceData ?? null,
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
