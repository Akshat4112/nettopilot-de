import {
  calculateAnnualContractualHours,
  type WorkingTimeEntry,
  type WorkingTimeResult,
} from './working-time'

export type VacationComparison =
  | {
      readonly state: 'unavailable'
      readonly offerA: WorkingTimeResult['state']
      readonly offerB: WorkingTimeResult['state']
      readonly reasonA: string | null
      readonly reasonB: string | null
    }
  | {
      readonly state: 'comparable'
      readonly offerAVacationDays: number
      readonly offerBVacationDays: number
      /** Positive means Offer B has more paid vacation days. */
      readonly vacationDifferenceBMinusA: number
      readonly offerAAnnualHoursHundredths: number
      readonly offerBAnnualHoursHundredths: number
      /** Positive means Offer B requires more standardized annual hours. */
      readonly annualHoursDifferenceBMinusA: number
      readonly calendarWeeks: 52
      readonly hourlyNetComparison: 'not_calculated'
    }

/**
 * Vacation is a time dimension, never a cash-equivalent benefit.
 * A and B each use their own explicit workweek; their annual work-hours
 * denominators can later support net/hour only after valid payroll results.
 */
export const compareVacation = (
  a: WorkingTimeEntry,
  b: WorkingTimeEntry,
): VacationComparison => {
  const offerA = calculateAnnualContractualHours(a)
  const offerB = calculateAnnualContractualHours(b)
  if (offerA.state !== 'calculated' || offerB.state !== 'calculated')
    return {
      state: 'unavailable',
      offerA: offerA.state,
      offerB: offerB.state,
      reasonA: offerA.state === 'calculated' ? null : offerA.reason,
      reasonB: offerB.state === 'calculated' ? null : offerB.reason,
    }
  return {
    state: 'comparable',
    offerAVacationDays: offerA.paidVacationDaysAnnual,
    offerBVacationDays: offerB.paidVacationDaysAnnual,
    vacationDifferenceBMinusA:
      offerB.paidVacationDaysAnnual - offerA.paidVacationDaysAnnual,
    offerAAnnualHoursHundredths: offerA.annualContractualHoursHundredths,
    offerBAnnualHoursHundredths: offerB.annualContractualHoursHundredths,
    annualHoursDifferenceBMinusA:
      offerB.annualContractualHoursHundredths -
      offerA.annualContractualHoursHundredths,
    calendarWeeks: 52,
    hourlyNetComparison: 'not_calculated',
  }
}
