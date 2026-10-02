import { describe, expect, it } from 'vitest'

import type { DecimalString } from './types'
import {
  validateIndividualSalaryScenario,
  type SalaryValidationRules,
} from './validation'

const rules: SalaryValidationRules = {
  calculationYear: 2026,
  taxClassIds: ['tax_class_1', 'tax_class_4'],
  pensionStatusIds: ['compulsory', 'exempt'],
  unemploymentStatusIds: ['compulsory', 'exempt'],
  oneOffPaymentClassificationIds: ['yearly_bonus', 'signing_bonus'],
  childAllowanceFactorMaximum: '6' as DecimalString,
}

const validScenario = () => ({
  context: {
    calculationYear: 2026,
    locale: 'en-DE',
    currency: 'EUR',
    scenarioLabel: 'Current role',
  },
  scope: {
    employmentCategory: 'regular_employee_full_time',
    payrollCountry: 'DE',
    crossBorderTreatmentRequired: false,
    simultaneousEmploymentCount: 1,
    specialEmploymentCase: 'none',
  },
  compensation: {
    baseSalary: {
      period: 'annual',
      grossAmount: { amount: '85000.00', currency: 'EUR' },
      paymentsPerYear: 12,
    },
    regularAdditionalCash: {
      kind: 'included',
      amount: { amount: '5000.00', currency: 'EUR' },
      period: 'annual',
      guarantee: 'variable',
    },
    oneOffPayments: [
      {
        amount: { amount: '2000.00', currency: 'EUR' },
        paymentMonth: 12,
        classification: 'yearly_bonus',
        guarantee: 'variable',
        label: 'Annual bonus',
      },
    ],
  },
  tax: {
    taxClass: 'tax_class_1',
    federalState: 'DE-BW',
    churchTaxStatus: 'not_liable',
    dateOfBirth: '1995-01-01',
    childAllowanceFactor: '0',
    annualAllowanceAmount: { amount: '0.00', currency: 'EUR' },
    annualAdditionalAmount: { amount: '0.00', currency: 'EUR' },
  },
  social: {
    pensionStatus: 'compulsory',
    unemploymentStatus: 'compulsory',
    careInsuranceChildStatus: 'childless',
    childrenUnderRelevantAge: 0,
    health: {
      healthInsuranceType: 'statutory',
      additionalRateMode: 'published_average',
    },
  },
  comparison: {
    weeklyHours: '40',
    vacationDaysAnnual: '30',
    remoteDaysPerWeek: '3',
    commuteOneWayKm: '12.5',
    benefits: [
      {
        label: 'Learning budget',
        employerValueAnnual: { amount: '1000', currency: 'EUR' },
        userValueAnnual: { amount: '800', currency: 'EUR' },
        certainty: 'guaranteed',
      },
    ],
  },
})

type MutableScenario = ReturnType<typeof validScenario> &
  Record<string, unknown>

const first = <Value>(values: readonly Value[]): Value => {
  const value = values[0]
  if (value === undefined) throw new Error('Expected a non-empty test fixture')
  return value
}

const validationErrors = (value: unknown) => {
  const result = validateIndividualSalaryScenario(value, rules, '2026-10-02')
  expect(result.success).toBe(false)
  return result.success ? [] : result.errors
}

