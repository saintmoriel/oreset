import 'dotenv/config'
import { Pool } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-serverless'
import argon2 from 'argon2'
import * as schema from './schema'

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  const db = drizzle(pool, { schema })

  console.log('Seeding dev data...')

  const [contributor] = await db
    .insert(schema.users)
    .values({
      role: 'contributor',
      phone: '+2348000000001',
      displayName: 'Dev Contributor',
      status: 'active',
    })
    .returning()

  const [operator] = await db
    .insert(schema.users)
    .values({
      role: 'operator',
      email: 'operator@oreset.dev',
      passwordHash: await argon2.hash('dev-password'),
      operatorCode: 'OP-0001',
      displayName: 'Dev Operator',
      status: 'active',
    })
    .returning()

  const [admin] = await db
    .insert(schema.users)
    .values({
      role: 'staff',
      staffRole: 'admin',
      email: 'admin@oreset.dev',
      passwordHash: await argon2.hash('dev-password'),
      displayName: 'Dev Admin',
      status: 'active',
    })
    .returning()

  const [reviewerLead] = await db
    .insert(schema.users)
    .values({
      role: 'staff',
      staffRole: 'reviewer_lead',
      email: 'reviewer-lead@oreset.dev',
      passwordHash: await argon2.hash('dev-password'),
      displayName: 'Dev Reviewer Lead',
      status: 'active',
    })
    .returning()

  const [campaign] = await db
    .insert(schema.campaigns)
    .values({
      title: 'Yorùbá Read-Speech — Batch 14',
      status: 'live',
      mediaType: 'audio',
      language: 'Yorùbá',
      domain: 'Read-speech',
      payRateMinorUnits: 250000, // ₦2,500.00
      cohort: 'Yorùbá Native Cohort',
      createdBy: admin.id,
      launchedAt: new Date(),
    })
    .returning()

  const [batch] = await db
    .insert(schema.batches)
    .values({
      campaignId: campaign.id,
      type: 'audio',
      title: 'Yorùbá read-speech batch',
      itemCount: 5,
      rateMinorUnits: 250000,
      status: 'available',
      brief: 'Read short Yorùbá sentences aloud in a quiet space.',
      guidelines: [
        'Record somewhere quiet — avoid traffic, fans, or background chatter',
        'Speak at a natural, conversational pace',
      ],
      requiredPermissions: ['Microphone access'],
    })
    .returning()

  console.log('Seeded:')
  console.log('  contributor:', contributor.phone)
  console.log('  operator:', operator.email, '(password: dev-password)')
  console.log('  admin:', admin.email, '(password: dev-password)')
  console.log('  reviewer_lead:', reviewerLead.email, '(password: dev-password)')
  console.log('  campaign:', campaign.title)
  console.log('  batch:', batch.title)

  await pool.end()
}

main().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
