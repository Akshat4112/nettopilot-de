import { screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { App } from '../App'
import { renderWithUser } from '../test/render'
import { LOCALE_STORAGE_KEY } from './catalog'

beforeEach(() => {
  window.localStorage.removeItem(LOCALE_STORAGE_KEY)
  document.documentElement.lang = 'en'
})

afterEach(() => {
  window.localStorage.removeItem(LOCALE_STORAGE_KEY)
  document.documentElement.lang = 'en'
})

describe('NP-I18N-002 language selection', () => {
  it('switches the shell without dropping a draft salary input', async () => {
    const { user } = renderWithUser(<App />)
    const gross = screen.getByRole('textbox', { name: 'Gross salary (EUR)' })
    await user.type(gross, '48000')
    const english = screen.getByRole('combobox', { name: 'Language' })
    expect(english).toHaveValue('en')
    expect(document.documentElement.lang).toBe('en')

    await user.selectOptions(english, 'de')
    expect(document.documentElement.lang).toBe('de')
    expect(window.localStorage.getItem(LOCALE_STORAGE_KEY)).toBe('de')
    expect(
      screen.getByRole('heading', {
        name: 'Verstehen Sie, was hinter einem Stellenangebot steckt.',
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Berechnungsmethodik' }),
    ).toHaveAttribute('href', '#methodology')
    expect(
      screen.getByText(/Die deutsche Übersetzung wird schrittweise ergänzt/),
    ).toBeInTheDocument()
    expect(gross).toHaveValue('48000')

    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Sprache' }),
      'en',
    )
    expect(document.documentElement.lang).toBe('en')
    expect(gross).toHaveValue('48000')
    expect(
      screen.getByRole('heading', {
        name: 'Understand the money behind a job offer.',
      }),
    ).toBeInTheDocument()
    expect(
      screen.queryByText(/Die deutsche Übersetzung wird schrittweise ergänzt/),
    ).not.toBeInTheDocument()
  })

  it('starts in persisted German but falls back for an unknown locale', () => {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, 'de')
    const { unmount } = renderWithUser(<App />)
    expect(document.documentElement.lang).toBe('de')
    expect(screen.getByRole('combobox', { name: 'Sprache' })).toHaveValue(
      'de',
    )
    unmount()

    window.localStorage.setItem(LOCALE_STORAGE_KEY, 'xx')
    renderWithUser(<App />)
    expect(document.documentElement.lang).toBe('en')
    expect(screen.getByRole('combobox', { name: 'Language' })).toHaveValue(
      'en',
    )
  })
})
