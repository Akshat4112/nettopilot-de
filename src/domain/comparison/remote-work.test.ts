import { describe, expect, it } from 'vitest'
import { createEmptyOfferComparison } from './offer-model'
import {
  attachRemoteWork,
  blankRemoteWork,
  evaluateRemoteWork,
} from './remote-work'

const entry = () => ({
  arrangement: 'hybrid' as const,
  workingDaysPerWeek: '5',
  officeDaysPerWeek: '3',
  employerAllowanceMonthlyEur: '50.00',
  homeOfficeCostMonthlyEur: '15.25',
})

describe('NP-CMP-008 remote work contract', () => {
  it('keeps blank allowance and costs unknown, not zero', () => {
    expect(evaluateRemoteWork(blankRemoteWork())).toMatchObject({
      state: 'valid',
      arrangement: 'unknown',
      remoteDaysPerWeek: { state: 'unknown' },
      employerAllowanceMonthlyCents: { state: 'unknown' },
      homeOfficeCostMonthlyCents: { state: 'unknown' },
      allowanceTaxTreatment: 'not_calculated',
    })
  })

  it('preserves independently declared arrangement, days and euro amounts', () => {
    expect(evaluateRemoteWork(entry())).toMatchObject({
      state: 'valid',
      arrangement: 'hybrid',
      officeDaysPerWeek: { state: 'provided', value: 3 },
      remoteDaysPerWeek: { state: 'provided', value: 2 },
      employerAllowanceMonthlyCents: { state: 'provided', value: 5000 },
      homeOfficeCostMonthlyCents: { state: 'provided', value: 1525 },
      allowanceTaxTreatment: 'not_calculated',
    })
    const draft = attachRemoteWork(createEmptyOfferComparison(), [
      entry(),
      blankRemoteWork(),
    ])
    expect(draft.offers[0].remoteWork).toMatchObject({
      arrangement: 'hybrid',
      employerAllowanceMonthly: {
        state: 'provided',
        value: { amount: '50.00', currency: 'EUR' },
      },
      homeOfficeCostMonthly: {
        state: 'provided',
        value: { amount: '15.25', currency: 'EUR' },
      },
    })
    expect(draft.offers[1].remoteWork).toMatchObject({
      arrangement: 'unknown',
      employerAllowanceMonthly: { state: 'unknown' },
    })
  })

  it('distinguishes explicit zero cash from an unanswered field', () => {
    expect(
      evaluateRemoteWork({
        ...entry(),
        employerAllowanceMonthlyEur: '0',
        homeOfficeCostMonthlyEur: '',
      }),
    ).toMatchObject({
      state: 'valid',
      employerAllowanceMonthlyCents: { state: 'provided', value: 0 },
      homeOfficeCostMonthlyCents: { state: 'unknown' },
    })
  })

  it('rejects work-location mismatches and invalid entered money', () => {
    for (const invalid of [
      { ...entry(), arrangement: 'remote' as const },
      { ...entry(), arrangement: 'onsite' as const },
      { ...entry(), officeDaysPerWeek: '6' },
      { ...entry(), workingDaysPerWeek: '0' },
      { ...entry(), homeOfficeCostMonthlyEur: '-5' },
      { ...entry(), employerAllowanceMonthlyEur: '10001' },
    ]) {
      expect(evaluateRemoteWork(invalid).state).toBe('invalid')
    }
  })

  it('accepts an explicitly all-remote arrangement', () => {
    expect(
      evaluateRemoteWork({
        ...entry(),
        arrangement: 'remote',
        officeDaysPerWeek: '0',
      }),
    ).toMatchObject({
      state: 'valid',
      remoteDaysPerWeek: { state: 'provided', value: 5 },
    })
  })

  it('retains independent terms when only working days are known', () => {
    for (const arrangement of [
      'unknown',
      'onsite',
      'hybrid',
      'remote',
    ] as const) {
      expect(
        evaluateRemoteWork({ ...entry(), arrangement, officeDaysPerWeek: '' }),
      ).toMatchObject({
        state: 'valid',
        arrangement,
        officeDaysPerWeek: { state: 'unknown' },
        remoteDaysPerWeek: { state: 'unknown' },
        employerAllowanceMonthlyCents: { state: 'provided', value: 5000 },
        homeOfficeCostMonthlyCents: { state: 'provided', value: 1525 },
      })
    }
  })

  it('retains supplied office frequency without inferring a work calendar', () => {
    expect(
      evaluateRemoteWork({ ...entry(), workingDaysPerWeek: '' }),
    ).toMatchObject({
      state: 'valid',
      officeDaysPerWeek: { state: 'provided', value: 3 },
      remoteDaysPerWeek: { state: 'unknown' },
    })
  })

  it('validates supplied days and arrangement conflicts without a full calendar', () => {
    for (const invalid of [
      { ...entry(), workingDaysPerWeek: '8', officeDaysPerWeek: '' },
      { ...entry(), workingDaysPerWeek: '', officeDaysPerWeek: '8' },
      { ...entry(), workingDaysPerWeek: '', arrangement: 'remote' as const },
      {
        ...entry(),
        workingDaysPerWeek: '',
        officeDaysPerWeek: '0',
        arrangement: 'onsite' as const,
      },
    ]) {
      expect(evaluateRemoteWork(invalid).state).toBe('invalid')
    }
  })
})
