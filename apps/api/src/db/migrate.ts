import 'dotenv/config'
import { Pool } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-serverless'
import { migrate } from 'drizzle-orm/neon-serverless/migrator'

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  const db = drizzle(pool)
  console.log('Running migrations...')
  await migrate(db, { migrationsFolder: './src/db/migrations' })
  console.log('Migrations complete.')
  await pool.end()
}

main().catch((err) => {
  console.error('Migration failed:', err)
  process.exit(1)
})
