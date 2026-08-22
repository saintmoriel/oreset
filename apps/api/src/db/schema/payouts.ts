import { pgTable, uuid, integer, text, timestamp } from 'drizzle-orm/pg-core'
import { payoutStatusEnum } from './enums'
import { users } from './users'

export const payouts = pgTable('payouts', {
  id: uuid('id').primaryKey().defaultRandom(),
  contributorId: uuid('contributor_id')
    .notNull()
    .references(() => users.id, { onDelete: 'restrict' }),
  amountMinorUnits: integer('amount_minor_units').notNull(),
  currency: text('currency').notNull().default('NGN'),
  status: payoutStatusEnum('status').notNull().default('pending'),
  // 'dev-stub' today; a real provider name (paystack/flutterwave) once one
  // is actually integrated — see PaymentProvider.
  provider: text('provider').notNull(),
  providerReference: text('provider_reference'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export type Payout = typeof payouts.$inferSelect
export type NewPayout = typeof payouts.$inferInsert
