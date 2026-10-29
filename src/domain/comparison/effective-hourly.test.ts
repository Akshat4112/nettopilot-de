import { describe, expect, it } from 'vitest'
import { aggregateSalaryResults2026 } from '../salary/salary-aggregation'
import type { OfferNetCompensationResult } from '../../components/offer-net-calculation'
import { blankWorkingTime, type WorkingTimeEntry } from './working-time'
import { blankCommuteCostEntry, type CommuteCostEntry } from './commute-costs'
import { blankCommuteTime, type CommuteTimeEntry } from './commute-time'
import {
  calculateEffectiveHourlyComparison,
  type EffectiveHourlyInputs,
} from './effective-hourly'

const payroll = (annualNetCents: number) =>
  aggregateSalaryResults2026(
    Array.from({ length: 12 }, (_, index) => ({
      state: 'calculated' as const,
      value: {
        month: index + 1,
        recurringGrossCents: index === 0 ? annualNetCents : 0,
        guaranteedRecurringGrossCents: index === 0 ? annualNetCents : 0,
        recurringWageTaxCents: 0,
        recurringSolidarityCents: 0,
        recurringChurchTaxCents: 0,
        employeePensionCents: 0,
        employeeUnemploymentCents: 0,
        employeeHealthCents: 0,
        employeeCareCents: 0,
        employerPensionCents: 0,
        employerUnemploymentCents: 0,
        employerHealthCents: 0,
        employerCareCents: 0,
        privateInsuranceOutflowCents: 0,
        oneOffPayments: [],
      },
    })),
  )

const net = (a = 2_400_000, b = 3_000_000): OfferNetCompensationResult => ({
  offers: [payroll(a), payroll(b)],
  comparison: { state: 'unavailable' },
  provenance: {
    profileId: 'test',
    calculationYear: 2026,
    sourceIds: [],
    assumptionSetIds: [],
  },
})
const working = (): WorkingTimeEntry => ({
  weeklyHours: '40',
  workingDaysPerWeek: '5',
  paidVacationDaysAnnual: '20',
})
const costs = (): CommuteCostEntry => ({
  workingDaysPerWeek: '5',
  officeDaysPerWeek: '5',
  paidVacationDaysAnnual: '20',
  publicTransportPerOfficeDayEur: '0',
  fuelPerOfficeDayEur: '5',
  parkingPerOfficeDayEur: '0',
  otherPerOfficeDayEur: '0',
})
const travel = (): CommuteTimeEntry => ({
  workingDaysPerWeek: '5',
  officeDaysPerWeek: '5',
  paidVacationDaysAnnual: '20',
  oneWayMinutes: '30',
})
const inputs = (): EffectiveHourlyInputs => ({
  netResult: net(),
  working: [working(), working()],
  commuteCosts: [costs(), costs()],
  commuteTime: [travel(), travel()],
})

