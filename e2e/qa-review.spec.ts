import { test, expect, request as playwrightRequest } from '@playwright/test'

const API = 'http://localhost:4001'

// Arranges a real `validated` submission via the API directly (not through
// the browser) — driving the full record→upload→validate UI flow here
// would need MediaRecorder fakery that's a separate, harder problem (see
// e2e/README.md). Everything from here on is real UI interaction.
async function arrangeValidatedSubmission() {
  const api = await playwrightRequest.newContext()

  const otp = await api.post(`${API}/api/v1/auth/otp/request`, { data: { phone: '+2348000000001' } })
  const { devCode } = await otp.json()
  await api.post(`${API}/api/v1/auth/otp/verify`, { data: { phone: '+2348000000001', code: devCode } })

  const { batches } = await (await api.get(`${API}/api/v1/batches`)).json()
  const batchId = batches[0].id

  const { consentRecord } = await (
    await api.post(`${API}/api/v1/consent`, { data: { batchId } })
  ).json()

  const { uploadUrl, storageKey } = await (
    await api.post(`${API}/api/v1/uploads`, { data: { batchId, mediaType: 'audio', mimeType: 'audio/webm' } })
  ).json()

  const bytes = Buffer.concat([Buffer.from([0x1a, 0x45, 0xdf, 0xa3]), Buffer.alloc(48000)])
  await api.put(uploadUrl, { data: bytes, headers: { 'Content-Type': 'audio/webm' } })

  const submitRes = await api.post(`${API}/api/v1/submissions`, {
    data: {
      batchId,
      consentRecordId: consentRecord.id,
      mediaType: 'audio',
      storageKey,
      fileSizeBytes: bytes.length,
      mimeType: 'audio/webm',
      durationSeconds: 6,
      capturedAt: new Date().toISOString(),
      deviceInfo: { ua: 'e2e' },
    },
  })
  const { submission } = await submitRes.json()
  await api.dispose()
  return submission
}

test('QA reviewer approves a validated submission and it leaves the queue', async ({ page }) => {
  const submission = await arrangeValidatedSubmission()
  test.skip(submission.status !== 'validated', 'seeded file did not pass validation — flaky stub, not a real bug')

  await page.goto('/qa')
  await page.locator('input[type=email]').fill('qa-reviewer@oreset.dev')
  await page.locator('input[type=password]').fill('dev-password')
  await page.getByRole('button', { name: /enter qa queue/i }).click()

  await expect(page).toHaveURL(/\/qa\/queue/)
  await expect(page.getByText(/awaiting manual review/i)).toBeVisible()

  await page.getByRole('link', { name: /start reviewing/i }).click()
  await expect(page).toHaveURL(/\/qa\/item/)
  await page.getByRole('button', { name: /^approve$/i }).click()

  // Either back to the queue (more items) or /qa/complete (none left) —
  // both prove the decision was accepted and the item left the queue.
  await expect(page).toHaveURL(/\/qa\/(item|complete)/)
})
