import { describe, expect, it } from 'vitest'
import { blankCommuteCostEntry, calculateCommuteCosts } from './commute-costs'

const entry = () => ({
  workingDaysPerWeek: '5',
  officeDaysPerWeek: '3',
  paidVacationDaysAnnual: '30',
  publicTransportPerOfficeDayEur: '4.20',
  fuelPerOfficeDayEur: '3.00',
  parkingPerOfficeDayEur: '2.50',
  otherPerOfficeDayEur: '0',
})

describe('NP-CMP-006 entered commute costs', () => {
  it('does not infer missing daily costs from other filled inputs', () => {
    expect(calculateCommuteCosts(blankCommuteCostEntry()).state).toBe(
      'incomplete',
    )
    expect(
      calculateCommuteCosts({
        ...entry(),
        fuelPerOfficeDayEur: '',
      }).state,
    ).toBe('incomplete')
  })

  it('uses annual office frequency adjusted by explicitly given paid leave', () => {
    expect(calculateCommuteCosts(entry())).toEqual({
      state: 'calculated',
      calendarWeeks: 52,
      officeDaysPerWeek: 3,
      annualOfficeDaysHundredths: 13_800,
      dailyCents: {
        publicTransport: 420,
        fuel: 300,
        parking: 250,
        other: 0,
      },
      annualCents: {
        publicTransport: 57_960,
        fuel: 41_400,
        parking: 34_500,
        other: 0,
      },
      annualTotalCents: 133_860,
      rounding: 'half_up_each_category',
    })
  })

  it('preserves fractional annual office days without preliminary rounding', () => {
    expect(
      calculateCommuteCosts({
        ...entry(),
        workingDaysPerWeek: '4',
        officeDaysPerWeek: '3',
        paidVacationDaysAnnual: '25',
        publicTransportPerOfficeDayEur: '1',
        fuelPerOfficeDayEur: '0',
        parkingPerOfficeDayEur: '0',
      }),
    ).toMatchObject({
      state: 'calculated',
      annualOfficeDaysHundredths: 13_725,
      annualTotalCents: 13_725,
    })
  })

  it('keeps explicit zero office days distinct from missing office frequency', () => {
    expect(
      calculateCommuteCosts({ ...entry(), officeDaysPerWeek: '0' }),
    ).toMatchObject({
      state: 'calculated',
      officeDaysPerWeek: 0,
      annualOfficeDaysHundredths: 0,
      annualTotalCents: 0,
    })
  })

  it('rejects impossible work patterns and malformed costs', () => {
    for (const invalid of [
      { ...entry(), workingDaysPerWeek: '0' },
      { ...entry(), officeDaysPerWeek: '6' },
      { ...entry(), paidVacationDaysAnnual: '261' },
      { ...entry(), fuelPerOfficeDayEur: '1.234' },
      { ...entry(), otherPerOfficeDayEur: '-5' },
      { ...entry(), parkingPerOfficeDayEur: '10001' },
    ]) {
      expect(calculateCommuteCosts(invalid).state).toBe('invalid')
    }
  })
})
