import { test, expect } from '@playwright/test'

// Real UI throughout: create -> assemble -> seal -> hand off, using the
// two seeded qa_approved submissions and the seeded buyer account.
test('admin assembles, seals, and hands off a dataset', async ({ page }) => {
  await page.goto('/admin')
  await page.locator('input[type=email]').fill('admin@oreset.dev')
  await page.locator('input[type=password]').fill('dev-password')
  await page.getByRole('button', { name: /^sign in$/i }).click()
  await expect(page).toHaveURL(/\/admin\/home/)

  await page.goto('/admin/datasets')
  await page.getByRole('button', { name: /new dataset/i }).click()
  await page.getByPlaceholder(/Delivery 1/i).fill('E2E Test Dataset')
  await page.getByPlaceholder(/perpetual/i).fill('Non-exclusive, for E2E testing.')
  await page.getByRole('button', { name: /create draft/i }).click()

  await expect(page).toHaveURL(/\/admin\/datasets\/[0-9a-f-]+$/)
  await expect(page.getByText('E2E Test Dataset')).toBeVisible()

  // Select every submission in the unassembled pool and add them all.
  const checkboxes = page.locator('input[type=checkbox]')
  await expect(checkboxes.first()).toBeVisible()
  const count = await checkboxes.count()
  for (let i = 0; i < count; i++) await checkboxes.nth(i).check()
  await page.getByRole('button', { name: /add.*to dataset/i }).click()

  await expect(page.getByText(/^in this dataset \(\d+\)$/i)).not.toContainText('(0)')

  await page.getByRole('button', { name: /seal dataset/i }).click()
  await expect(page.getByText(/provenance sealed/i)).toBeVisible()

  await page.locator('select').selectOption({ label: 'Dev Buyer Org' })
  await page.getByRole('button', { name: /hand off/i }).click()

  await expect(page.getByText(/delivered to/i)).toBeVisible()
})
