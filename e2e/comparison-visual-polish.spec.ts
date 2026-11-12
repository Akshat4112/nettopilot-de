import { expect, test } from '@playwright/test'

for (const width of [320, 375, 768, 1280]) {
  test(`NP-UX-013 comparison identities and responsive layout at ${String(width)}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('./')
    const comparison = page.getByRole('region', {
      name: 'Compare two job offers',
      exact: true,
    })
    const baseA = comparison.locator('.offer-card[data-offer="a"]').first()
    const baseB = comparison.locator('.offer-card[data-offer="b"]').first()
    await expect(baseA).toHaveAttribute('data-offer', 'a')
    await expect(baseB).toHaveAttribute('data-offer', 'b')
    await expect(baseA.locator('legend')).toHaveText('Offer A')
    await expect(baseB.locator('legend')).toHaveText('Offer B')
    const a = await baseA.boundingBox()
    const b = await baseB.boundingBox()
    if (a === null || b === null) {
      throw new Error('Both base-offer panels must have layout boxes')
    }
    if (width <= 760) {
      expect(a.y).toBeLessThan(b.y)
    } else {
      expect(Math.abs(a.y - b.y)).toBeLessThanOrEqual(2)
    }
    const categories = comparison.locator('details.offer-category')
    await expect(categories).toHaveCount(5)
    const statuses = categories.first().locator('.offer-category-status')
    await expect(statuses).toHaveCount(2)
    await expect(statuses.nth(0)).toHaveAttribute('data-offer', 'a')
    await expect(statuses.nth(1)).toHaveAttribute('data-offer', 'b')
    await expect(statuses.nth(0)).toContainText('Offer A: Not supplied')
    await expect(statuses.nth(1)).toContainText('Offer B: Not supplied')

    const grossA = comparison.getByLabel('Offer A gross salary (EUR)')
    const grossB = comparison.getByLabel('Offer B gross salary (EUR)')
    await grossA.fill('48000')
    await grossB.fill('55000')
    await categories.first().locator('summary').click()
    await expect(grossA).toHaveValue('48000')
    await expect(grossB).toHaveValue('55000')
    await expect(statuses.nth(0)).toHaveAttribute('data-status', 'not-supplied')

    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(width)
  })
}
