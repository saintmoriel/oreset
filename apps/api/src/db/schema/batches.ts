import { pgTable, uuid, text, integer, jsonb, timestamp } from 'drizzle-orm/pg-core'
import { batchStatusEnum, mediaTypeEnum } from './enums'
import { campaigns } from './campaigns'

export const batches = pgTable('batches', {
  id: uuid('id').primaryKey().defaultRandom(),
  campaignId: uuid('campaign_id').references(() => campaigns.id, { onDelete: 'set null' }),
  type: mediaTypeEnum('type').notNull(),
  title: text('title').notNull(),
  itemCount: integer('item_count').notNull(),
  rateMinorUnits: integer('rate_minor_units').notNull(),
  currency: text('currency').notNull().default('NGN'),
  status: batchStatusEnum('status').notNull().default('available'),
  brief: text('brief'),
  guidelines: jsonb('guidelines'),
  requiredPermissions: jsonb('required_permissions'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export type Batch = typeof batches.$inferSelect
export type NewBatch = typeof batches.$inferInsert
