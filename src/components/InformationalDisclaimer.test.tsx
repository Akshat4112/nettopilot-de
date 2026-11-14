import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { LanguageContext, type LanguageContextValue } from '../i18n/context'
import { renderWithUser } from '../test/render'
import { InformationalDisclaimer } from './InformationalDisclaimer'

function renderDisclaimer(locale: 'en' | 'de') {
  const language = {
    locale,
    setLocale: () => {},
    t: () => '',
    term: () => '',
  } as LanguageContextValue
  return renderWithUser(
    <LanguageContext.Provider value={language}>
      <InformationalDisclaimer />
    </LanguageContext.Provider>,
  )
}

describe('InformationalDisclaimer', () => {
  it.each([
    {
      locale: 'en' as const,
      heading: 'About these estimates',
      body: 'not an official payslip',
      link: 'Read calculation methodology and limitations',
    },
    {
      locale: 'de' as const,
      heading: 'Hinweis zu diesen Schätzwerten',
      body: 'keine offizielle Gehaltsabrechnung',
      link: 'Berechnungsmethode und Einschränkungen lesen',
    },
  ])('shows an accessible $locale disclaimer and methodology link', ({ locale, heading, body, link }) => {
    renderDisclaimer(locale)
    const notice = screen.getByRole('complementary', { name: heading })
    expect(notice).toHaveTextContent(body)
    expect(screen.getByRole('link', { name: link })).toHaveAttribute('href', '#methodology')
  })
})
