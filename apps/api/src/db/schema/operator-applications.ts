import { pgTable, uuid, text, jsonb, timestamp, uniqueIndex } from 'drizzle-orm/pg-core'
import { users } from './users'

// One-to-one with users (role='operator'). The red team application: who
// they are, what security and AI testing they have done, and a short work
// sample a lead auditor reads before approving them. Languages stay because
// they matter for judgement testing. Legacy language-era columns
// (academicBackground, englishProficiency, dialect) are nullable and unused
// by the current form.
export const operatorApplications = pgTable(
  'operator_applications',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    location: text('location').notNull(),
    languages: jsonb('languages').notNull(), // { language: string; fluency: string }[]
    // 'none' | 'under_2' | '2_to_5' | 'over_5'
    securityExperienceYears: text('security_experience_years'),
    experience: text('experience'),
    aiRedTeamExposure: text('ai_red_team_exposure'),
    tools: text('tools'),
    workSample: text('work_sample'),
    portfolioUrl: text('portfolio_url'),
    availability: jsonb('availability'), // string[] | null
    dialect: text('dialect'),
    academicBackground: text('academic_background'),
    englishProficiency: text('english_proficiency'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    userIdUnique: uniqueIndex('operator_applications_user_id_unique').on(table.userId),
  }),
)

export type OperatorApplication = typeof operatorApplications.$inferSelect
export type NewOperatorApplication = typeof operatorApplications.$inferInsert
