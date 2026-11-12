import { expect, test } from '@playwright/test'

test('NP-UX-004 keeps unresolved errors and links to each correction', async ({
  page,
}) => {
  await page.goto('./')
  await page.getByRole('button', { name: 'Check inputs' }).click()
  const corrections = page.getByRole('status', {
    name: 'Corrections needed before calculating',
  })
  await expect(corrections).toBeVisible()
  await expect(
    corrections.getByRole('link', { name: /Gross salary:/ }),
  ).toBeVisible()
  await expect(
    corrections.getByRole('link', { name: /Tax class:/ }),
  ).toBeVisible()

  await page.getByLabel('Gross salary (EUR)', { exact: true }).fill('3500')
  await expect(
    corrections.getByRole('link', { name: /Gross salary:/ }),
  ).toHaveCount(0)
  await expect(
    corrections.getByRole('link', { name: /Tax class:/ }),
  ).toBeVisible()
  await corrections.getByRole('link', { name: /Tax class:/ }).click()
  await expect(page.getByLabel('Tax class', { exact: true })).toBeFocused()
  await page.getByLabel('Tax class', { exact: true }).selectOption('1')
  await expect(
    corrections.getByRole('link', { name: /Federal state:/ }),
  ).toBeVisible()
  await expect(
    corrections.getByRole('link', {
      name: /Confirm standard full-year employment assumptions/,
    }),
  ).toBeVisible()
})

test('NP-UX-004 targets invalid advanced fields inside a closed section', async ({
  page,
}) => {
  await page.goto('./')
  await page
    .getByRole('button', { name: /Load example: €3,500 monthly/ })
    .click()
  const details = page.locator('.salary-inputs details.np-panel')
  await details.locator('summary').click()
  await page.getByLabel('Annual tax allowance (EUR)').fill('bad')
  await details.locator('summary').click()
  await page.getByRole('button', { name: 'Check inputs' }).click()
  const corrections = page.getByRole('status', {
    name: 'Corrections needed before calculating',
  })
  await corrections.getByRole('link', { name: /Advanced settings:/ }).click()
  await expect(details).toHaveAttribute('open')
  await expect(page.getByLabel('Annual tax allowance (EUR)')).toBeFocused()
  await page.getByLabel('Annual tax allowance (EUR)').fill('')
  await expect(
    corrections.getByRole('link', { name: /Advanced settings:/ }),
  ).toHaveCount(0)
})

test('NP-UX-004 requires fresh submit after valid input edits', async ({
  page,
}) => {
  await page.goto('./')
  await page
    .getByRole('button', { name: /Load example: €3,500 monthly/ })
    .click()
  await page.locator('#np-standard-employment').check()
  await page.getByRole('button', { name: 'Check inputs' }).click()
  const result = page.getByRole('region', { name: 'Salary summary' })
  await expect(result).toBeVisible()
  await page.getByLabel('Gross salary (EUR)', { exact: true }).fill('3600')
  await expect(result).toHaveCount(0)
  await page.getByRole('button', { name: 'Check inputs' }).click()
  await expect(result).toBeVisible()
})
