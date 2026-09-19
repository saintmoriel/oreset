import { pgTable, uuid, text, integer, timestamp } from 'drizzle-orm/pg-core'
import { users } from './users'

// One scoped piece of work for one client. Tier and phase are text (not
// pg enums) so adding a phase later is a code change, not a migration.
export const engagements = pgTable('engagements', {
  id: uuid('id').primaryKey().defaultRandom(),
  buyerId: uuid('buyer_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  agentName: text('agent_name').notNull(),
  tier: text('tier').notNull(),
  phase: text('phase').notNull().default('kickoff'),
  scope: text('scope').notNull().default(''),
  // The Rules of Engagement testers must acknowledge. Editing the text bumps
  // rules_version so everyone re-acknowledges before their next decision.
  rules: text('rules').notNull().default(''),
  rulesVersion: integer('rules_version').notNull().default(1),
  startsAt: timestamp('starts_at', { withTimezone: true }),
  endsAt: timestamp('ends_at', { withTimezone: true }),
  retestUntil: timestamp('retest_until', { withTimezone: true }),
  createdBy: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const engagementAcknowledgements = pgTable('engagement_acknowledgements', {
  id: uuid('id').primaryKey().defaultRandom(),
  engagementId: uuid('engagement_id').notNull().references(() => engagements.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  rulesVersion: integer('rules_version').notNull(),
  ip: text('ip'),
  acknowledgedAt: timestamp('acknowledged_at', { withTimezone: true }).notNull().defaultNow(),
})

export type Engagement = typeof engagements.$inferSelect
export type NewEngagement = typeof engagements.$inferInsert
