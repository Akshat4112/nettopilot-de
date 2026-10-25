import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SalaryDeductionBreakdown, percentageOfGross } from './SalaryDeductionBreakdown'
import { aggregateSalaryResults2026 } from '../domain/salary/salary-aggregation'
import type { SalaryMonthAdmission2026 } from '../domain/salary/salary-aggregation'

const aggregate = () => {
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

describe('NP-UI-007 deduction breakdown', () => {
  it('renders source-explained deductions from the admitted annual aggregate', () => {
    const result = aggregate()
    expect(result.state).toBe('calculated')
    if (result.state !== 'calculated') return
    render(<SalaryDeductionBreakdown totals={result.annual} />)
    expect(screen.getByRole('table', { name: /Annual employee deductions/ })).toBeInTheDocument()
    expect(screen.getByText('Wage tax')).toBeInTheDocument()
    expect(screen.getByText('Employee pension insurance')).toBeInTheDocument()
    expect(screen.getByText(/How wage tax is calculated/)).toBeInTheDocument()
    expect(screen.getByText(/Total deductions \(including outside-payroll costs\)/)).toBeInTheDocument()
  })

  it('distinguishes share of gross from the statutory rate', () => {
    expect(percentageOfGross(1234, 10000)).toBe('12.34%')
    expect(percentageOfGross(0, 10000)).toBe('0.00%')
    expect(percentageOfGross(0, 0)).toBe('—')
  })

  it('fails closed when a displayed deduction is not reconciled', () => {
    const result = aggregate()
    expect(result.state).toBe('calculated')
    if (result.state !== 'calculated') return
    render(
      <SalaryDeductionBreakdown
        totals={{ ...result.annual, allDeductionsCents: 1 }}
      />,
    )
    expect(screen.getByRole('alert')).toHaveTextContent('do not reconcile')
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })
})
