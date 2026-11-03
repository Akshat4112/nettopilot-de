import { expect, test } from '@playwright/test'
import { openOfferCategories } from './offer-categories'

test('current entered factors stay factual, explainable and private at mobile and desktop widths', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 375, height: 900 })
  await page.goto('./')
  const factors = page.getByRole('region', {
    name: 'Entered factors behind the comparison',
    exact: true,
  })
  await expect(factors).toHaveCount(0)
  await openOfferCategories(
    page,
    'Working time and vacation',
    'Commute costs and time',
    'Pension and benefits',
  )
  for (const [side, gross, vacation, office] of [
    ['A', '48000', '20', '5'],
    ['B', '60000', '25', '3'],
  ] as const) {
    await page
      .getByLabel(`Offer ${side} gross salary (EUR)`, { exact: true })
      .fill(gross)
    await page
      .getByLabel(`Offer ${side} contractual weekly hours`, { exact: true })
      .fill('40')
    await page
      .getByLabel(`Offer ${side} working days per week`, { exact: true })
      .selectOption('5')
    await page
      .getByLabel(`Offer ${side} paid vacation days per year`, { exact: true })
      .fill(vacation)
    await page
      .getByLabel(`Offer ${side} office days per week`, { exact: true })
      .selectOption(office)
    for (const category of [
      'public transport',
      'fuel',
      'parking',
      'other costs',
    ])
      await page
        .getByLabel(`Offer ${side} ${category} per office day (EUR)`, {
          exact: true,
        })
        .fill(category === 'fuel' ? '5' : '0')
    await page
      .getByLabel(`Offer ${side} one-way commute (minutes)`, { exact: true })
      .fill('30')
    await page
      .getByLabel(`Offer ${side} employer pension annual (EUR)`, {
        exact: true,
      })
      .fill(side === 'A' ? '1000' : '1200')
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
  await page
    .getByRole('button', { name: 'Calculate net compensation', exact: true })
    .click()
  await expect(factors).toBeVisible()
  await expect(factors.locator('summary')).toHaveCount(5)
  await expect(
    factors.getByText(/^Annual base-pay net: B − A: \+€6,295.08/),
  ).toBeVisible()
  await expect(
    factors.getByText(
      /^Annual net after entered commute costs: B − A: \+€6,790.08/,
    ),
  ).toBeVisible()
  await expect(
    factors.getByText(
      /^Effective net after commute cost per hour: B − A: \+€4.32 \/ hour/,
    ),
  ).toBeVisible()
  await expect(
    factors.getByText(/^Annual contractual work hours: B − A: −40 hours/),
  ).toBeVisible()
  await expect(
    factors.getByText(
      /^Annual employer pension contribution: B − A: \+€200.00/,
    ),
  ).toBeVisible()
  const paySummary = factors
    .getByRole('heading', {
      name: 'Base pay and payroll deductions',
      exact: true,
    })
    .locator('..')
  await paySummary.focus()
  await page.keyboard.press('Enter')
  await expect(
    factors.getByText(/Offer A: €48,000.00 − €16,734.00 = €31,266.00/),
  ).toBeVisible()
  await factors.screenshot({
    path: testInfo.outputPath('offer-tradeoffs-375.png'),
  })
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(375)
  await page.setViewportSize({ width: 1280, height: 900 })
  await factors.screenshot({
    path: testInfo.outputPath('offer-tradeoffs-1280.png'),
  })
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(1280)
  await factors
    .getByRole('heading', {
      name: 'Effective hourly compensation basis',
      exact: true,
    })
    .click()
  await expect(
    factors.getByText(
      /Offer A uses €30,066.00 \/ \(1,920 hours \+ 240 hours\)/,
    ),
  ).toBeVisible()
  await factors
    .getByRole('heading', {
      name: 'Working time, vacation and location',
      exact: true,
    })
    .click()
  await expect(
    factors.getByText(/Vacation values are entered day counts/),
  ).toBeVisible()
  await factors
    .getByRole('heading', {
      name: 'Separate pension and benefit valuations',
      exact: true,
    })
    .click()
  await expect(
    factors.getByText(/not added to net pay or to each other/),
  ).toBeVisible()

  await page
    .getByLabel('Offer B fuel per office day (EUR)', { exact: true })
    .fill('')
  await expect(
    factors.getByText(
      /^Annual net after entered commute costs: Difference unavailable/,
    ),
  ).toBeVisible()
  await expect(
    factors.getByText(/^Annual base-pay net: B − A: \+€6,295.08/),
  ).toBeVisible()
  const grossA = page.getByLabel('Offer A gross salary (EUR)', { exact: true })
  await grossA.fill('')
  await expect(grossA).toBeFocused()
  await expect(
    factors.getByText(/^Annual base-pay net: Difference unavailable/),
  ).toContainText('Offer B: €37,561.08')
  await expect(
    factors.getByText(/Offer B: €60,000.00 − €22,438.92 = €37,561.08/),
  ).toBeVisible()
  await page.emulateMedia({ media: 'print' })
  await expect(factors).toBeHidden()
  await page.emulateMedia({ media: 'screen' })
  await expect(page).not.toHaveURL(/48000|60000|1990/)
  await page
    .getByRole('button', { name: 'Reset payroll assumptions', exact: true })
    .click()
  await expect(factors).toHaveCount(0)
})