describe('NP-CMP-011 effective compensation after commute cost per committed hour', () => {
  it('uses annual net less entered costs over annual work plus round-trip commute hours', () => {
    const data = inputs()
    const snapshot = JSON.stringify(data)
    expect(calculateEffectiveHourlyComparison(data)).toMatchObject({
      offers: [
        {
          state: 'calculated',
          annualNetCents: 2_400_000,
          annualCommuteCostCents: 120_000,
          adjustedAnnualNetCents: 2_280_000,
          annualWorkHoursHundredths: 192_000,
          annualCommuteHoursHundredths: 24_000,
          annualTotalHoursHundredths: 216_000,
          hourlyCents: 1056,
        },
        { state: 'calculated', hourlyCents: 1333 },
      ],
      comparison: { state: 'comparable', bMinusAHourlyCents: 278 },
    })
    expect(JSON.stringify(data)).toBe(snapshot)
  })

  it('accepts confirmed zero commute cost and time without inventing remote costs', () => {
    const data = inputs()
    const zeroCost = { ...costs(), officeDaysPerWeek: '0' }
    const zeroTime = { ...travel(), officeDaysPerWeek: '0' }
    expect(
      calculateEffectiveHourlyComparison({
        ...data,
        commuteCosts: [zeroCost, zeroCost],
        commuteTime: [zeroTime, zeroTime],
      }).offers[0],
    ).toMatchObject({
      state: 'calculated',
      annualCommuteCostCents: 0,
      annualCommuteHoursHundredths: 0,
      hourlyCents: 1250,
    })
  })

  it.each(['working', 'commuteCosts', 'commuteTime'] as const)(
    'keeps missing %s unavailable on its own offer',
    (key) => {
      const data = inputs()
      const blank =
        key === 'working'
          ? blankWorkingTime()
          : key === 'commuteCosts'
            ? blankCommuteCostEntry()
            : blankCommuteTime()
      const result = calculateEffectiveHourlyComparison({
        ...data,
        [key]: [data[key][0], blank],
      })
      expect(result.offers[0].state).toBe('calculated')
      expect(result.offers[1]).toMatchObject({
        state: 'incomplete',
        source: key,
      })
      expect(result.comparison).toEqual({ state: 'unavailable' })
    },
  )

  it.each(['incomplete', 'unsupported'] as const)(
    'preserves a blocked payroll %s state and the other offer',
    (state) => {
      const data = inputs()
      const result = calculateEffectiveHourlyComparison({
        ...data,
        netResult: {
          ...data.netResult,
          offers: [
            { state, month: 0, reason: 'offer_base_salary_required' },
            data.netResult.offers[1],
          ],
        },
      })
      expect(result.offers[0]).toMatchObject({
        state,
        source: 'payroll',
        reason: 'offer_base_salary_required',
      })
      expect(result.offers[1].state).toBe('calculated')
      expect(result.comparison.state).toBe('unavailable')
    },
  )

  it.each([
    { working: [{ ...working(), weeklyHours: '85' }, working()] },
    { commuteCosts: [{ ...costs(), fuelPerOfficeDayEur: '-1' }, costs()] },
    { commuteTime: [{ ...travel(), oneWayMinutes: '721' }, travel()] },
  ] satisfies readonly Partial<EffectiveHourlyInputs>[])(
    'rejects invalid current inputs %j',
    (change) => {
      const result = calculateEffectiveHourlyComparison({
        ...inputs(),
        ...change,
      })
      expect(result.offers[0].state).toBe('invalid')
      expect(result.offers[1].state).toBe('calculated')
    },
  )

  it('does not combine mismatching work, leave or office schedules', () => {
    const data = inputs()
    const result = calculateEffectiveHourlyComparison({
      ...data,
      commuteTime: [{ ...travel(), officeDaysPerWeek: '4' }, travel()],
    })
    expect(result.offers[0]).toMatchObject({
      state: 'invalid',
      source: 'schedule',
    })
    expect(result.offers[1].state).toBe('calculated')
  })

  it('returns unavailable for zero annual work-plus-commute hours', () => {
    const data = inputs()
    const result = calculateEffectiveHourlyComparison({
      ...data,
      working: [{ ...working(), paidVacationDaysAnnual: '260' }, working()],
      commuteCosts: [{ ...costs(), paidVacationDaysAnnual: '260' }, costs()],
      commuteTime: [{ ...travel(), paidVacationDaysAnnual: '260' }, travel()],
    })
    expect(result.offers[0]).toMatchObject({
      state: 'unavailable',
      source: 'denominator',
    })
    expect(result.comparison.state).toBe('unavailable')
  })

  it('rounds half-up symmetrically even when commute costs exceed net pay', () => {
    const data = inputs()
    const noTravel = { ...travel(), oneWayMinutes: '0' }
    const free = { ...costs(), fuelPerOfficeDayEur: '0' }
    const result = calculateEffectiveHourlyComparison({
      ...data,
      netResult: net(960, 960),
      commuteCosts: [free, { ...costs(), fuelPerOfficeDayEur: '0.08' }],
      commuteTime: [noTravel, noTravel],
    })
    expect(result.offers).toMatchObject([
      { hourlyCents: 1 },
      { adjustedAnnualNetCents: -960, hourlyCents: -1 },
    ])
    expect(result.comparison).toEqual({
      state: 'comparable',
      bMinusAHourlyCents: -1,
    })
  })

  it('inverts the exact rational delta when offers are swapped', () => {
    const data = inputs()
    const forward = calculateEffectiveHourlyComparison(data)
    const reverse = calculateEffectiveHourlyComparison({
      netResult: {
        ...data.netResult,
        offers: [data.netResult.offers[1], data.netResult.offers[0]],
      },
      working: [data.working[1], data.working[0]],
      commuteCosts: [data.commuteCosts[1], data.commuteCosts[0]],
      commuteTime: [data.commuteTime[1], data.commuteTime[0]],
    })
    expect(reverse.offers).toEqual([...forward.offers].reverse())
    expect(reverse.comparison).toEqual({
      state: 'comparable',
      bMinusAHourlyCents: -278,
    })
  })
})
