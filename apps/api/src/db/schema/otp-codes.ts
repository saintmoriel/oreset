import { pgTable, uuid, text, timestamp, integer } from 'drizzle-orm/pg-core'
import { otpPurposeEnum } from './enums'

// Not part of the original persona/mock model — required to make
// contributor phone/OTP auth real rather than a UI-only checkbox.
export const otpCodes = pgTable('otp_codes', {
  id: uuid('id').primaryKey().defaultRandom(),
  phone: text('phone').notNull(),
  codeHash: text('code_hash').notNull(), // never store the plaintext code
  purpose: otpPurposeEnum('purpose').notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  consumedAt: timestamp('consumed_at', { withTimezone: true }),
  attemptCount: integer('attempt_count').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export type OtpCode = typeof otpCodes.$inferSelect
export type NewOtpCode = typeof otpCodes.$inferInsert
