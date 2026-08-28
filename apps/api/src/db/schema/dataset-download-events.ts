import { pgTable, uuid, timestamp } from 'drizzle-orm/pg-core'
import { datasets } from './datasets'
import { submissions } from './submissions'
import { users } from './users'

// Insert-only event log, same shape as audit_log — no update/delete route
// ever exposed. One row per real click-through on a buyer's Download link,
// the concrete signal that Origin previously had no way to observe: did a
// buyer actually retrieve their licensed data.
export const datasetDownloadEvents = pgTable('dataset_download_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  datasetId: uuid('dataset_id')
    .notNull()
    .references(() => datasets.id, { onDelete: 'cascade' }),
  submissionId: uuid('submission_id')
    .notNull()
    .references(() => submissions.id, { onDelete: 'restrict' }),
  buyerId: uuid('buyer_id')
    .notNull()
    .references(() => users.id, { onDelete: 'restrict' }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export type DatasetDownloadEvent = typeof datasetDownloadEvents.$inferSelect
export type NewDatasetDownloadEvent = typeof datasetDownloadEvents.$inferInsert
