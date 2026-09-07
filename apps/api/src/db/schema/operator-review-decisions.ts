import { pgTable, uuid, text, jsonb, timestamp, integer } from 'drizzle-orm/pg-core'
import { operatorDecisionEnum, vulnTagEnum, severityEnum, exploitStatusEnum } from './enums'
import { users } from './users'
import { campaigns } from './campaigns'

export const operatorReviewDecisions = pgTable('operator_review_decisions', {
  id: uuid('id').primaryKey().defaultRandom(),
  operatorId: uuid('operator_id')
    .notNull()
    .references(() => users.id, { onDelete: 'restrict' }),
  campaignId: uuid('campaign_id').references(() => campaigns.id, { onDelete: 'set null' }),
  clientItemId: text('client_item_id').notNull(),
  clientItemSnapshot: jsonb('client_item_snapshot'),
  decision: operatorDecisionEnum('decision').notNull(),
  vulnTag: vulnTagEnum('vuln_tag'),
  severity: severityEnum('severity'),
  exploitStatus: exploitStatusEnum('exploit_status'),
  notes: text('notes'),
  reproductionSteps: text('reproduction_steps'),
  recommendedFix: text('recommended_fix'),
  reviewTimeMs: integer('review_time_ms'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export type OperatorReviewDecision = typeof operatorReviewDecisions.$inferSelect
export type NewOperatorReviewDecision = typeof operatorReviewDecisions.$inferInsert