describe('validated salary input schema', () => {
  it('constructs a canonical value only after all fields pass validation', () => {
    const input = validScenario()
    const result = validateIndividualSalaryScenario(input, rules, '2026-10-02')

    expect(result).toEqual({ success: true, value: input, warnings: [] })
  })

  it('accepts explicit unknown states without confusing them with zero or false', () => {
    const input = validScenario()
    input.scope.crossBorderTreatmentRequired = 'unknown' as never
    input.scope.simultaneousEmploymentCount = 'unknown' as never
    input.scope.specialEmploymentCase = 'unknown'
    input.tax.churchTaxStatus = 'unknown'
    input.social.pensionStatus = 'unknown'
    input.social.unemploymentStatus = 'unknown'
    input.social.careInsuranceChildStatus = 'unknown'
    input.social.childrenUnderRelevantAge = 'unknown' as never
    input.social.health = { healthInsuranceType: 'unknown' } as never
    first(input.comparison.benefits).certainty = 'unknown'

    const result = validateIndividualSalaryScenario(input, rules, '2026-10-02')
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.value.social.childrenUnderRelevantAge).toBe('unknown')
      expect(result.value.scope.crossBorderTreatmentRequired).toBe('unknown')
    }
  })

  it('validates insurer-specific statutory insurance', () => {
    const input = validScenario()
    input.social.health = {
      healthInsuranceType: 'statutory',
      additionalRateMode: 'insurer_specific',
      additionalContributionRate: { value: '2.5', unit: 'percent' },
    } as never

    expect(validateIndividualSalaryScenario(input, rules).success).toBe(true)

    ;(
      input.social.health as Record<string, unknown>
    ).additionalContributionRate = {
      value: '101',
      unit: 'ratio',
    }
    const errors = validationErrors(input)
    expect(errors.map(({ path }) => path)).toEqual(
      expect.arrayContaining([
        'social.health.additionalContributionRate.value',
        'social.health.additionalContributionRate.unit',
      ]),
    )
  })

  it('validates both private-insurance employer-contribution paths', () => {
    const input = validScenario()
    input.social.health = {
      healthInsuranceType: 'private',
      totalHealthPremiumMonthly: { amount: '650', currency: 'EUR' },
      totalCarePremiumMonthly: { amount: '90', currency: 'EUR' },
      payrollBasicCoverageAmountMonthly: { amount: '550', currency: 'EUR' },
      employerContributionKnown: true,
      employerContributionMonthly: { amount: '370', currency: 'EUR' },
    } as never
    expect(validateIndividualSalaryScenario(input, rules).success).toBe(true)

    input.social.health = {
      healthInsuranceType: 'private',
      totalHealthPremiumMonthly: { amount: '650', currency: 'EUR' },
      totalCarePremiumMonthly: { amount: '90', currency: 'EUR' },
      employerContributionKnown: false,
    } as never
    expect(validateIndividualSalaryScenario(input, rules).success).toBe(true)
  })

  it('rejects inconsistent private-insurance values', () => {
    const input = validScenario()
    input.social.health = {
      healthInsuranceType: 'private',
      totalHealthPremiumMonthly: { amount: '650', currency: 'EUR' },
      totalCarePremiumMonthly: { amount: '90', currency: 'EUR' },
      payrollBasicCoverageAmountMonthly: { amount: '800', currency: 'EUR' },
      employerContributionKnown: true,
      employerContributionMonthly: { amount: '800', currency: 'EUR' },
    } as never
    const errors = validationErrors(input)
    expect(
      errors.filter(({ code }) => code === 'inconsistent_fields'),
    ).toHaveLength(2)

    ;(
      input.social.health as Record<string, unknown>
    ).employerContributionKnown = 'unknown'
    expect(validationErrors(input)).toContainEqual(
      expect.objectContaining({ code: 'invalid_value' }),
    )
  })

  it('rejects fields from inactive health-insurance paths', () => {
    const statutory = validScenario()
    ;(
      statutory.social.health as Record<string, unknown>
    ).totalHealthPremiumMonthly = {
      amount: '650',
      currency: 'EUR',
    }
    expect(validationErrors(statutory)).toContainEqual(
      expect.objectContaining({
        path: 'social.health.totalHealthPremiumMonthly',
        code: 'inconsistent_fields',
      }),
    )

    const privateInsurance = validScenario()
    privateInsurance.social.health = {
      healthInsuranceType: 'private',
      totalHealthPremiumMonthly: { amount: '650', currency: 'EUR' },
      totalCarePremiumMonthly: { amount: '90', currency: 'EUR' },
      employerContributionKnown: false,
      additionalRateMode: 'published_average',
    } as never
    expect(validationErrors(privateInsurance)).toContainEqual(
      expect.objectContaining({ path: 'social.health.additionalRateMode' }),
    )

    const unknown = validScenario()
    unknown.social.health = {
      healthInsuranceType: 'unknown',
      totalCarePremiumMonthly: { amount: '90', currency: 'EUR' },
    } as never
    expect(validationErrors(unknown)).toContainEqual(
      expect.objectContaining({
        path: 'social.health.totalCarePremiumMonthly',
      }),
    )
  })

  it('rejects whitespace-only and untrimmed labels', () => {
    const input = validScenario()
    input.context.scenarioLabel = '   '
    first(input.compensation.oneOffPayments).label = ' Annual bonus '
    first(input.comparison.benefits).label = '   '

    expect(validationErrors(input)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: 'context.scenarioLabel',
          code: 'out_of_range',
        }),
        expect.objectContaining({
          path: 'compensation.oneOffPayments.0.label',
          code: 'invalid_value',
        }),
        expect.objectContaining({
          path: 'comparison.benefits.0.label',
          code: 'out_of_range',
        }),
      ]),
    )
  })

  it('returns localized field errors and never returns a partial value', () => {
    const input = validScenario() as MutableScenario
    ;(input as Record<string, unknown>).context = null
    ;(input as Record<string, unknown>).scope = 'not-an-object'
    input.compensation.baseSalary.grossAmount.amount = '-1'
    input.tax.taxClass = 'tax_class_3'

    const result = validateIndividualSalaryScenario(input, rules)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result).not.toHaveProperty('value')
      expect(first(result.errors).message.de).toBeTruthy()
      expect(first(result.errors).message.en).toBeTruthy()
      expect(result.errors.map(({ code }) => code)).toEqual(
        expect.arrayContaining([
          'required',
          'invalid_type',
          'invalid_value',
          'unsupported_option',
        ]),
      )
    }
  })

  it.each([
    [
      'context.calculationYear missing',
      (s: MutableScenario) =>
        delete (s.context as Record<string, unknown>).calculationYear,
      'context.calculationYear',
    ],
    [
      'unsupported year',
      (s: MutableScenario) => (s.context.calculationYear = 2025),
      'context.calculationYear',
    ],
    [
      'invalid locale',
      (s: MutableScenario) => (s.context.locale = 'fr-FR'),
      'context.locale',
    ],
    [
      'long scenario label',
      (s: MutableScenario) => (s.context.scenarioLabel = 'x'.repeat(81)),
      'context.scenarioLabel',
    ],
    [
      'invalid employment',
      (s: MutableScenario) => (s.scope.employmentCategory = 'freelancer'),
      'scope.employmentCategory',
    ],
    [
      'invalid country',
      (s: MutableScenario) => (s.scope.payrollCountry = 'FR'),
      'scope.payrollCountry',
    ],
    [
      'invalid cross-border state',
      (s: MutableScenario) =>
        (s.scope.crossBorderTreatmentRequired = 'maybe' as never),
      'scope.crossBorderTreatmentRequired',
    ],
    [
      'invalid job count',
      (s: MutableScenario) => (s.scope.simultaneousEmploymentCount = 0),
      'scope.simultaneousEmploymentCount',
    ],
    [
      'invalid special case',
      (s: MutableScenario) => (s.scope.specialEmploymentCase = 'director'),
      'scope.specialEmploymentCase',
    ],
    [
      'invalid pay period',
      (s: MutableScenario) => (s.compensation.baseSalary.period = 'weekly'),
      'compensation.baseSalary.period',
    ],
    [
      'zero base salary',
      (s: MutableScenario) =>
        (s.compensation.baseSalary.grossAmount.amount = '0'),
      'compensation.baseSalary.grossAmount.amount',
    ],
    [
      'wrong currency',
      (s: MutableScenario) =>
        (s.compensation.baseSalary.grossAmount.currency = 'USD'),
      'compensation.baseSalary.grossAmount.currency',
    ],
    [
      'wrong payment count',
      (s: MutableScenario) => (s.compensation.baseSalary.paymentsPerYear = 13),
      'compensation.baseSalary.paymentsPerYear',
    ],
    [
      'invalid recurring kind',
      (s: MutableScenario) =>
        (s.compensation.regularAdditionalCash.kind = 'maybe'),
      'compensation.regularAdditionalCash.kind',
    ],
    [
      'missing recurring period',
      (s: MutableScenario) =>
        delete (s.compensation.regularAdditionalCash as Record<string, unknown>)
          .period,
      'compensation.regularAdditionalCash.period',
    ],
    [
      'missing recurring guarantee',
      (s: MutableScenario) =>
        delete (s.compensation.regularAdditionalCash as Record<string, unknown>)
          .guarantee,
      'compensation.regularAdditionalCash.guarantee',
    ],
    [
      'one-off month',
      (s: MutableScenario) =>
        (first(s.compensation.oneOffPayments).paymentMonth = 13),
      'compensation.oneOffPayments.0.paymentMonth',
    ],
    [
      'one-off class',
      (s: MutableScenario) =>
        (first(s.compensation.oneOffPayments).classification = 'gift'),
      'compensation.oneOffPayments.0.classification',
    ],
    [
      'one-off guarantee',
      (s: MutableScenario) =>
        (first(s.compensation.oneOffPayments).guarantee = 'unknown'),
      'compensation.oneOffPayments.0.guarantee',
    ],
    [
      'long payment label',
      (s: MutableScenario) =>
        (first(s.compensation.oneOffPayments).label = 'x'.repeat(81)),
      'compensation.oneOffPayments.0.label',
    ],
    [
      'invalid state',
      (s: MutableScenario) => (s.tax.federalState = 'DE-XX'),
      'tax.federalState',
    ],
    [
      'future birth date',
      (s: MutableScenario) => (s.tax.dateOfBirth = '2027-01-01'),
      'tax.dateOfBirth',
    ],
    [
      'impossible birth date',
      (s: MutableScenario) => (s.tax.dateOfBirth = '2020-02-31'),
      'tax.dateOfBirth',
    ],
    [
      'child allowance',
      (s: MutableScenario) => (s.tax.childAllowanceFactor = '7'),
      'tax.childAllowanceFactor',
    ],
    [
      'invalid pension',
      (s: MutableScenario) => (s.social.pensionStatus = 'optional'),
      'social.pensionStatus',
    ],
    [
      'invalid unemployment',
      (s: MutableScenario) => (s.social.unemploymentStatus = 'optional'),
      'social.unemploymentStatus',
    ],
    [
      'invalid care status',
      (s: MutableScenario) => (s.social.careInsuranceChildStatus = 'maybe'),
      'social.careInsuranceChildStatus',
    ],
    [
      'invalid child count',
      (s: MutableScenario) => (s.social.childrenUnderRelevantAge = 21),
      'social.childrenUnderRelevantAge',
    ],
    [
      'invalid health type',
      (s: MutableScenario) =>
        ((s.social.health as Record<string, unknown>).healthInsuranceType =
          'travel'),
      'social.health.healthInsuranceType',
    ],
    [
      'zero weekly hours',
      (s: MutableScenario) => (s.comparison.weeklyHours = '0'),
      'comparison.weeklyHours',
    ],
    [
      'vacation days',
      (s: MutableScenario) => (s.comparison.vacationDaysAnnual = '367'),
      'comparison.vacationDaysAnnual',
    ],
    [
      'remote days',
      (s: MutableScenario) => (s.comparison.remoteDaysPerWeek = '8'),
      'comparison.remoteDaysPerWeek',
    ],
    [
      'commute distance',
      (s: MutableScenario) => (s.comparison.commuteOneWayKm = '2001'),
      'comparison.commuteOneWayKm',
    ],
    [
      'long benefit label',
      (s: MutableScenario) =>
        (first(s.comparison.benefits).label = 'x'.repeat(121)),
      'comparison.benefits.0.label',
    ],
    [
      'invalid benefit certainty',
      (s: MutableScenario) =>
        (first(s.comparison.benefits).certainty = 'likely'),
      'comparison.benefits.0.certainty',
    ],
  ])('rejects %s', (_name, mutate, expectedPath) => {
    const input = validScenario() as MutableScenario
    mutate(input)
    expect(validationErrors(input).map(({ path }) => path)).toContain(
      expectedPath,
    )
  })

  it('enforces collection limits and required arrays', () => {
    const tooMany = validScenario()
    tooMany.compensation.oneOffPayments = Array.from({ length: 13 }, () =>
      first(tooMany.compensation.oneOffPayments),
    )
    tooMany.comparison.benefits = Array.from({ length: 21 }, () =>
      first(tooMany.comparison.benefits),
    )
    expect(validationErrors(tooMany).map(({ path }) => path)).toEqual(
      expect.arrayContaining([
        'compensation.oneOffPayments',
        'comparison.benefits',
      ]),
    )

    const missing = validScenario() as MutableScenario
    missing.compensation.oneOffPayments = null as never
    missing.comparison.benefits = null as never
    expect(validationErrors(missing).map(({ path }) => path)).toEqual(
      expect.arrayContaining([
        'compensation.oneOffPayments',
        'comparison.benefits',
      ]),
    )

    const oversized = validScenario()
    oversized.compensation.oneOffPayments = Array.from(
      { length: 130_000 },
      () => first(oversized.compensation.oneOffPayments),
    )
    const oversizedErrors = validationErrors(oversized)
    expect(oversizedErrors).toHaveLength(1)
    expect(first(oversizedErrors).path).toBe('compensation.oneOffPayments')
  })

  it('requires a zero amount when recurring cash is explicitly none', () => {
    const input = validScenario()
    input.compensation.regularAdditionalCash = {
      kind: 'none',
      amount: { amount: '1', currency: 'EUR' },
    } as never
    expect(validationErrors(input)).toContainEqual(
      expect.objectContaining({ code: 'inconsistent_fields' }),
    )
    input.compensation.regularAdditionalCash.amount.amount = '0'
    expect(validateIndividualSalaryScenario(input, rules).success).toBe(true)
  })

  it('warns above EUR 1m and blocks annual compensation above EUR 10m', () => {
    const input = validScenario()
    input.compensation.baseSalary.period = 'monthly'
    input.compensation.baseSalary.grossAmount.amount = '90000'
    let result = validateIndividualSalaryScenario(input, rules)
    expect(result.success).toBe(true)
    expect(result.warnings).toContainEqual(
      expect.objectContaining({ code: 'annual_compensation_high' }),
    )

    input.compensation.baseSalary.grossAmount.amount = '900000'
    result = validateIndividualSalaryScenario(input, rules)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.errors).toContainEqual(
        expect.objectContaining({ path: 'compensation' }),
      )
    }
  })

  it('rejects a non-object root and non-text decimal values', () => {
    expect(validationErrors(null)[0]).toMatchObject({ path: '$' })
    expect(validationErrors('scenario')[0]).toMatchObject({ path: '$' })

    const input = validScenario() as MutableScenario
    input.tax.annualAllowanceAmount.amount = 10 as never
    expect(validationErrors(input)).toContainEqual(
      expect.objectContaining({
        path: 'tax.annualAllowanceAmount.amount',
        code: 'invalid_type',
      }),
    )
  })
})
