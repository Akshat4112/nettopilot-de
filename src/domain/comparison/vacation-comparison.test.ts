import { describe, expect, it } from 'vitest'
import { compareVacation } from './vacation-comparison'
import { blankWorkingTime } from './working-time'

describe('NP-CMP-005 vacation comparison', () => {
  it('does not fabricate a difference from missing or invalid time inputs', () => {
    expect(compareVacation(blankWorkingTime(), blankWorkingTime())).toMatchObject({
      state: 'unavailable',
      offerA: 'incomplete',
      offerB: 'incomplete',
    })
    expect(compareVacation(
      { weeklyHours: '40', workingDaysPerWeek: '5', paidVacationDaysAnnual: '20' },
      { weeklyHours: '40', workingDaysPerWeek: '5', paidVacationDaysAnnual: '261' },
    )).toMatchObject({ state: 'unavailable', offerB: 'invalid' })
  })

  it('compares paid vacation days and its annual-hours denominator', () => {
    const result = compareVacation(
      { weeklyHours: '40', workingDaysPerWeek: '5', paidVacationDaysAnnual: '20' },
      { weeklyHours: '40', workingDaysPerWeek: '5', paidVacationDaysAnnual: '30' },
    )
    expect(result).toEqual({
      state: 'comparable',
      offerAVacationDays: 20,
      offerBVacationDays: 30,
      vacationDifferenceBMinusA: 10,
      offerAAnnualHoursHundredths: 192_000,
      offerBAnnualHoursHundredths: 184_000,
      annualHoursDifferenceBMinusA: -8000,
      calendarWeeks: 52,
      hourlyNetComparison: 'not_calculated',
    })
  })

  it('compares distinct workweeks without treating leave as cash', () => {
    const result = compareVacation(
      { weeklyHours: '37.5', workingDaysPerWeek: '5', paidVacationDaysAnnual: '25' },
      { weeklyHours: '40', workingDaysPerWeek: '4', paidVacationDaysAnnual: '20' },
    )
    expect(result).toMatchObject({
      state: 'comparable',
      vacationDifferenceBMinusA: -5,
      offerAAnnualHoursHundredths: 176_250,
      offerBAnnualHoursHundredths: 188_000,
      hourlyNetComparison: 'not_calculated',
    })
  })

  it('preserves equality at zero leave and equal schedules', () => {
    const entry = { weeklyHours: '30', workingDaysPerWeek: '4', paidVacationDaysAnnual: '0' }
    expect(compareVacation(entry, entry)).toMatchObject({
      state: 'comparable',
      vacationDifferenceBMinusA: 0,
      annualHoursDifferenceBMinusA: 0,
    })
  })
})
