import { describe, expect, it } from 'vitest'

import { normalizeCompensation } from './frequency'
import type {
  CompensationInput,
  DecimalString,
  EuroAmount,
  RegistryOptionId,
} from './types'
import {
  calculateAnnualStatutoryHealthContribution2026,
  calculateHealthFromNormalizedCompensation2026,
  calculateStatutoryHealthContribution2026,
  type HealthAdditionalRateInput,
  type HealthContributionInput,
} from './health'

const published: HealthAdditionalRateInput = { mode: 'published_average' }
const insurer = (ratePercent: string): HealthAdditionalRateInput => ({
  mode: 'insurer_specific',
  ratePercent,
})

const ordinaryInput = (
  liablePayCents: number,
  overrides: Partial<HealthContributionInput> = {},
): HealthContributionInput => ({
  liablePayCents,
  contributionDays: 30,
  coverageStatus: 'statutory_mandatory_general',
  additionalRate: published,
  calculationYear: 2026,
  ...overrides,
})

const euro = (amount: string): EuroAmount => ({
  amount: amount as DecimalString,
  currency: 'EUR',
})

const compensation = (
  amount: string,
  period: 'monthly' | 'annual',
): CompensationInput => ({
  baseSalary: {
    period,
    grossAmount: euro(amount),
    paymentsPerYear: 12,
  },
  regularAdditionalCash: { kind: 'none', amount: euro('0') },
  oneOffPayments: [],
})

describe('2026 statutory health contribution', () => {
  it.each([
    [0, 0],
    [400_000, 35_000],
    [581_249, 50_859],
    [581_250, 50_859],
    [581_251, 50_859],
    [1_000_000, 50_859],
  ])('calculates published-average mandatory pay of %i cents', (pay, share) => {
    const result = calculateStatutoryHealthContribution2026(ordinaryInput(pay))

    expect(result.state).toBe('calculated')
    if (result.state !== 'calculated') return
    expect(result.resultQuality).toBe('published_average_estimate')
    expect(result.estimateWarning).toBe(true)
    expect(result.additionalRatePercent).toBe('2.9')
    expect(result.combinedRatePercent).toBe('17.5')
    expect(result.contribution.employeeCents).toBe(share)
    expect(result.contribution.employerCents).toBe(share)
    expect(result.contribution.totalCents).toBe(share * 2)
    expect(result.contributionBaseCents).toBe(Math.min(pay, 581_250))
  })

  it.each([
    ['1.7', 31_100],
    ['2.9', 35_000],
    ['4.2', 37_600],
  ])('supports an exact insurer-specific rate of %s percent', (rate, share) => {
    const result = calculateStatutoryHealthContribution2026(
      ordinaryInput(400_000, { additionalRate: insurer(rate) }),
    )

    expect(result.state).toBe('calculated')
    if (result.state !== 'calculated') return
    expect(result.resultQuality).toBe('insurer_exact')
    expect(result.estimateWarning).toBe(false)
    expect(result.additionalRatePercent).toBe(rate)
    expect(result.contribution.employeeCents).toBe(share)
  })

  it('preserves entered decimal precision without floating point', () => {
    const result = calculateStatutoryHealthContribution2026(
      ordinaryInput(123_457, { additionalRate: insurer('3.123') }),
    )

    expect(result.state).toBe('calculated')
    if (result.state !== 'calculated') return
    expect(result.additionalRatePercent).toBe('3.123')
    expect(result.combinedRatePercent).toBe('17.723')
    expect(result.contribution.employeeCents).toBe(10_940)
  })

  it.each([
    [1, 19_375, 1_695],
    [15, 290_625, 25_430],
    [29, 561_875, 49_164],
    [30, 581_250, 50_859],
  ])(
    'preserves the exact ceiling for %i contribution days',
    (days, ceiling, share) => {
      const result = calculateStatutoryHealthContribution2026(
        ordinaryInput(1_000_000, { contributionDays: days }),
      )

      expect(result.state).toBe('calculated')
      if (result.state !== 'calculated') return
      expect(result.appliedCeilingCents).toBe(ceiling)
      expect(result.contributionBaseCents).toBe(ceiling)
      expect(result.contribution.employeeCents).toBe(share)
    },
  )

  it('uses separate full and half rounding for voluntary GKV', () => {
    const result = calculateStatutoryHealthContribution2026(
      ordinaryInput(581_250, {
        coverageStatus: 'statutory_voluntary_employee',
        voluntaryOtherIncomeStatus: 'unknown_or_present',
      }),
    )

    expect(result.state).toBe('calculated')
    if (result.state !== 'calculated') return
    expect(result.memberTotalCents).toBe(101_719)
    expect(result.employerSubsidyCents).toBe(50_859)
    expect(result.contribution).toEqual({
      employeeCents: 50_860,
      employerCents: 50_859,
      totalCents: 101_719,
    })
  })

  it('requires other-income certainty for voluntary pay below the ceiling', () => {
    expect(
      calculateStatutoryHealthContribution2026(
        ordinaryInput(400_000, {
          coverageStatus: 'statutory_voluntary_employee',
          voluntaryOtherIncomeStatus: 'unknown_or_present',
        }),
      ),
    ).toMatchObject({
      state: 'incomplete',
      reason: 'voluntary_other_income_unknown',
    })
  })

  it.each([
    ['unknown', 'incomplete', 'unknown_coverage_status'],
    ['statutory_reduced_rate', 'unsupported', 'reduced_rate_unsupported'],
    ['private', 'unsupported', 'private_insurance_separate_path'],
    ['family_insured', 'unsupported', 'family_insurance_unsupported'],
    ['transition_range', 'unsupported', 'transition_range_unsupported'],
    ['minijob', 'unsupported', 'minijob_unsupported'],
    ['student', 'unsupported', 'student_unsupported'],
    ['pensioner', 'unsupported', 'pensioner_unsupported'],
    ['cross_border', 'unsupported', 'cross_border_unsupported'],
  ] as const)('fails closed for %s coverage', (coverageStatus, state, reason) => {
    expect(
      calculateStatutoryHealthContribution2026(
        ordinaryInput(400_000, { coverageStatus }),
      ),
    ).toMatchObject({ state, reason })
  })

  it('rejects invalid rates and numeric boundaries', () => {
    expect(() =>
      calculateStatutoryHealthContribution2026(
        ordinaryInput(400_000, { additionalRate: insurer('-1') }),
      ),
    ).toThrow()
    expect(() =>
      calculateStatutoryHealthContribution2026(
        ordinaryInput(400_000, { additionalRate: insurer('abc') }),
      ),
    ).toThrow()
    expect(() =>
      calculateStatutoryHealthContribution2026(ordinaryInput(-1)),
    ).toThrow(RangeError)
    expect(() =>
      calculateStatutoryHealthContribution2026(
        ordinaryInput(1, { contributionDays: 31 }),
      ),
    ).toThrow(RangeError)
    expect(() =>
      calculateStatutoryHealthContribution2026(
        ordinaryInput(1, { calculationYear: 2025 }),
      ),
    ).toThrow(RangeError)
  })

  it('routes one-off pay to its specialised allocation path', () => {
    expect(
      calculateStatutoryHealthContribution2026(
        ordinaryInput(400_000, { includesOneOffPay: true }),
      ),
    ).toMatchObject({
      state: 'incomplete',
      reason: 'one_off_allocation_required',
    })
  })
})

