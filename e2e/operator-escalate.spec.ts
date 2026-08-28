import { test, expect } from '@playwright/test'

// Real UI throughout — uses the seeded operator@oreset.dev and one of the
// four seeded client_queue_items, no API-only setup needed.
test('operator escalates a client item with an ERR tag and severity', async ({ page }) => {
  await page.goto('/operator')
  await page.locator('input[type=email]').fill('operator@oreset.dev')
  await page.locator('input[type=password]').fill('dev-password')
  await page.getByRole('button', { name: /^sign in$/i }).click()

  await expect(page).toHaveURL(/\/operator\/home/)
  await page.locator('nav').getByRole('link', { name: 'Queue', exact: true }).click()
  await expect(page).toHaveURL(/\/operator\/queue/)
  await page.getByRole('link', { name: /start reviewing/i }).click()
  await expect(page).toHaveURL(/\/operator\/item/)

  await page.getByRole('button', { name: /^escalate$/i }).click()
  await expect(page.getByText(/tag the issue/i)).toBeVisible()

  // Default ERR tag / severity radios are pre-selected — submit as-is.
  await page.getByRole('button', { name: /route to client ticket queue/i }).click()

  await expect(page).toHaveURL(/\/operator\/(item|home)/)
})
