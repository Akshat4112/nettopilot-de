import type { OfferNetCompensationResult } from '../../components/offer-net-calculation'
import type { SalaryAggregationResult2026 } from '../salary/salary-aggregation'
import {
  calculateAnnualContractualHours,
  type WorkingTimeEntry,
} from './working-time'
import { calculateCommuteCosts, type CommuteCostEntry } from './commute-costs'
import {
  calculateAnnualCommuteTime,
  type CommuteTimeEntry,
} from './commute-time'

export interface EffectiveHourlyInputs {
  readonly netResult: OfferNetCompensationResult
  readonly working: readonly [WorkingTimeEntry, WorkingTimeEntry]
  readonly commuteCosts: readonly [CommuteCostEntry, CommuteCostEntry]
  readonly commuteTime: readonly [CommuteTimeEntry, CommuteTimeEntry]
}

export type EffectiveHourlyOfferResult =
  | {
      readonly state: 'incomplete' | 'invalid' | 'unsupported' | 'unavailable'
      readonly source:
        | 'payroll'
        | 'working'
        | 'commuteCosts'
        | 'commuteTime'
        | 'schedule'
        | 'denominator'
      readonly reason: string
    }
  | {
      readonly state: 'calculated'
      readonly annualNetCents: number
      readonly annualCommuteCostCents: number
      readonly adjustedAnnualNetCents: number
      readonly annualWorkHoursHundredths: number
      readonly annualCommuteHoursHundredths: number
      readonly annualTotalHoursHundredths: number
      readonly hourlyCents: number
    }

export interface EffectiveHourlyComparison {
  readonly offers: readonly [
    EffectiveHourlyOfferResult,
    EffectiveHourlyOfferResult,
  ]
  readonly comparison:
    | { readonly state: 'unavailable' }
    | { readonly state: 'comparable'; readonly bMinusAHourlyCents: number }
}

/** Exact signed half-up (ties away from zero), with one final cent rounding. */
const roundHalfUp = (numerator: bigint, denominator: bigint): number => {
  const magnitude = numerator < 0n ? -numerator : numerator
  const rounded = (magnitude * 2n + denominator) / (denominator * 2n)
  return Number(numerator < 0n ? -rounded : rounded)
}

const calculateOffer = (
  payroll: SalaryAggregationResult2026,
  working: WorkingTimeEntry,
  commuteCosts: CommuteCostEntry,
  commuteTime: CommuteTimeEntry,
): EffectiveHourlyOfferResult => {
  if (payroll.state !== 'calculated')
    return { state: payroll.state, source: 'payroll', reason: payroll.reason }
  const work = calculateAnnualContractualHours(working)
  if (work.state !== 'calculated') return { ...work, source: 'working' }
  const cost = calculateCommuteCosts(commuteCosts)
  if (cost.state !== 'calculated') return { ...cost, source: 'commuteCosts' }
  const time = calculateAnnualCommuteTime(commuteTime)
  if (time.state !== 'calculated') return { ...time, source: 'commuteTime' }
  if (
    working.workingDaysPerWeek !== commuteCosts.workingDaysPerWeek ||
    working.workingDaysPerWeek !== commuteTime.workingDaysPerWeek ||
    working.paidVacationDaysAnnual !== commuteCosts.paidVacationDaysAnnual ||
    working.paidVacationDaysAnnual !== commuteTime.paidVacationDaysAnnual ||
    commuteCosts.officeDaysPerWeek !== commuteTime.officeDaysPerWeek
  )
    return {
      state: 'invalid',
      source: 'schedule',
      reason:
        'Workdays and paid vacation must match across working time and commuting; commute cost and time must use the same office days.',
    }
  const totalHours =
    work.annualContractualHoursHundredths + time.annualCommuteHoursHundredths
  if (totalHours === 0)
    return {
      state: 'unavailable',
      source: 'denominator',
      reason: 'Annual work plus commute hours must be greater than zero.',
    }
  const annualNetCents = payroll.annual.netPayrollCents
  const adjustedAnnualNetCents = annualNetCents - cost.annualTotalCents
  return {
    state: 'calculated',
    annualNetCents,
    annualCommuteCostCents: cost.annualTotalCents,
    adjustedAnnualNetCents,
    annualWorkHoursHundredths: work.annualContractualHoursHundredths,
    annualCommuteHoursHundredths: time.annualCommuteHoursHundredths,
    annualTotalHoursHundredths: totalHours,
    hourlyCents: roundHalfUp(
      BigInt(adjustedAnnualNetCents) * 100n,
      BigInt(totalHours),
    ),
  }
}

/** Current admitted base-pay annual net only. No stored results, benefits or pension inputs.
 * Hours use NP-CMP-004/007 hundredth-hour outputs; costs use NP-CMP-006 cents.
 * B−A is rounded from the exact rational hourly rates, before display rounding.
 */
export const calculateEffectiveHourlyComparison = (
  inputs: EffectiveHourlyInputs,
): EffectiveHourlyComparison => {
  const a = calculateOffer(
    inputs.netResult.offers[0],
    inputs.working[0],
    inputs.commuteCosts[0],
    inputs.commuteTime[0],
  )
  const b = calculateOffer(
    inputs.netResult.offers[1],
    inputs.working[1],
    inputs.commuteCosts[1],
    inputs.commuteTime[1],
  )
  return {
    offers: [a, b],
    comparison:
      a.state === 'calculated' && b.state === 'calculated'
        ? {
            state: 'comparable',
            bMinusAHourlyCents: roundHalfUp(
              (BigInt(b.adjustedAnnualNetCents) *
                BigInt(a.annualTotalHoursHundredths) -
                BigInt(a.adjustedAnnualNetCents) *
                  BigInt(b.annualTotalHoursHundredths)) *
                100n,
              BigInt(a.annualTotalHoursHundredths) *
                BigInt(b.annualTotalHoursHundredths),
            ),
          }
        : { state: 'unavailable' },
  }
}
