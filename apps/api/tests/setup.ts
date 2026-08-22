import { sql } from 'drizzle-orm'
import { beforeEach } from 'vitest'
// Importing db-urls.ts first loads .env.test with override:true, so this
// db/client.ts import (and every service's own later import of it) points
// at oreset_test, not the real dev database.
import './db-urls'
import { db } from '../src/db/client'

beforeEach(async () => {
  const tables = await db.execute<{ tablename: string }>(
    sql`SELECT tablename FROM pg_tables WHERE schemaname = 'public'`,
  )
  if (tables.rows.length === 0) return
  const names = tables.rows.map((t) => `"${t.tablename}"`).join(', ')
  await db.execute(sql.raw(`TRUNCATE TABLE ${names} RESTART IDENTITY CASCADE`))
})
