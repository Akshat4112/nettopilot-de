import { describe, expect, it } from 'vitest'
import type { OfferComparisonDraft } from '../domain/comparison/offer-model'
import type { DecimalString } from '../domain/salary/types'
import { buildOfferPairFromEntries } from './offer-input-validation'
import { applyAdditionalPay, emptyAdditionalPay } from './offer-additional-pay'
import {
  calculateOfferNetCompensation,
  emptyComparisonPayrollContext,
  offerNetReasonText,
  type ComparisonPayrollContext,
} from './offer-net-calculation'

const context: ComparisonPayrollContext = {
  essential: {
    year: '2026',
    taxClass: '4',
    federalState: 'DE-BW',
    churchTax: 'not_liable',
    dateOfBirth: '1990-01-01',
    children: '0',
    insurance: 'statutory',
  },
  additionalHealthRatePercent: '',
  standardEmploymentConfirmed: true,
}

const pair = (): OfferComparisonDraft =>
  buildOfferPairFromEntries(
    { grossEur: '4000.00', period: 'monthly' },
    { grossEur: '5000.00', period: 'monthly' },
  )

describe('offer net compensation under one shared payroll context', () => {
  it('requires explicit shared inputs and confirmation before comparing', () => {
    const empty = emptyComparisonPayrollContext()
    expect(empty.standardEmploymentConfirmed).toBe(false)
    expect(empty.essential.taxClass).toBe('')
    expect(empty.essential.federalState).toBe('')
    expect(empty.essential.dateOfBirth).toBe('')
    expect(calculateOfferNetCompensation(pair(), empty)).toMatchObject({
      offers: [
        { state: 'incomplete', reason: 'essential_payroll_inputs_invalid' },
        { state: 'incomplete', reason: 'essential_payroll_inputs_invalid' },
      ],
      comparison: { state: 'unavailable' },
    })
    expect(
      calculateOfferNetCompensation(pair(), {
        ...context,
        standardEmploymentConfirmed: false,
      }).offers[0],
    ).toMatchObject({
      state: 'incomplete',
      reason: 'standard_employment_confirmation_required',
    })
  })

  it('calculates both offers independently and derives signed B minus A deltas', () => {
    const result = calculateOfferNetCompensation(pair(), context)
    const [a, b] = result.offers
    expect(a.state).toBe('calculated')
    expect(b.state).toBe('calculated')
    expect(result.comparison.state).toBe('calculated')
    if (a.state !== 'calculated' || b.state !== 'calculated') return
    expect(a.recurringMonthlyNetCents).not.toBeNull()
    expect(b.recurringMonthlyNetCents).not.toBeNull()
    if (
      a.recurringMonthlyNetCents === null ||
      b.recurringMonthlyNetCents === null
    )
      return
    expect(a.annual.grossCents).toBe(4_800_000)
    expect(b.annual.grossCents).toBe(6_000_000)
    expect(result.comparison).toEqual({
      state: 'calculated',
      annualNetDifferenceCents:
        b.annual.netPayrollCents - a.annual.netPayrollCents,
      monthlyNetDifferenceCents:
        b.recurringMonthlyNetCents - a.recurringMonthlyNetCents,
    })
    expect(b.annual.netPayrollCents).toBeGreaterThan(a.annual.netPayrollCents)
  })

  it('treats equivalent annual and monthly pay as an exact tie', () => {
    const draft = buildOfferPairFromEntries(
      { grossEur: '4000.00', period: 'monthly' },
      { grossEur: '48000.00', period: 'annual' },
    )
    const result = calculateOfferNetCompensation(draft, context)
    expect(result.offers[0]).toEqual(result.offers[1])
    expect(result.comparison).toEqual({
      state: 'calculated',
      annualNetDifferenceCents: 0,
      monthlyNetDifferenceCents: 0,
    })
  })

  it('swaps values and reverses deltas without changing the payroll results', () => {
    const draft = pair()
    const forward = calculateOfferNetCompensation(draft, context)
    const reverse = calculateOfferNetCompensation(
      {
        ...draft,
        offers: [
          { ...draft.offers[1], id: 'offer_a', label: 'Offer A' },
          { ...draft.offers[0], id: 'offer_b', label: 'Offer B' },
        ],
      },
      context,
    )
    expect(reverse.offers).toEqual([...forward.offers].reverse())
    expect(reverse.comparison.state).toBe('calculated')
    if (
      forward.comparison.state !== 'calculated' ||
      reverse.comparison.state !== 'calculated'
    )
      return
    expect(reverse.comparison.annualNetDifferenceCents).toBe(
      -forward.comparison.annualNetDifferenceCents,
    )
    expect(forward.comparison.monthlyNetDifferenceCents).not.toBeNull()
    if (forward.comparison.monthlyNetDifferenceCents === null) return
    expect(reverse.comparison.monthlyNetDifferenceCents).toBe(
      -forward.comparison.monthlyNetDifferenceCents,
    )
  })

  it('preserves a supported offer while withholding a blocked pair delta', () => {
    const draft = buildOfferPairFromEntries(
      { grossEur: '4000.00', period: 'monthly' },
      { grossEur: '', period: 'annual' },
    )
    expect(calculateOfferNetCompensation(draft, context)).toMatchObject({
      offers: [
        { state: 'calculated' },
        { state: 'incomplete', reason: 'offer_base_salary_required' },
      ],
      comparison: { state: 'unavailable' },
    })
  })

  it.each([
    [
      [true, false],
      ['calculated', 'incomplete'],
    ],
    [
      [false, true],
      ['incomplete', 'calculated'],
    ],
  ] as const)(
    'blocks only the offer with invalid raw inputs: %j',
    (inputValidity, states) => {
      const result = calculateOfferNetCompensation(
        pair(),
        context,
        inputValidity,
      )
      expect(result.offers.map((offer) => offer.state)).toEqual(states)
      expect(result.comparison).toEqual({ state: 'unavailable' })
      const invalidIndex = inputValidity[0] ? 1 : 0
      expect(result.offers[invalidIndex]).toMatchObject({
        state: 'incomplete',
        reason: 'offer_inputs_invalid',
      })
      expect(offerNetReasonText('offer_inputs_invalid')).toMatch(
        /payment month/i,
      )
    },
  )

  it.each([
    [
      'expected variable',
      { ...emptyAdditionalPay(), expectedVariableEur: '1000' },
    ],
    [
      'one-off',
      { ...emptyAdditionalPay(), oneOffEur: '1000', oneOffMonth: '10' },
    ],
  ])('does not invent payroll treatment for %s cash', (_, additional) => {
    const draft = applyAdditionalPay(pair(), [emptyAdditionalPay(), additional])
    expect(calculateOfferNetCompensation(draft, context)).toMatchObject({
      offers: [
        { state: 'calculated' },
        {
          state: 'unsupported',
          reason: 'offer_additional_compensation_not_supported',
        },
      ],
      comparison: { state: 'unavailable' },
    })
  })

  it('does not treat recurring additional pay as base salary', () => {
    const draft = pair()
    const a = draft.offers[0]
    const withAdditional: OfferComparisonDraft = {
      ...draft,
      offers: [
        {
          ...a,
          compensation: {
            ...a.compensation,
            recurringAdditionalCash: [
              {
                label: 'Allowance',
                amount: { amount: '100' as DecimalString, currency: 'EUR' },
                period: 'monthly',
                guarantee: 'guaranteed',
              },
            ],
          },
        },
        draft.offers[1],
      ],
    }
    expect(
      calculateOfferNetCompensation(withAdditional, context).offers[0],
    ).toMatchObject({
      state: 'unsupported',
      reason: 'offer_additional_compensation_not_supported',
    })
  })

  it.each([
    [{ currency: 'USD' }, 'comparison_currency_unsupported'],
    [{ calculationYear: 2027 }, 'calculation_year_unsupported'],
  ])(
    'rejects incompatible runtime comparison context %j',
    (override, reason) => {
      const invalid = {
        ...pair(),
        ...override,
      } as unknown as OfferComparisonDraft
      expect(calculateOfferNetCompensation(invalid, context)).toMatchObject({
        offers: [
          { state: 'unsupported', reason },
          { state: 'unsupported', reason },
        ],
        comparison: { state: 'unavailable' },
      })
    },
  )

  it('checks the currency of each base salary at runtime', () => {
    const draft = pair()
    const a = draft.offers[0]
    if (a.compensation.baseSalary.state !== 'provided')
      throw new Error('Fixture salary absent')
    const invalid = {
      ...draft,
      offers: [
        {
          ...a,
          compensation: {
            ...a.compensation,
            baseSalary: {
              ...a.compensation.baseSalary,
              value: {
                ...a.compensation.baseSalary.value,
                grossAmount: { amount: '4000', currency: 'USD' },
              },
            },
          },
        },
        draft.offers[1],
      ],
    } as unknown as OfferComparisonDraft
    expect(calculateOfferNetCompensation(invalid, context)).toMatchObject({
      offers: [
        { state: 'unsupported', reason: 'comparison_currency_unsupported' },
        { state: 'calculated' },
      ],
      comparison: { state: 'unavailable' },
    })
  })

  it('preserves existing payroll admission and monthly cent-allocation boundaries', () => {
    const draft = buildOfferPairFromEntries(
      { grossEur: '2000', period: 'monthly' },
      { grossEur: '48000.01', period: 'annual' },
    )
    expect(calculateOfferNetCompensation(draft, context)).toMatchObject({
      offers: [
        {
          state: 'unsupported',
          reason: 'special_or_voluntary_insurance_check_required',
        },
        {
          state: 'unsupported',
          reason: 'annual_salary_requires_monthly_cent_allocation',
        },
      ],
      comparison: { state: 'unavailable' },
    })
  })

  it('does not reuse a previous valid calculation after shared inputs change', () => {
    const initial = calculateOfferNetCompensation(pair(), context)
    const changed = calculateOfferNetCompensation(pair(), {
      ...context,
      additionalHealthRatePercent: '3.5',
    })
    expect(changed.offers).not.toEqual(initial.offers)
    expect(
      calculateOfferNetCompensation(pair(), {
        ...context,
        essential: { ...context.essential, taxClass: '' },
      }).comparison,
    ).toEqual({ state: 'unavailable' })
    expect(
      calculateOfferNetCompensation(pair(), {
        ...context,
        additionalHealthRatePercent: 'invalid',
      }).offers[0],
    ).toMatchObject({
      state: 'incomplete',
      reason: 'advanced_payroll_inputs_invalid',
    })
  })

  it('keeps comparison context separate and leaves input payroll metadata untouched', () => {
    const draft = pair()
    const snapshot = structuredClone(draft)
    const result = calculateOfferNetCompensation(draft, context)
    const withCommute: OfferComparisonDraft = {
      ...draft,
      offers: [
        {
          ...draft.offers[0],
          commute: {
            ...draft.offers[0].commute,
            fuelCostMonthly: {
              state: 'provided',
              source: 'user_entry',
              value: { amount: '300' as DecimalString, currency: 'EUR' },
            },
          },
        },
        draft.offers[1],
      ],
    }
    expect(calculateOfferNetCompensation(withCommute, context)).toEqual(result)
    expect(draft).toEqual(snapshot)
    expect(draft.payrollMetadata.state).toBe('unknown')
    expect(result.provenance.calculationYear).toBe(2026)
    expect(result.provenance.sourceIds).toContain('DE-BMF-PAP-2026-A1')
    expect(result.provenance.assumptionSetIds).toContain(
      'de-statutory-health-insurance-2026-v1',
    )
  })

  it('provides readable reasons and a useful fallback for future engine reasons', () => {
    expect(offerNetReasonText('offer_base_salary_required')).toMatch(
      /base salary/i,
    )
    expect(offerNetReasonText('essential_payroll_inputs_invalid')).toMatch(
      /tax class|shared payroll/i,
    )
    expect(offerNetReasonText('future_engine_reason')).toMatch(
      /unavailable|not supported/i,
    )
  })
})
