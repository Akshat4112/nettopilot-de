import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { LanguageProvider } from '../i18n/LanguageProvider'
import { renderWithUser } from '../test/render'
import { InformationalDisclaimer } from './InformationalDisclaimer'

describe('InformationalDisclaimer', () => {
  it('shows an accessible English disclaimer with methodology link', () => {
    renderWithUser(
      <LanguageProvider>
        <InformationalDisclaimer />
      </LanguageProvider>,
    )
    expect(
      screen.getByRole('complementary', { name: 'About these estimates' }),
    ).toHaveTextContent('not an official payslip')
    expect(
      screen.getByRole('link', {
        name: 'Read calculation methodology and limitations',
      }),
    ).toHaveAttribute('href', '#methodology')
  })
})
