import { describe, expect, it } from 'vitest'
import { blankBenefits, blankBenefit } from '../domain/comparison/benefits'
import { blankCommuteCostEntry } from '../domain/comparison/commute-costs'
import { blankRemoteWork } from '../domain/comparison/remote-work'
import { blankWorkingTime } from '../domain/comparison/working-time'
import { emptyAdditionalPay } from './offer-additional-pay'
import { optionalCategoryStatuses } from './offer-category-status'

const blank = () => ({
  additional: emptyAdditionalPay(),
  working: blankWorkingTime(),
  commute: blankCommuteCostEntry(),
  oneWayMinutes: '',
  remote: blankRemoteWork(),
  benefits: blankBenefits(),
})

describe('optional category status from entered values', () => {
  it('keeps every untouched category unknown despite populated shared prerequisites', () => {
    const entry = blank()
    const status = optionalCategoryStatuses({
      ...entry,
      working: {
        weeklyHours: '40',
        workingDaysPerWeek: '5',
        paidVacationDaysAnnual: '30',
      },
    })
    expect(status).toEqual({
      cash: 'Not supplied',
      working: 'Supplied',
      commute: 'Not supplied',
      remote: 'Not supplied',
      benefits: 'Not supplied',
    })
  })

  it('reports incomplete inputs and accepts exact zero only where already supported', () => {
    const entry = blank()
    expect(
      optionalCategoryStatuses({
        ...entry,
        additional: { ...entry.additional, oneOffEur: '500' },
      }).cash,
    ).toBe('Incomplete')
    expect(
      optionalCategoryStatuses({
        ...entry,
        remote: { ...entry.remote, employerAllowanceMonthlyEur: '0' },
      }).remote,
    ).toBe('Supplied')
    expect(
      optionalCategoryStatuses({
        ...entry,
        benefits: { ...entry.benefits, employerContributionAnnualEur: '0' },
      }).benefits,
    ).toBe('Supplied')
    expect(
      optionalCategoryStatuses({
        ...entry,
        benefits: { ...entry.benefits, benefits: [blankBenefit('1')] },
      }).benefits,
    ).toBe('Incomplete')
  })

  it('keeps commute incomplete until the entered branch has its prerequisites', () => {
    const entry = blank()
    expect(
      optionalCategoryStatuses({ ...entry, oneWayMinutes: '0' }).commute,
    ).toBe('Incomplete')
    const ready = {
      ...entry,
      working: {
        weeklyHours: '40',
        workingDaysPerWeek: '5',
        paidVacationDaysAnnual: '30',
      },
      commute: { ...entry.commute, officeDaysPerWeek: '3' },
      oneWayMinutes: '0',
    }
    expect(optionalCategoryStatuses(ready).commute).toBe('Supplied')
    expect(
      optionalCategoryStatuses({
        ...ready,
        commute: { ...ready.commute, fuelPerOfficeDayEur: '0' },
      }).commute,
    ).toBe('Incomplete')
    expect(
      optionalCategoryStatuses({
        ...ready,
        commute: {
          ...ready.commute,
          publicTransportPerOfficeDayEur: '0',
          fuelPerOfficeDayEur: '0',
          parkingPerOfficeDayEur: '0',
          otherPerOfficeDayEur: '0',
        },
      }).commute,
    ).toBe('Supplied')
  })
  it('keeps cash metadata without a payment incomplete', () => {
    const entry = blank()
    for (const additional of [
      { ...entry.additional, oneOffGuarantee: 'guaranteed' as const },
      { ...entry.additional, oneOffClassification: 'holiday_payment' as const },
    ])
      expect(optionalCategoryStatuses({ ...entry, additional }).cash).toBe(
        'Incomplete',
      )
  })
  it('validates each supplied category without admitting unknown or invalid fields', () => {
    const entry = blank()
    expect(optionalCategoryStatuses(entry)).toEqual({
      cash: 'Not supplied',
      working: 'Not supplied',
      commute: 'Not supplied',
      remote: 'Not supplied',
      benefits: 'Not supplied',
    })
    for (const amount of ['0', '-1', '1.001', ' '])
      expect(
        optionalCategoryStatuses({
          ...entry,
          additional: { ...entry.additional, expectedVariableEur: amount },
        }).cash,
      ).toBe('Incomplete')
    expect(
      optionalCategoryStatuses({
        ...entry,
        additional: { ...entry.additional, expectedVariableEur: '500' },
      }).cash,
    ).toBe('Supplied')
    expect(
      optionalCategoryStatuses({
        ...entry,
        additional: { ...entry.additional, oneOffMonth: '12' },
      }).cash,
    ).toBe('Incomplete')
    expect(
      optionalCategoryStatuses({
        ...entry,
        additional: {
          ...entry.additional,
          oneOffEur: '500',
          oneOffMonth: '12',
        },
      }).cash,
    ).toBe('Supplied')
    expect(
      optionalCategoryStatuses({
        ...entry,
        working: {
          weeklyHours: '85',
          workingDaysPerWeek: '5',
          paidVacationDaysAnnual: '30',
        },
      }).working,
    ).toBe('Incomplete')
    expect(
      optionalCategoryStatuses({
        ...entry,
        remote: { ...entry.remote, arrangement: 'remote' },
        commute: { ...entry.commute, officeDaysPerWeek: '3' },
      }).remote,
    ).toBe('Incomplete')
    expect(
      optionalCategoryStatuses({
        ...entry,
        remote: { ...entry.remote, arrangement: 'hybrid' },
      }).remote,
    ).toBe('Supplied')
    expect(
      optionalCategoryStatuses({
        ...entry,
        remote: { ...entry.remote, homeOfficeCostMonthlyEur: '-1' },
      }).remote,
    ).toBe('Incomplete')
    expect(
      optionalCategoryStatuses({
        ...entry,
        benefits: { ...entry.benefits, employerContributionAnnualEur: '-1' },
      }).benefits,
    ).toBe('Incomplete')
    expect(
      optionalCategoryStatuses({
        ...entry,
        benefits: { ...entry.benefits, pensionCertainty: 'conditional' },
      }).benefits,
    ).toBe('Supplied')
  })

  it('admits cost-only commuting independently from time and catches an invalid entered branch', () => {
    const entry = blank()
    const ready = {
      ...entry,
      working: {
        weeklyHours: '40',
        workingDaysPerWeek: '5',
        paidVacationDaysAnnual: '30',
      },
      commute: {
        ...entry.commute,
        officeDaysPerWeek: '3',
        publicTransportPerOfficeDayEur: '0',
        fuelPerOfficeDayEur: '4.20',
        parkingPerOfficeDayEur: '0',
        otherPerOfficeDayEur: '0',
      },
    }
    expect(optionalCategoryStatuses(ready).commute).toBe('Supplied')
    expect(
      optionalCategoryStatuses({ ...ready, oneWayMinutes: '721' }).commute,
    ).toBe('Incomplete')
    expect(
      optionalCategoryStatuses({
        ...entry,
        commute: { ...entry.commute, officeDaysPerWeek: '3' },
      }).commute,
    ).toBe('Incomplete')
    expect(
      optionalCategoryStatuses({
        ...entry,
        working: ready.working,
        commute: { ...entry.commute, officeDaysPerWeek: '3' },
      }).remote,
    ).toBe('Not supplied')
  })
})
