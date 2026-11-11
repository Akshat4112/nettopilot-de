import { expect, test } from '@playwright/test'

for (const width of [320, 375, 768, 1280]) {
  test(`NP-UX-012 salary workflow stays form-first and responsive at ${String(width)}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: width === 1280 ? 720 : 812 })
    await page.goto('./')
    const panel = page.locator('.salary-inputs')
    const gross = panel.getByLabel('Gross salary (EUR)', { exact: true })
    const examples = panel.getByRole('group', {
      name: 'Fictional salary examples',
    })
    const primary = panel.getByRole('button', { name: 'Check inputs' })
    const share = panel.getByRole('group', { name: 'Private sharing' })
    const [grossBounds, examplesBounds, primaryBounds, shareBounds] =
      await Promise.all([
        gross.boundingBox(),
        examples.boundingBox(),
        primary.boundingBox(),
        share.boundingBox(),
      ])
    if (
      grossBounds === null ||
      examplesBounds === null ||
      primaryBounds === null ||
      shareBounds === null
    ) {
      throw new Error(
        'Expected all calculator actions and inputs to be laid out',
      )
    }
    expect(grossBounds.y).toBeLessThan(primaryBounds.y)
    expect(primaryBounds.y).toBeLessThan(examplesBounds.y)
    expect(examplesBounds.y).toBeLessThan(shareBounds.y)
    expect(primaryBounds.height).toBeGreaterThanOrEqual(44)

    await panel
      .getByRole('button', {
        name: /Load example: €3,500 monthly/,
      })
      .click()
    await expect(gross).toHaveValue('3500')
    await expect(panel.getByRole('checkbox')).not.toBeChecked()
    await panel.locator('#np-standard-employment').check()
    await primary.click()
    const summary = page.getByRole('region', { name: 'Salary summary' })
    await expect(summary).toBeVisible()
    const recurring = summary.getByRole('heading', {
      name: 'Recurring monthly take-home pay',
    })
    await expect(recurring).toBeVisible()
    const recurringBounds = await recurring.boundingBox()
    const detailsBounds = await summary
      .getByRole('group', { name: 'Salary display period' })
      .boundingBox()
    if (recurringBounds === null || detailsBounds === null) {
      throw new Error(
        'Expected recurring result and period toggle to be laid out',
      )
    }
    expect(recurringBounds.y).toBeLessThan(detailsBounds.y)
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(width)
  })
}
