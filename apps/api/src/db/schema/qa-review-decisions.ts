import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core'
import { qaDecisionEnum, errTagEnum } from './enums'
import { submissions } from './submissions'
import { users } from './users'

// Origin Quality Reviewer persona (/qa) — internal staff reviewing
// Oreset's own collected data. Approve or Reject-with-defect-tag only;
// no "escalate" here (that's the Certified Operator persona, a different
// table below, reviewing a client's own AI output instead).
export const qaReviewDecisions = pgTable('qa_review_decisions', {
  id: uuid('id').primaryKey().defaultRandom(),
  submissionId: uuid('submission_id')
    .notNull()
    .references(() => submissions.id, { onDelete: 'cascade' }),
  reviewerId: uuid('reviewer_id')
    .notNull()
    .references(() => users.id, { onDelete: 'restrict' }),
  decision: qaDecisionEnum('decision').notNull(),
  // Required when decision='rejected' — enforced in the service layer,
  // not the DB, since Drizzle/Postgres CHECK constraints referencing a
  // sibling column's value are awkward across two columns like this.
  defectTag: errTagEnum('defect_tag'),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export type QaReviewDecision = typeof qaReviewDecisions.$inferSelect
export type NewQaReviewDecision = typeof qaReviewDecisions.$inferInsert
