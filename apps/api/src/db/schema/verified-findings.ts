import { pgTable, uuid, text, boolean, timestamp } from 'drizzle-orm/pg-core'
import { auditorDecisionEnum, severityEnum, findingStatusEnum } from './enums'
import { clientQueueItems } from './client-queue-items'
import { operatorReviewDecisions } from './operator-review-decisions'
import { users } from './users'

// A lead auditor's verdict on a tester's finding, plus the finding's
// remediation lifecycle (verified → fix_submitted → closed / reopened).
// This is the row the client dashboard and resilience score are built from.
export const verifiedFindings = pgTable('verified_findings', {
  id: uuid('id').primaryKey().defaultRandom(),
  clientItemId: uuid('client_item_id')
    .notNull()
    .references(() => clientQueueItems.id, { onDelete: 'cascade' }),
  reviewDecisionId: uuid('review_decision_id')
    .notNull()
    .references(() => operatorReviewDecisions.id, { onDelete: 'cascade' }),
  auditorId: uuid('auditor_id')
    .notNull()
    .references(() => users.id, { onDelete: 'restrict' }),
  verdict: auditorDecisionEnum('verdict').notNull(),
  adjustedSeverity: severityEnum('adjusted_severity'),
  reproducible: boolean('reproducible').notNull(),
  blastRadius: text('blast_radius'),
  auditorNotes: text('auditor_notes'),
  status: findingStatusEnum('status').notNull().default('verified'),
  fixSubmittedAt: timestamp('fix_submitted_at', { withTimezone: true }),
  retestedAt: timestamp('retested_at', { withTimezone: true }),
  retestedBy: uuid('retested_by').references(() => users.id, { onDelete: 'set null' }),
  retestNotes: text('retest_notes'),
  closedAt: timestamp('closed_at', { withTimezone: true }),
  verifiedAt: timestamp('verified_at', { withTimezone: true }).notNull().defaultNow(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export type VerifiedFinding = typeof verifiedFindings.$inferSelect
export type NewVerifiedFinding = typeof verifiedFindings.$inferInsert
