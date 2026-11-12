import { expect, test } from '@playwright/test'

for (const width of [375, 1280]) {
  test(`NP-UX-014 form and disclosure states at ${String(width)}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('./')
    const gross = page.getByLabel('Gross salary (EUR)', { exact: true })
    const submit = page.getByRole('button', { name: 'Check inputs' })
    const reset = page.getByRole('button', { name: 'Reset', exact: true })

    await submit.click()
    await expect(gross).toHaveAttribute('aria-invalid', 'true')
    await expect(gross).toHaveCSS('border-top-color', 'rgb(163, 38, 50)')
    await expect(gross).toBeFocused()
    await expect(gross).toHaveCSS('outline-style', 'solid')
    await expect(page.locator('#np-error-gross')).toHaveAttribute(
      'role',
      'alert',
    )

    await gross.fill('3500')
    await expect(gross).not.toHaveAttribute('aria-invalid', 'true')
    await reset.hover()
    await expect(reset).toHaveCSS('border-top-color', 'rgb(19, 94, 138)')
    await reset.evaluate((button: HTMLButtonElement) => {
      button.disabled = true
    })
    await expect(reset).toBeDisabled()
    await expect(reset).toHaveCSS('cursor', 'not-allowed')
    await expect(reset).toHaveCSS('opacity', '1')

    const category = page.locator('.offer-category').first()
    await category.locator('summary').click()
    await expect(category).toHaveAttribute('open')
    await category.locator('summary').focus()
    await page.keyboard.press('Tab')
    await page.keyboard.press('Shift+Tab')
    await expect(category.locator('summary')).toBeFocused()
    await expect(category.locator('summary')).toHaveCSS(
      'outline-style',
      'solid',
    )
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(width)
  })
}

test('NP-UX-014 reduced motion leaves focus and feedback visible', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('./')
  const submit = page.getByRole('button', { name: 'Check inputs' })
  await submit.focus()
  await expect(submit).toHaveCSS('outline-style', 'solid')
  await expect(submit).toHaveCSS('transition-duration', '0s')
  await submit.click()
  await expect(
    page.getByLabel('Gross salary (EUR)', { exact: true }),
  ).toHaveAttribute('aria-invalid', 'true')
})
