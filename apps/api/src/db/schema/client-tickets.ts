import { pgTable, uuid, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core'
import { ticketStatusEnum, errTagEnum, severityEnum } from './enums'
import { operatorReviewDecisions } from './operator-review-decisions'
import { users } from './users'

// The real destination for an operator's Escalate decision — before this
// table, escalating just flipped client_queue_items.status and nothing
// downstream ever surfaced it. One ticket per escalation.
export const clientTickets = pgTable(
  'client_tickets',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    operatorReviewDecisionId: uuid('operator_review_decision_id')
      .notNull()
      .references(() => operatorReviewDecisions.id, { onDelete: 'cascade' }),
    // Denormalized from the escalation's snapshot — same reasoning
    // operator_review_decisions.clientItemSnapshot already uses.
    clientName: text('client_name').notNull(),
    externalRef: text('external_ref').notNull(),
    errTag: errTagEnum('err_tag'),
    severity: severityEnum('severity'),
    notes: text('notes'),
    status: ticketStatusEnum('status').notNull().default('open'),
    resolvedBy: uuid('resolved_by').references(() => users.id, { onDelete: 'set null' }),
    resolvedAt: timestamp('resolved_at', { withTimezone: true }),
    resolutionNotes: text('resolution_notes'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    operatorReviewDecisionIdUnique: uniqueIndex('client_tickets_operator_review_decision_id_unique').on(
      table.operatorReviewDecisionId,
    ),
  }),
)

export type ClientTicket = typeof clientTickets.$inferSelect
export type NewClientTicket = typeof clientTickets.$inferInsert
