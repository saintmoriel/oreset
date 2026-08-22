import { pgTable, uuid, timestamp, uniqueIndex } from 'drizzle-orm/pg-core'
import { datasets } from './datasets'
import { submissions } from './submissions'

// A submission can be assembled into at most one dataset ever — enforced
// here via a real unique index (defense in depth alongside the
// check-before-insert in datasets.service.ts, same shape as
// operators.service.ts's email-uniqueness handling). Re-licensing the same
// recording to two buyers is a real legal question this scaffold isn't
// responsible for answering.
export const datasetItems = pgTable(
  'dataset_items',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    datasetId: uuid('dataset_id')
      .notNull()
      .references(() => datasets.id, { onDelete: 'cascade' }),
    submissionId: uuid('submission_id')
      .notNull()
      .references(() => submissions.id, { onDelete: 'restrict' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    submissionIdUnique: uniqueIndex('dataset_items_submission_id_unique').on(table.submissionId),
  }),
)

export type DatasetItem = typeof datasetItems.$inferSelect
export type NewDatasetItem = typeof datasetItems.$inferInsert
