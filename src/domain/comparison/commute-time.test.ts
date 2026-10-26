import { describe, expect, it } from 'vitest'
import {
  blankCommuteTime,
  calculateAnnualCommuteTime,
  compareCommuteTime,
} from './commute-time'

const entry = () => ({
  workingDaysPerWeek: '5',
  officeDaysPerWeek: '3',
  paidVacationDaysAnnual: '30',
  oneWayMinutes: '35',
})

describe('NP-CMP-007 commute hours', () => {
  it('requires declared one-way time and office attendance', () => {
    expect(calculateAnnualCommuteTime(blankCommuteTime()).state).toBe(
      'incomplete',
    )
    expect(
      calculateAnnualCommuteTime({ ...entry(), oneWayMinutes: '' }).state,
    ).toBe('incomplete')
  })

  it('converts two journeys per office day to annual hours', () => {
    expect(calculateAnnualCommuteTime(entry())).toEqual({
      state: 'calculated',
      calendarWeeks: 52,
      oneWayMinutes: 35,
      officeDaysPerWeek: 3,
      annualOfficeDaysHundredths: 13_800,
      annualCommuteHoursHundredths: 16_100,
      journeysPerOfficeDay: 2,
      excluded: ['public_holidays', 'sick_days', 'overtime', 'unpaid_leave'],
    })
  })

  it('preserves fractional annual attendance until hours are rounded', () => {
    expect(
      calculateAnnualCommuteTime({
        workingDaysPerWeek: '4',
        officeDaysPerWeek: '3',
        paidVacationDaysAnnual: '25',
        oneWayMinutes: '20',
      }),
    ).toMatchObject({
      state: 'calculated',
      annualOfficeDaysHundredths: 13_725,
      annualCommuteHoursHundredths: 9150,
    })
  })

  it('keeps confirmed zero commuting separate from missing data', () => {
    expect(
      calculateAnnualCommuteTime({
        ...entry(),
        officeDaysPerWeek: '0',
        oneWayMinutes: '0',
      }),
    ).toMatchObject({
      state: 'calculated',
      annualCommuteHoursHundredths: 0,
    })
  })

  it('fails closed on impossible or malformed schedules', () => {
    for (const bad of [
      { ...entry(), workingDaysPerWeek: '0' },
      { ...entry(), officeDaysPerWeek: '6' },
      { ...entry(), paidVacationDaysAnnual: '261' },
      { ...entry(), oneWayMinutes: '-5' },
      { ...entry(), oneWayMinutes: '721' },
      { ...entry(), oneWayMinutes: '30.5' },
    ]) {
      expect(calculateAnnualCommuteTime(bad).state).toBe('invalid')
    }
  })

  it('compares two independent offers without assigning monetary value', () => {
    expect(
      compareCommuteTime(entry(), { ...entry(), oneWayMinutes: '20' }),
    ).toEqual({
      state: 'comparable',
      aHoursHundredths: 16_100,
      bHoursHundredths: 9200,
      bMinusAHoursHundredths: -6900,
      monetaryValue: 'not_calculated',
    })
    expect(compareCommuteTime(entry(), blankCommuteTime())).toMatchObject({
      state: 'unavailable',
      offerA: 'calculated',
      offerB: 'incomplete',
    })
  })
})
