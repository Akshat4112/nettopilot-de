import { expect, test } from '@playwright/test'
import { openOfferCategories } from './offer-categories'

test('one calculation action separates optional completeness from current per-offer payroll readiness', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 375, height: 900 })
  await page.goto('./')
  const calculate = page.getByRole('button', {
    name: 'Calculate net compensation',
  })
  await expect(calculate).toHaveCount(1)
  await expect(
    page.getByRole('button', { name: 'Check both offers' }),
  ).toHaveCount(0)
  for (const side of ['A', 'B']) {
    await page
      .getByLabel(`Offer ${side} gross salary (EUR)`, { exact: true })
      .fill('48000')
  }
  await page
    .getByLabel('Comparison tax class', { exact: true })
    .selectOption('1')
  await page
    .getByLabel('Comparison federal state', { exact: true })
    .selectOption('DE-BW')
  await page
    .getByLabel('Comparison date of birth', { exact: true })
    .fill('1990-01-01')
  await page.getByLabel(/Confirm shared standard payroll assumptions/).check()
  const results = page.getByRole('region', {
    name: 'Offer net compensation results',
  })
  await expect(results).toHaveCount(0)
  await openOfferCategories(
    page,
    'Working time and vacation',
    'Pension and benefits',
  )
  await page
    .getByLabel('Offer A contractual weekly hours', { exact: true })
    .fill('40')
  await page
    .getByLabel('Offer A employer occupational pension annual (EUR)', { exact: true })
    .fill('-1')
  await calculate.focus()
  await page.keyboard.press('Enter')
  await expect(results).toBeFocused()
  const a = results.getByRole('region', {
    name: 'Offer A net result',
    exact: true,
  })
  const b = results.getByRole('region', {
    name: 'Offer B net result',
    exact: true,
  })
  for (const offer of [a, b]) {
    await expect(offer).toContainText('Estimated annual recurring net pay')
  }
  await expect(
    page.getByRole('group', {
      name: 'Offer A working time and vacation',
      exact: true,
    }),
  ).toHaveAttribute('aria-invalid', 'true')
  await expect(
    page.getByRole('group', {
      name: 'Offer A occupational pension and benefits inputs',
      exact: true,
    }),
  ).toHaveAttribute('aria-invalid', 'true')
  await expect(
    page.getByRole('status', { name: 'Optional comparison input review' }),
  ).toContainText('Incomplete')
  await calculate.scrollIntoViewIfNeeded()
  await page.screenshot({ path: testInfo.outputPath('primary-action-375.png') })
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(375)

  await openOfferCategories(page, 'Cash compensation')
  const variable = page.getByLabel(
    'Offer A expected annual variable pay (EUR)',
    { exact: true },
  )
  await variable.fill('-1')
  await expect(variable).toBeFocused()
  await expect(a).toContainText('Expected variable pay')
  await expect(a).toContainText(
    'Expected variable compensation must be a positive EUR amount',
  )
  await expect(b).toContainText('Estimated annual recurring net pay')
  await expect(results.getByText(/Annual net difference/)).toHaveCount(0)
  await variable.fill('')
  await expect(a).toContainText('Estimated annual recurring net pay')

  const payment = page.getByLabel('Offer A one-time payment (EUR)', {
    exact: true,
  })
  await payment.fill('500')
  await calculate.click()
  await expect(results).toBeFocused()
  await expect(a).toContainText('One-time payment')
  await expect(a).toContainText(
    'Choose the payment month for the one-time payment.',
  )
  await expect(b).toContainText('Estimated annual recurring net pay')
  await expect(
    page.getByLabel('Offer A one-time payment month', { exact: true }),
  ).toHaveValue('')
  await expect(payment).toHaveValue('500')
  await payment.fill('')
  await expect(payment).toBeFocused()
  await expect(a).toContainText('Estimated annual recurring net pay')
  await expect(b).toContainText('Estimated annual recurring net pay')
  await page.emulateMedia({ media: 'print' })
  await expect(results).toBeHidden()
  await page.emulateMedia({ media: 'screen' })
  await expect(page).not.toHaveURL(/48000|1990|500/)
  await page.getByRole('button', { name: 'Reset payroll assumptions' }).click()
  await expect(
    page.getByLabel('Comparison tax class', { exact: true }),
  ).toBeFocused()
  await expect(results).toHaveCount(0)
})
