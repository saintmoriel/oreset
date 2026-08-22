import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core'
import { datasetStatusEnum } from './enums'
import { campaigns } from './campaigns'
import { users } from './users'

// Assembly (draft, items being added) -> Provenance Seal (sealed, manifest
// locked + hashed) -> Handoff (delivered, buyer assigned) — the marketing
// site's own ORIGIN_STAGES names these three stages explicitly.
export const datasets = pgTable('datasets', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  // Required, not nullable — a dataset is scoped to one campaign, matching
  // "buying against a project deliverable" from the marketing copy, not a
  // cross-campaign mix.
  campaignId: uuid('campaign_id')
    .notNull()
    .references(() => campaigns.id, { onDelete: 'restrict' }),
  buyerId: uuid('buyer_id').references(() => users.id, { onDelete: 'set null' }),
  licenseTerms: text('license_terms').notNull(),
  status: datasetStatusEnum('status').notNull().default('draft'),
  // sha256 of the sealed manifest (item + consent-record ids) — a real
  // hash tied to actual consent records, not a cosmetic checksum. Null
  // until sealed.
  provenanceHash: text('provenance_hash'),
  sealedAt: timestamp('sealed_at', { withTimezone: true }),
  deliveredAt: timestamp('delivered_at', { withTimezone: true }),
  createdBy: uuid('created_by')
    .notNull()
    .references(() => users.id, { onDelete: 'restrict' }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export type Dataset = typeof datasets.$inferSelect
export type NewDataset = typeof datasets.$inferInsert
