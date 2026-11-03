import {
  calculateEffectiveHourlyComparison,
  type EffectiveHourlyInputs,
} from '../domain/comparison/effective-hourly'
import { calculateAnnualContractualHours } from '../domain/comparison/working-time'
import { calculateCommuteCosts } from '../domain/comparison/commute-costs'
import { calculateAnnualCommuteTime } from '../domain/comparison/commute-time'
import {
  evaluateBenefits,
  type BenefitsEntry,
} from '../domain/comparison/benefits'
import {
  evaluateRemoteWork,
  type RemoteWorkEntry,
} from '../domain/comparison/remote-work'
import type { OfferBenefit } from '../domain/comparison/offer-model'
import type { EuroAmount } from '../domain/salary/types'
import { offerNetReasonText } from './offer-net-calculation'

export interface OfferComparisonSummaryInputs extends EffectiveHourlyInputs {
  readonly benefits: readonly [BenefitsEntry, BenefitsEntry]
  readonly remote: readonly [RemoteWorkEntry, RemoteWorkEntry]
}

interface SummaryValue {
  readonly amount: number | null
  readonly missing: string
  readonly reason?: string
}

type Formatter = (value: number) => string

const known = (amount: number): SummaryValue => ({ amount, missing: '' })
const unavailable = (reason: string): SummaryValue => ({
  amount: null,
  missing: 'Unavailable',
  reason,
})
const notSupplied: SummaryValue = { amount: null, missing: 'Not supplied' }
const euro: Formatter = (cents) => {
  // Preserve every admitted integer cent, including the safe-integer limit.
  const value = BigInt(cents)
  const magnitude = value < 0n ? -value : value
  const whole = (magnitude / 100n).toLocaleString('en-GB')
  const fraction = (magnitude % 100n).toString().padStart(2, '0')
  return `${value < 0n ? '-' : ''}€${whole}.${fraction}`
}
const number = (value: number): string =>
  value.toLocaleString('en-GB', { maximumFractionDigits: 2 })
const hours: Formatter = (hundredths) => number(hundredths / 100) + ' hours'
const days: Formatter = (value) => number(value) + ' days'
const weeklyDays: Formatter = (value) => number(value) + ' days / week'

/** Only validated EUR decimals enter this exact conversion; no floating sum. */
const cents = (value: EuroAmount): number => {
  const [whole = '0', fraction = ''] = value.amount.split('.')
  return Number(BigInt(whole) * 100n + BigInt(fraction.padEnd(2, '0')))
}

const benefitTotal = (
  entry: BenefitsEntry,
  kind: 'employerStatedAnnualValue' | 'userAssignedAnnualValue',
): SummaryValue => {
  // Pension terms are independent from benefit valuations.
  const result = evaluateBenefits({
    ...entry,
    employerContributionAnnualEur: '',
    benefits: entry.benefits.map((benefit) => ({
      ...benefit,
      // A supplied valuation remains usable when the other source is invalid.
      ...(kind === 'employerStatedAnnualValue'
        ? { userAssignedAnnualValueEur: '' }
        : { employerStatedAnnualValueEur: '' }),
    })),
  })
  if (result.state === 'invalid') return unavailable(result.reason)
  if (result.benefits.length === 0) return notSupplied
  const values = result.benefits.map((benefit: OfferBenefit) => benefit[kind])
  if (values.some((value) => value.state !== 'provided'))
    return { amount: null, missing: 'Unknown — values missing' }
  return known(
    values.reduce(
      (total, value) =>
        total + (value.state === 'provided' ? cents(value.value) : 0),
      0,
    ),
  )
}

function SummaryRow({
  label,
  values,
  format,
  difference,
}: {
  readonly label: string
  readonly values: readonly [SummaryValue, SummaryValue]
  readonly format: Formatter
  readonly difference?: number | undefined
}) {
  const [a, b] = values
  const delta =
    a.amount === null || b.amount === null
      ? null
      : (difference ?? b.amount - a.amount)
  return (
    <tr role="row">
      <th scope="row" role="rowheader">
        {label}
      </th>
      {values.map((value, index) => (
        <td key={index} role="cell">
          <span className="offer-summary-mobile-label" aria-hidden="true">
            {index === 0 ? 'Offer A' : 'Offer B'}
          </span>
          <div className="offer-summary-value">
            {value.amount !== null ? (
              <span className="offer-summary-number">
                {format(value.amount)}
              </span>
            ) : value.reason === undefined ? (
              value.missing
            ) : (
              <details>
                <summary>{value.missing}</summary>
                <p>{value.reason}</p>
              </details>
            )}
          </div>
        </td>
      ))}
      <td role="cell">
        <span className="offer-summary-mobile-label" aria-hidden="true">
          B − A
        </span>
        <div className="offer-summary-value">
          {delta === null ? (
            'Unavailable'
          ) : (
            <span className="offer-summary-number">
              {(delta < 0 ? '−' : delta > 0 ? '+' : '') +
                format(Math.abs(delta))}
            </span>
          )}
        </div>
      </td>
    </tr>
  )
}

