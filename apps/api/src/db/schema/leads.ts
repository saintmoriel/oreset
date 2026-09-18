import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core'
import { users } from './users'

// Inbound requests from the public site. Before this table existed the two
// site forms showed "success" and dropped the submission on the floor.
export const leads = pgTable('leads', {
  id: uuid('id').primaryKey().defaultRandom(),
  // 'pilot' = Request early access modal, 'contact' = footer form
  kind: text('kind').notNull(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  organization: text('organization'),
  agentType: text('agent_type'),
  languages: text('languages'),
  audience: text('audience'),
  message: text('message').notNull(),
  // new → contacted → qualified → closed (won or lost, see notes)
  status: text('status').notNull().default('new'),
  notes: text('notes'),
  handledBy: uuid('handled_by').references(() => users.id, { onDelete: 'set null' }),
  handledAt: timestamp('handled_at', { withTimezone: true }),
  sourcePath: text('source_path'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export type Lead = typeof leads.$inferSelect
export type NewLead = typeof leads.$inferInsert
