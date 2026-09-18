import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core'
import { users } from './users'

// Single-use, short-lived. Only the SHA-256 of the token is stored; the
// plaintext lives in the email link and nowhere else.
export const passwordResets = pgTable('password_resets', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  tokenHash: text('token_hash').notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  consumedAt: timestamp('consumed_at', { withTimezone: true }),
  requestedIp: text('requested_ip'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export type PasswordReset = typeof passwordResets.$inferSelect
