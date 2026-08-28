import { pgTable, uuid, text, integer, timestamp } from 'drizzle-orm/pg-core'
import { batches } from './batches'

export const prompts = pgTable('prompts', {
  id: uuid('id').primaryKey().defaultRandom(),
  batchId: uuid('batch_id')
    .notNull()
    .references(() => batches.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  order: integer('order').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export type Prompt = typeof prompts.$inferSelect
export type NewPrompt = typeof prompts.$inferInsert
