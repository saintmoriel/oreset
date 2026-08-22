import { describe, it, expect } from 'vitest'
import { db } from '../src/db/client'
import { users, campaigns, batches, consentRecords, submissions } from '../src/db/schema'
import * as payoutsService from '../src/modules/payouts/payouts.service'

async function seedPayableSubmission() {
  const [admin] = await db
    .insert(users)
    .values({ role: 'staff', staffRole: 'admin', email: 'admin-payout-test@oreset.dev', status: 'active' })
    .returning()
  const [contributor] = await db
    .insert(users)
    .values({
      role: 'contributor',
      phone: '+2348000000096',
      status: 'active',
      payoutDetails: { type: 'mobile_money', provider: 'MTN', accountNumber: '08000000096' },
    })
    .returning()
  const [campaign] = await db
    .insert(campaigns)
    .values({ title: 'Payout Test Campaign', status: 'live', mediaType: 'audio', createdBy: admin.id })
    .returning()
  const [batch] = await db
    .insert(batches)
    .values({
      campaignId: campaign.id,
      type: 'audio',
      title: 'Payout Test Batch',
      itemCount: 1,
      rateMinorUnits: 5000,
    })
    .returning()
  const [consent] = await db
    .insert(consentRecords)
    .values({ contributorId: contributor.id, batchId: batch.id, consentTextVersion: 'v1' })
    .returning()
  await db.insert(submissions).values({
    batchId: batch.id,
    contributorId: contributor.id,
    consentRecordId: consent.id,
    mediaType: 'audio',
    storageKey: 'contributors/x/y/z.webm',
    fileSizeBytes: 2000,
    mimeType: 'audio/webm',
    capturedAt: new Date(),
    deviceInfo: {},
    status: 'qa_approved',
  })
  return { contributor }
}

describe('payouts.service.runPayoutBatch', () => {
  it('is idempotent — a second run creates zero new payouts', async () => {
    await seedPayableSubmission()

    const first = await payoutsService.runPayoutBatch()
    expect(first.payoutsCreated).toBe(1)

    const second = await payoutsService.runPayoutBatch()
    expect(second.payoutsCreated).toBe(0)
  })

  it('skips a contributor with no payoutDetails on file', async () => {
    const [admin] = await db
      .insert(users)
      .values({ role: 'staff', staffRole: 'admin', email: 'admin-payout-test2@oreset.dev', status: 'active' })
      .returning()
    const [contributor] = await db
      .insert(users)
      .values({ role: 'contributor', phone: '+2348000000095', status: 'active' })
      .returning()
    const [campaign] = await db
      .insert(campaigns)
      .values({ title: 'No Details Campaign', status: 'live', mediaType: 'audio', createdBy: admin.id })
      .returning()
    const [batch] = await db
      .insert(batches)
      .values({ campaignId: campaign.id, type: 'audio', title: 'No Details Batch', itemCount: 1, rateMinorUnits: 5000 })
      .returning()
    const [consent] = await db
      .insert(consentRecords)
      .values({ contributorId: contributor.id, batchId: batch.id, consentTextVersion: 'v1' })
      .returning()
    await db.insert(submissions).values({
      batchId: batch.id,
      contributorId: contributor.id,
      consentRecordId: consent.id,
      mediaType: 'audio',
      storageKey: 'contributors/x/y/z2.webm',
      fileSizeBytes: 2000,
      mimeType: 'audio/webm',
      capturedAt: new Date(),
      deviceInfo: {},
      status: 'qa_approved',
    })

    const result = await payoutsService.runPayoutBatch()
    expect(result.payoutsCreated).toBe(0)
  })
})
