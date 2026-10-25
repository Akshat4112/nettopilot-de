import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SalarySummary } from './SalarySummary'

describe('SalarySummary', () => {
  it('never presents missing data as a calculated net salary', () => {
    render(
      <SalarySummary
        result={{
          state: 'incomplete',
          reason: 'twelve_payroll_months_required',
          month: 0,
        }}
      />,
    )
    expect(screen.getByRole('status')).toHaveTextContent('more validated')
    expect(screen.queryByText('Net payroll pay')).not.toBeInTheDocument()
  })

  it('labels unsupported payroll and affected month', () => {
    render(
      <SalarySummary
        result={{
          state: 'unsupported',
          reason: 'missing_tax_evidence',
          month: 3,
        }}
      />,
    )
    expect(screen.getByRole('status')).toHaveTextContent(
      'Affected month: 3',
    )
    expect(screen.getByRole('status')).toHaveTextContent(
      'missing_tax_evidence',
    )
  })
})
