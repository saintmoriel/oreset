import { describe, it, expect } from 'vitest'
import { eq, sql } from 'drizzle-orm'
import { db } from '../src/db/client'
import { users, campaigns, batches, consentRecords, submissions } from '../src/db/schema'

async function seedSubmission() {
  const [contributor] = await db
    .insert(users)
    .values({ role: 'contributor', phone: '+2348000000098', status: 'active' })
    .returning()
  const [admin] = await db
    .insert(users)
    .values({ role: 'staff', staffRole: 'admin', email: 'admin-test@oreset.dev', status: 'active' })
    .returning()
  const [campaign] = await db
    .insert(campaigns)
    .values({ title: 'Test Campaign', status: 'live', mediaType: 'audio', createdBy: admin.id })
    .returning()
  const [batch] = await db
    .insert(batches)
    .values({ campaignId: campaign.id, type: 'audio', title: 'Test Batch', itemCount: 1, rateMinorUnits: 1000 })
    .returning()
  const [consent] = await db
    .insert(consentRecords)
    .values({ contributorId: contributor.id, batchId: batch.id, consentTextVersion: 'v1' })
    .returning()
  const [submission] = await db
    .insert(submissions)
    .values({
      batchId: batch.id,
      contributorId: contributor.id,
      consentRecordId: consent.id,
      mediaType: 'audio',
      storageKey: 'contributors/x/y/z.webm',
      fileSizeBytes: 2000,
      mimeType: 'audio/webm',
      capturedAt: new Date(),
      deviceInfo: {},
    })
    .returning()
  return submission
}

describe('submissions write-once trigger', () => {
  it('rejects a direct UPDATE on storage_key', async () => {
    const submission = await seedSubmission()

    await expect(
      db.execute(sql`UPDATE submissions SET storage_key = 'hacked' WHERE id = ${submission.id}`),
    ).rejects.toThrow(/immutable/)
  })

  it('rejects a direct UPDATE on captured_at and device_info', async () => {
    const submission = await seedSubmission()

    await expect(
      db.execute(sql`UPDATE submissions SET captured_at = now() WHERE id = ${submission.id}`),
    ).rejects.toThrow(/immutable/)

    await expect(
      db.execute(sql`UPDATE submissions SET device_info = '{"x":1}'::jsonb WHERE id = ${submission.id}`),
    ).rejects.toThrow(/immutable/)
  })

  it('allows an UPDATE on status (not trigger-protected)', async () => {
    const submission = await seedSubmission()

    await db.update(submissions).set({ status: 'validated' }).where(eq(submissions.id, submission.id))

    const updated = await db.query.submissions.findFirst({ where: eq(submissions.id, submission.id) })
    expect(updated?.status).toBe('validated')
  })
})
