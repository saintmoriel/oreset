import { asc, eq } from 'drizzle-orm'
import { db } from '../../db/client'
import { prompts, type Prompt } from '../../db/schema'
import { HttpError } from '../../middleware/error-handler'

export async function listByBatch(batchId: string): Promise<Prompt[]> {
  return db.query.prompts.findMany({ where: eq(prompts.batchId, batchId), orderBy: asc(prompts.order) })
}

export async function create(input: { batchId: string; content: string }): Promise<Prompt> {
  const existing = await listByBatch(input.batchId)
  const nextOrder = existing.length > 0 ? Math.max(...existing.map((p) => p.order)) + 1 : 0
  const [prompt] = await db
    .insert(prompts)
    .values({ batchId: input.batchId, content: input.content, order: nextOrder })
    .returning()
  return prompt
}

export async function update(id: string, content: string): Promise<Prompt> {
  const [prompt] = await db.update(prompts).set({ content }).where(eq(prompts.id, id)).returning()
  if (!prompt) throw new HttpError(404, 'not_found', 'Prompt not found.')
  return prompt
}

export async function remove(id: string): Promise<void> {
  const deleted = await db.delete(prompts).where(eq(prompts.id, id)).returning({ id: prompts.id })
  if (deleted.length === 0) throw new HttpError(404, 'not_found', 'Prompt not found.')
}
