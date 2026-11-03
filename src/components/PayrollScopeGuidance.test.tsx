import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import {
  PayrollScopeGuidance,
  PayrollScopeSummary,
} from './PayrollScopeGuidance'
import type { PayrollScopeInput } from './payroll-scope'

const empty: PayrollScopeInput = {
  essential: {
    gross: '',
    period: 'monthly',
    year: '2026',
    taxClass: '',
    federalState: '',
    churchTax: '',
    dateOfBirth: '',
    children: '',
    insurance: '',
  },
  advanced: {
    annualTaxAllowanceEur: '',
    annualTaxAdditionEur: '',
    additionalHealthRatePercent: '',
    privateHealthPremiumEur: '',
    privateCarePremiumEur: '',
    oneOffBonusEur: '',
    oneOffBonusMonth: '',
  },
  standardEmploymentConfirmed: false,
}

describe('payroll scope explanation', () => {
  it('shows the exact supported year, strict gross range, birth-date window and employment assumptions', () => {
    render(<PayrollScopeSummary />)
    const text = screen.getByText(/Supported estimate:/).textContent
    expect(text).toContain('2026')
    expect(text).toContain('above €2,000 and below €5,800')
    expect(text).toContain('1963-01-01 through 2002-12-31')
    expect(text).toContain('12 equal payroll months')
    expect(text).toContain('compulsory GKV')
    expect(text).toContain('no children or church tax')
    expect(text).toContain('no allowance adjustments or special payments')
    expect(text).toContain(
      'Annual gross must divide into 12 equal monthly cent amounts',
    )
  })

  it('announces a known unsupported selection before submitting or completing the form', () => {
    render(
      <PayrollScopeGuidance
        data={{
          ...empty,
          essential: { ...empty.essential, insurance: 'private' },
        }}
      />,
    )
    expect(screen.getByRole('status')).toHaveTextContent(
      'Private health insurance is outside this estimate',
    )
    expect(screen.getByRole('status')).toHaveTextContent('Keep your inputs')
    expect(screen.getByRole('status')).toHaveTextContent(
      'Missing payroll inputs',
    )
    expect(screen.getByRole('status')).not.toHaveTextContent(
      'Invalid payroll inputs',
    )
  })

  it('updates from current inputs and distinguishes malformed data from unsupported selections', () => {
    const { rerender } = render(
      <PayrollScopeGuidance
        data={{
          ...empty,
          essential: { ...empty.essential, gross: 'abc', children: '1' },
        }}
      />,
    )
    expect(screen.getByRole('status')).toHaveTextContent(
      'Invalid payroll inputs',
    )
    expect(screen.getByRole('status')).toHaveTextContent(
      'Children or tax class II',
    )
    rerender(<PayrollScopeGuidance data={empty} />)
    expect(screen.getByRole('status')).not.toHaveTextContent(
      'Children or tax class II',
    )
    expect(screen.getByRole('status')).not.toHaveTextContent(
      'Invalid payroll inputs',
    )
  })

  it('allows one common summary with separately labelled live offer messages', () => {
    render(
      <PayrollScopeGuidance data={empty} label="Offer A" showSummary={false} />,
    )
    expect(screen.queryByText(/Supported estimate:/)).not.toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveAccessibleName(
      'Offer A payroll scope',
    )
  })
})
