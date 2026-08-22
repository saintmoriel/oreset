import 'dotenv/config'
import { Pool } from 'pg'
import { drizzle } from 'drizzle-orm/node-postgres'
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
      // Set so the Phase 4 payout-run endpoint has an eligible contributor
      // to act on during verification without needing a UI round trip.
      payoutDetails: { type: 'mobile_money', provider: 'MTN', accountNumber: '08000000001' },
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

  const [pendingOperator] = await db
    .insert(schema.users)
    .values({
      role: 'operator',
      email: 'pending-operator@oreset.dev',
      passwordHash: await argon2.hash('dev-password'),
      operatorCode: 'OP-0002',
      displayName: 'Dev Pending Operator',
      status: 'pending',
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

  const [qaReviewer] = await db
    .insert(schema.users)
    .values({
      role: 'staff',
      staffRole: 'qa_reviewer',
      email: 'qa-reviewer@oreset.dev',
      passwordHash: await argon2.hash('dev-password'),
      displayName: 'Dev QA Reviewer',
      status: 'active',
    })
    .returning()

  const [compliance] = await db
    .insert(schema.users)
    .values({
      role: 'staff',
      staffRole: 'compliance',
      email: 'compliance@oreset.dev',
      passwordHash: await argon2.hash('dev-password'),
      displayName: 'Dev Compliance Officer',
      status: 'active',
    })
    .returning()

  const [buyer] = await db
    .insert(schema.users)
    .values({
      role: 'buyer',
      email: 'buyer@oreset.dev',
      passwordHash: await argon2.hash('dev-password'),
      displayName: 'Dev Buyer Org',
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

  await db.insert(schema.prompts).values([
    { batchId: batch.id, content: 'Ẹ káàárọ̀, báwo ni iṣẹ́ àárọ̀?', order: 0 },
    { batchId: batch.id, content: 'Mo fẹ́ ra ọjà ní ọjà náà lónìí.', order: 1 },
    { batchId: batch.id, content: 'Ọmọdé náà ń sáré lọ sí ilé-ìwé.', order: 2 },
    { batchId: batch.id, content: 'Òjò ń rọ̀ ní ìlú Èkó lónìí.', order: 3 },
    { batchId: batch.id, content: 'Bàbá àti ìyá mi ń gbé ní Ìbàdàn.', order: 4 },
  ])

  await db.insert(schema.operatorApplications).values([
    {
      userId: operator.id,
      location: 'Lagos, Nigeria',
      languages: [{ language: 'Yorùbá', fluency: 'Native' }],
      academicBackground: "Tertiary — Bachelor's",
      englishProficiency: 'Professional working proficiency',
      availability: ['Weekday mornings', 'Weekday afternoons'],
      experience: 'Two years of annotation and QA work.',
    },
    {
      userId: pendingOperator.id,
      location: 'Ibadan, Nigeria',
      languages: [
        { language: 'Yorùbá', fluency: 'Native' },
        { language: 'English', fluency: 'Level 4' },
      ],
      dialect: 'Ìjẹ̀bú dialect',
      academicBackground: "Tertiary — Bachelor's",
      englishProficiency: 'Professional working proficiency',
      availability: ['Weekends'],
    },
  ])

  const [consentRecord] = await db
    .insert(schema.consentRecords)
    .values({
      contributorId: contributor.id,
      batchId: batch.id,
      consentTextVersion: 'v1',
    })
    .returning()

  // Two qa_approved submissions with no payout/dataset yet — real data for
  // the Phase 4 payout-run endpoint and the Phase 5 Assembly step to act
  // on during verification. storageKeys are placeholders (no real file
  // behind them) since neither payout nor dataset-assembly logic touches
  // storage; only retention/download paths do.
  await db.insert(schema.submissions).values([
    {
      batchId: batch.id,
      contributorId: contributor.id,
      consentRecordId: consentRecord.id,
      mediaType: 'audio',
      storageKey: `contributors/${contributor.id}/${batch.id}/00000000-0000-0000-0000-000000000000.webm`,
      fileSizeBytes: 48000,
      mimeType: 'audio/webm',
      durationSeconds: '6',
      capturedAt: new Date(),
      deviceInfo: { seeded: true },
      status: 'qa_approved',
    },
    {
      batchId: batch.id,
      contributorId: contributor.id,
      consentRecordId: consentRecord.id,
      mediaType: 'audio',
      storageKey: `contributors/${contributor.id}/${batch.id}/00000000-0000-0000-0000-000000000001.webm`,
      fileSizeBytes: 52000,
      mimeType: 'audio/webm',
      durationSeconds: '7',
      capturedAt: new Date(),
      deviceInfo: { seeded: true },
      status: 'qa_approved',
    },
  ])

  await db.insert(schema.clientQueueItems).values([
    {
      clientName: 'FirstBank AI Chatbot QA',
      externalRef: 'txn_5521a',
      content: 'Customer: "Why was my transfer declined?" · Bot: "Please contact your branch for transfer issues."',
    },
    {
      clientName: 'FirstBank AI Chatbot QA',
      externalRef: 'txn_5521b',
      content: 'Customer: "How do I reset my PIN?" · Bot: "Go to Settings > Security > Reset PIN, then verify with OTP."',
    },
    {
      clientName: 'FirstBank AI Chatbot QA',
      externalRef: 'txn_5521c',
      content: 'Customer: "What\'s my account balance?" · Bot: "I can\'t access account details in this chat. Please use the app."',
    },
    {
      clientName: 'FirstBank AI Chatbot QA',
      externalRef: 'txn_5521d',
      content: 'Customer: "Is the app down?" · Bot: "Yes, contact your branch for transfer issues."',
    },
  ])

  console.log('Seeded:')
  console.log('  contributor:', contributor.phone)
  console.log('  operator:', operator.email, '(password: dev-password)')
  console.log('  pending_operator:', pendingOperator.email, '(password: dev-password)')
  console.log('  admin:', admin.email, '(password: dev-password)')
  console.log('  reviewer_lead:', reviewerLead.email, '(password: dev-password)')
  console.log('  qa_reviewer:', qaReviewer.email, '(password: dev-password)')
  console.log('  compliance:', compliance.email, '(password: dev-password)')
  console.log('  buyer:', buyer.email, '(password: dev-password)')
  console.log('  campaign:', campaign.title)
  console.log('  batch:', batch.title)
  console.log('  prompts: 5 seeded for', batch.title)
  console.log('  operator_applications: 2 seeded')
  console.log('  client_queue_items: 4 seeded')
  console.log('  qa_approved submissions (no payout/dataset): 2 seeded, for', contributor.phone)

  await pool.end()
}

main().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
