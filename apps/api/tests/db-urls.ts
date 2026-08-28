// Tests run against a real, second Postgres database (oreset_test) via the
// same pg/Drizzle stack the app itself uses — consistent with this
// codebase's founding decision to always test against real Postgres, not
// mocks (the Neon-driver correction all the way back in Phase 0).
//
// Loads .env.test with override:true — this must be the first thing that
// touches process.env.DATABASE_URL, before src/config/env.ts (imported
// transitively by any service under test) reads it. Vitest guarantees
// setupFiles finish running before a test file's own imports execute, and
// this module is imported at the top of tests/setup.ts, so that ordering
// holds.
import { config as loadDotenv } from 'dotenv'
loadDotenv({ path: '.env.test', override: true })

const appUrl = new URL(process.env.DATABASE_URL ?? 'postgresql://oreset:oreset@localhost:5434/oreset')

export const TEST_DB_NAME = 'oreset_test'

export const maintenanceDatabaseUrl = (() => {
  const url = new URL(appUrl.toString())
  url.pathname = '/postgres'
  return url.toString()
})()

export const testDatabaseUrl = (() => {
  const url = new URL(appUrl.toString())
  url.pathname = `/${TEST_DB_NAME}`
  return url.toString()
})()
