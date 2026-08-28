import { test, expect } from '@playwright/test'

// The real OTP sign-in flow and the cross-origin cookie round trip
// between localhost:3000 (web) and localhost:4001 (api) that proxy.ts's
// route gating depends on — flagged as never verified in a real browser
// in every prior phase.
test('contributor signs in via OTP and reaches /capture/home', async ({ page }) => {
  await page.goto('/capture')
  await page.locator('input[type=tel]').fill('+2348000000001')
  await page.getByRole('button', { name: /send code/i }).click()

  // Dev mode echoes the code directly on the page as a small monospace
  // debug tag (Contributor-flow redesign) — a dedicated element, not text
  // matching, since the surrounding copy is deliberately minimal now.
  const code = await page.locator('span.font-mono').textContent()
  expect(code?.trim()).toMatch(/^\d{6}$/)

  await page.locator('input[inputmode=numeric]').fill(code!.trim())
  await page.getByRole('button', { name: /verify & continue/i }).click()

  await expect(page).toHaveURL(/\/capture\/home/)
  await expect(page.getByRole('heading', { name: 'Home', exact: true })).toBeVisible()

  // The batches list now lives on its own page (round 4's IA split) —
  // confirm the sidebar reaches it and the real seeded batch renders there.
  // Scoped to the sidebar <nav> since Home's own quick-links grid also has
  // a "Batches" link.
  await page.locator('nav').getByRole('link', { name: 'Batches', exact: true }).click()
  await expect(page).toHaveURL(/\/capture\/batches$/)
  await expect(page.getByRole('heading', { name: /Yorùbá read-speech batch/i })).toBeVisible()
})

test('an unauthenticated visitor is redirected away from /capture/home', async ({ page }) => {
  await page.goto('/capture/home')
  await expect(page).toHaveURL(/\/capture\?next=/)
})
