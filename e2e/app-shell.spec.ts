import { expect, test } from '@playwright/test'

test('loads the production application shell without browser errors', async ({
  page,
}) => {
  const browserErrors: string[] = []

  page.on('console', (message) => {
    if (message.type() === 'error') {
      browserErrors.push(`console: ${message.text()}`)
    }
  })
  page.on('pageerror', (error) => {
    browserErrors.push(`page: ${error.message}`)
  })

  const response = await page.goto('./')

  expect(response?.ok()).toBe(true)
  await expect(
    page.getByRole('heading', {
      name: 'Understand the money behind a job offer.',
    }),
  ).toBeVisible()
  await expect(
    page.getByRole('link', { name: 'NettoPilot DE home' }),
  ).toHaveAttribute('href', '/nettopilot-de/')
  await expect(
    page.getByRole('complementary', { name: 'Application status' }),
  ).toContainText('The calculation engine is not available yet.')
  expect(browserErrors).toEqual([])
})
