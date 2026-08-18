import { pgTable, uuid, text, integer, numeric, jsonb, timestamp } from 'drizzle-orm/pg-core'
import { mediaTypeEnum, submissionStatusEnum } from './enums'
import { users } from './users'
import { batches } from './batches'
import { consentRecords } from './consent-records'

// Compliance core: identity (users) is deliberately separate from this
// table. captured_at / device_info / storage_key are immutable once
// written — enforced by a hand-written `BEFORE UPDATE` trigger shipped as
// a custom Drizzle migration (see db/migrations/README.md), since Drizzle's
// schema DSL has no trigger primitive. There is intentionally no
// `updated_at` column: status transitions are recorded as new rows in
// validation_results / qa_review_decisions, never as mutations of this row.
export const submissions = pgTable('submissions', {
  id: uuid('id').primaryKey().defaultRandom(),
  batchId: uuid('batch_id')
    .notNull()
    .references(() => batches.id, { onDelete: 'restrict' }),
  contributorId: uuid('contributor_id')
    .notNull()
    .references(() => users.id, { onDelete: 'restrict' }),
  consentRecordId: uuid('consent_record_id')
    .notNull()
    .references(() => consentRecords.id, { onDelete: 'restrict' }),
  mediaType: mediaTypeEnum('media_type').notNull(),
  storageKey: text('storage_key').notNull(), // R2 object key — immutable
  fileSizeBytes: integer('file_size_bytes').notNull(),
  mimeType: text('mime_type').notNull(),
  durationSeconds: numeric('duration_seconds'), // audio only
  imageMetadata: jsonb('image_metadata'), // image only (category tag, etc.)
  // Immutable, write-once compliance metadata:
  capturedAt: timestamp('captured_at', { withTimezone: true }).notNull(),
  deviceInfo: jsonb('device_info').notNull(),
  geoLocation: jsonb('geo_location'),
  status: submissionStatusEnum('status').notNull().default('submitted'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export type Submission = typeof submissions.$inferSelect
export type NewSubmission = typeof submissions.$inferInsert
