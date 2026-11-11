import { expect, test } from '@playwright/test'

test('language selection is accessible, persists only preference, and preserves salary draft', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto('./')
  const gross = page.getByLabel('Gross salary (EUR)', { exact: true })
  await gross.fill('48000')
  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  await page.getByLabel('Language', { exact: true }).selectOption('de')
  await expect(page.locator('html')).toHaveAttribute('lang', 'de')
  await expect(
    page.getByRole('heading', {
      name: 'Verstehen Sie, was hinter einem Stellenangebot steckt.',
    }),
  ).toBeVisible()
  await expect(
    page.getByText(/Die deutsche Übersetzung wird schrittweise ergänzt/),
  ).toBeVisible()
  await expect(gross).toHaveValue('48000')
  const preference = await page.evaluate(() => ({
    value: localStorage.getItem('nettopilot:locale'),
    keys: Array.from({ length: localStorage.length }, (_, index) =>
      localStorage.key(index),
    ),
  }))
  expect(preference).toEqual({
    value: 'de',
    keys: ['nettopilot:locale'],
  })
  await expect(page).not.toHaveURL(/48000|1990|taxClass/)
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(375)

  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('lang', 'de')
  await expect(page.getByLabel('Sprache', { exact: true })).toHaveValue('de')
  await expect(
    page.getByLabel('Gross salary (EUR)', { exact: true }),
  ).toHaveValue('')
  await page.getByLabel('Sprache', { exact: true }).selectOption('en')
  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  await expect(page.getByLabel('Language', { exact: true })).toHaveValue('en')
})
