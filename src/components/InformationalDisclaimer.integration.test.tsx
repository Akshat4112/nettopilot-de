import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderWithUser } from '../test/render'
import { EssentialSalaryInputs } from './EssentialSalaryInputs'
import { OfferComparisonInputs } from './OfferComparisonInputs'

describe('NP-TRUST-004 result-journey integration', () => {
  it('keeps the disclaimer next to the comparison calculation area', () => {
    renderWithUser(<OfferComparisonInputs />)
    const disclaimer = screen.getByRole('complementary', {
      name: 'About these estimates',
    })
    const calculate = screen.getByRole('button', {
      name: 'Calculate net compensation',
    })
    const methodologyLink = screen.getByRole('link', {
      name: /Read calculation methodology/,
    })
    const documentOrder = calculate.compareDocumentPosition(disclaimer)
    const notices = screen.getAllByRole('complementary')

    expect(disclaimer).toHaveTextContent('not an official payslip')
    expect(disclaimer).toContainElement(methodologyLink)
    expect(documentOrder & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(notices).toHaveLength(1)
  })

  it('does not show the salary-results disclaimer before a calculation', () => {
    renderWithUser(<EssentialSalaryInputs />)
    const disclaimer = screen.queryByRole('complementary', {
      name: 'About these estimates',
    })
    expect(disclaimer).not.toBeInTheDocument()
  })
})
