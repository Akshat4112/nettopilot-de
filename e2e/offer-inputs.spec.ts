import { expect, test } from '@playwright/test'

test('compare-offer inputs copy, clear and validate without storing salary', async ({
  page,
}) => {
  await page.goto('./')
  const a = page.getByRole('textbox', { name: 'Offer A gross salary (EUR)' })
  const b = page.getByRole('textbox', { name: 'Offer B gross salary (EUR)' })

  await page.getByRole('button', { name: 'Check both offers' }).click()
  await expect(page.getByRole('alert')).toHaveCount(2)

  await a.fill('85000.00')
  await b.fill('92000.25')
  await page.getByRole('button', { name: 'Check both offers' }).click()
  await expect(page.getByText(/Both base salaries are valid/)).toBeVisible()

  await page.getByRole('button', { name: 'Copy Offer A to Offer B' }).click()
  await expect(b).toHaveValue('85000.00')

  await page.getByRole('button', { name: 'Clear Offer B' }).click()
  await expect(b).toHaveValue('')
  await expect(a).toHaveValue('85000.00')
})

test('two-offer inputs fit the mobile viewport', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto('./')
  await expect(
    page.getByRole('heading', { name: 'Compare two job offers' }),
  ).toBeVisible()
  const scrollWidth = await page.evaluate(
    () => document.documentElement.scrollWidth,
  )
  expect(scrollWidth).toBeLessThanOrEqual(375)
})

test('offer drafts are excluded from salary report printing', async ({
  page,
}) => {
  await page.goto('./')
  await page
    .getByRole('textbox', { name: 'Offer A gross salary (EUR)' })
    .fill('85000')
  await page.emulateMedia({ media: 'print' })
  await expect(page.locator('.offer-comparison')).toBeHidden()
})

test('variable and one-time pay stay separate and require an explicit month', async ({
  page,
}) => {
  await page.goto('./')
  await page
    .getByRole('textbox', {
      name: 'Offer A expected annual variable pay (EUR)',
    })
    .fill('5000.25')
  await page
    .getByRole('textbox', { name: 'Offer A one-time payment (EUR)' })
    .fill('1200')
  await page.getByRole('button', { name: 'Check both offers' }).click()
  await expect(
    page.getByText('Choose the payment month for the one-time payment.'),
  ).toBeVisible()
  await page
    .getByRole('combobox', { name: 'Offer A one-time payment month' })
    .selectOption('11')
  await page
    .getByRole('combobox', { name: 'Offer A one-time payment certainty' })
    .selectOption('guaranteed')
  await page.getByRole('button', { name: 'Copy Offer A to Offer B' }).click()
  await expect(
    page.getByRole('textbox', {
      name: 'Offer B expected annual variable pay (EUR)',
    }),
  ).toHaveValue('5000.25')
  await expect(
    page.getByRole('combobox', { name: 'Offer B one-time payment certainty' }),
  ).toHaveValue('guaranteed')
  await page.getByRole('button', { name: 'Clear Offer B' }).click()
  await expect(
    page.getByRole('textbox', { name: 'Offer A one-time payment (EUR)' }),
  ).toHaveValue('1200')
})

test('vacation comparison updates for two independently editable schedules', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 900 })
  await page.goto('./')
  await expect(page.getByText(/Vacation comparison unavailable/)).toBeVisible()
  for (const side of ['Offer A', 'Offer B']) {
    await page
      .getByRole('textbox', { name: side + ' contractual weekly hours' })
      .fill('40')
    await page
      .getByRole('combobox', { name: side + ' working days per week' })
      .selectOption('5')
  }
  await page
    .getByRole('textbox', { name: 'Offer A paid vacation days per year' })
    .fill('20')
  await page
    .getByRole('textbox', { name: 'Offer B paid vacation days per year' })
    .fill('30')
  await expect(
    page.getByText(/Paid vacation difference \(B − A\): \+10 days/),
  ).toBeVisible()
  await expect(page.getByText(/Net per hour remains unavailable/)).toBeVisible()
  const scrollWidth = await page.evaluate(
    () => document.documentElement.scrollWidth,
  )
  expect(scrollWidth).toBeLessThanOrEqual(375)
  await page.getByRole('button', { name: 'Copy Offer B to Offer A' }).click()
  await expect(
    page.getByText(/Paid vacation difference \(B − A\): 0 days/),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Clear Offer B' }).click()
  await expect(page.getByText(/Vacation comparison unavailable/)).toBeVisible()
})

test('commute costs require user-entered categories and respect paid leave', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 900 })
  await page.goto('./')
  await expect(
    page.getByText(/Annual commute cost comparison unavailable/),
  ).toBeVisible()
  for (const side of ['Offer A', 'Offer B']) {
    await page
      .getByRole('combobox', { name: side + ' working days per week' })
      .selectOption('5')
    await page
      .getByRole('textbox', { name: side + ' paid vacation days per year' })
      .fill('30')
    await page
      .getByRole('combobox', { name: side + ' office days per week' })
      .selectOption('3')
    for (const category of [
      'public transport',
      'fuel',
      'parking',
      'other costs',
    ]) {
      await page
        .getByRole('textbox', {
          name: side + ' ' + category + ' per office day (EUR)',
        })
        .fill(category === 'public transport' ? '4.20' : '0')
    }
  }
  await expect(
    page.getByText(/Annual commute difference \(B − A\)/),
  ).toBeVisible()
  await expect(page.getByText(/€0.00/)).toBeVisible()
  const width = await page.evaluate(() => document.documentElement.scrollWidth)
  expect(width).toBeLessThanOrEqual(375)
  await page.getByRole('button', { name: 'Clear Offer B' }).click()
  await expect(
    page.getByText(/Annual commute cost comparison unavailable/),
  ).toBeVisible()
})
