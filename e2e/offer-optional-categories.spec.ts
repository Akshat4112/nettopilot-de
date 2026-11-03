import { expect, test } from '@playwright/test'

test('matched optional sections retain values and support native keyboard at 375px', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 375, height: 900 })
  await page.goto('./')
  const comparison = page.getByRole('region', {
    name: 'Compare two job offers',
    exact: true,
  })
  const disclosures = comparison.locator('details.offer-category')
  await expect(disclosures).toHaveCount(5)
  for (const detail of await disclosures.all()) {
    await expect(detail).not.toHaveAttribute('open')
    await expect(detail.locator('summary')).toContainText(
      'Offer A: Not supplied',
    )
    await expect(detail.locator('summary')).toContainText(
      'Offer B: Not supplied',
    )
  }
  const firstOptional = disclosures.first()
  expect(
    await page
      .getByLabel('Offer B pay frequency')
      .evaluate(
        (field, optional) =>
          Boolean(
            field.compareDocumentPosition(optional as Node) &
            Node.DOCUMENT_POSITION_FOLLOWING,
          ),
        await firstOptional.elementHandle(),
      ),
  ).toBe(true)
  await comparison
    .locator('.offer-optional-categories')
    .screenshot({ path: testInfo.outputPath('optional-closed-375.png') })
  const working = disclosures.filter({
    has: page.getByRole('heading', {
      name: 'Working time and vacation',
      exact: true,
    }),
  })
  const summary = working.locator('summary')
  await summary.focus()
  await page.keyboard.press('Enter')
  await expect(working).toHaveAttribute('open')
  await page.keyboard.press('Tab')
  const hoursA = page.getByLabel('Offer A contractual weekly hours')
  await expect(hoursA).toBeFocused()
  await hoursA.fill('40')
  await expect(summary).toContainText('Offer A: Incomplete')
  await expect(summary).toContainText('Offer B: Not supplied')
  await page
    .getByLabel('Offer A working days per week', { exact: true })
    .selectOption('5')
  await page.getByLabel('Offer A paid vacation days per year').fill('30')
  await expect(summary).toContainText('Offer A: Supplied')
  await working.screenshot({
    path: testInfo.outputPath('optional-open-375.png'),
  })
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(375)
  await summary.focus()
  await page.keyboard.press('Space')
  await expect(working).not.toHaveAttribute('open')
  await expect(hoursA).toBeHidden()
  await page.getByRole('button', { name: 'Copy Offer A to Offer B' }).click()
  await expect(summary).toContainText('Offer B: Supplied')
  await summary.focus()
  await page.keyboard.press('Enter')
  await expect(hoursA).toHaveValue('40')
  await expect(page.getByLabel('Offer B contractual weekly hours')).toHaveValue(
    '40',
  )
  await page.getByRole('button', { name: 'Clear Offer B' }).click()
  await expect(summary).toContainText('Offer B: Not supplied')
  await expect(hoursA).toHaveValue('40')
  for (const category of [
    'Commute costs and time',
    'Remote and home-office terms',
  ]) {
    await expect(
      disclosures
        .filter({
          has: page.getByRole('heading', { name: category, exact: true }),
        })
        .locator('summary'),
    ).toContainText('Offer A: Not supplied')
  }
  await page.setViewportSize({ width: 1280, height: 900 })
  await working.screenshot({
    path: testInfo.outputPath('optional-open-1280.png'),
  })
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(1280)
})
