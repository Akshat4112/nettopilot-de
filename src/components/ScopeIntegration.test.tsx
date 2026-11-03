import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { EssentialSalaryInputs } from './EssentialSalaryInputs'
import { OfferComparisonInputs } from './OfferComparisonInputs'

describe('payroll scope before form completion', () => {
  it('explains the salary scope before the first payroll field', () => {
    render(<EssentialSalaryInputs />)
    const summary = screen.getByText(/Supported estimate:/)
    const gross = screen.getByLabelText('Gross salary (EUR)')
    expect(
      summary.compareDocumentPosition(gross) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
    expect(summary).toHaveTextContent('above €2,000 and below €5,800')
    expect(summary).toHaveTextContent('1963-01-01 through 2002-12-31')
  })

  it('shows private insurance as unsupported immediately and preserves actual inputs', () => {
    render(<EssentialSalaryInputs />)
    const insurance = screen.getByLabelText('Health insurance')
    fireEvent.change(insurance, { target: { value: 'private' } })
    expect(
      screen.getByRole('status', { name: 'Salary payroll scope' }),
    ).toHaveTextContent('Private health insurance is outside this estimate')
    expect(insurance).toHaveValue('private')
    expect(screen.getByLabelText('Tax class')).toHaveValue('')
    expect(
      screen.queryByRole('heading', { name: 'Salary summary' }),
    ).not.toBeInTheDocument()
  })

  it('keeps unknown insurance distinct from a known unsupported selection', () => {
    render(<EssentialSalaryInputs />)
    fireEvent.change(screen.getByLabelText('Health insurance'), {
      target: { value: 'unknown' },
    })
    const guidance = screen.getByRole('status', {
      name: 'Salary payroll scope',
    })
    expect(guidance).toHaveTextContent('Invalid payroll inputs')
    expect(guidance).not.toHaveTextContent(
      'Private health insurance is outside',
    )
    expect(guidance).not.toHaveTextContent('match the limited payroll scope')
  })

  it('shows the common comparison scope before either offer salary field', () => {
    render(<OfferComparisonInputs />)
    const summary = screen.getAllByText(/Supported estimate:/)[0]
    if (!summary) throw new Error('Comparison scope summary is missing')
    for (const label of [
      'Offer A gross salary (EUR)',
      'Offer B gross salary (EUR)',
    ]) {
      expect(
        summary.compareDocumentPosition(screen.getByLabelText(label)) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy()
    }
  })

  it('flags an offer range and annual-cent allocation before the shared profile is known', () => {
    render(<OfferComparisonInputs />)
    const gross = screen.getByLabelText('Offer A gross salary (EUR)')
    fireEvent.change(gross, { target: { value: '85000' } })
    const card = within(screen.getByRole('group', { name: 'Offer A' }))
    expect(
      card.getByText(/gross salary is outside the supported monthly range/),
    ).toBeInTheDocument()
    expect(card.getByText(/Annual salary cannot be split/)).toBeInTheDocument()
    expect(gross).toHaveValue('85000')
    expect(screen.getByLabelText('Comparison tax class')).toHaveValue('')
    fireEvent.change(gross, { target: { value: '48000' } })
    expect(
      card.queryByText(/gross salary is outside the supported monthly range/),
    ).not.toBeInTheDocument()
    expect(
      card.queryByText(/Annual salary cannot be split/),
    ).not.toBeInTheDocument()
  })

  it('flags special payments immediately even with a missing amount allocation or base salary', () => {
    render(<OfferComparisonInputs />)
    const payment = screen.getByLabelText('Offer A one-time payment (EUR)')
    fireEvent.change(payment, { target: { value: '500' } })
    const card = within(screen.getByRole('group', { name: 'Offer A' }))
    expect(
      card.getByText(/special payments are outside this estimate/),
    ).toBeInTheDocument()
    expect(payment).toHaveValue('500')
    expect(screen.getByLabelText('Offer A one-time payment month')).toHaveValue(
      '',
    )
    expect(screen.getByLabelText('Offer A gross salary (EUR)')).toHaveValue('')
  })

  it('explains a known shared birth-date restriction without requiring salary or tax class', () => {
    render(<OfferComparisonInputs />)
    const birth = screen.getByLabelText('Comparison date of birth')
    fireEvent.change(birth, { target: { value: '2003-01-01' } })
    expect(
      screen.getByText(/This birth date requires age-specific payroll rules/),
    ).toBeInTheDocument()
    expect(birth).toHaveValue('2003-01-01')
    expect(screen.getByLabelText('Comparison tax class')).toHaveValue('')
    expect(birth).toHaveAccessibleDescription(/Supported estimate: 2026/)
    fireEvent.change(birth, { target: { value: '2002-12-31' } })
    expect(
      screen.queryByText(/This birth date requires age-specific payroll rules/),
    ).not.toBeInTheDocument()
  })
})
