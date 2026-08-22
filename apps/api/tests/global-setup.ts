import { Pool } from 'pg'
import { drizzle } from 'drizzle-orm/node-postgres'
import { migrate } from 'drizzle-orm/node-postgres/migrator'
import { maintenanceDatabaseUrl, testDatabaseUrl, TEST_DB_NAME } from './db-urls'

// Vitest globalSetup — runs once before the whole suite. Creates the test
// database if it doesn't exist yet, then runs the real migrations against
// it (the same drizzle-orm/node-postgres/migrator db/migrate.ts uses) so
// tests exercise the actual schema, enums, FKs, and write-once trigger.
export default async function globalSetup() {
  const maintenancePool = new Pool({ connectionString: maintenanceDatabaseUrl })
  try {
    const exists = await maintenancePool.query('SELECT 1 FROM pg_database WHERE datname = $1', [TEST_DB_NAME])
    if (exists.rowCount === 0) {
      // Can't parameterize a database name in CREATE DATABASE — safe here
      // since TEST_DB_NAME is a hardcoded constant, never user input.
      await maintenancePool.query(`CREATE DATABASE ${TEST_DB_NAME}`)
    }
  } finally {
    await maintenancePool.end()
  }

  const testPool = new Pool({ connectionString: testDatabaseUrl })
  try {
    const db = drizzle(testPool)
    await migrate(db, { migrationsFolder: './src/db/migrations' })
  } finally {
    await testPool.end()
  }
}
