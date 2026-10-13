import { describe, expect, it } from 'vitest'

import type {
  CompensationInput,
  DecimalString,
  EuroAmount,
  RegistryOptionId,
} from './types'
import { normalizeCompensation } from './frequency'
import {
  calculateAnnualPensionContribution2026,
  calculatePensionContribution2026,
  calculatePensionFromNormalizedCompensation2026,
  type PensionContributionInput,
} from './pension'

const ordinaryInput = (
  liablePayCents: number,
  overrides: Partial<PensionContributionInput> = {},
): PensionContributionInput => ({
  liablePayCents,
  contributionDays: 30,
  coverageStatus: 'general_statutory_mandatory',
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

describe('2026 statutory pension contribution', () => {
  it.each([
    [0, 0],
    [400_000, 37_200],
    [581_250, 54_056],
    [844_999, 78_585],
    [845_000, 78_585],
    [845_001, 78_585],
    [1_000_000, 78_585],
  ])('calculates ordinary monthly pay of %i cents', (pay, expectedShare) => {
    const result = calculatePensionContribution2026(ordinaryInput(pay))

    expect(result.state).toBe('calculated')
    if (result.state !== 'calculated') return
    expect(result.contribution.employeeCents).toBe(expectedShare)
    expect(result.contribution.employerCents).toBe(expectedShare)
    expect(result.contribution.totalCents).toBe(expectedShare * 2)
    expect(result.contributionBaseCents).toBe(Math.min(pay, 845_000))
  })

  it('rounds the half contribution once using the statutory half-up rule', () => {
    const belowHalfCent = calculatePensionContribution2026(ordinaryInput(499))
    const exactlyHalfCent = calculatePensionContribution2026(ordinaryInput(500))

    expect(belowHalfCent.state).toBe('calculated')
    expect(exactlyHalfCent.state).toBe('calculated')
    if (
      belowHalfCent.state !== 'calculated' ||
      exactlyHalfCent.state !== 'calculated'
    )
      return
    expect(belowHalfCent.contribution.employeeCents).toBe(46)
    expect(exactlyHalfCent.contribution.employeeCents).toBe(47)
  })

  it.each([
    [1, 28_167, 2_620],
    [15, 422_500, 39_293],
    [29, 816_833, 75_966],
    [30, 845_000, 78_585],
  ])(
    'prorates the ceiling for %i contribution days',
    (days, expectedCeiling, expectedShare) => {
      const result = calculatePensionContribution2026(
        ordinaryInput(1_000_000, { contributionDays: days }),
      )

      expect(result.state).toBe('calculated')
      if (result.state !== 'calculated') return
      expect(result.appliedCeilingCents).toBe(expectedCeiling)
      expect(result.contributionBaseCents).toBe(expectedCeiling)
      expect(result.contribution.employeeCents).toBe(expectedShare)
    },
  )

  it('returns zero only for a validated statutory exemption', () => {
    const incomplete = calculatePensionContribution2026(
      ordinaryInput(500_000, { coverageStatus: 'statutory_exempt' }),
    )
    const exempt = calculatePensionContribution2026(
      ordinaryInput(500_000, {
        coverageStatus: 'statutory_exempt',
        exemptionValidated: true,
      }),
    )

    expect(incomplete).toMatchObject({
      state: 'incomplete',
      reason: 'exemption_not_validated',
    })
    expect(exempt).toMatchObject({
      state: 'calculated',
      contributionBaseCents: 0,
      ceilingReached: false,
      contribution: { employeeCents: 0, employerCents: 0, totalCents: 0 },
    })
  })

  it.each([
    ['unknown', 'incomplete', 'unknown_coverage_status'],
    [
      'professional_scheme',
      'incomplete',
      'professional_scheme_requires_scheme_amount',
    ],
    ['miners_scheme', 'unsupported', 'miners_scheme_unsupported'],
    ['minijob', 'unsupported', 'minijob_unsupported'],
    ['transition_range', 'unsupported', 'transition_range_unsupported'],
  ] as const)(
    'fails closed for %s coverage',
    (coverageStatus, state, reason) => {
      expect(
        calculatePensionContribution2026(
          ordinaryInput(400_000, { coverageStatus }),
        ),
      ).toMatchObject({ state, reason })
    },
  )

  it('requires a separate allocation rule for one-off pay', () => {
    expect(
      calculatePensionContribution2026(
        ordinaryInput(500_000, { includesOneOffPay: true }),
      ),
    ).toMatchObject({
      state: 'incomplete',
      reason: 'one_off_allocation_required',
    })
  })

  it.each([
    ordinaryInput(-1),
    ordinaryInput(Number.MAX_SAFE_INTEGER + 1),
    ordinaryInput(1, { contributionDays: 0 }),
    ordinaryInput(1, { contributionDays: 31 }),
    ordinaryInput(1, { contributionDays: 1.5 }),
    ordinaryInput(1, { calculationYear: 2025 }),
  ])('rejects invalid numeric and year inputs', (input) => {
    expect(() => calculatePensionContribution2026(input)).toThrow(RangeError)
  })
})

describe('annual pension contribution', () => {
  it('calculates twelve monthly payroll periods and preserves monthly caps', () => {
    const result = calculateAnnualPensionContribution2026(
      Array<number>(12).fill(1_000_000),
    )

    expect(result.months).toHaveLength(12)
    expect(result.contributionBaseCents).toBe(10_140_000)
    expect(result.contribution).toEqual({
      employeeCents: 943_020,
      employerCents: 943_020,
      totalCents: 1_886_040,
    })
    expect(result.ceilingReachedInMonths).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12,
    ])
  })

  it('rejects an annual input that is not twelve payroll months', () => {
    expect(() =>
      calculateAnnualPensionContribution2026(Array<number>(11).fill(400_000)),
    ).toThrow('exactly 12 months')
  })

  it('uses normalized recurring monthly pay without annual shortcut rounding', () => {
    const normalized = normalizeCompensation(compensation('60000', 'annual'))
    const result = calculatePensionFromNormalizedCompensation2026(
      normalized,
      'general_statutory_mandatory',
    )

    expect(result.state).toBe('calculated')
    if (result.state !== 'calculated') return
    expect(result.contribution).toEqual({
      employeeCents: 558_000,
      employerCents: 558_000,
      totalCents: 1_116_000,
    })
  })

  it('preserves sub-cent monthly pay until the contribution rounding boundary', () => {
    const normalized = normalizeCompensation(compensation('0.65', 'annual'))
    const result = calculatePensionFromNormalizedCompensation2026(
      normalized,
      'general_statutory_mandatory',
    )

    expect(result.state).toBe('calculated')
    if (result.state !== 'calculated') return
    expect(result.contribution).toEqual({
      employeeCents: 12,
      employerCents: 12,
      totalCents: 24,
    })
  })

  it('does not silently include normalized one-off compensation', () => {
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
      calculatePensionFromNormalizedCompensation2026(
        normalizeCompensation(input),
        'general_statutory_mandatory',
      ),
    ).toMatchObject({
      state: 'incomplete',
      reason: 'one_off_allocation_required',
    })
  })
})
