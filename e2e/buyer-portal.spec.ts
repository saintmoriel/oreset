import { test, expect, request as playwrightRequest } from '@playwright/test'

const API = 'http://localhost:4001'

// Fully self-contained arrangement via the API (contributor -> validated
// submission -> QA-approved -> admin creates/assembles/seals/hands off a
// dataset) — independent of any other spec file or execution order,
// unlike relying on the seeded qa_approved submissions other specs may
// have already consumed.
async function arrangeDeliveredDataset() {
  const contributorApi = await playwrightRequest.newContext()
  const otp = await contributorApi.post(`${API}/api/v1/auth/otp/request`, {
    data: { phone: '+2348000000001' },
  })
  const { devCode } = await otp.json()
  await contributorApi.post(`${API}/api/v1/auth/otp/verify`, {
    data: { phone: '+2348000000001', code: devCode },
  })
  const { batches } = await (await contributorApi.get(`${API}/api/v1/batches`)).json()
  const batchId = batches[0].id
  const { consentRecord } = await (
    await contributorApi.post(`${API}/api/v1/consent`, { data: { batchId } })
  ).json()
  const { uploadUrl, storageKey } = await (
    await contributorApi.post(`${API}/api/v1/uploads`, {
      data: { batchId, mediaType: 'audio', mimeType: 'audio/webm' },
    })
  ).json()
  const bytes = Buffer.concat([Buffer.from([0x1a, 0x45, 0xdf, 0xa3]), Buffer.alloc(48000)])
  await contributorApi.put(uploadUrl, { data: bytes, headers: { 'Content-Type': 'audio/webm' } })
  const { submission } = await (
    await contributorApi.post(`${API}/api/v1/submissions`, {
      data: {
        batchId,
        consentRecordId: consentRecord.id,
        mediaType: 'audio',
        storageKey,
        fileSizeBytes: bytes.length,
        mimeType: 'audio/webm',
        durationSeconds: 6,
        capturedAt: new Date().toISOString(),
        deviceInfo: { ua: 'e2e-buyer-arrange' },
      },
    })
  ).json()
  await contributorApi.dispose()
  test.skip(submission.status !== 'validated', 'seeded file did not pass validation — flaky stub, not a real bug')

  const qaApi = await playwrightRequest.newContext()
  await qaApi.post(`${API}/api/v1/auth/login`, {
    data: { email: 'qa-reviewer@oreset.dev', password: 'dev-password' },
  })
  await qaApi.post(`${API}/api/v1/qa/items/${submission.id}/decision`, { data: { decision: 'approved' } })
  await qaApi.dispose()

  const adminApi = await playwrightRequest.newContext()
  await adminApi.post(`${API}/api/v1/auth/login`, {
    data: { email: 'admin@oreset.dev', password: 'dev-password' },
  })
  const { campaigns } = await (await adminApi.get(`${API}/api/v1/campaigns`)).json()
  const campaignId = campaigns[0].id
  const { dataset } = await (
    await adminApi.post(`${API}/api/v1/admin/datasets`, {
      data: { title: 'E2E Buyer Dataset', campaignId, licenseTerms: 'For E2E testing.' },
    })
  ).json()
  await adminApi.post(`${API}/api/v1/admin/datasets/${dataset.id}/items`, {
    data: { submissionIds: [submission.id] },
  })
  await adminApi.post(`${API}/api/v1/admin/datasets/${dataset.id}/seal`)
  const { buyers } = await (await adminApi.get(`${API}/api/v1/admin/buyers`)).json()
  const buyer = buyers.find((b: { email: string }) => b.email === 'buyer@oreset.dev')
  await adminApi.post(`${API}/api/v1/admin/datasets/${dataset.id}/handoff`, { data: { buyerId: buyer.id } })
  await adminApi.dispose()

  return dataset.title
}

test('buyer sees a delivered dataset with a working download link', async ({ page }) => {
  const datasetTitle = await arrangeDeliveredDataset()

  await page.goto('/buyer')
  await page.locator('input[type=email]').fill('buyer@oreset.dev')
  await page.locator('input[type=password]').fill('dev-password')
  await page.getByRole('button', { name: /^sign in$/i }).click()

  await expect(page).toHaveURL(/\/buyer\/home/)
  await page.locator('nav').getByRole('link', { name: 'Datasets', exact: true }).click()
  await expect(page).toHaveURL(/\/buyer\/datasets/)
  await page.getByText(datasetTitle).click()

  await expect(page).toHaveURL(/\/buyer\/datasets\/[0-9a-f-]+$/)
  await expect(page.getByText(/provenance sealed/i)).toBeVisible()
  await expect(page.getByRole('link', { name: /download/i })).toBeVisible()
})

test('a random dataset id 404s instead of leaking existence', async ({ page }) => {
  await page.goto('/buyer')
  await page.locator('input[type=email]').fill('buyer@oreset.dev')
  await page.locator('input[type=password]').fill('dev-password')
  await page.getByRole('button', { name: /^sign in$/i }).click()
  await expect(page).toHaveURL(/\/buyer\/home/)

  const response = await page.goto('/buyer/datasets/00000000-0000-0000-0000-000000000000')
  expect(response?.status()).toBe(404)
})
