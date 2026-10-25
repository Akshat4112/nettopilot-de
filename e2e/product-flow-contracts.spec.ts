import { expect, test } from '@playwright/test'

test.describe('product-flow smoke contracts', () => {
  test('completes a supported 2026 gross-to-net salary calculation', async ({
    page,
  }) => {
    await page.goto('./')
    await page.getByLabel('Gross salary (EUR)').fill('5000')
    await page.getByLabel('Tax class').selectOption('4')
    await page.getByLabel('Federal state').selectOption('DE-BW')
    await page.getByLabel('Church-tax liability').selectOption('not_liable')
    await page.getByLabel('Date of birth').fill('1990-01-01')
    await page.getByLabel('Number of children').fill('0')
    await page.locator('#np-insurance').selectOption('statutory')
    await page.getByRole('checkbox').check()
    await page.getByRole('button', { name: 'Check inputs' }).click()
    await expect(
      page.getByRole('heading', { name: 'Salary summary' }),
    ).toBeVisible()
    await expect(page.getByText('Gross pay', { exact: true })).toBeVisible()
    await expect(page.getByText('Net payroll pay')).toBeVisible()
    await expect(page.getByText('Employer cost')).toBeVisible()
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
    await expect(page.getByLabel('Gross salary (EUR)')).toHaveValue('5000')

    await page.getByRole('button', { name: 'Reset' }).click()
    await expect(
      page.getByRole('heading', { name: 'Salary summary' }),
    ).toHaveCount(0)
    await expect(page.getByLabel('Gross salary (EUR)')).toHaveValue('')
  })

  test('does not fabricate private-insurance results', async ({ page }) => {
    await page.goto('./')
    await page.getByLabel('Gross salary (EUR)').fill('5000')
    await page.getByLabel('Tax class').selectOption('4')
    await page.getByLabel('Federal state').selectOption('DE-BW')
    await page.getByLabel('Church-tax liability').selectOption('not_liable')
    await page.getByLabel('Date of birth').fill('1990-01-01')
    await page.getByLabel('Number of children').fill('0')
    await page.locator('#np-insurance').selectOption('private')
    await page.getByRole('checkbox').check()
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
    await expect(page.getByLabel('Federal state')).toHaveValue('DE-BE')
    await expect(page.getByLabel('Gross salary (EUR)')).toHaveValue('')
    await expect(page.getByText('Safe URL settings restored')).toBeVisible()
    await page
      .getByRole('button', { name: 'Clear shared settings and reset' })
      .click()
    await expect(page).not.toHaveURL(/np=1/)
    await expect(page.getByLabel('Federal state')).toHaveValue('')
  })

  test('compares two job offers', () => {
    test.fixme(
      true,
      'Activate after NP-CMP-002 and NP-CMP-012 provide the comparison journey.',
    )
  })
})
