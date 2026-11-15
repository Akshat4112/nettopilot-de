import { expect, test } from '@playwright/test'
import { openOfferCategories } from './offer-categories'

for (const blockedSide of ['A', 'B'] as const) {
  test(`NP-QA-022: Offer ${blockedSide} invalid gross never produces a misleading delta`, async ({
    page,
  }) => {
    await page.goto('./')
    for (const side of ['A', 'B']) {
      await page
        .getByRole('textbox', { name: `Offer ${side} gross salary (EUR)` })
        .fill('48000')
    }
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
      .getByLabel(/Confirm shared standard payroll assumptions/)
      .check()
    await page
      .getByRole('button', { name: 'Calculate net compensation' })
      .click()

    const results = page.getByRole('region', {
      name: 'Offer net compensation results',
    })
    await expect(results.getByText(/Annual net difference/)).toBeVisible()
    const input = page.getByRole('textbox', {
      name: `Offer ${blockedSide} gross salary (EUR)`,
    })
    await input.fill('not-a-number')
    const supportedSide = blockedSide === 'A' ? 'B' : 'A'
    await expect(
      results.getByRole('region', { name: `Offer ${supportedSide} net result` }),
    ).toContainText('Estimated annual recurring net pay')
    await expect(
      results.getByRole('region', { name: `Offer ${blockedSide} net result` }),
    ).toContainText('unavailable')
    await expect(results.getByText(/Annual net difference/)).toHaveCount(0)
    await expect(results.getByText(/Monthly net difference/)).toHaveCount(0)
    await expect(
      results.getByText(/Net difference unavailable until both offers are supported/),
    ).toBeVisible()
    await input.fill('48000')
    await expect(results.getByText(/Annual net difference/)).toBeVisible()
    await expect(page).not.toHaveURL(/48000|1990/)
  })

  test(`NP-QA-022: Offer ${blockedSide} one-time payment blocks delta until corrected`, async ({
    page,
  }) => {
    await page.goto('./')
    await openOfferCategories(page, 'Cash compensation')
    for (const side of ['A', 'B']) {
      await page
        .getByRole('textbox', { name: `Offer ${side} gross salary (EUR)` })
        .fill('48000')
    }
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
      .getByLabel(/Confirm shared standard payroll assumptions/)
      .check()
    await page
      .getByRole('button', { name: 'Calculate net compensation' })
      .click()

    const results = page.getByRole('region', {
      name: 'Offer net compensation results',
    })
    const payment = page.getByRole('textbox', {
      name: `Offer ${blockedSide} one-time payment (EUR)`,
    })
    await payment.fill('1000')
    const supportedSide = blockedSide === 'A' ? 'B' : 'A'
    await expect(
      results.getByRole('region', { name: `Offer ${supportedSide} net result` }),
    ).toContainText('Estimated annual recurring net pay')
    await expect(
      results.getByRole('region', { name: `Offer ${blockedSide} net result` }),
    ).toContainText('unavailable')
    await expect(results.getByText(/Annual net difference/)).toHaveCount(0)
    await expect(results.getByText(/Monthly net difference/)).toHaveCount(0)
    await payment.fill('')
    await expect(results.getByText(/Annual net difference/)).toBeVisible()
  })
}
