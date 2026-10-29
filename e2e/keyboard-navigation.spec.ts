import { expect, test, type Locator, type Page } from '@playwright/test'

async function activateWithKeyboard(control: Locator): Promise<void> {
  await control.focus()
  await control.press('Enter')
}

async function loadSalaryExample(page: Page): Promise<void> {
  await activateWithKeyboard(
    page.getByRole('button', { name: /Load example: €3,500 monthly/ }),
  )
}

test('the first keyboard stop skips the header and visibly focuses main', async ({
  page,
}) => {
  await page.goto('./')
  await page.keyboard.press('Tab')
  const skip = page.getByRole('link', { name: 'Skip to main content' })
  await expect(skip).toBeFocused()
  await expect(skip).toBeVisible()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('main')).toBeFocused()
  await expect(page.getByRole('main')).toHaveCSS('outline-style', 'solid')
})

test('salary submission focuses the first invalid input, then confirmation, then the result', async ({
  page,
}) => {
  await page.goto('./')
  await activateWithKeyboard(page.getByRole('button', { name: 'Check inputs' }))
  await expect(page.locator('#np-gross')).toBeFocused()
  await expect(page.locator('#np-gross')).toHaveAttribute(
    'aria-invalid',
    'true',
  )
  await page.keyboard.type('3500')
  await page.keyboard.press('Tab')
  await expect(page.getByLabel('Salary frequency')).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(page.getByLabel('Tax year', { exact: true })).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(page.getByLabel('Tax class', { exact: true })).toBeFocused()
  await page.locator('#np-gross').focus()
  await page.keyboard.press('Enter')
  await expect(page.getByLabel('Tax class', { exact: true })).toBeFocused()
  await expect(page.locator('#np-gross')).toHaveValue('3500')

  await loadSalaryExample(page)
  await page.locator('#np-gross').focus()
  await page.keyboard.press('Enter')
  await expect(page.locator('#np-standard-employment')).toBeFocused()
  await page.keyboard.press('Space')
  await page.keyboard.press('Tab')
  await expect(page.getByRole('button', { name: 'Check inputs' })).toBeFocused()
  await page.keyboard.press('Enter')
  const summary = page.getByRole('region', { name: 'Salary summary' })
  await expect(summary).toBeFocused()
  await expect(summary).toHaveCSS('outline-style', 'solid')

  const monthly = page.getByRole('button', { name: 'Monthly', exact: true })
  await activateWithKeyboard(monthly)
  await expect(monthly).toHaveAttribute('aria-pressed', 'true')
  await page.keyboard.press('Tab')
  const annual = page.getByRole('button', { name: 'Annual', exact: true })
  await expect(annual).toBeFocused()
  await page.keyboard.press('Space')
  await expect(annual).toHaveAttribute('aria-pressed', 'true')
  await expect(annual).toBeFocused()

  await page.locator('#np-gross').focus()
  await page.keyboard.press('End')
  await page.keyboard.type('0')
  await expect(page.locator('#np-gross')).toBeFocused()
  await activateWithKeyboard(
    page.getByRole('button', { name: 'Reset', exact: true }),
  )
  await expect(page.locator('#np-gross')).toBeFocused()
  await expect(page.locator('#np-gross')).toHaveValue('')
})

test('collapsed advanced errors are revealed and focused without trapping the keyboard', async ({
  page,
}) => {
  await page.goto('./')
  await loadSalaryExample(page)
  const advanced = page.getByText('Advanced settings (optional)', {
    exact: true,
  })
  await advanced.focus()
  await expect(advanced).toHaveCSS('outline-style', 'solid')
  await page.keyboard.press('Enter')
  const allowance = page.getByLabel('Annual tax allowance (EUR)', {
    exact: true,
  })
  await page.keyboard.press('Tab')
  await expect(allowance).toBeFocused()
  await page.keyboard.type('invalid')
  await advanced.focus()
  await page.keyboard.press('Space')
  await expect(allowance).toBeHidden()
  await activateWithKeyboard(page.getByRole('button', { name: 'Check inputs' }))
  await expect(allowance).toBeVisible()
  await expect(allowance).toBeFocused()
  await page.keyboard.press('Shift+Tab')
  await expect(advanced).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(allowance).toBeFocused()
})

test('offer calculation focuses current results only on deliberate activation and reset returns to assumptions', async ({
  page,
}) => {
  await page.goto('./')
  await page
    .getByLabel('Offer A gross salary (EUR)', { exact: true })
    .fill('48000')
  await page
    .getByLabel('Offer B gross salary (EUR)', { exact: true })
    .fill('48000')
  await page
    .getByLabel('Comparison tax class', { exact: true })
    .selectOption('1')
  await page
    .getByLabel('Comparison federal state', { exact: true })
    .selectOption('DE-BW')
  await page
    .getByLabel('Comparison date of birth', { exact: true })
    .fill('1990-01-01')
  const confirmation = page.getByRole('checkbox', {
    name: /Confirm shared standard payroll assumptions/,
  })
  await confirmation.focus()
  await page.keyboard.press('Space')
  await page.keyboard.press('Tab')
  await expect(
    page.getByRole('button', { name: 'Calculate net compensation' }),
  ).toBeFocused()
  await page.keyboard.press('Enter')
  const results = page.getByRole('region', {
    name: 'Offer net compensation results',
  })
  await expect(results).toBeFocused()
  await expect(results).toHaveCSS('outline-style', 'solid')
  await expect(results).toContainText('Estimated recurring net pay is equal.')
  const rate = page.getByLabel('Comparison additional health rate (%)', {
    exact: true,
  })
  await rate.focus()
  await page.keyboard.type('3')
  await expect(rate).toBeFocused()
  await activateWithKeyboard(
    page.getByRole('button', { name: 'Calculate net compensation' }),
  )
  await expect(results).toBeFocused()
  await activateWithKeyboard(
    page.getByRole('button', { name: 'Reset payroll assumptions' }),
  )
  await expect(
    page.getByLabel('Comparison tax class', { exact: true }),
  ).toBeFocused()
  await expect(results).toHaveCount(0)
})
