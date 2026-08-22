import { pgTable, uuid, text, jsonb, timestamp, uniqueIndex } from 'drizzle-orm/pg-core'
import { users } from './users'

// One-to-one with users (role='operator'). Holds the rich application-form
// fields with no home on `users`. Free-text/jsonb rather than enums for
// academicBackground/englishProficiency/languages/availability — these are
// UI-only option labels, not values any RBAC or workflow logic reads,
// unlike ERR_TAGS/SEVERITY_LEVELS.
export const operatorApplications = pgTable(
  'operator_applications',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    location: text('location').notNull(),
    languages: jsonb('languages').notNull(), // { language: string; fluency: string }[]
    dialect: text('dialect'),
    academicBackground: text('academic_background').notNull(),
    englishProficiency: text('english_proficiency').notNull(),
    availability: jsonb('availability'), // string[] | null
    experience: text('experience'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    userIdUnique: uniqueIndex('operator_applications_user_id_unique').on(table.userId),
  }),
)

export type OperatorApplication = typeof operatorApplications.$inferSelect
export type NewOperatorApplication = typeof operatorApplications.$inferInsert
