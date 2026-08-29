import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core'
import { users } from './users'
import { agreementTypeEnum } from './enums'

export const operatorAgreements = pgTable('operator_agreements', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  agreementType: agreementTypeEnum('agreement_type').notNull(),
  version: text('version').notNull().default('1.0'),
  signedAt: timestamp('signed_at', { withTimezone: true }).notNull().defaultNow(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
})

export type OperatorAgreement = typeof operatorAgreements.$inferSelect
export type NewOperatorAgreement = typeof operatorAgreements.$inferInsert
