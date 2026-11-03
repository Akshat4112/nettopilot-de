/** Explicit user-entered *per office day* costs, not inferred kilometres or prices. */
export interface CommuteCostEntry {
  readonly workingDaysPerWeek: string
  readonly officeDaysPerWeek: string
  readonly paidVacationDaysAnnual: string
  readonly publicTransportPerOfficeDayEur: string
  readonly fuelPerOfficeDayEur: string
  readonly parkingPerOfficeDayEur: string
  readonly otherPerOfficeDayEur: string
}

export type CommuteCostCategory =
  'publicTransport' | 'fuel' | 'parking' | 'other'

export type CommuteCostResult =
  | {
      readonly state: 'incomplete' | 'invalid'
      readonly reason: string
    }
  | {
      readonly state: 'calculated'
      readonly calendarWeeks: 52
      readonly officeDaysPerWeek: number
      readonly annualOfficeDaysHundredths: number
      readonly dailyCents: Readonly<Record<CommuteCostCategory, number>>
      readonly annualCents: Readonly<Record<CommuteCostCategory, number>>
      readonly annualTotalCents: number
      readonly rounding: 'half_up_each_category'
    }

export const blankCommuteCostEntry = (): CommuteCostEntry => ({
  workingDaysPerWeek: '',
  officeDaysPerWeek: '',
  paidVacationDaysAnnual: '',
  publicTransportPerOfficeDayEur: '',
  fuelPerOfficeDayEur: '',
  parkingPerOfficeDayEur: '',
  otherPerOfficeDayEur: '',
})

const keys = ['publicTransport', 'fuel', 'parking', 'other'] as const

const cents = (raw: string): bigint | null => {
  if (!/^(?:0|[1-9]\d*)(?:\.\d{1,2})?$/.test(raw)) return null
  const [whole = '0', fraction = ''] = raw.split('.')
  const result = BigInt(whole) * 100n + BigInt(fraction.padEnd(2, '0'))
  return result <= 1_000_000n ? result : null
}

const halfUp = (numerator: bigint, denominator: bigint): bigint =>
  (numerator + denominator / 2n) / denominator

/**
 * 52-week expected office attendance, adjusted proportionally for paid leave.
 * Annual category amounts are rounded individually to cents, then added.
 * A missing amount (even if other categories are known) cannot imply zero.
 */
export const calculateCommuteCosts = (
  entry: CommuteCostEntry,
): CommuteCostResult => {
  if (
    [
      entry.workingDaysPerWeek,
      entry.officeDaysPerWeek,
      entry.paidVacationDaysAnnual,
      entry.publicTransportPerOfficeDayEur,
      entry.fuelPerOfficeDayEur,
      entry.parkingPerOfficeDayEur,
      entry.otherPerOfficeDayEur,
    ].some((value) => value.trim() === '')
  )
    return {
      state: 'incomplete',
      reason:
        'Enter office days, working days, paid vacation and every daily cost. Use 0 for a confirmed free category.',
    }

  const working = Number(entry.workingDaysPerWeek)
  const office = Number(entry.officeDaysPerWeek)
  const vacation = Number(entry.paidVacationDaysAnnual)
  if (
    !/^[1-7]$/.test(entry.workingDaysPerWeek) ||
    !/^[0-7]$/.test(entry.officeDaysPerWeek) ||
    !/^(?:0|[1-9]\d*)$/.test(entry.paidVacationDaysAnnual) ||
    office > working ||
    vacation > 52 * working
  )
    return {
      state: 'invalid',
      reason:
        'Office days cannot exceed working days (1–7), and vacation cannot exceed available workdays.',
    }

  const values = [
    entry.publicTransportPerOfficeDayEur,
    entry.fuelPerOfficeDayEur,
    entry.parkingPerOfficeDayEur,
    entry.otherPerOfficeDayEur,
  ]
  const entered = values.map(cents)
  if (entered.some((value) => value === null))
    return {
      state: 'invalid',
      reason:
        'Each office-day cost must be 0–10,000 EUR with at most two decimal places.',
    }

  const denominator = BigInt(working)
  const officeNumerator = BigInt(office * (52 * working - vacation))
  const daily = {} as Record<CommuteCostCategory, number>
  const annual = {} as Record<CommuteCostCategory, number>
  for (let index = 0; index < keys.length; index++) {
    const key = keys[index]
    const value = entered[index]
    if (key === undefined || value === null || value === undefined)
      throw new Error('Validated commute category missing')
    daily[key] = Number(value)
    annual[key] = Number(halfUp(value * officeNumerator, denominator))
  }

  return {
    state: 'calculated',
    calendarWeeks: 52,
    officeDaysPerWeek: office,
    annualOfficeDaysHundredths: Number(
      halfUp(officeNumerator * 100n, denominator),
    ),
    dailyCents: daily,
    annualCents: annual,
    annualTotalCents: keys.reduce((total, key) => total + annual[key], 0),
    rounding: 'half_up_each_category',
  }
}
