import { pgTable, uuid, text, jsonb, timestamp, integer, real } from 'drizzle-orm/pg-core'
import { calibrationStatusEnum, calibrationResultEnum, operatorDecisionEnum, errTagEnum, severityEnum } from './enums'
import { users } from './users'

export const calibrationCases = pgTable('calibration_cases', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  traceData: jsonb('trace_data'),
  expectedDecision: operatorDecisionEnum('expected_decision').notNull(),
  expectedErrTag: errTagEnum('expected_err_tag'),
  expectedSeverity: severityEnum('expected_severity'),
  expectedOutcome: text('expected_outcome'),
  explanation: text('explanation').notNull(),
  domain: text('domain'),
  language: text('language').default('en'),
  status: calibrationStatusEnum('status').notNull().default('active'),
  createdBy: uuid('created_by')
    .notNull()
    .references(() => users.id, { onDelete: 'restrict' }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const calibrationAttempts = pgTable('calibration_attempts', {
  id: uuid('id').primaryKey().defaultRandom(),
  calibrationCaseId: uuid('calibration_case_id')
    .notNull()
    .references(() => calibrationCases.id, { onDelete: 'cascade' }),
  operatorId: uuid('operator_id')
    .notNull()
    .references(() => users.id, { onDelete: 'restrict' }),
  decision: operatorDecisionEnum('decision').notNull(),
  errTag: errTagEnum('err_tag'),
  severity: severityEnum('severity'),
  correctedOutcome: text('corrected_outcome'),
  notes: text('notes'),
  reviewTimeMs: integer('review_time_ms'),
  result: calibrationResultEnum('result').notNull(),
  score: real('score').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export type CalibrationCase = typeof calibrationCases.$inferSelect
export type NewCalibrationCase = typeof calibrationCases.$inferInsert
export type CalibrationAttempt = typeof calibrationAttempts.$inferSelect
export type NewCalibrationAttempt = typeof calibrationAttempts.$inferInsert
