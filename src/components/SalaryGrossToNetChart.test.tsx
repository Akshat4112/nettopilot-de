import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SalaryGrossToNetChart } from './SalaryGrossToNetChart'
import { aggregateSalaryResults2026 } from '../domain/salary/salary-aggregation'
import type { SalaryMonthAdmission2026 } from '../domain/salary/salary-aggregation'

const annualTotals = () => {
  const months: SalaryMonthAdmission2026[] = Array.from(
    { length: 12 },
    (_, index) => ({
      state: 'calculated',
      value: {
        month: index + 1,
        recurringGrossCents: 500000,
        recurringWageTaxCents: 50000,
        recurringSolidarityCents: 0,
        recurringChurchTaxCents: 0,
        employeePensionCents: 10000,
        employeeUnemploymentCents: 3000,
        employeeHealthCents: 5000,
        employeeCareCents: 2000,
        employerPensionCents: 10000,
        employerUnemploymentCents: 3000,
        employerHealthCents: 5000,
        employerCareCents: 2000,
        privateInsuranceOutflowCents: 0,
        guaranteedRecurringGrossCents: 500000,
        oneOffPayments: [],
      },
    }),
  )
  return aggregateSalaryResults2026(months)
}

describe('NP-UI-008 annual gross-to-net visualization', () => {
  it('shows reconciled annual gross, deductions and available share', () => {
    const result = annualTotals()
    expect(result.state).toBe('calculated')
    if (result.state !== 'calculated') return
    render(<SalaryGrossToNetChart totals={result.annual} />)
    expect(
      screen.getByText('From annual gross to available pay'),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('img', { name: /Available:.*Deductions:/ }),
    ).toBeInTheDocument()
    expect(screen.getByText('Annual gross pay')).toBeInTheDocument()
  })

  it('fails closed when tax components do not reconcile', () => {
    const result = annualTotals()
    expect(result.state).toBe('calculated')
    if (result.state !== 'calculated') return
    render(
      <SalaryGrossToNetChart
        totals={{ ...result.annual, allDeductionsCents: 1 }}
      />,
    )
    expect(screen.getByRole('alert')).toHaveTextContent('do not')
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })
})
