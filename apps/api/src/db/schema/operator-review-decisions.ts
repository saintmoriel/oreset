import { pgTable, uuid, text, jsonb, timestamp, integer } from 'drizzle-orm/pg-core'
import { operatorDecisionEnum, errTagEnum, severityEnum } from './enums'
import { users } from './users'
import { campaigns } from './campaigns'

// Certified Operator persona (/operator) — reviewing a live enterprise
// client's own AI output, not Oreset's collected data. client_item_snapshot
// captures the reviewed content as a point-in-time JSON snapshot rather
// than a foreign key, since it's the client's data, not a table we own.
export const operatorReviewDecisions = pgTable('operator_review_decisions', {
  id: uuid('id').primaryKey().defaultRandom(),
  operatorId: uuid('operator_id')
    .notNull()
    .references(() => users.id, { onDelete: 'restrict' }),
  campaignId: uuid('campaign_id').references(() => campaigns.id, { onDelete: 'set null' }),
  clientItemId: text('client_item_id').notNull(), // external ref, e.g. "txn_5521a"
  clientItemSnapshot: jsonb('client_item_snapshot'),
  decision: operatorDecisionEnum('decision').notNull(),
  errTag: errTagEnum('err_tag'), // required when decision='escalated'
  severity: severityEnum('severity'), // required when decision='escalated'
  notes: text('notes'),
  correctedTranscript: text('corrected_transcript'),
  correctedIntent: text('corrected_intent'),
  correctedOutcome: text('corrected_outcome'),
  reviewTimeMs: integer('review_time_ms'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export type OperatorReviewDecision = typeof operatorReviewDecisions.$inferSelect
export type NewOperatorReviewDecision = typeof operatorReviewDecisions.$inferInsert
