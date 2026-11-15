import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderWithUser } from '../test/render'
import { EssentialSalaryInputs } from './EssentialSalaryInputs'
import { OfferComparisonInputs } from './OfferComparisonInputs'

describe('NP-TRUST-004 result-journey integration', () => {
  it('keeps the disclaimer next to the comparison calculation area', () => {
    const { container } = renderWithUser(<OfferComparisonInputs />)
    const disclaimer = screen.getByRole('complementary', {
      name: 'About these estimates',
    })
    const calculate = screen.getByRole('button', {
      name: 'Calculate net compensation',
    })
    expect(disclaimer).toHaveTextContent('not an official payslip')
    expect(disclaimer).toContainElement(
      screen.getByRole('link', { name: 'Read calculation methodology and limitations' }),
    )
    expect(
      calculate.compareDocumentPosition(disclaimer) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
    expect(
      container.querySelectorAll('aside[aria-label="About these estimates"]'),
    ).toHaveLength(1)
  })

  it('does not show the salary-results disclaimer before a calculation', () => {
    renderWithUser(<EssentialSalaryInputs />)
    expect(
      screen.queryByRole('complementary', { name: 'About these estimates' }),
    ).not.toBeInTheDocument()
  })
})
