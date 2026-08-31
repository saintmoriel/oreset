import { pgTable, uuid, text, integer, timestamp } from 'drizzle-orm/pg-core'
import { users } from './users'

export const invoices = pgTable('invoices', {
  id: uuid('id').primaryKey().defaultRandom(),
  buyerId: uuid('buyer_id')
    .notNull()
    .references(() => users.id, { onDelete: 'restrict' }),
  reference: text('reference').notNull().unique(),
  description: text('description').notNull(),
  amountMinorUnits: integer('amount_minor_units').notNull(),
  currency: text('currency').notNull().default('NGN'),
  caseCount: integer('case_count'),
  status: text('status').notNull().default('pending'),
  paymentLink: text('payment_link'),
  provider: text('provider').notNull(),
  providerReference: text('provider_reference'),
  paidAt: timestamp('paid_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export type Invoice = typeof invoices.$inferSelect
export type NewInvoice = typeof invoices.$inferInsert
