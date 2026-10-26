import { describe, expect, it } from 'vitest'
import { createEmptyOfferComparison } from './offer-model'
import {
  attachWorkingTime,
  blankWorkingTime,
  calculateAnnualContractualHours,
} from './working-time'

describe('NP-CMP-004 standard working-time estimate', () => {
  it('keeps missing hours, days and leave explicitly incomplete', () => {
    expect(calculateAnnualContractualHours(blankWorkingTime()).state).toBe(
      'incomplete',
    )
    const empty = attachWorkingTime(createEmptyOfferComparison(), [
      blankWorkingTime(),
      blankWorkingTime(),
    ])
    expect(empty.offers[0].workingTime.weeklyHours.state).toBe('unknown')
    expect(empty.offers[1].workingTime.weeklyHours.state).toBe('unknown')
  })

  it('uses an explicit 52-week schedule and paid leave, not public holidays', () => {
    const result = calculateAnnualContractualHours({
      weeklyHours: '40',
      workingDaysPerWeek: '5',
      paidVacationDaysAnnual: '30',
    })
    expect(result).toMatchObject({
      state: 'calculated',
      annualContractualHoursHundredths: 184_000,
      weeklyHoursHundredths: 4000,
      calendarWeeks: 52,
      excluded: ['public_holidays', 'sick_days', 'overtime', 'unpaid_leave'],
    })
  })

  it('preserves decimal weekly hours and independently entered offer schedules', () => {
    const result = calculateAnnualContractualHours({
      weeklyHours: '37.50',
      workingDaysPerWeek: '5',
      paidVacationDaysAnnual: '25',
    })
    expect(result.state).toBe('calculated')
    if (result.state === 'calculated')
      expect(result.annualContractualHoursHundredths).toBe(176_250)
    const data = attachWorkingTime(createEmptyOfferComparison(), [
      {
        weeklyHours: '37.5',
        workingDaysPerWeek: '5',
        paidVacationDaysAnnual: '25',
      },
      {
        weeklyHours: '40',
        workingDaysPerWeek: '4',
        paidVacationDaysAnnual: '20',
      },
    ])
    expect(data.offers[0].workingTime.weeklyHours).toMatchObject({
      state: 'provided',
      value: 37.5,
    })
    expect(data.offers[1].workingTime.workingDaysPerWeek).toMatchObject({
      state: 'provided',
      value: 4,
    })
    expect(data.offers[1].workingTime.overtimeHoursAnnual.state).toBe(
      'unknown',
    )
  })

  it('rejects impossible work and leave conventions', () => {
    for (const input of [
      { weeklyHours: '0', workingDaysPerWeek: '5', paidVacationDaysAnnual: '25' },
      { weeklyHours: '85', workingDaysPerWeek: '5', paidVacationDaysAnnual: '25' },
      { weeklyHours: '40', workingDaysPerWeek: '0', paidVacationDaysAnnual: '25' },
      { weeklyHours: '40', workingDaysPerWeek: '5', paidVacationDaysAnnual: '261' },
      { weeklyHours: '40.123', workingDaysPerWeek: '5', paidVacationDaysAnnual: '25' },
    ]) {
      expect(calculateAnnualContractualHours(input).state).toBe('invalid')
    }
  })
})
