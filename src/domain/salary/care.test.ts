import { describe, expect, it } from 'vitest'

import {
  calculateAnnualCareContribution2026,
  calculateCareContribution2026,
  calculateCareFromNormalizedCompensation2026,
  type AnnualCareContributionInput,
  type CareContributionInput,
  type CareEmploymentState,
} from './care'
import { normalizeCompensation } from './frequency'
import type { CompensationInput, DecimalString, EuroAmount } from './types'

const ordinaryInput = (
  liablePayCents: number,
  overrides: Partial<CareContributionInput> = {},
): CareContributionInput => ({
  liablePayCents,
  contributionDays: 30,
  insurancePath: 'statutory',
  employmentState: 'other',
  payrollYear: 2026,
  payrollMonth: 1,
  birthDate: '1990-06-15',
  parentStatus: 'parent',
  qualifyingChildren: 1,
  evidenceStatus: 'confirmed',
  calculationYear: 2026,
  ...overrides,
})

const annualInput = (
  overrides: Partial<AnnualCareContributionInput> = {},
): AnnualCareContributionInput => ({
  monthlyLiablePayCents: Array<number>(12).fill(400_000),
  monthlyQualifyingChildren: Array<number>(12).fill(1),
  insurancePath: 'statutory',
  employmentState: 'other',
  birthDate: '1990-06-15',
  parentStatus: 'parent',
  evidenceStatus: 'confirmed',
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

describe('2026 social care contribution', () => {
  it.each([
    [0, 0],
    [400_000, 72_00],
    [581_249, 104_62],
    [581_250, 104_63],
    [581_251, 104_63],
    [1_000_000, 104_63],
  ])('applies the ordinary ceiling to %i cents', (pay, share) => {
    const result = calculateCareContribution2026(ordinaryInput(pay))

    expect(result.state).toBe('calculated')
    if (result.state !== 'calculated') return
    expect(result.contribution.employeeCents).toBe(share)
    expect(result.contribution.employerCents).toBe(share)
    expect(result.contribution.totalCents).toBe(share * 2)
    expect(result.contributionBaseCents).toBe(Math.min(pay, 581_250))
  })

  it.each([
    [0, 104_63],
    [1, 104_63],
    [2, 90_09],
    [3, 75_56],
    [4, 61_03],
    [5, 46_50],
    [6, 46_50],
  ])(
    'applies the parent reduction for %i qualifying children',
    (children, employee) => {
      const result = calculateCareContribution2026(
        ordinaryInput(581_250, { qualifyingChildren: children }),
      )

      expect(result.state).toBe('calculated')
      if (result.state !== 'calculated') return
      expect(result.contribution.employeeCents).toBe(employee)
      expect(result.reductionCount).toBe(Math.min(Math.max(children - 1, 0), 4))
      expect(result.contribution.employerCents).toBe(104_63)
    },
  )

  it.each([
    ['other', 139_50, 104_63, 244_13],
    ['saxony', 168_56, 75_56, 244_12],
  ] as const)(
    'calculates childless ceiling shares for %s',
    (employmentState, employee, employer, total) => {
      const result = calculateCareContribution2026(
        ordinaryInput(581_250, {
          employmentState,
          payrollMonth: 4,
          birthDate: '2000-03-20',
          parentStatus: 'childless',
          qualifyingChildren: undefined,
        }),
      )

      expect(result.state).toBe('calculated')
      if (result.state !== 'calculated') return
      expect(result.contribution).toEqual({
        employeeCents: employee,
        employerCents: employer,
        totalCents: total,
      })
      expect(result.saxonyAllocationApplied).toBe(employmentState === 'saxony')
      expect(result.childlessSurchargeRatePercent).toBe('0.6')
    },
  )

  it.each([
    [2, false],
    [3, false],
    [4, true],
  ])(
    'starts the surcharge after the birthday month: month %i',
    (payrollMonth, applies) => {
      const result = calculateCareContribution2026(
        ordinaryInput(400_000, {
          payrollMonth,
          birthDate: '2003-03-31',
          parentStatus: 'childless',
          qualifyingChildren: undefined,
        }),
      )

      expect(result.state).toBe('calculated')
      if (result.state !== 'calculated') return
      expect(result.childlessSurchargeRatePercent).toBe(applies ? '0.6' : '0')
      expect(result.contribution.employeeCents).toBe(applies ? 96_00 : 72_00)
    },
  )

  it.each([
    [1, 19_375, 349],
    [15, 290_625, 5_231],
    [29, 561_875, 10_114],
    [30, 581_250, 10_463],
  ])(
    'preserves the exact ceiling for %i contribution days',
    (days, ceiling, share) => {
      const result = calculateCareContribution2026(
        ordinaryInput(1_000_000, { contributionDays: days }),
      )

      expect(result.state).toBe('calculated')
      if (result.state !== 'calculated') return
      expect(result.appliedCeilingCents).toBe(ceiling)
      expect(result.contributionBaseCents).toBe(ceiling)
      expect(result.contribution.employeeCents).toBe(share)
    },
  )

  it('marks unconfirmed evidence as a scenario estimate', () => {
    const result = calculateCareContribution2026(
      ordinaryInput(400_000, { evidenceStatus: 'scenario' }),
    )

    expect(result.state).toBe('calculated')
    if (result.state !== 'calculated') return
    expect(result.resultQuality).toBe('scenario_estimate')
  })

  it('defaults missing evidence confirmation to a scenario estimate', () => {
    const result = calculateCareContribution2026(
      ordinaryInput(400_000, { evidenceStatus: undefined }),
    )

    expect(result.state).toBe('calculated')
    if (result.state !== 'calculated') return
    expect(result.resultQuality).toBe('scenario_estimate')
  })

  it.each([
    [{ insurancePath: 'unknown' }, 'incomplete', 'unknown_insurance_path'],
    [
      { insurancePath: 'private' },
      'unsupported',
      'private_insurance_separate_path',
    ],
    [
      { insurancePath: 'transition_range' },
      'unsupported',
      'transition_range_unsupported',
    ],
    [{ insurancePath: 'minijob' }, 'unsupported', 'minijob_unsupported'],
    [{ insurancePath: 'student' }, 'unsupported', 'student_unsupported'],
    [{ insurancePath: 'pensioner' }, 'unsupported', 'pensioner_unsupported'],
    [
      { insurancePath: 'cross_border' },
      'unsupported',
      'cross_border_unsupported',
    ],
    [{ employmentState: 'unknown' }, 'incomplete', 'unknown_employment_state'],
    [
      { employmentState: 'ambiguous' },
      'incomplete',
      'ambiguous_saxony_treatment',
    ],
    [{ birthDate: undefined }, 'incomplete', 'missing_birth_date'],
    [{ parentStatus: 'unknown' }, 'incomplete', 'unknown_parent_status'],
    [
      { qualifyingChildren: undefined },
      'incomplete',
      'missing_qualifying_child_count',
    ],
    [
      { possibleSurchargeException: true },
      'unsupported',
      'possible_surcharge_exception',
    ],
    [
      {
        birthDate: '1939-12-31',
        parentStatus: 'childless',
        qualifyingChildren: undefined,
      },
      'unsupported',
      'possible_surcharge_exception',
    ],
    [{ includesOneOffPay: true }, 'incomplete', 'one_off_allocation_required'],
  ] as const)('fails closed for %o', (overrides, state, reason) => {
    expect(
      calculateCareContribution2026(
        ordinaryInput(400_000, overrides as Partial<CareContributionInput>),
      ),
    ).toMatchObject({ state, reason })
  })

  it('rejects invalid numeric and date inputs', () => {
    expect(() => calculateCareContribution2026(ordinaryInput(-1))).toThrow(
      RangeError,
    )
    expect(() =>
      calculateCareContribution2026(ordinaryInput(1, { contributionDays: 31 })),
    ).toThrow(RangeError)
    expect(() =>
      calculateCareContribution2026(ordinaryInput(1, { payrollMonth: 13 })),
    ).toThrow(RangeError)
    expect(() =>
      calculateCareContribution2026(
        ordinaryInput(1, { birthDate: '2026-02-30' }),
      ),
    ).toThrow(RangeError)
    expect(() =>
      calculateCareContribution2026(
        ordinaryInput(1, { calculationYear: 2025 }),
      ),
    ).toThrow(RangeError)
  })
})

describe('annual social care contribution', () => {
  it('aggregates twelve capped monthly payroll periods', () => {
    const result = calculateAnnualCareContribution2026(
      annualInput({ monthlyLiablePayCents: Array<number>(12).fill(1_000_000) }),
    )

    expect(result.contributionBaseCents).toBe(6_975_000)
    expect(result.contribution).toEqual({
      employeeCents: 125_556,
      employerCents: 125_556,
      totalCents: 251_112,
    })
    expect(result.ceilingReachedInMonths).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12,
    ])
  })

  it('changes the childless rate after the 23rd-birthday month', () => {
    const result = calculateAnnualCareContribution2026(
      annualInput({
        birthDate: '2003-03-01',
        parentStatus: 'childless',
        monthlyQualifyingChildren: undefined,
      }),
    )

    expect(result.surchargeMonths).toEqual([4, 5, 6, 7, 8, 9, 10, 11, 12])
    expect(result.months[2]?.contribution.employeeCents).toBe(72_00)
    expect(result.months[3]?.contribution.employeeCents).toBe(96_00)
  })

  it('accepts month-specific qualifying-child counts', () => {
    const result = calculateAnnualCareContribution2026(
      annualInput({
        monthlyQualifyingChildren: [2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1],
      }),
    )

    expect(result.months[5]?.employeeRatePercent).toBe('1.55')
    expect(result.months[6]?.employeeRatePercent).toBe('1.8')
  })

  it('requires twelve pay and child-count entries', () => {
    expect(() =>
      calculateAnnualCareContribution2026(
        annualInput({ monthlyLiablePayCents: Array<number>(11).fill(400_000) }),
      ),
    ).toThrow('exactly 12 pay values')
    expect(() =>
      calculateAnnualCareContribution2026(
        annualInput({ monthlyQualifyingChildren: Array<number>(11).fill(1) }),
      ),
    ).toThrow('exactly 12 qualifying-child counts')
  })

  it('preserves exact normalized annual salary conversion', () => {
    const result = calculateCareFromNormalizedCompensation2026(
      normalizeCompensation(compensation('60000', 'annual')),
      {
        insurancePath: 'statutory',
        employmentState: 'other',
        payrollYear: 2026,
        birthDate: '1990-06-15',
        parentStatus: 'parent',
        evidenceStatus: 'confirmed',
        calculationYear: 2026,
      },
      Array<number>(12).fill(1),
    )

    expect(result.state).toBe('calculated')
    if (result.state !== 'calculated') return
    expect(result.contribution).toEqual({
      employeeCents: 108_000,
      employerCents: 108_000,
      totalCents: 216_000,
    })
  })

  it('returns incomplete for normalized one-off compensation', () => {
    const input: CompensationInput = {
      ...compensation('5000', 'monthly'),
      oneOffPayments: [
        {
          amount: euro('1000'),
          paymentMonth: 3,
          classification: 'annual_bonus' as never,
          guarantee: 'variable',
        },
      ],
    }
    const result = calculateCareFromNormalizedCompensation2026(
      normalizeCompensation(input),
      {
        insurancePath: 'statutory',
        employmentState: 'other',
        payrollYear: 2026,
        birthDate: '1990-06-15',
        parentStatus: 'parent',
        calculationYear: 2026,
      },
      Array<number>(12).fill(1),
    )

    expect(result).toMatchObject({
      state: 'incomplete',
      reason: 'one_off_allocation_required',
    })
  })

  it.each<CareEmploymentState>(['saxony', 'other'])(
    'keeps annual state allocation stable for %s',
    (employmentState) => {
      const result = calculateAnnualCareContribution2026(
        annualInput({ employmentState }),
      )
      expect(
        result.months.every(
          (month) =>
            month.saxonyAllocationApplied === (employmentState === 'saxony'),
        ),
      ).toBe(true)
    },
  )
})
