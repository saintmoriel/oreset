import { pgTable, uuid, text, real, timestamp } from 'drizzle-orm/pg-core'
import { consensusStatusEnum, operatorDecisionEnum, errTagEnum, severityEnum } from './enums'
import { clientQueueItems } from './client-queue-items'
import { operatorReviewDecisions } from './operator-review-decisions'
import { users } from './users'

export const consensusPairs = pgTable('consensus_pairs', {
  id: uuid('id').primaryKey().defaultRandom(),
  clientItemId: uuid('client_item_id')
    .notNull()
    .references(() => clientQueueItems.id, { onDelete: 'cascade' }),
  reviewerOneId: uuid('reviewer_one_id')
    .notNull()
    .references(() => users.id, { onDelete: 'restrict' }),
  reviewerTwoId: uuid('reviewer_two_id')
    .references(() => users.id, { onDelete: 'restrict' }),
  decisionOneId: uuid('decision_one_id')
    .references(() => operatorReviewDecisions.id, { onDelete: 'set null' }),
  decisionTwoId: uuid('decision_two_id')
    .references(() => operatorReviewDecisions.id, { onDelete: 'set null' }),
  status: consensusStatusEnum('status').notNull().default('awaiting_reviews'),
  finalDecision: operatorDecisionEnum('final_decision'),
  finalErrTag: errTagEnum('final_err_tag'),
  finalSeverity: severityEnum('final_severity'),
  agreementScore: real('agreement_score'),
  adjudicatorId: uuid('adjudicator_id')
    .references(() => users.id, { onDelete: 'set null' }),
  adjudicatorNotes: text('adjudicator_notes'),
  adjudicatedAt: timestamp('adjudicated_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export type ConsensusPair = typeof consensusPairs.$inferSelect
export type NewConsensusPair = typeof consensusPairs.$inferInsert
