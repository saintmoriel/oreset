import { pgTable, uuid, text, jsonb, timestamp } from 'drizzle-orm/pg-core'
import { users } from './users'

// Insert-only, denormalized on purpose: actor_label/actor_role are stored
// directly (not just a FK) so the log survives actor deletion and reads
// don't require a join. No update/delete route is ever exposed for this
// table. actorId is nullable for system actors (e.g. "validation-svc").
export const auditLog = pgTable('audit_log', {
  id: uuid('id').primaryKey().defaultRandom(),
  actorId: uuid('actor_id').references(() => users.id, { onDelete: 'set null' }),
  actorLabel: text('actor_label').notNull(),
  actorRole: text('actor_role').notNull(),
  action: text('action').notNull(), // e.g. "consent.recorded", "qa.approved"
  resourceType: text('resource_type'),
  resourceId: text('resource_id'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export type AuditLogEntry = typeof auditLog.$inferSelect
export type NewAuditLogEntry = typeof auditLog.$inferInsert
