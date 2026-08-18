import { pgTable, uuid, text, numeric, timestamp } from 'drizzle-orm/pg-core'
import { validationOutcomeEnum } from './enums'
import { submissions } from './submissions'

// One-to-many: a submission could theoretically be re-validated. "Latest"
// is queried by createdAt desc limit 1. Phase 0's validator_version is
// always 'stub-v0' — the real ERR-01..04 model (Favor's) plugs in later
// behind the same validateSubmission() service function.
export const validationResults = pgTable('validation_results', {
  id: uuid('id').primaryKey().defaultRandom(),
  submissionId: uuid('submission_id')
    .notNull()
    .references(() => submissions.id, { onDelete: 'cascade' }),
  outcome: validationOutcomeEnum('outcome').notNull(),
  reason: text('reason'),
  score: numeric('score'),
  validatorVersion: text('validator_version').notNull().default('stub-v0'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export type ValidationResult = typeof validationResults.$inferSelect
export type NewValidationResult = typeof validationResults.$inferInsert
