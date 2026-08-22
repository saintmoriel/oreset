import { describe, it, expect } from 'vitest'
import { db } from '../src/db/client'
import { users, campaigns, batches, consentRecords, submissions } from '../src/db/schema'
import * as qaService from '../src/modules/qa/qa.service'

async function seedValidatedSubmission() {
  const [contributor] = await db
    .insert(users)
    .values({ role: 'contributor', phone: '+2348000000097', status: 'active' })
    .returning()
  const [reviewer] = await db
    .insert(users)
    .values({ role: 'staff', staffRole: 'qa_reviewer', email: 'qa-test@oreset.dev', status: 'active' })
    .returning()
  const [admin] = await db
    .insert(users)
    .values({ role: 'staff', staffRole: 'admin', email: 'admin-test-qa@oreset.dev', status: 'active' })
    .returning()
  const [campaign] = await db
    .insert(campaigns)
    .values({ title: 'QA Test Campaign', status: 'live', mediaType: 'audio', createdBy: admin.id })
    .returning()
  const [batch] = await db
    .insert(batches)
    .values({ campaignId: campaign.id, type: 'audio', title: 'QA Test Batch', itemCount: 1, rateMinorUnits: 1000 })
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
      status: 'validated',
    })
    .returning()
  return { submission, reviewer }
}

describe('qa.service.decide', () => {
  it('rejects a second decision on the same submission (race guard)', async () => {
    const { submission, reviewer } = await seedValidatedSubmission()

    const first = await qaService.decide({
      submissionId: submission.id,
      reviewerId: reviewer.id,
      reviewerRole: 'qa_reviewer',
      decision: 'approved',
    })
    expect(first.submission.status).toBe('qa_approved')

    await expect(
      qaService.decide({
        submissionId: submission.id,
        reviewerId: reviewer.id,
        reviewerRole: 'qa_reviewer',
        decision: 'approved',
      }),
    ).rejects.toMatchObject({ status: 409, code: 'invalid_state' })
  })
})
