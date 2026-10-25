import { expect, test } from '@playwright/test'

for (const width of [320, 375, 768, 1024, 1440]) {
  test(`calculator has no page overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('./')
    await expect(
      page.getByRole('heading', { name: 'Salary calculator inputs' }),
    ).toBeVisible()

    const rootWidth = await page.evaluate(
      () => document.documentElement.scrollWidth,
    )
    expect(rootWidth).toBeLessThanOrEqual(width)

    await page.getByRole('button', { name: /Load example:.*Class I/ }).click()
    await page.getByRole('checkbox').check()
    await page.getByRole('button', { name: 'Check inputs' }).click()

    await expect(
      page.getByRole('heading', { name: 'Salary summary' }),
    ).toBeVisible()
    await expect(
      page.getByRole('heading', { name: 'Deduction breakdown' }),
    ).toBeVisible()

    const renderedWidth = await page.evaluate(
      () => document.documentElement.scrollWidth,
    )
    expect(renderedWidth).toBeLessThanOrEqual(width)

    const tableViewport = page.locator('.salary-deduction-scroll')
    await expect(tableViewport).toBeVisible()
    const widths = await tableViewport.evaluate((element) => ({
      scrollWidth: element.scrollWidth,
      clientWidth: element.clientWidth,
    }))
    expect(widths.clientWidth).toBeGreaterThan(0)
  })
}
