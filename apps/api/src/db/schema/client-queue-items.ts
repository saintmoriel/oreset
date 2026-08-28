import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core'
import { clientQueueItemStatusEnum } from './enums'

// A live enterprise client's AI output awaiting Certified Operator QA.
// Not `campaigns` (models Origin data-sourcing) and deliberately no
// `clients` table — clientName is denormalized text; real client-system
// integration is Phase 5's scope, not this phase's.
export const clientQueueItems = pgTable('client_queue_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  clientName: text('client_name').notNull(),
  externalRef: text('external_ref').notNull(), // e.g. "txn_5521a"
  content: text('content').notNull(),
  status: clientQueueItemStatusEnum('status').notNull().default('pending'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export type ClientQueueItem = typeof clientQueueItems.$inferSelect
export type NewClientQueueItem = typeof clientQueueItems.$inferInsert
