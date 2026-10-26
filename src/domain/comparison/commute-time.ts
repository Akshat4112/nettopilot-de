/** Compare time lost in commuting independently from travel money and net pay. */
export interface CommuteTimeEntry {
  readonly workingDaysPerWeek: string
  readonly officeDaysPerWeek: string
  readonly paidVacationDaysAnnual: string
  /** User-specified one-way trip duration, in whole minutes. */
  readonly oneWayMinutes: string
}

export const blankCommuteTime = (): CommuteTimeEntry => ({
  workingDaysPerWeek: '',
  officeDaysPerWeek: '',
  paidVacationDaysAnnual: '',
  oneWayMinutes: '',
})

export type CommuteTimeResult =
  | { readonly state: 'incomplete' | 'invalid'; readonly reason: string }
  | {
      readonly state: 'calculated'
      readonly calendarWeeks: 52
      readonly oneWayMinutes: number
      readonly officeDaysPerWeek: number
      readonly annualOfficeDaysHundredths: number
      readonly annualCommuteHoursHundredths: number
      readonly journeysPerOfficeDay: 2
      readonly excluded: readonly [
        'public_holidays',
        'sick_days',
        'overtime',
        'unpaid_leave',
      ]
    }

const roundHalfUp = (value: bigint, denominator: bigint): number =>
  Number((value + denominator / 2n) / denominator)

/** Office frequency × (52 − paid-leave days / workdays per week), 2 trips/day.
 * Annual time is rounded *once* to 0.01 hour from its exact rational value.
 * Paid leave excludes expected office trips but does not change contractual pay.
 */
export const calculateAnnualCommuteTime = (
  entry: CommuteTimeEntry,
): CommuteTimeResult => {
  if (
    entry.workingDaysPerWeek === '' ||
    entry.officeDaysPerWeek === '' ||
    entry.paidVacationDaysAnnual === '' ||
    entry.oneWayMinutes === ''
  )
    return {
      state: 'incomplete',
      reason:
        'Enter working days, office days, paid vacation and one-way commute minutes.',
    }

  if (
    !/^[1-7]$/.test(entry.workingDaysPerWeek) ||
    !/^[0-7]$/.test(entry.officeDaysPerWeek) ||
    !/^(?:0|[1-9]\d*)$/.test(entry.paidVacationDaysAnnual) ||
    !/^(?:0|[1-9]\d*)$/.test(entry.oneWayMinutes)
  )
    return {
      state: 'invalid',
      reason: 'Working-day, office-day, vacation or time input is invalid.',
    }

  const working = Number(entry.workingDaysPerWeek)
  const office = Number(entry.officeDaysPerWeek)
  const vacation = Number(entry.paidVacationDaysAnnual)
  const oneWay = Number(entry.oneWayMinutes)
  if (office > working || vacation > 52 * working || oneWay > 720)
    return {
      state: 'invalid',
      reason:
        'Office days cannot exceed workdays, vacation cannot exceed scheduled workdays, and one-way travel must be 0–720 minutes.',
    }

  const numerator = BigInt(office * (52 * working - vacation))
  const denominator = BigInt(working)
  return {
    state: 'calculated',
    calendarWeeks: 52,
    oneWayMinutes: oneWay,
    officeDaysPerWeek: office,
    annualOfficeDaysHundredths: roundHalfUp(numerator * 100n, denominator),
    annualCommuteHoursHundredths: roundHalfUp(
      numerator * BigInt(oneWay) * 2n * 100n,
      denominator * 60n,
    ),
    journeysPerOfficeDay: 2,
    excluded: ['public_holidays', 'sick_days', 'overtime', 'unpaid_leave'],
  }
}

export type CommuteTimeComparison =
  | {
      readonly state: 'unavailable'
      readonly offerA: CommuteTimeResult['state']
      readonly offerB: CommuteTimeResult['state']
    }
  | {
      readonly state: 'comparable'
      readonly aHoursHundredths: number
      readonly bHoursHundredths: number
      /** Positive means Offer B requires more travel hours annually. */
      readonly bMinusAHoursHundredths: number
      readonly monetaryValue: 'not_calculated'
    }

export const compareCommuteTime = (
  a: CommuteTimeEntry,
  b: CommuteTimeEntry,
): CommuteTimeComparison => {
  const first = calculateAnnualCommuteTime(a)
  const second = calculateAnnualCommuteTime(b)
  if (first.state !== 'calculated' || second.state !== 'calculated')
    return { state: 'unavailable', offerA: first.state, offerB: second.state }
  return {
    state: 'comparable',
    aHoursHundredths: first.annualCommuteHoursHundredths,
    bHoursHundredths: second.annualCommuteHoursHundredths,
    bMinusAHoursHundredths:
      second.annualCommuteHoursHundredths - first.annualCommuteHoursHundredths,
    monetaryValue: 'not_calculated',
  }
}
