import { useState } from 'react'
import type { EssentialSalaryDraft } from './EssentialSalaryInputs'
import type { AdvancedSalaryDraft } from './advanced-salary-validation'
import { SalaryPrintReport } from './SalaryPrintReport'
import type {
  SalaryAggregationResult2026,
  SalaryPeriodTotals2026,
} from '../domain/salary/salary-aggregation'
import { SalaryDeductionBreakdown } from './SalaryDeductionBreakdown'
import { SalaryGrossToNetChart } from './SalaryGrossToNetChart'

export interface SalarySummaryProps {
  readonly result: SalaryAggregationResult2026
  readonly displayPeriod?: 'monthly' | 'annual'
  readonly inputs?: EssentialSalaryDraft
  readonly advancedInputs?: AdvancedSalaryDraft
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
  values,
}: {
  readonly values: SalaryPeriodTotals2026
}) {
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
  inputs,
  advancedInputs,
}: SalarySummaryProps) {
  const [period, setPeriod] = useState<'monthly' | 'annual'>(displayPeriod)
  const first = result.state === 'calculated' ? result.months[0] : undefined
  const fields =
    result.state === 'calculated'
      ? (Object.keys(result.annual) as (keyof SalaryPeriodTotals2026)[])
      : []
  const monthlyStable =
    result.state === 'calculated' &&
    first !== undefined &&
    result.months.length === 12 &&
    result.months.every((month) =>
      fields.every((field) => month[field] === first[field]),
    )
  const values =
    result.state === 'calculated'
      ? period === 'annual'
        ? result.annual
        : monthlyStable
          ? first
          : null
      : null

  return (
    <section className="np-panel" aria-labelledby="salary-summary-heading">
      <h2 id="salary-summary-heading">Salary summary</h2>
      {result.state === 'calculated' ? (
        <>
          {inputs !== undefined && advancedInputs !== undefined && (
            <div className="np-print-action">
              <p>
                Printing includes your personal salary and payroll inputs.
                Review the contents before sharing or saving.
              </p>
              <button
                type="button"
                className="np-button-secondary"
                onClick={() => {
                  window.print()
                }}
              >
                Print or save as PDF
              </button>
            </div>
          )}
          <div
            className="np-period-toggle"
            role="group"
            aria-label="Salary display period"
          >
            <button
              type="button"
              aria-pressed={period === 'monthly'}
              onClick={() => {
                setPeriod('monthly')
              }}
            >
              Monthly
            </button>
            <button
              type="button"
              aria-pressed={period === 'annual'}
              onClick={() => {
                setPeriod('annual')
              }}
            >
              Annual
            </button>
          </div>
          <p>
            Estimated payroll result for {result.calculationYear} —{' '}
            {period === 'annual' ? 'annual' : 'monthly'} display.
          </p>
          {values === null ? (
            <p role="status">
              Monthly payroll changes across the year. Select annual totals to
              compare the complete result; no monthly average is inferred.
            </p>
          ) : (
            <>
              <SummaryFigures values={values} />
              <SalaryGrossToNetChart totals={values} period={period} />
              <SalaryDeductionBreakdown totals={values} period={period} />
            </>
          )}
          {inputs !== undefined && advancedInputs !== undefined && (
            <SalaryPrintReport
              inputs={inputs}
              advanced={advancedInputs}
              totals={result.annual}
              calculationYear={result.calculationYear}
              generatedOn={new Date().toISOString().slice(0, 10)}
            />
          )}
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
