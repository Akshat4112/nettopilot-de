import type { SalaryAggregationResult2026 } from '../domain/salary/salary-aggregation'

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

function SummaryFigures({
  result,
  period,
}: {
  readonly result: Calculated
  readonly period: 'monthly' | 'annual'
}) {
  const annual = result.annual
  const first = result.months[0]
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
        month.privateInsuranceOutflowCents ===
          first.privateInsuranceOutflowCents,
    )
  const values = period === 'annual' ? annual : stable ? first : null

  if (values === null)
    return (
      <p role="status">
        Monthly payroll changes across the year. Select annual totals to
        compare the complete result; no monthly average is inferred.
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
            Verified payroll result for {result.calculationYear} —{' '}
            {displayPeriod === 'annual' ? 'annual' : 'monthly'} display.
          </p>
          <SummaryFigures result={result} period={displayPeriod} />
        </>
      ) : (
        <p role="status">
          {result.state === 'incomplete'
            ? 'Salary result unavailable: more validated payroll inputs are required.'
            : 'Salary result unavailable: this payroll scenario is not supported.'}{' '}
          Reason: {result.reason}.{' '}
          {result.month > 0 ? `Affected month: ${result.month}.` : ''}
        </p>
      )}
    </section>
  )
}
