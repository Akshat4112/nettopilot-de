import { openOfferCategories } from './offer-categories'
import { expect, test } from '@playwright/test'

test.describe('product-flow smoke contracts', () => {
  test('completes a supported 2026 gross-to-net salary calculation', async ({
    page,
  }) => {
    await page.goto('./')
    await page.locator('#np-gross').fill('5000')
    await page.getByLabel('Tax class', { exact: true }).selectOption('4')
    await page
      .getByLabel('Federal state', { exact: true })
      .selectOption('DE-BW')
    await page.getByLabel('Church-tax liability').selectOption('not_liable')
    await page.getByLabel('Date of birth', { exact: true }).fill('1990-01-01')
    await page.getByLabel('Number of children').fill('0')
    await page.locator('#np-insurance').selectOption('statutory')
    await page.locator('#np-standard-employment').check()
    await page.getByRole('button', { name: 'Check inputs' }).click()
    await expect(
      page.getByRole('heading', { name: 'Salary summary' }),
    ).toBeVisible()
    await expect(page.getByText('Gross pay', { exact: true })).toBeVisible()
    await expect(
      page.getByText('Net payroll pay', { exact: true }),
    ).toBeVisible()
    await expect(page.getByText('Employer cost', { exact: true })).toBeVisible()
    await page.getByRole('button', { name: 'Monthly', exact: true }).click()
    await expect(
      page.getByText('From monthly gross to available pay'),
    ).toBeVisible()
    await expect(
      page.getByRole('table', { name: /Monthly employee deductions/ }),
    ).toBeVisible()
    await page.getByRole('button', { name: 'Annual', exact: true }).click()
    await expect(
      page.getByText('From annual gross to available pay'),
    ).toBeVisible()
    await expect(page.locator('#np-gross')).toHaveValue('5000')

    await page.getByRole('button', { name: 'Reset', exact: true }).click()
    await expect(
      page.getByRole('heading', { name: 'Salary summary' }),
    ).toHaveCount(0)
    await expect(page.locator('#np-gross')).toHaveValue('')
  })

  test('does not fabricate private-insurance results', async ({ page }) => {
    await page.goto('./')
    await page.locator('#np-gross').fill('5000')
    await page.getByLabel('Tax class', { exact: true }).selectOption('4')
    await page
      .getByLabel('Federal state', { exact: true })
      .selectOption('DE-BW')
    await page.getByLabel('Church-tax liability').selectOption('not_liable')
    await page.getByLabel('Date of birth', { exact: true }).fill('1990-01-01')
    await page.getByLabel('Number of children').fill('0')
    await page.locator('#np-insurance').selectOption('private')
    await page.locator('#np-standard-employment').check()
    await page.getByRole('button', { name: 'Check inputs' }).click()
    await expect(
      page.getByText(
        /Salary result unavailable: this payroll scenario is not supported/,
      ),
    ).toBeVisible()
    await expect(page.getByText('Net payroll pay')).toHaveCount(0)
  })

  test('restores only safe shared settings and clears them on reset', async ({
    page,
  }) => {
    await page.goto('./?np=1&year=2026&period=annual&state=DE-BE')
    await expect(page.getByLabel('Salary frequency')).toHaveValue('annual')
    await expect(page.getByLabel('Federal state', { exact: true })).toHaveValue(
      'DE-BE',
    )
    await expect(page.locator('#np-gross')).toHaveValue('')
    await expect(page.getByText('Safe URL settings restored')).toBeVisible()
    await page
      .getByRole('button', { name: 'Clear shared settings and reset' })
      .click()
    await expect(page).not.toHaveURL(/np=1/)
    await expect(page.getByLabel('Federal state', { exact: true })).toHaveValue(
      '',
    )
  })

  test('compares two job offers in a current, private summary at mobile width', async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width: 375, height: 900 })
    await page.goto('./')
    await openOfferCategories(
      page,
      'Working time and vacation',
      'Commute costs and time',
      'Pension and benefits',
    )
    const summary = page.getByRole('region', {
      name: 'Offer comparison summary',
      exact: true,
    })
    await expect(summary).toHaveCount(0)
    for (const [side, gross, vacation] of [
      ['A', '48000', '20'],
      ['B', '60000', '25'],
    ] as const) {
      await page
        .getByLabel(`Offer ${side} gross salary (EUR)`, { exact: true })
        .fill(gross)
      await page.getByLabel(`Offer ${side} contractual weekly hours`).fill('40')
      await page
        .getByLabel(`Offer ${side} working days per week`, { exact: true })
        .selectOption('5')
      await page
        .getByLabel(`Offer ${side} paid vacation days per year`)
        .fill(vacation)
      await page
        .getByLabel(`Offer ${side} office days per week`, { exact: true })
        .selectOption('5')
      for (const category of [
        'public transport',
        'fuel',
        'parking',
        'other costs',
      ]) {
        await page
          .getByLabel(`Offer ${side} ${category} per office day (EUR)`)
          .fill(category === 'fuel' ? '5' : '0')
      }
      await page
        .getByLabel(`Offer ${side} one-way commute (minutes)`)
        .fill('30')
    }
    await page
      .getByLabel('Offer A employer occupational pension annual (EUR)')
      .fill('1200.05')
    await page.getByRole('button', { name: 'Add benefit to Offer A' }).click()
    await page
      .getByLabel('Offer A benefit 1 label', { exact: true })
      .fill('Training')
    await page
      .getByLabel('Offer A benefit 1 employer-stated annual value (EUR)')
      .fill('500')
    await page
      .getByLabel('Offer A benefit 1 user-assigned annual value (EUR)')
      .fill('0')
    await page.getByLabel('Comparison tax class').selectOption('1')
    await page.getByLabel('Comparison federal state').selectOption('DE-BW')
    await page.getByLabel('Comparison date of birth').fill('1990-01-01')
    await page.getByLabel(/Confirm shared standard payroll assumptions/).check()
    await page
      .getByRole('button', { name: 'Calculate net compensation' })
      .click()
    await expect(summary).toBeVisible()
    const table = summary.getByRole('table', {
      name: 'Current offer comparison — EUR, 2026',
    })
    await expect(
      table.getByRole('columnheader', { name: 'Offer A', exact: true }),
    ).toBeVisible()
    await expect(
      table.getByRole('columnheader', { name: 'Offer B', exact: true }),
    ).toBeVisible()
    await expect(
      table.getByRole('row', { name: /^Annual base gross/ }),
    ).toContainText('+€12,000.00')
    await expect(
      table.getByRole('row', { name: /^Paid vacation days/ }),
    ).toContainText('+5 days')
    await expect(
      table.getByRole('row', { name: /^Annual entered commute costs/ }),
    ).toContainText('−€25.00')
    await expect(
      table.getByRole('row', { name: /^Employer-stated benefit values/ }),
    ).toContainText('€500.00')
    await expect(
      table.getByRole('row', { name: /^User-assigned benefit values/ }),
    ).toContainText('€0.00')
    const net = table.getByRole('row', { name: /^Annual base-pay net/ })
    const originalNet = await net.innerText()
    await page
      .getByLabel('Offer A employer occupational pension annual (EUR)')
      .fill('90071992547409.91')
    await expect(
      table.getByRole('row', {
        name: /^Employer occupational pension contribution/,
      }),
    ).toContainText('€90,071,992,547,409.91')
    expect(await net.innerText()).toBe(originalNet)
    expect(
      await table.locator('caption').evaluate((caption) => {
        const range = document.createRange()
        range.selectNodeContents(caption)
        return range.getClientRects().length
      }),
    ).toBeLessThanOrEqual(2)
    const grossAmount = table
      .getByRole('row', { name: /^Annual base gross/ })
      .getByText('€48,000.00', { exact: true })
    expect(
      await grossAmount.evaluate((cell) => {
        const range = document.createRange()
        range.selectNodeContents(cell)
        return range.getClientRects().length
      }),
    ).toBe(1)
    await expect(
      table
        .getByRole('row', { name: /^Annual base gross/ })
        .getByText('Offer A', { exact: true }),
    ).toBeVisible()
    await expect(
      table
        .getByRole('row', { name: /^Annual base gross/ })
        .getByText('Offer B', { exact: true }),
    ).toBeVisible()
    const pensionAmount = table
      .getByRole('row', { name: /^Employer occupational pension contribution/ })
      .getByText('€90,071,992,547,409.91', { exact: true })
    expect(
      await pensionAmount.evaluate((amount) => {
        const range = document.createRange()
        range.selectNodeContents(amount)
        return range.getClientRects().length
      }),
    ).toBe(1)
    await table.screenshot({
      path: testInfo.outputPath('comparison-summary-375.png'),
    })
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(375)
    await page.setViewportSize({ width: 1280, height: 900 })
    expect(
      await pensionAmount.evaluate((amount) => {
        const range = document.createRange()
        range.selectNodeContents(amount)
        return range.getClientRects().length
      }),
    ).toBe(1)
    await table.screenshot({
      path: testInfo.outputPath('comparison-summary-1280.png'),
    })
    for (const pension of ['90071992547409.90', '45035996273704.95']) {
      await page
        .getByLabel('Offer B employer occupational pension annual (EUR)')
        .fill(pension)
      for (const width of [621, 768]) {
        await page.setViewportSize({ width, height: 900 })
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth),
        ).toBeLessThanOrEqual(width)
      }
    }
    await page.setViewportSize({ width: 375, height: 900 })
    await page.getByLabel('Offer A fuel per office day (EUR)').fill('')
    const cost = table.getByRole('row', {
      name: /^Annual entered commute costs/,
    })
    await expect(cost.getByText('Unavailable', { exact: true })).toHaveCount(2)
    await expect(cost).toContainText('€1,175.00')
    const reason = cost.locator('summary')
    await reason.focus()
    await page.keyboard.press('Enter')
    await expect(cost.getByText(/every daily cost/)).toBeVisible()
    expect(await net.innerText()).toBe(originalNet)
    await page.emulateMedia({ media: 'print' })
    await expect(summary).toBeHidden()
    await expect(
      page.getByLabel('Offer A benefit 1 label', { exact: true }),
    ).toBeHidden()
    await page.emulateMedia({ media: 'screen' })
    await expect(page).not.toHaveURL(/48000|60000|1990|90071992547409/)
    await page
      .getByRole('button', { name: 'Reset payroll assumptions' })
      .click()
    await expect(summary).toHaveCount(0)
  })
})