describe('annual statutory health contribution', () => {
  it('aggregates twelve capped monthly payroll periods', () => {
    const result = calculateAnnualStatutoryHealthContribution2026(
      Array<number>(12).fill(1_000_000),
      Array<HealthAdditionalRateInput>(12).fill(published),
      'statutory_mandatory_general',
    )

    expect(result.contributionBaseCents).toBe(6_975_000)
    expect(result.contribution).toEqual({
      employeeCents: 610_308,
      employerCents: 610_308,
      totalCents: 1_220_616,
    })
    expect(result.ceilingReachedInMonths).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12,
    ])
    expect(result.estimateMonths).toHaveLength(12)
  })

  it('supports a midyear insurer-rate change', () => {
    const rates = [
      ...Array<HealthAdditionalRateInput>(6).fill(insurer('2.5')),
      ...Array<HealthAdditionalRateInput>(6).fill(insurer('3.5')),
    ]
    const result = calculateAnnualStatutoryHealthContribution2026(
      Array<number>(12).fill(400_000),
      rates,
      'statutory_mandatory_general',
    )

    expect(result.months[5]?.additionalRatePercent).toBe('2.5')
    expect(result.months[6]?.additionalRatePercent).toBe('3.5')
    expect(result.contribution.employeeCents).toBe(420_000)
  })

  it('requires twelve pay and rate entries', () => {
    expect(() =>
      calculateAnnualStatutoryHealthContribution2026(
        Array<number>(11).fill(400_000),
        Array<HealthAdditionalRateInput>(12).fill(published),
        'statutory_mandatory_general',
      ),
    ).toThrow('exactly 12 months')
  })

  it('preserves exact normalized annual salary conversion', () => {
    const result = calculateHealthFromNormalizedCompensation2026(
      normalizeCompensation(compensation('60000', 'annual')),
      Array<HealthAdditionalRateInput>(12).fill(published),
      'statutory_mandatory_general',
    )

    expect(result.state).toBe('calculated')
    if (result.state !== 'calculated') return
    expect(result.contribution).toEqual({
      employeeCents: 525_000,
      employerCents: 525_000,
      totalCents: 1_050_000,
    })
  })

  it('returns incomplete for normalized one-off compensation', () => {
    const input: CompensationInput = {
      ...compensation('5000', 'monthly'),
      oneOffPayments: [
        {
          amount: euro('1000'),
          paymentMonth: 3,
          classification: 'annual_bonus' as RegistryOptionId,
          guarantee: 'variable',
        },
      ],
    }
    expect(
      calculateHealthFromNormalizedCompensation2026(
        normalizeCompensation(input),
        Array<HealthAdditionalRateInput>(12).fill(published),
        'statutory_mandatory_general',
      ),
    ).toMatchObject({
      state: 'incomplete',
      reason: 'one_off_allocation_required',
    })
  })
})
