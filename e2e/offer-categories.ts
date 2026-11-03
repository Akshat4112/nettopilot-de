import type { Page } from '@playwright/test'

/** Expand only the optional categories needed for the current user journey. */
export async function openOfferCategories(
  page: Page,
  ...categories: readonly string[]
): Promise<void> {
  for (const category of categories) {
    const disclosure = page.locator('details.offer-category').filter({
      has: page.getByRole('heading', { name: category, exact: true }),
    })
    if (!(await disclosure.evaluate((element) => element.hasAttribute('open'))))
      await disclosure.locator('summary').click()
  }
}
