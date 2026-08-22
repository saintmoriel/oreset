import { describe, it, expect } from 'vitest'
import { db } from '../src/db/client'
import { users, campaigns, batches, consentRecords, submissions } from '../src/db/schema'
import * as datasetsService from '../src/modules/datasets/datasets.service'

async function seedCampaignWithSubmissions(opts: { qaApprovedCount: number; notApprovedCount?: number }) {
  const [admin] = await db
    .insert(users)
    .values({ role: 'staff', staffRole: 'admin', email: `admin-ds-${Math.random()}@oreset.dev`, status: 'active' })
    .returning()
  const [contributor] = await db
    .insert(users)
    .values({ role: 'contributor', phone: `+234800000${Math.floor(Math.random() * 9000 + 1000)}`, status: 'active' })
    .returning()
  const [campaign] = await db
    .insert(campaigns)
    .values({ title: 'Dataset Test Campaign', status: 'live', mediaType: 'audio', createdBy: admin.id })
    .returning()
  const [batch] = await db
    .insert(batches)
    .values({ campaignId: campaign.id, type: 'audio', title: 'Dataset Test Batch', itemCount: 5, rateMinorUnits: 1000 })
    .returning()
  const [consent] = await db
    .insert(consentRecords)
    .values({ contributorId: contributor.id, batchId: batch.id, consentTextVersion: 'v1' })
    .returning()

  async function makeSubmission(status: 'qa_approved' | 'submitted') {
    const [s] = await db
      .insert(submissions)
      .values({
        batchId: batch.id,
        contributorId: contributor.id,
        consentRecordId: consent.id,
        mediaType: 'audio',
        storageKey: `contributors/x/y/${Math.random()}.webm`,
        fileSizeBytes: 2000,
        mimeType: 'audio/webm',
        capturedAt: new Date(),
        deviceInfo: {},
        status,
      })
      .returning()
    return s
  }

  const approved = await Promise.all(
    Array.from({ length: opts.qaApprovedCount }, () => makeSubmission('qa_approved')),
  )
  const notApproved = await Promise.all(
    Array.from({ length: opts.notApprovedCount ?? 0 }, () => makeSubmission('submitted')),
  )

  return { admin, campaign, approved, notApproved }
}

async function seedBuyer() {
  const [buyer] = await db
    .insert(users)
    .values({ role: 'buyer', email: `buyer-${Math.random()}@oreset.dev`, status: 'active' })
    .returning()
  return buyer
}

describe('datasets.service — Assembly / Seal / Handoff state machine', () => {
  it('rejects adding a non-qa_approved submission', async () => {
    const { admin, campaign, approved, notApproved } = await seedCampaignWithSubmissions({
      qaApprovedCount: 1,
      notApprovedCount: 1,
    })
    const dataset = await datasetsService.createDataset({
      title: 'Test Dataset',
      campaignId: campaign.id,
      licenseTerms: 'x',
      createdBy: admin.id,
    })

    await expect(datasetsService.addItems(dataset.id, [notApproved[0].id])).rejects.toMatchObject({ status: 400 })

    const { added } = await datasetsService.addItems(dataset.id, [approved[0].id])
    expect(added).toBe(1)
  })

  it('rejects sealing an empty dataset, and blocks further edits once sealed', async () => {
    const { admin, campaign, approved } = await seedCampaignWithSubmissions({ qaApprovedCount: 1 })
    const empty = await datasetsService.createDataset({
      title: 'Empty',
      campaignId: campaign.id,
      licenseTerms: 'x',
      createdBy: admin.id,
    })
    await expect(datasetsService.sealDataset(empty.id, admin.id)).rejects.toMatchObject({
      status: 409,
      code: 'empty_dataset',
    })

    const dataset = await datasetsService.createDataset({
      title: 'Sealable',
      campaignId: campaign.id,
      licenseTerms: 'x',
      createdBy: admin.id,
    })
    await datasetsService.addItems(dataset.id, [approved[0].id])
    const sealed = await datasetsService.sealDataset(dataset.id, admin.id)
    expect(sealed.status).toBe('sealed')
    expect(sealed.provenanceHash).toMatch(/^[0-9a-f]{64}$/)

    await expect(datasetsService.addItems(dataset.id, [approved[0].id])).rejects.toMatchObject({ status: 409 })
  })

  it('rejects handoff to a non-buyer, accepts handoff to a real buyer', async () => {
    const { admin, campaign, approved } = await seedCampaignWithSubmissions({ qaApprovedCount: 1 })
    const dataset = await datasetsService.createDataset({
      title: 'Handoff Test',
      campaignId: campaign.id,
      licenseTerms: 'x',
      createdBy: admin.id,
    })
    await datasetsService.addItems(dataset.id, [approved[0].id])
    await datasetsService.sealDataset(dataset.id, admin.id)

    await expect(datasetsService.handoffDataset(dataset.id, admin.id, admin.id)).rejects.toMatchObject({
      status: 400,
      code: 'invalid_buyer',
    })

    const buyer = await seedBuyer()
    const delivered = await datasetsService.handoffDataset(dataset.id, buyer.id, admin.id)
    expect(delivered.status).toBe('delivered')
    expect(delivered.buyerId).toBe(buyer.id)
  })

  it('gives two datasets with different contents different provenance hashes', async () => {
    const { admin, campaign, approved } = await seedCampaignWithSubmissions({ qaApprovedCount: 2 })

    const datasetA = await datasetsService.createDataset({
      title: 'A',
      campaignId: campaign.id,
      licenseTerms: 'x',
      createdBy: admin.id,
    })
    await datasetsService.addItems(datasetA.id, [approved[0].id])
    const sealedA = await datasetsService.sealDataset(datasetA.id, admin.id)

    const datasetB = await datasetsService.createDataset({
      title: 'B',
      campaignId: campaign.id,
      licenseTerms: 'x',
      createdBy: admin.id,
    })
    await datasetsService.addItems(datasetB.id, [approved[1].id])
    const sealedB = await datasetsService.sealDataset(datasetB.id, admin.id)

    expect(sealedA.provenanceHash).not.toBe(sealedB.provenanceHash)
  })
})
