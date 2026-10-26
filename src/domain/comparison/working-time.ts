import type {
  OfferComparisonDraft,
  OfferInput,
  OfferWorkingTime,
} from './offer-model'

export interface WorkingTimeEntry {
  readonly weeklyHours: string
  readonly workingDaysPerWeek: string
  readonly paidVacationDaysAnnual: string
}

export const blankWorkingTime = (): WorkingTimeEntry => ({
  weeklyHours: '',
  workingDaysPerWeek: '',
  paidVacationDaysAnnual: '',
})

export const STANDARD_CALENDAR_WEEKS = 52

export type WorkingTimeResult =
  | { readonly state: 'incomplete' | 'invalid'; readonly reason: string }
  | {
      readonly state: 'calculated'
      readonly annualContractualHoursHundredths: number
      readonly weeklyHoursHundredths: number
      readonly workingDaysPerWeek: number
      readonly paidVacationDaysAnnual: number
      readonly calendarWeeks: 52
      readonly excluded: readonly [
        'public_holidays',
        'sick_days',
        'overtime',
        'unpaid_leave',
      ]
    }

const missing = (value: string) => value.trim() === ''

/**
 * Standardized annual hours, not real clocked hours or a statutory work year.
 * Vacation is treated as paid leave on the same weekly schedule; public
 * holidays, overtime, sick leave and unpaid leave are deliberately excluded.
 * The sole output rounding is half-up to 1/100 of an hour.
 */
export const calculateAnnualContractualHours = (
  entry: WorkingTimeEntry,
): WorkingTimeResult => {
  if (
    missing(entry.weeklyHours) ||
    missing(entry.workingDaysPerWeek) ||
    missing(entry.paidVacationDaysAnnual)
  )
    return {
      state: 'incomplete',
      reason:
        'Enter weekly hours, working days per week and paid vacation days.',
    }
  if (
    !/^(?:0|[1-9]\d*)(?:\.\d{1,2})?$/.test(entry.weeklyHours) ||
    !/^[1-7]$/.test(entry.workingDaysPerWeek) ||
    !/^(?:0|[1-9]\d*)$/.test(entry.paidVacationDaysAnnual)
  )
    return {
      state: 'invalid',
      reason:
        'Enter valid positive weekly hours, 1–7 working days and whole vacation days.',
    }

  const [hours = '0', fraction = ''] = entry.weeklyHours.split('.')
  const hundredths = BigInt(hours) * 100n + BigInt(fraction.padEnd(2, '0'))
  const days = Number(entry.workingDaysPerWeek)
  const vacation = BigInt(entry.paidVacationDaysAnnual)
  const totalDays = BigInt(STANDARD_CALENDAR_WEEKS * days)
  if (hundredths < 1n || hundredths > 8_400n || vacation > totalDays)
    return {
      state: 'invalid',
      reason:
        'Weekly hours must be at most 84, and vacation cannot exceed working days in 52 weeks.',
    }
  const workingHundredths =
    (hundredths * (totalDays - vacation) + BigInt(days) / 2n) / BigInt(days)
  return {
    state: 'calculated',
    annualContractualHoursHundredths: Number(workingHundredths),
    weeklyHoursHundredths: Number(hundredths),
    workingDaysPerWeek: days,
    paidVacationDaysAnnual: Number(vacation),
    calendarWeeks: STANDARD_CALENDAR_WEEKS,
    excluded: ['public_holidays', 'sick_days', 'overtime', 'unpaid_leave'],
  }
}

const userProvided = (value: number): OfferInput<number> => ({
  state: 'provided',
  value,
  source: 'user_entry',
})

export const workingTimeToDomain = (
  input: WorkingTimeEntry,
): OfferWorkingTime | null => {
  const result = calculateAnnualContractualHours(input)
  if (result.state !== 'calculated') return null
  return {
    weeklyHours: userProvided(result.weeklyHoursHundredths / 100),
    workingDaysPerWeek: userProvided(result.workingDaysPerWeek),
    paidVacationDaysAnnual: userProvided(result.paidVacationDaysAnnual),
    overtimeHoursAnnual: { state: 'unknown' },
  }
}

/** Keep each side's time assumptions separate. No compensation is monetized. */
export const attachWorkingTime = (
  draft: OfferComparisonDraft,
  entries: readonly [WorkingTimeEntry, WorkingTimeEntry],
): OfferComparisonDraft => {
  const [a, b] = entries
  return {
    ...draft,
    offers: [
      {
        ...draft.offers[0],
        workingTime: workingTimeToDomain(a) ?? draft.offers[0].workingTime,
      },
      {
        ...draft.offers[1],
        workingTime: workingTimeToDomain(b) ?? draft.offers[1].workingTime,
      },
    ],
  }
}
