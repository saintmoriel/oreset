import 'dotenv/config'
import { randomBytes } from 'node:crypto'
import { Pool } from 'pg'
import { drizzle } from 'drizzle-orm/node-postgres'
import { eq } from 'drizzle-orm'
import argon2 from 'argon2'
import * as schema from './schema'

// First-run bootstrap for a fresh production database. If BOOTSTRAP_ADMIN_EMAIL
// is set and no account with that email exists, create an admin with a
// random password and print it to the logs once. Re-runs do nothing, so it
// is safe in the container start command. Change the password after first
// sign-in via Forgot password.

async function main() {
  const email = process.env.BOOTSTRAP_ADMIN_EMAIL?.trim()
  if (!email) {
    console.log('[bootstrap-admin] BOOTSTRAP_ADMIN_EMAIL not set, skipping.')
    return
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  const db = drizzle(pool, { schema })

  const existing = await db.query.users.findFirst({ where: eq(schema.users.email, email) })
  if (existing) {
    console.log(`[bootstrap-admin] ${email} already exists, skipping.`)
    await pool.end()
    return
  }

  const password = randomBytes(12).toString('base64url')
  await db.insert(schema.users).values({
    role: 'staff',
    staffRole: 'admin',
    email,
    displayName: process.env.BOOTSTRAP_ADMIN_NAME?.trim() || 'Oreset Admin',
    passwordHash: await argon2.hash(password),
    status: 'active',
  })

  console.log('='.repeat(72))
  console.log(`[bootstrap-admin] Created admin ${email}`)
  console.log(`[bootstrap-admin] Temporary password: ${password}`)
  console.log('[bootstrap-admin] Sign in at /admin, then change it via Forgot password. This is printed once.')
  console.log('='.repeat(72))

  await pool.end()
}

main().catch((err) => {
  console.error('[bootstrap-admin] failed:', err)
  process.exit(1)
})
