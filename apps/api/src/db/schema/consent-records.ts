import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core'
import { users } from './users'
import { batches } from './batches'

// Insert-only. No update/delete route is ever exposed for this table —
// it is the audit trail proving explicit consent was given before capture.
export const consentRecords = pgTable('consent_records', {
  id: uuid('id').primaryKey().defaultRandom(),
  contributorId: uuid('contributor_id')
    .notNull()
    .references(() => users.id, { onDelete: 'restrict' }),
  batchId: uuid('batch_id').references(() => batches.id, { onDelete: 'set null' }),
  consentTextVersion: text('consent_text_version').notNull(),
  consentedAt: timestamp('consented_at', { withTimezone: true }).notNull().defaultNow(),
  // sha256(contributorId, batchId, consentTextVersion, consentedAt) — the
  // cryptographic consent hash from the compliance brief. Nullable now;
  // computed once the exact hashing spec is finalized (Phase 1+).
  consentHash: text('consent_hash'),
  ip: text('ip'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export type ConsentRecord = typeof consentRecords.$inferSelect
export type NewConsentRecord = typeof consentRecords.$inferInsert
