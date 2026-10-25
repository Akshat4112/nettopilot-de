import type { SalaryAggregationResult2026 } from '../domain/salary/salary-aggregation'
import { SalaryDeductionBreakdown } from './SalaryDeductionBreakdown'

type Calculated = Extract<SalaryAggregationResult2026, { state: 'calculated' }>

export interface SalarySummaryProps {
  readonly result: SalaryAggregationResult2026
  readonly displayPeriod?: 'monthly' | 'annual'
}

const euro = (cents: number): string =>
  new Intl.NumberFormat('en-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(cents / 100)

const reasonText: Record<string, string> = {
  standard_employment_confirmation_required:
    'Confirm the standard full-year payroll assumptions.',
  private_insurance_payslip_details_required:
    'Private insurance needs additional confirmed premium and subsidy data.',
  church_tax_evidence_not_in_scope:
    'Church-tax withholding requires additional approved evidence.',
  child_allowance_and_care_status_required:
    'Child allowances and age-dependent care reductions need more details.',
  age_specific_pension_or_care_rules_required:
    'Age-specific insurance and payroll assumptions need more details.',
  advanced_payroll_settlement_not_connected:
    'Bonuses and adjusted payroll allowances are not enabled in this view.',
  annual_salary_requires_monthly_cent_allocation:
    'This annual amount cannot be split into twelve equal cent-precise months.',
  special_or_voluntary_insurance_check_required:
    'This salary range needs additional insurance-coverage confirmation.',
  payroll_calculation_could_not_be_validated:
    'The selected values could not be verified against the supported payroll rules.',
}

function SummaryFigures({
  result,
  period,
}: {
  readonly result: Calculated
  readonly period: 'monthly' | 'annual'
}) {
  const annual = result.annual
  const first = result.months[0]
  const firstPrivateOutflow = first?.privateInsuranceOutflowCents
  const stable =
    first !== undefined &&
    result.months.length === 12 &&
    result.months.every(
      (month) =>
        month.oneOffGrossCents === 0 &&
        month.grossCents === first.grossCents &&
        month.netPayrollCents === first.netPayrollCents &&
        month.allDeductionsCents === first.allDeductionsCents &&
        month.employerCostCents === first.employerCostCents &&
        month.privateInsuranceOutflowCents === firstPrivateOutflow,
    )
  const values = period === 'annual' ? annual : stable ? first : null

  if (values === null)
    return (
      <p role="status">
        Monthly payroll changes across the year. Select annual totals to compare
        the complete result; no monthly average is inferred.
      </p>
    )

  return (
    <dl className="salary-summary-figures">
      <div>
        <dt>Gross pay</dt>
        <dd>{euro(values.grossCents)}</dd>
      </div>
      <div>
        <dt>Net payroll pay</dt>
        <dd>{euro(values.netPayrollCents)}</dd>
      </div>
      <div>
        <dt>Total deductions including private insurance</dt>
        <dd>{euro(values.allDeductionsCents)}</dd>
      </div>
      <div>
        <dt>Employer cost</dt>
        <dd>{euro(values.employerCostCents)}</dd>
      </div>
      {values.privateInsuranceOutflowCents > 0 && (
        <div>
          <dt>After private insurance cash outflow</dt>
          <dd>{euro(values.disposableAfterPrivateInsuranceCents)}</dd>
        </div>
      )}
    </dl>
  )
}

/**
 * Displays only independently admitted, pre-calculated monthly payroll.
 * Never treats input gross salary as a calculated net salary.
 */
export function SalarySummary({
  result,
  displayPeriod = 'annual',
}: SalarySummaryProps) {
  return (
    <section className="np-panel" aria-labelledby="salary-summary-heading">
      <h2 id="salary-summary-heading">Salary summary</h2>
      {result.state === 'calculated' ? (
        <>
          <p>
            Estimated payroll result for {result.calculationYear} —{' '}
            {displayPeriod === 'annual' ? 'annual' : 'monthly'} display.
          </p>
          <SummaryFigures result={result} period={displayPeriod} />
          <SalaryDeductionBreakdown totals={result.annual} />
        </>
      ) : (
        <p role="status">
          {result.state === 'incomplete'
            ? 'Salary result unavailable: more validated payroll inputs are required.'
            : 'Salary result unavailable: this payroll scenario is not supported.'}{' '}
          Reason: {reasonText[result.reason] ?? result.reason}.{' '}
          {result.month > 0 ? `Affected month: ${String(result.month)}.` : ''}
        </p>
      )}
    </section>
  )
}
