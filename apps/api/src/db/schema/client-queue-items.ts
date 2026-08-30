import { pgTable, uuid, text, jsonb, timestamp, boolean } from 'drizzle-orm/pg-core'
import { clientQueueItemStatusEnum } from './enums'

export const clientQueueItems = pgTable('client_queue_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  clientName: text('client_name').notNull(),
  externalRef: text('external_ref').notNull(),
  content: text('content').notNull(),
  traceData: jsonb('trace_data'),
  status: clientQueueItemStatusEnum('status').notNull().default('pending'),
  requiresDualSolve: boolean('requires_dual_solve').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export type ClientQueueItem = typeof clientQueueItems.$inferSelect
export type NewClientQueueItem = typeof clientQueueItems.$inferInsert
