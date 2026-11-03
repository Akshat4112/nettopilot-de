import {
  calculateEffectiveHourlyComparison,
  type EffectiveHourlyInputs,
  type EffectiveHourlyOfferResult,
} from '../domain/comparison/effective-hourly'
import { offerNetReasonText } from './offer-net-calculation'

const euro = (cents: number): string =>
  new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'EUR',
  }).format(cents / 100)
const hours = (hundredths: number): string =>
  (hundredths / 100).toLocaleString('en-GB', { maximumFractionDigits: 2 }) +
  ' hours'
const sources = {
  payroll: 'payroll',
  working: 'working time',
  commuteCosts: 'commute costs',
  commuteTime: 'commute time',
  schedule: 'schedule',
  denominator: 'annual hours',
} as const

function HourlyResult({
  label,
  result,
}: {
  readonly label: string
  readonly result: EffectiveHourlyOfferResult
}) {
  return (
    <section aria-label={label + ' effective hourly result'}>
      <h5>{label}</h5>
      {result.state === 'calculated' ? (
        <dl>
          <div>
            <dt>Annual base-pay net</dt>
            <dd>{euro(result.annualNetCents)}</dd>
          </div>
          <div>
            <dt>Entered annual commute costs</dt>
            <dd>{euro(result.annualCommuteCostCents)}</dd>
          </div>
          <div>
            <dt>Annual net after entered commute costs</dt>
            <dd>{euro(result.adjustedAnnualNetCents)}</dd>
          </div>
          <div>
            <dt>Annual contractual work hours</dt>
            <dd>{hours(result.annualWorkHoursHundredths)}</dd>
          </div>
          <div>
            <dt>Annual commute hours</dt>
            <dd>{hours(result.annualCommuteHoursHundredths)}</dd>
          </div>
          <div>
            <dt>Annual work plus commute hours</dt>
            <dd>{hours(result.annualTotalHoursHundredths)}</dd>
          </div>
          <div>
            <dt>Effective net after commute cost per hour</dt>
            <dd>{euro(result.hourlyCents)} / hour</dd>
          </div>
        </dl>
      ) : (
        <p>
          {label}: Effective hourly compensation unavailable (
          {sources[result.source]}).{' '}
          {result.source === 'payroll'
            ? offerNetReasonText(result.reason)
            : result.reason}
        </p>
      )}
    </section>
  )
}

export function EffectiveHourlyComparison(props: EffectiveHourlyInputs) {
  const result = calculateEffectiveHourlyComparison(props)
  return (
    <section
      className="effective-hourly-comparison"
      aria-labelledby="effective-hourly-heading"
    >
      <h4 id="effective-hourly-heading">
        Effective hourly compensation — after commuting
      </h4>
      <p>
        User-adjusted estimate for 2026: (annual base-pay net − entered annual
        commute costs) / (annual contractual work hours + annual commute hours).
        Benefits and employer pension are excluded.
      </p>
      <div className="offer-net-results">
        <HourlyResult label="Offer A" result={result.offers[0]} />
        <HourlyResult label="Offer B" result={result.offers[1]} />
      </div>
      {result.comparison.state === 'comparable' ? (
        <p>
          Hourly difference (B − A):{' '}
          {result.comparison.bMinusAHourlyCents > 0 ? '+' : ''}
          {euro(result.comparison.bMinusAHourlyCents)} / hour.
        </p>
      ) : (
        <p>
          An hourly difference is unavailable until both offers have supported
          annual net, entered commute costs and valid time inputs.
        </p>
      )}
      <p className="vacation-method">
        Uses 52 weeks adjusted for paid leave, with two commute trips per office
        day. Public holidays, sickness, overtime and unpaid leave are excluded.
        Work and commute hours are each rounded half-up to 0.01 hour; commute
        costs follow the entered daily categories. Hourly values and the
        difference are rounded half-up to EUR cents separately from exact
        ratios, so displayed values can differ by one cent when subtracted. This
        is a comparison estimate, not a payslip hourly rate.
      </p>
    </section>
  )
}
