import { describe, expect, it } from 'vitest'

import { normalizeCompensation } from './frequency'
import type {
  CompensationInput,
  DecimalString,
  EuroAmount,
  RegistryOptionId,
} from './types'
import {
  calculateAnnualUnemploymentContribution2026,
  calculateUnemploymentContribution2026,
  calculateUnemploymentFromNormalizedCompensation2026,
  type UnemploymentContributionInput,
} from './unemployment'

const ordinaryInput = (
  liablePayCents: number,
  overrides: Partial<UnemploymentContributionInput> = {},
): UnemploymentContributionInput => ({
  liablePayCents,
  contributionDays: 30,
  coverageStatus: 'mandatory_standard',
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

describe('2026 statutory unemployment contribution', () => {
  it.each([
    [0, 0],
    [400_000, 5_200],
    [581_250, 7_556],
    [844_999, 10_985],
    [845_000, 10_985],
    [845_001, 10_985],
    [1_000_000, 10_985],
  ])('calculates ordinary monthly pay of %i cents', (pay, expectedShare) => {
    const result = calculateUnemploymentContribution2026(ordinaryInput(pay))

    expect(result.state).toBe('calculated')
    if (result.state !== 'calculated') return
    expect(result.contribution.employeeCents).toBe(expectedShare)
    expect(result.contribution.employerCents).toBe(expectedShare)
    expect(result.contribution.totalCents).toBe(expectedShare * 2)
    expect(result.contributionBaseCents).toBe(Math.min(pay, 845_000))
  })

  it('rounds each half contribution once using the statutory half-up rule', () => {
    const belowHalfCent = calculateUnemploymentContribution2026(
      ordinaryInput(499),
    )
    const exactlyHalfCent = calculateUnemploymentContribution2026(
      ordinaryInput(500),
    )

    expect(belowHalfCent.state).toBe('calculated')
    expect(exactlyHalfCent.state).toBe('calculated')
    if (
      belowHalfCent.state !== 'calculated' ||
      exactlyHalfCent.state !== 'calculated'
    )
      return
    expect(belowHalfCent.contribution.employeeCents).toBe(6)
    expect(exactlyHalfCent.contribution.employeeCents).toBe(7)
  })

  it.each([
    [1, 28_167, 366],
    [15, 422_500, 5_493],
    [29, 816_833, 10_619],
    [30, 845_000, 10_985],
  ])(
    'preserves the exact prorated ceiling for %i contribution days',
    (days, expectedCeiling, expectedShare) => {
      const result = calculateUnemploymentContribution2026(
        ordinaryInput(1_000_000, { contributionDays: days }),
      )

      expect(result.state).toBe('calculated')
      if (result.state !== 'calculated') return
      expect(result.appliedCeilingCents).toBe(expectedCeiling)
      expect(result.contributionBaseCents).toBe(expectedCeiling)
      expect(result.contribution.employeeCents).toBe(expectedShare)
    },
  )

  it('returns zero only when exemption evidence is validated', () => {
    const incomplete = calculateUnemploymentContribution2026(
      ordinaryInput(500_000, { coverageStatus: 'exempt_validated' }),
    )
    const exempt = calculateUnemploymentContribution2026(
      ordinaryInput(500_000, {
        coverageStatus: 'exempt_validated',
        exemptionEvidenceValidated: true,
      }),
    )

    expect(incomplete).toMatchObject({
      state: 'incomplete',
      reason: 'exemption_evidence_required',
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
      'standard_retirement_age_employer_only',
      'unsupported',
      'retirement_age_employer_only_unsupported',
    ],
    ['transition_range', 'unsupported', 'transition_range_unsupported'],
    ['minijob', 'unsupported', 'minijob_unsupported'],
    ['trainee_special', 'unsupported', 'trainee_special_unsupported'],
    [
      'voluntary_self_insurance',
      'unsupported',
      'voluntary_self_insurance_unsupported',
    ],
    ['cross_border', 'unsupported', 'cross_border_unsupported'],
  ] as const)(
    'fails closed for %s coverage',
    (coverageStatus, state, reason) => {
      expect(
        calculateUnemploymentContribution2026(
          ordinaryInput(400_000, { coverageStatus }),
        ),
      ).toMatchObject({ state, reason })
    },
  )

  it('routes one-off pay to the specialised allocation rules', () => {
    expect(
      calculateUnemploymentContribution2026(
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
    expect(() => calculateUnemploymentContribution2026(input)).toThrow(
      RangeError,
    )
  })
})

describe('annual unemployment contribution', () => {
  it('calculates twelve monthly payroll periods and preserves monthly caps', () => {
    const result = calculateAnnualUnemploymentContribution2026(
      Array<number>(12).fill(1_000_000),
    )

    expect(result.months).toHaveLength(12)
    expect(result.contributionBaseCents).toBe(10_140_000)
    expect(result.contribution).toEqual({
      employeeCents: 131_820,
      employerCents: 131_820,
      totalCents: 263_640,
    })
    expect(result.ceilingReachedInMonths).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12,
    ])
  })

  it('rejects an annual input that is not twelve payroll months', () => {
    expect(() =>
      calculateAnnualUnemploymentContribution2026(
        Array<number>(11).fill(400_000),
      ),
    ).toThrow('exactly 12 months')
  })

  it('uses exact normalized recurring monthly pay', () => {
    const normalized = normalizeCompensation(compensation('60000', 'annual'))
    const result = calculateUnemploymentFromNormalizedCompensation2026(
      normalized,
      'mandatory_standard',
    )

    expect(result.state).toBe('calculated')
    if (result.state !== 'calculated') return
    expect(result.contribution).toEqual({
      employeeCents: 78_000,
      employerCents: 78_000,
      totalCents: 156_000,
    })
  })

  it('preserves sub-cent monthly pay until contribution rounding', () => {
    const normalized = normalizeCompensation(compensation('13.85', 'annual'))
    const result = calculateUnemploymentFromNormalizedCompensation2026(
      normalized,
      'mandatory_standard',
    )

    expect(result.state).toBe('calculated')
    if (result.state !== 'calculated') return
    expect(result.contribution).toEqual({
      employeeCents: 24,
      employerCents: 24,
      totalCents: 48,
    })
  })

  it('carries validated exemption evidence through normalized calculations', () => {
    const normalized = normalizeCompensation(compensation('60000', 'annual'))
    const withoutEvidence = calculateUnemploymentFromNormalizedCompensation2026(
      normalized,
      'exempt_validated',
    )
    const validated = calculateUnemploymentFromNormalizedCompensation2026(
      normalized,
      'exempt_validated',
      true,
    )

    expect(withoutEvidence).toMatchObject({
      state: 'incomplete',
      reason: 'exemption_evidence_required',
    })
    expect(validated.state).toBe('calculated')
    if (validated.state !== 'calculated') return
    expect(validated.months).toHaveLength(12)
    expect(validated.contributionBaseCents).toBe(0)
    expect(validated.contribution).toEqual({
      employeeCents: 0,
      employerCents: 0,
      totalCents: 0,
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
      calculateUnemploymentFromNormalizedCompensation2026(
        normalizeCompensation(input),
        'mandatory_standard',
      ),
    ).toMatchObject({
      state: 'incomplete',
      reason: 'one_off_allocation_required',
    })
  })
})
