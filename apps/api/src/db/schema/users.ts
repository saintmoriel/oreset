import { pgTable, uuid, text, timestamp, jsonb, uniqueIndex } from 'drizzle-orm/pg-core'
import { roleTypeEnum, staffRoleEnum, userStatusEnum } from './enums'

export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    role: roleTypeEnum('role').notNull(),
    // Only set when role='staff'. Doubles as the RBAC gate for the QA
    // persona (qa_reviewer) and the three Admin-dashboard roles.
    staffRole: staffRoleEnum('staff_role'),
    // Contributor identity — kept intentionally minimal here; this table
    // is still "identity", separate from submissions (the compliance core).
    phone: text('phone'),
    // Operator / staff identity
    email: text('email'),
    passwordHash: text('password_hash'),
    // Human-readable operator id, e.g. "OP-4471"
    operatorCode: text('operator_code'),
    displayName: text('display_name'),
    // e.g. {type:'mobile_money', provider, accountNumber} — contributor-set,
    // required before a payout can be initiated for them.
    payoutDetails: jsonb('payout_details'),
    status: userStatusEnum('status').notNull().default('active'),
    // Stamped on password login. Shown on the admin People page so an owner
    // can see who actually uses their access.
    lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
    // Two-factor authentication (authenticator app). The secret is stored
    // encrypted (see lib/totp.ts); enabled_at null means setup started but
    // not confirmed, or never started. Recovery codes are sha256 hashes.
    totpSecret: text('totp_secret'),
    totpEnabledAt: timestamp('totp_enabled_at', { withTimezone: true }),
    totpRecoveryCodes: jsonb('totp_recovery_codes'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    phoneUnique: uniqueIndex('users_phone_unique').on(table.phone),
    emailUnique: uniqueIndex('users_email_unique').on(table.email),
    operatorCodeUnique: uniqueIndex('users_operator_code_unique').on(table.operatorCode),
  }),
)

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
