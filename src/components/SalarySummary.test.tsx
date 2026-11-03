import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { SalarySummary } from './SalarySummary'
import {
  aggregateSalaryResults2026,
  type SalaryMonthAdmission2026,
} from '../domain/salary/salary-aggregation'

const complete = (
  options: {
    readonly varyingRecurringTax?: boolean
    readonly privateInsuranceOutflowCents?: number
    readonly bonus?: boolean
  } = {},
): ReturnType<typeof aggregateSalaryResults2026> => {
  const months: SalaryMonthAdmission2026[] = Array.from(
    { length: 12 },
    (_, index) => ({
      state: 'calculated',
      value: {
        month: index + 1,
        recurringGrossCents: 500000,
        recurringWageTaxCents:
          options.varyingRecurringTax === true && index === 5 ? 50001 : 50000,
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
        privateInsuranceOutflowCents: options.privateInsuranceOutflowCents ?? 0,
        guaranteedRecurringGrossCents: 500000,
        oneOffPayments:
          options.bonus === true && index === 11
            ? [
                {
                  guarantee: 'variable',
                  settlement: {
                    state: 'calculated',
                    grossCents: 100000,
                    wageTaxCents: 20000,
                    solidarityCents: 0,
                    churchTaxCents: 0,
                    employeeInsuranceCents: 0,
                    employerInsuranceCents: 0,
                    netBonusCents: 80000,
                    incrementalEmployerCostCents: 100000,
                  },
                },
              ]
            : [],
      },
    }),
  )
  return aggregateSalaryResults2026(months)
}

describe('SalarySummary', () => {
  it('leads with recurring take-home pay, tax year and estimate status before details', () => {
    render(<SalarySummary result={complete()} />)
    const summary = screen.getByRole('region', { name: 'Salary summary' })
    const primary = within(summary).getByRole('region', {
      name: 'Recurring monthly take-home pay',
    })
    expect(summary.children[1]).toBe(primary)
    expect(primary).toHaveTextContent(
      'Estimated take-home pay for tax year 2026',
    )
    expect(primary).toHaveTextContent('€4,300.00')
    for (const detail of [
      screen.getByRole('group', { name: 'Salary display period' }),
      screen.getByText('Employer cost'),
    ]) {
      expect(primary.compareDocumentPosition(detail)).toBe(
        Node.DOCUMENT_POSITION_FOLLOWING,
      )
    }
  })

  it('keeps the recurring figure independent of annual totals, bonuses and the detail toggle', () => {
    render(
      <SalarySummary
        result={complete({ bonus: true, privateInsuranceOutflowCents: 30000 })}
      />,
    )
    const primary = screen.getByRole('region', {
      name: 'Recurring monthly take-home pay',
    })
    expect(primary).toHaveTextContent('€4,000.00')
    expect(primary).toHaveTextContent('After private insurance cash outflow')
    fireEvent.click(screen.getByRole('button', { name: 'Monthly' }))
    expect(primary).toHaveTextContent('€4,000.00')
    expect(screen.getByRole('status')).toHaveTextContent(
      'no monthly average is inferred',
    )
    fireEvent.click(screen.getByRole('button', { name: 'Annual' }))
    expect(primary).toHaveTextContent('€4,000.00')
    expect(screen.getByText('Net payroll pay')).toBeInTheDocument()
  })

  it('names varying recurring take-home pay without presenting an averaged lead amount', () => {
    render(<SalarySummary result={complete({ varyingRecurringTax: true })} />)
    const primary = screen.getByRole('region', {
      name: 'Recurring monthly take-home pay',
    })
    expect(primary).toHaveTextContent('Recurring monthly take-home pay varies')
    expect(primary).toHaveTextContent('No monthly average is inferred')
    expect(primary.textContent).not.toContain('€')
    expect(screen.getByText('Net payroll pay')).toBeInTheDocument()
  })

  it('replaces the leading figure with the current result and removes it when unsupported', () => {
    const { rerender } = render(<SalarySummary result={complete()} />)
    rerender(
      <SalarySummary
        result={complete({ privateInsuranceOutflowCents: 30000 })}
      />,
    )
    expect(
      screen.getByRole('region', { name: 'Recurring monthly take-home pay' }),
    ).toHaveTextContent('€4,000.00')
    rerender(
      <SalarySummary
        result={{
          state: 'unsupported',
          reason: 'missing_tax_evidence',
          month: 3,
        }}
      />,
    )
    expect(
      screen.queryByRole('region', { name: 'Recurring monthly take-home pay' }),
    ).not.toBeInTheDocument()
    expect(
      screen.getByRole('region', { name: 'Salary summary' }).textContent,
    ).not.toContain('€')
  })

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
    const print = vi.spyOn(window, 'print').mockImplementation(vi.fn())
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
    expect(
      screen.getByText(/Printing includes your personal salary/),
    ).toBeInTheDocument()
    expect(
      screen
        .getByRole('region', { name: 'Recurring monthly take-home pay' })
        .compareDocumentPosition(
          screen.getByRole('button', { name: 'Print or save as PDF' }),
        ),
    ).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
    fireEvent.click(
      screen.getByRole('button', { name: 'Print or save as PDF' }),
    )
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
    expect(
      screen.queryByRole('region', { name: 'Recurring monthly take-home pay' }),
    ).not.toBeInTheDocument()
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
