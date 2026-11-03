import { expect, test } from '@playwright/test'

test('annual pension and benefit valuations stay independent on mobile and out of print', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 900 })
  await page.goto('./')
  await page
    .getByRole('textbox', { name: 'Offer A employer pension annual (EUR)' })
    .fill('1200.05')
  await page
    .getByRole('combobox', { name: 'Offer A pension certainty' })
    .selectOption('conditional')
  await page.getByRole('button', { name: 'Add benefit to Offer A' }).click()
  await page
    .getByRole('textbox', { name: 'Offer A benefit 1 label' })
    .fill('Training')
  await page
    .getByRole('textbox', {
      name: 'Offer A benefit 1 employer-stated annual value (EUR)',
    })
    .fill('500.25')
  await page
    .getByRole('textbox', {
      name: 'Offer A benefit 1 user-assigned annual value (EUR)',
    })
    .fill('0')
  await page.getByRole('button', { name: 'Copy Offer A to Offer B' }).click()
  await expect(
    page.getByRole('textbox', {
      name: 'Offer B employer pension annual (EUR)',
    }),
  ).toHaveValue('1200.05')
  await expect(
    page.getByRole('textbox', {
      name: 'Offer B benefit 1 user-assigned annual value (EUR)',
    }),
  ).toHaveValue('0')
  await page
    .getByRole('textbox', { name: 'Offer B benefit 1 label' })
    .fill('Different')
  await expect(
    page.getByRole('textbox', { name: 'Offer A benefit 1 label' }),
  ).toHaveValue('Training')
  const summary = page.getByRole('region', {
    name: 'Offer A pension and benefits summary',
  })
  await expect(summary.getByText(/Employer-stated:.*500.25/)).toBeVisible()
  await expect(summary.getByText(/User-assigned:.*0.00/)).toBeVisible()
  await expect(
    summary.getByText(/Tax treatment is not calculated/),
  ).toBeVisible()
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(375)
  await page.emulateMedia({ media: 'print' })
  await expect(summary).toBeHidden()
  await page.emulateMedia({ media: 'screen' })
  await page.getByRole('button', { name: 'Clear Offer B' }).click()
  await expect(
    page.getByRole('textbox', {
      name: 'Offer B employer pension annual (EUR)',
    }),
  ).toHaveValue('')
  await expect(
    page.getByRole('textbox', { name: 'Offer B benefit 1 label' }),
  ).toHaveCount(0)
  await page.getByRole('button', { name: 'Remove Offer A benefit 1' }).click()
  await expect(
    page.getByRole('textbox', { name: 'Offer A benefit 1 label' }),
  ).toHaveCount(0)
})