/** A current-props projection of admitted results; no cached amounts or ranking. */
export function OfferComparisonSummary(props: OfferComparisonSummaryInputs) {
  const effective = calculateEffectiveHourlyComparison(props)
  const summarize = (index: 0 | 1) => {
    const payroll = props.netResult.offers[index]
    const work = calculateAnnualContractualHours(props.working[index])
    const cost = calculateCommuteCosts(props.commuteCosts[index])
    const time = calculateAnnualCommuteTime(props.commuteTime[index])
    const remote = evaluateRemoteWork({
      ...props.remote[index],
      // These monetary terms do not participate in the location schedule.
      employerAllowanceMonthlyEur: '',
      homeOfficeCostMonthlyEur: '',
    })
    const benefits = props.benefits[index]
    const pension = evaluateBenefits({ ...benefits, benefits: [] })
    const hourly = effective.offers[index]
    const net =
      payroll.state === 'calculated'
        ? known(payroll.annual.netPayrollCents)
        : unavailable(offerNetReasonText(payroll.reason))
    return {
      gross:
        payroll.state === 'calculated'
          ? known(payroll.annual.recurringGrossCents)
          : unavailable(offerNetReasonText(payroll.reason)),
      net,
      afterCommute:
        payroll.state === 'calculated' && cost.state === 'calculated'
          ? known(payroll.annual.netPayrollCents - cost.annualTotalCents)
          : unavailable(
              'Supported annual net and all entered commute costs are required.',
            ),
      hourly:
        hourly.state === 'calculated'
          ? known(hourly.hourlyCents)
          : unavailable(
              hourly.source === 'payroll'
                ? offerNetReasonText(hourly.reason)
                : hourly.reason,
            ),
      work:
        work.state === 'calculated'
          ? known(work.annualContractualHoursHundredths)
          : unavailable(work.reason),
      vacation:
        work.state === 'calculated'
          ? known(work.paidVacationDaysAnnual)
          : unavailable(work.reason),
      commuteCost:
        cost.state === 'calculated'
          ? known(cost.annualTotalCents)
          : unavailable(cost.reason),
      commuteTime:
        time.state === 'calculated'
          ? known(time.annualCommuteHoursHundredths)
          : unavailable(time.reason),
      remote:
        remote.state === 'invalid'
          ? unavailable(remote.reason)
          : remote.remoteDaysPerWeek.state === 'provided'
            ? known(remote.remoteDaysPerWeek.value)
            : notSupplied,
      pension:
        pension.state === 'invalid'
          ? unavailable(pension.reason)
          : pension.employerPension.employerContributionAnnual.state ===
              'provided'
            ? known(
                cents(pension.employerPension.employerContributionAnnual.value),
              )
            : notSupplied,
      employerBenefits: benefitTotal(benefits, 'employerStatedAnnualValue'),
      personalBenefits: benefitTotal(benefits, 'userAssignedAnnualValue'),
    }
  }
  const offers = [summarize(0), summarize(1)] as const
  const values = (
    key: keyof (typeof offers)[number],
  ): readonly [SummaryValue, SummaryValue] => [offers[0][key], offers[1][key]]

  return (
    <section aria-label="Offer comparison summary">
      <h4>Offer comparison summary</h4>
      <p>
        EUR, 2026 base pay only under the shared payroll assumptions. B − A is a
        signed difference; higher values are not a recommendation. Unknown
        inputs are not zero.
      </p>
      <table className="offer-comparison-summary-table" role="table">
        <caption>Current offer comparison — EUR, 2026</caption>
        <thead role="rowgroup">
          <tr role="row">
            <th scope="col" role="columnheader">
              Measure
            </th>
            <th scope="col" role="columnheader">
              Offer A
            </th>
            <th scope="col" role="columnheader">
              Offer B
            </th>
            <th scope="col" role="columnheader">
              B − A
            </th>
          </tr>
        </thead>
        <tbody role="rowgroup">
          <SummaryRow
            label="Annual base gross"
            values={values('gross')}
            format={euro}
          />
          <SummaryRow
            label="Annual base-pay net"
            values={values('net')}
            format={euro}
          />
          <SummaryRow
            label="Annual net after entered commute costs"
            values={values('afterCommute')}
            format={euro}
          />
          <SummaryRow
            label="Effective net after commute cost per hour"
            values={values('hourly')}
            format={(value) => euro(value) + ' / hour'}
            difference={
              effective.comparison.state === 'comparable'
                ? effective.comparison.bMinusAHourlyCents
                : undefined
            }
          />
          <SummaryRow
            label="Annual contractual work hours"
            values={values('work')}
            format={hours}
          />
          <SummaryRow
            label="Paid vacation days"
            values={values('vacation')}
            format={days}
          />
          <SummaryRow
            label="Annual entered commute costs"
            values={values('commuteCost')}
            format={euro}
          />
          <SummaryRow
            label="Annual commute time"
            values={values('commuteTime')}
            format={hours}
          />
          <SummaryRow
            label="Remote days per week"
            values={values('remote')}
            format={weeklyDays}
          />
          <SummaryRow
            label="Employer pension contribution — annual"
            values={values('pension')}
            format={euro}
          />
          <SummaryRow
            label="Employer-stated benefit values — annual"
            values={values('employerBenefits')}
            format={euro}
          />
          <SummaryRow
            label="User-assigned benefit values — annual"
            values={values('personalBenefits')}
            format={euro}
          />
        </tbody>
      </table>
      <p>
        Annual net is the admitted 2026 annual payroll result for 12 equal
        base-pay months, not a monthly figure multiplied by 12. Time uses 52
        weeks adjusted for paid vacation and two commute trips per office day.
        Public holidays, sickness, overtime and unpaid leave are excluded. Work
        and commute hours round to 0.01 hour. Effective hourly values and their
        difference round independently to EUR cents from exact ratios.
      </p>
      <p>
        Employer pension, employer-stated benefit values and user-assigned
        benefit values are separate annual EUR amounts, not added to net pay or
        combined. Benefit valuations are summed within each column only when
        every listed benefit has a supplied value. Certainty, eligibility and
        vesting remain in the benefit inputs. Remote days describe the entered
        location schedule; remote allowances and home-office costs are excluded
        from these net figures.
      </p>
    </section>
  )
}
