import { pgTable, uuid, text, jsonb, timestamp } from 'drizzle-orm/pg-core'
import { users } from './users'

// Machine access for clients: CI pulls the regression suite with a bearer
// token instead of a browser session. Only the SHA-256 of the token is
// stored; the plaintext is shown once at creation.
export const apiTokens = pgTable('api_tokens', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  // First characters of the token, so a client can tell tokens apart.
  tokenPrefix: text('token_prefix').notNull(),
  tokenHash: text('token_hash').notNull().unique(),
  scopes: jsonb('scopes').notNull().$type<string[]>(),
  lastUsedAt: timestamp('last_used_at', { withTimezone: true }),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
  revokedAt: timestamp('revoked_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export type ApiToken = typeof apiTokens.$inferSelect
