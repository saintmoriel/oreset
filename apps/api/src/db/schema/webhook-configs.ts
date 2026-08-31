import { pgTable, uuid, text, timestamp, boolean, jsonb } from 'drizzle-orm/pg-core'
import { users } from './users'

export const webhookConfigs = pgTable('webhook_configs', {
  id: uuid('id').primaryKey().defaultRandom(),
  buyerId: uuid('buyer_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  url: text('url').notNull(),
  secret: text('secret').notNull(),
  events: jsonb('events').notNull().$type<string[]>(),
  active: boolean('active').notNull().default(true),
  description: text('description'),
  lastTriggeredAt: timestamp('last_triggered_at', { withTimezone: true }),
  lastStatus: text('last_status'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export type WebhookConfig = typeof webhookConfigs.$inferSelect
export type NewWebhookConfig = typeof webhookConfigs.$inferInsert
