import { expect, test } from '@playwright/test'

test('same-profile net compensation reconciles across pay frequencies and invalidates unsupported edits', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 900 })
  await page.goto('./')
  await page
    .getByRole('textbox', { name: 'Offer A gross salary (EUR)' })
    .fill('48000')
  await page
    .getByRole('textbox', { name: 'Offer B gross salary (EUR)' })
    .fill('4000')
  await page
    .getByRole('combobox', { name: 'Offer B pay frequency' })
    .selectOption('monthly')
  await page
    .getByRole('combobox', { name: 'Comparison tax class' })
    .selectOption('1')
  await page
    .getByRole('combobox', { name: 'Comparison federal state' })
    .selectOption('DE-BW')
  await page
    .getByLabel('Comparison date of birth', { exact: true })
    .fill('1990-01-01')
  await page
    .getByRole('checkbox', {
      name: /Confirm shared standard payroll assumptions/,
    })
    .check()
  await page.getByRole('button', { name: 'Calculate net compensation' }).click()
  const results = page.getByRole('region', {
    name: 'Offer net compensation results',
  })
  await expect(
    results.getByText('Estimated recurring net pay is equal.'),
  ).toBeVisible()
  await expect(results.getByText(/Annual net difference/)).toContainText(
    '€0.00',
  )
  await results.getByText('Offer A annual payroll breakdown').click()
  await expect(
    results.getByRole('table', { name: 'Offer A annual amounts in EUR' }),
  ).toBeVisible()
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(375)
  const original = await results
    .getByRole('region', { name: 'Offer A net result' })
    .innerText()
  await page
    .getByRole('textbox', { name: 'Offer A employer pension annual (EUR)' })
    .fill('1000')
  expect(
    await results
      .getByRole('region', { name: 'Offer A net result' })
      .innerText(),
  ).toBe(original)
  await page
    .getByRole('textbox', { name: 'Offer B gross salary (EUR)' })
    .fill('5000')
  await expect(results.getByText(/Annual net difference/)).not.toContainText(
    '€0.00',
  )
  await page
    .getByRole('textbox', {
      name: 'Offer A expected annual variable pay (EUR)',
    })
    .fill('1000')
  await expect(results.getByText(/Annual net difference/)).toHaveCount(0)
  await expect(
    results.getByText(/Offer A:.*Additional.*not supported/),
  ).toBeVisible()
  await page
    .getByRole('textbox', {
      name: 'Offer A expected annual variable pay (EUR)',
    })
    .fill('')
  await expect(results.getByText(/Annual net difference/)).toBeVisible()
  await page
    .getByRole('textbox', { name: 'Comparison additional health rate (%)' })
    .fill('invalid')
  await expect(results.getByText(/Annual net difference/)).toHaveCount(0)
  await page
    .getByRole('textbox', { name: 'Comparison additional health rate (%)' })
    .fill('')
  await page.emulateMedia({ media: 'print' })
  await expect(results).toBeHidden()
  await page.emulateMedia({ media: 'screen' })
  await expect(page).not.toHaveURL(/48000|1990|5000/)
  await page.getByRole('button', { name: 'Reset payroll assumptions' }).click()
  await expect(results).toHaveCount(0)
  await expect(
    page.getByLabel('Comparison date of birth', { exact: true }),
  ).toHaveValue('')
})
