import { pgTable, uuid, text, integer, jsonb, timestamp } from 'drizzle-orm/pg-core'
import { campaignStatusEnum, mediaTypeEnum } from './enums'
import { users } from './users'

export const campaigns = pgTable('campaigns', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  status: campaignStatusEnum('status').notNull().default('draft'),
  mediaType: mediaTypeEnum('media_type').notNull(),
  language: text('language'),
  domain: text('domain'),
  payRateMinorUnits: integer('pay_rate_minor_units'),
  currency: text('currency').notNull().default('NGN'),
  materials: jsonb('materials'),
  cohort: text('cohort'),
  createdBy: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
  launchedAt: timestamp('launched_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export type Campaign = typeof campaigns.$inferSelect
export type NewCampaign = typeof campaigns.$inferInsert
