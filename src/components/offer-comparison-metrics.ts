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

export interface OfferComparisonMetricsInputs extends EffectiveHourlyInputs {
  readonly benefits: readonly [BenefitsEntry, BenefitsEntry]
  readonly remote: readonly [RemoteWorkEntry, RemoteWorkEntry]
}

export interface ComparisonValue {
  readonly amount: number | null
  readonly missing: string
  readonly reason?: string
}

export type ComparisonFormatter = (value: number) => string

const known = (amount: number): ComparisonValue => ({ amount, missing: '' })
const unavailable = (reason: string): ComparisonValue => ({
  amount: null,
  missing: 'Unavailable',
  reason,
})
const notSupplied: ComparisonValue = { amount: null, missing: 'Not supplied' }
export const formatComparisonEuro: ComparisonFormatter = (cents) => {
  // Preserve every admitted integer cent, including the safe-integer limit.
  const value = BigInt(cents)
  const magnitude = value < 0n ? -value : value
  const whole = (magnitude / 100n).toLocaleString('en-GB')
  const fraction = (magnitude % 100n).toString().padStart(2, '0')
  return `${value < 0n ? '-' : ''}€${whole}.${fraction}`
}
const number = (value: number): string =>
  value.toLocaleString('en-GB', { maximumFractionDigits: 2 })
export const formatComparisonHours: ComparisonFormatter = (hundredths) =>
  number(hundredths / 100) + ' hours'
export const formatComparisonDays: ComparisonFormatter = (value) =>
  number(value) + ' days'
export const formatComparisonWeeklyDays: ComparisonFormatter = (value) =>
  number(value) + ' days / week'

/** Only validated EUR decimals enter this exact conversion; no floating sum. */
const cents = (value: EuroAmount): number => {
  const [whole = '0', fraction = ''] = value.amount.split('.')
  return Number(BigInt(whole) * 100n + BigInt(fraction.padEnd(2, '0')))
}

const benefitTotal = (
  entry: BenefitsEntry,
  kind: 'employerStatedAnnualValue' | 'userAssignedAnnualValue',
): ComparisonValue => {
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

export interface OfferMetrics {
  readonly gross: ComparisonValue
  readonly deductions: ComparisonValue
  readonly net: ComparisonValue
  readonly afterCommute: ComparisonValue
  readonly hourly: ComparisonValue
  readonly work: ComparisonValue
  readonly workingDays: ComparisonValue
  readonly totalHours: ComparisonValue
  readonly vacation: ComparisonValue
  readonly commuteCost: ComparisonValue
  readonly commuteTime: ComparisonValue
  readonly remote: ComparisonValue
  readonly pension: ComparisonValue
  readonly employerBenefits: ComparisonValue
  readonly personalBenefits: ComparisonValue
}

export type ComparisonMetric = keyof OfferMetrics

export interface OfferComparisonMetrics {
  readonly offers: readonly [OfferMetrics, OfferMetrics]
  readonly hourlyDifference: number | null
}

/** Current validated projections shared by table and explanations; no stored state. */
export function calculateOfferComparisonMetrics(
  props: OfferComparisonMetricsInputs,
): OfferComparisonMetrics {
  const effective = calculateEffectiveHourlyComparison(props)
  const summarize = (index: 0 | 1): OfferMetrics => {
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
      deductions:
        payroll.state === 'calculated'
          ? known(payroll.annual.grossCents - payroll.annual.netPayrollCents)
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
      workingDays:
        work.state === 'calculated'
          ? known(work.workingDaysPerWeek)
          : unavailable(work.reason),
      totalHours:
        hourly.state === 'calculated'
          ? known(hourly.annualTotalHoursHundredths)
          : unavailable(
              hourly.source === 'payroll'
                ? offerNetReasonText(hourly.reason)
                : hourly.reason,
            ),
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
  return {
    offers: [summarize(0), summarize(1)],
    hourlyDifference:
      effective.comparison.state === 'comparable'
        ? effective.comparison.bMinusAHourlyCents
        : null,
  }
}

/** Use the canonical exact-ratio hourly delta rather than display-rounded rates. */
export function comparisonDifference(
  metrics: OfferComparisonMetrics,
  key: ComparisonMetric,
): number | null {
  const a = metrics.offers[0][key].amount
  const b = metrics.offers[1][key].amount
  if (a === null || b === null) return null
  return key === 'hourly' ? metrics.hourlyDifference : b - a
}

export function formatComparisonDifference(
  amount: number,
  format: ComparisonFormatter,
): string {
  return (amount < 0 ? '−' : amount > 0 ? '+' : '') + format(Math.abs(amount))
}
