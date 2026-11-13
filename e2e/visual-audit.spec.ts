import { expect, test } from '@playwright/test'

/**
 * NP-UX-011: deterministic baseline evidence; captures only fictional form
 * examples and never commits screenshots to the repository.
 *
 * Artifact naming is aligned with the annotated visual audit inventory.
 */
for (const width of [375, 768, 1280]) {
  test(`visual audit baseline at ${String(width)}px`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width, height: width === 1280 ? 720 : 812 })
    await page.goto('./')
    await expect(
      page.getByRole('heading', { name: 'Salary calculator inputs' }),
    ).toBeVisible()

    const screenshot = async (name: string) => {
      await page.screenshot({
        path: testInfo.outputPath(`${name}-${String(width)}.png`),
        fullPage: name === 'hero',
        animations: 'disabled',
      })
    }

    await screenshot('hero')

    const salary = page.locator('.salary-inputs')
    await salary.scrollIntoViewIfNeeded()
    await salary.screenshot({
      path: testInfo.outputPath(`salary-${String(width)}.png`),
      animations: 'disabled',
    })

    await page.getByRole('button', { name: /Load example:.*Class I ·/ }).click()
    await page.locator('#np-standard-employment').check()
    await page.getByRole('button', { name: 'Check inputs' }).click()
    await expect(
      page.getByRole('heading', { name: 'Salary summary' }),
    ).toBeVisible()

    await page
      .locator('[aria-labelledby="salary-summary-heading"]')
      .screenshot({
        path: testInfo.outputPath(`salary-result-${String(width)}.png`),
        animations: 'disabled',
      })

    await page.locator('.offer-comparison').screenshot({
      path: testInfo.outputPath(`comparison-${String(width)}.png`),
      animations: 'disabled',
    })

    await page.locator('#methodology').screenshot({
      path: testInfo.outputPath(`methodology-${String(width)}.png`),
      animations: 'disabled',
    })

    if (width === 1280) {
      await page.emulateMedia({ media: 'print' })
      await page.screenshot({
        path: testInfo.outputPath('print-report-1280.png'),
        fullPage: true,
        animations: 'disabled',
      })
      await page.emulateMedia({ media: 'screen' })
    }

    const pageWidth = await page.evaluate(
      () => document.documentElement.scrollWidth,
    )
    expect(pageWidth).toBeLessThanOrEqual(width)
  })
}
