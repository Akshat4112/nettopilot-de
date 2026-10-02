import { describe, expect, it } from 'vitest'

import {
  createPagesRedirect,
  PAGES_BASE_PATH,
  restorePagesRoute,
} from './pages-routing'

describe('GitHub Pages routing', () => {
  it('preserves a project deep link for restoration', () => {
    const redirect = createPagesRedirect(
      'https://akshat4112.github.io/nettopilot-de/calculator?year=2026#results',
    )

    expect(redirect.pathname).toBe(PAGES_BASE_PATH)
    expect(redirect.searchParams.get('__route')).toBe(
      '/nettopilot-de/calculator?year=2026#results',
    )
  })

  it('returns project home for paths outside the project', () => {
    const redirect = createPagesRedirect(
      'https://akshat4112.github.io/another-project',
    )

    expect(redirect.toString()).toBe(
      'https://akshat4112.github.io/nettopilot-de/',
    )
  })

  it('restores a safe same-origin project route', () => {
    const entry = new URL('https://akshat4112.github.io/nettopilot-de/')
    entry.searchParams.set(
      '__route',
      '/nettopilot-de/compare?offers=two#summary',
    )

    expect(restorePagesRoute(entry)?.toString()).toBe(
      'https://akshat4112.github.io/nettopilot-de/compare?offers=two#summary',
    )
  })

  it.each(['https://attacker.example/nettopilot-de/', '/another-project'])(
    'rejects an unsafe restored route: %s',
    (route) => {
      const entry = new URL('https://akshat4112.github.io/nettopilot-de/')
      entry.searchParams.set('__route', route)

      expect(restorePagesRoute(entry)).toBeNull()
    },
  )

  it('returns null when there is no route to restore', () => {
    expect(
      restorePagesRoute('https://akshat4112.github.io/nettopilot-de/'),
    ).toBeNull()
  })
})
