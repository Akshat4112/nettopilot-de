import {
  compareVacation,
  type VacationComparison as VacationResult,
} from '../domain/comparison/vacation-comparison'
import type { WorkingTimeEntry } from '../domain/comparison/working-time'

const hours = (hundredths: number) =>
  (hundredths / 100).toLocaleString('en-DE', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })

function ComparisonNumbers({
  result,
}: {
  readonly result: Extract<VacationResult, { state: 'comparable' }>
}) {
  const difference = result.vacationDifferenceBMinusA
  return (
    <>
      <p>
        Paid vacation difference (B − A): {difference > 0 ? '+' : ''}
        {difference} days per year.
      </p>
      <dl className="vacation-comparison-values">
        <div>
          <dt>Offer A paid vacation</dt>
          <dd>{result.offerAVacationDays} days</dd>
        </div>
        <div>
          <dt>Offer B paid vacation</dt>
          <dd>{result.offerBVacationDays} days</dd>
        </div>
        <div>
          <dt>Offer A annual contractual hours</dt>
          <dd>{hours(result.offerAAnnualHoursHundredths)} hours</dd>
        </div>
        <div>
          <dt>Offer B annual contractual hours</dt>
          <dd>{hours(result.offerBAnnualHoursHundredths)} hours</dd>
        </div>
      </dl>
      <p>
        Contractual hours difference (B − A):{' '}
        {result.annualHoursDifferenceBMinusA > 0 ? '+' : ''}
        {hours(result.annualHoursDifferenceBMinusA)} hours per year.
      </p>
      <p>
        Paid vacation changes each offer’s annual-hours denominator, which can
        affect effective hourly compensation. Net per hour remains unavailable
        until both offers have validated payroll results.
      </p>
    </>
  )
}

export function VacationComparison({
  offerA,
  offerB,
}: {
  readonly offerA: WorkingTimeEntry
  readonly offerB: WorkingTimeEntry
}) {
  const result = compareVacation(offerA, offerB)
  return (
    <section
      className="vacation-comparison"
      aria-labelledby="vacation-comparison-heading"
    >
      <h3 id="vacation-comparison-heading">Paid vacation comparison</h3>
      {result.state === 'comparable' ? (
        <ComparisonNumbers result={result} />
      ) : (
        <p>
          Vacation comparison unavailable. Enter valid weekly hours, working
          days per week and paid vacation days for both offers.
          {result.offerA === 'invalid' ? ' Review Offer A.' : ''}
          {result.offerB === 'invalid' ? ' Review Offer B.' : ''}
        </p>
      )}
      <p className="vacation-method">
        Basis: 52 calendar weeks minus paid leave at the stated working days per
        week. Public holidays, sickness, overtime and unpaid leave are excluded.
        No cash value is assigned to vacation days.
      </p>
    </section>
  )
}
