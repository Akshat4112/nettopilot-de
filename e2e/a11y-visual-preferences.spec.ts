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
      button.evaluate(
        (element) => getComputedStyle(element).transitionDuration,
      ),
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

test('semantic text tokens retain WCAG AA contrast on calculator surfaces', async ({
  page,
}) => {
  await page.goto('./')
  const combinations = await page.evaluate(() => {
    const root = getComputedStyle(document.documentElement)
    const token = (name: string) =>
      root.getPropertyValue('--np-color-' + name).trim()
    const parseHex = (value: string) =>
      [1, 3, 5].map(
        (position) =>
          Number.parseInt(value.slice(position, position + 2), 16) / 255,
      )
    const luminosity = (hex: string) => {
      const [red, green, blue] = parseHex(hex).map((channel) =>
        channel <= 0.04045
          ? channel / 12.92
          : ((channel + 0.055) / 1.055) ** 2.4,
      )
      return (red ?? 0) * 0.2126 + (green ?? 0) * 0.7152 + (blue ?? 0) * 0.0722
    }
    const ratio = (foreground: string, background: string) => {
      const one = luminosity(token(foreground))
      const two = luminosity(token(background))
      return (Math.max(one, two) + 0.05) / (Math.min(one, two) + 0.05)
    }
    return ['ink', 'muted', 'focus', 'error', 'success', 'accent'].flatMap(
      (foreground) =>
        ['surface', 'canvas'].map((background) => ({
          foreground,
          background,
          contrast: ratio(foreground, background),
        })),
    )
  })
  for (const combination of combinations) {
    expect(
      combination.contrast,
      `Contrast for ${combination.foreground} on ${combination.background}`,
    ).toBeGreaterThanOrEqual(4.5)
  }
})
