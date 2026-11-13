import { expect, test } from '@playwright/test'

/**
 * NP-A11Y-004: automated checks for reduced-motion and visible keyboard focus.
 * A full WCAG AA colour-contrast audit remains a separate completion gate.
 */
test('reduced-motion preference disables interactive transitions', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('./')

  const button = page.getByRole('button', { name: 'Check inputs' })
  await expect(button).toBeVisible()
  await expect
    .poll(async () =>
      button.evaluate((element) => getComputedStyle(element).transitionDuration),
    )
    .toMatch(/^(0s)(, 0s)*$/)

  const reducedMotion = await page.evaluate(
    () => matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  expect(reducedMotion).toBe(true)
})

test('keyboard focus has a visible indicator in standard and reduced-motion modes', async ({
  page,
}) => {
  for (const reducedMotion of ['no-preference', 'reduce'] as const) {
    await page.emulateMedia({ reducedMotion })
    await page.goto('./')

    const button = page.getByRole('button', { name: 'Check inputs' })
    await button.focus()
    await expect(button).toBeFocused()

    const indicator = await button.evaluate((element) => {
      const style = getComputedStyle(element)
      return {
        outlineStyle: style.outlineStyle,
        outlineWidth: Number.parseFloat(style.outlineWidth),
        boxShadow: style.boxShadow,
      }
    })
    expect(
      (indicator.outlineStyle !== 'none' && indicator.outlineWidth > 0) ||
        indicator.boxShadow !== 'none',
    ).toBe(true)
  }
})
