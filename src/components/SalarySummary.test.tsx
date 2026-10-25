import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { SalarySummary } from './SalarySummary'
import {
  aggregateSalaryResults2026,
  type SalaryMonthAdmission2026,
} from '../domain/salary/salary-aggregation'

const complete = (): ReturnType<typeof aggregateSalaryResults2026> => {
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

describe('SalarySummary', () => {
  it('presents domain-calculated annual amounts and employer costs', () => {
    render(<SalarySummary result={complete()} />)
    expect(screen.getByText('Gross pay')).toBeInTheDocument()
    expect(screen.getByText('Net payroll pay')).toBeInTheDocument()
    expect(screen.getByText('Employer cost')).toBeInTheDocument()
    expect(screen.getByText(/annual display/i)).toBeInTheDocument()
  })

  it('shows a stable, pre-calculated monthly result without averaging', () => {
    render(<SalarySummary result={complete()} displayPeriod="monthly" />)
    expect(screen.getByText('Net payroll pay')).toBeInTheDocument()
    expect(screen.getByText(/monthly display/i)).toBeInTheDocument()
  })

  it('switches exact period amounts without recalculation', () => {
    const result = complete()
    render(<SalarySummary result={result} />)
    const monthly = screen.getByRole('button', { name: 'Monthly' })
    const annual = screen.getByRole('button', { name: 'Annual' })
    expect(annual).toHaveAttribute('aria-pressed', 'true')
    expect(
      screen.getByText('From annual gross to available pay'),
    ).toBeInTheDocument()

    const annualValue =
      screen.getByText('Net payroll pay').nextElementSibling?.textContent
    fireEvent.click(monthly)
    expect(monthly).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByText(/monthly display/i)).toBeInTheDocument()
    expect(
      screen.getByText('From monthly gross to available pay'),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('table', { name: /Monthly employee deductions/ }),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Net payroll pay').nextElementSibling?.textContent,
    ).not.toBe(annualValue)

    fireEvent.click(annual)
    expect(annual).toHaveAttribute('aria-pressed', 'true')
    expect(
      screen.getByText('Net payroll pay').nextElementSibling?.textContent,
    ).toBe(annualValue)
    expect(
      screen.getByRole('table', { name: /Annual employee deductions/ }),
    ).toBeInTheDocument()
  })

  it('rejects monthly averages when payroll months differ', () => {
    const result = complete()
    expect(result.state).toBe('calculated')
    if (result.state !== 'calculated') return
    const months = result.months.map((month, index) =>
      index === 5
        ? { ...month, netPayrollCents: month.netPayrollCents + 1 }
        : month,
    )
    render(<SalarySummary result={{ ...result, months }} />)
    fireEvent.click(screen.getByRole('button', { name: 'Monthly' }))
    expect(screen.getByRole('status')).toHaveTextContent(
      'no monthly average is inferred',
    )
    expect(
      screen.queryByRole('img', { name: /Available:/ }),
    ).not.toBeInTheDocument()
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Annual' }))
    expect(screen.getByText('Net payroll pay')).toBeInTheDocument()
  })

  it('prints a local-only report with input assumptions and exact annual totals', () => {
    const print = vi.spyOn(window, 'print').mockImplementation(() => {})
    render(
      <SalarySummary
        result={complete()}
        inputs={{
          gross: '5000',
          period: 'monthly',
          year: '2026',
          taxClass: '4',
          federalState: 'DE-BW',
          churchTax: 'not_liable',
          dateOfBirth: '1990-01-01',
          children: '0',
          insurance: 'statutory',
        }}
        advancedInputs={{
          annualTaxAllowanceEur: '',
          annualTaxAdditionEur: '',
          additionalHealthRatePercent: '',
          privateHealthPremiumEur: '',
          privateCarePremiumEur: '',
          oneOffBonusEur: '',
          oneOffBonusMonth: '',
        }}
      />,
    )
    const report = screen.getByRole('region', {
      name: 'Printable salary report',
      hidden: true,
    })
    expect(report).toHaveTextContent('BMF 2026 wage-tax algorithm')
    expect(report).toHaveTextContent('1990-01-01')
    expect(report).toHaveTextContent('Reconciled calculation summary (annual)')
    expect(report).toHaveTextContent('Generated (UTC)')
    expect(report).toHaveTextContent('All values were calculated locally')
    expect(screen.getByText(/Printing includes your personal salary/)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Print or save as PDF' }))
    expect(print).toHaveBeenCalledTimes(1)
    print.mockRestore()
  })

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
    expect(screen.getByRole('status')).toHaveTextContent('Affected month: 3')
    expect(screen.getByRole('status')).toHaveTextContent('missing_tax_evidence')
  })
})
