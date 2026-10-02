import { describe, expect, it } from 'vitest'

import type {
  BenefitLabel,
  CalculationYear,
  DecimalString,
  IndividualSalaryScenarioInput,
  IsoDate,
  RegistryOptionId,
  SalaryAlternativeInput,
  ScenarioLabel,
} from './types'

const decimal = (value: string) => value as DecimalString
const euro = (value: string) =>
  ({ amount: decimal(value), currency: 'EUR' }) as const
const option = (value: string) => value as RegistryOptionId

const baseScenario = {
  context: {
    calculationYear: 2026 as CalculationYear,
    locale: 'en-DE',
    currency: 'EUR',
    scenarioLabel: 'Current role' as ScenarioLabel,
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
      grossAmount: euro('85000.00'),
      paymentsPerYear: 12,
    },
    regularAdditionalCash: {
      kind: 'included',
      amount: euro('5000.00'),
      period: 'annual',
      guarantee: 'variable',
    },
    oneOffPayments: [
      {
        amount: euro('2000.00'),
        paymentMonth: 12,
        classification: option('yearly_bonus'),
        guarantee: 'variable',
        label: 'Annual bonus' as ScenarioLabel,
      },
    ],
  },
  tax: {
    taxClass: option('tax_class_1'),
    federalState: 'DE-BW',
    churchTaxStatus: 'not_liable',
    dateOfBirth: '1995-01-01' as IsoDate,
    childAllowanceFactor: decimal('0'),
    annualAllowanceAmount: euro('0.00'),
    annualAdditionalAmount: euro('0.00'),
  },
  comparison: {
    weeklyHours: decimal('40'),
    vacationDaysAnnual: decimal('30'),
    remoteDaysPerWeek: decimal('5'),
    benefits: [
      {
        label: 'Learning budget' as BenefitLabel,
        employerValueAnnual: euro('1000.00'),
        certainty: 'guaranteed',
      },
    ],
  },
} as const

describe('salary-domain types', () => {
  it('models the statutory health-insurance path without private fields', () => {
    const scenario = {
      ...baseScenario,
      social: {
        pensionStatus: option('compulsory'),
        unemploymentStatus: option('compulsory'),
        careInsuranceChildStatus: 'childless',
        childrenUnderRelevantAge: 0,
        health: {
          healthInsuranceType: 'statutory',
          additionalRateMode: 'insurer_specific',
          additionalContributionRate: {
            value: decimal('2.50'),
            unit: 'percent',
          },
        },
      },
    } satisfies IndividualSalaryScenarioInput

    expect(scenario.social.health.healthInsuranceType).toBe('statutory')
    expect(scenario.social.health.additionalContributionRate.value).toBe('2.50')
  })

  it('models known private premiums and an explicit unknown child count', () => {
    const scenario = {
      ...baseScenario,
      social: {
        pensionStatus: option('compulsory'),
        unemploymentStatus: option('compulsory'),
        careInsuranceChildStatus: 'has_child',
        childrenUnderRelevantAge: 'unknown',
        health: {
          healthInsuranceType: 'private',
          totalHealthPremiumMonthly: euro('650.00'),
          totalCarePremiumMonthly: euro('90.00'),
          payrollBasicCoverageAmountMonthly: euro('550.00'),
          employerContributionKnown: true,
          employerContributionMonthly: euro('370.00'),
        },
      },
    } satisfies IndividualSalaryScenarioInput

    expect(scenario.social.childrenUnderRelevantAge).toBe('unknown')
    expect(scenario.social.health.employerContributionMonthly.amount).toBe(
      '370.00',
    )
  })

  it('keeps unknown, false, and zero as distinct domain states', () => {
    const unknown: IndividualSalaryScenarioInput = {
      ...baseScenario,
      scope: {
        ...baseScenario.scope,
        crossBorderTreatmentRequired: 'unknown',
        simultaneousEmploymentCount: 'unknown',
      },
      social: {
        pensionStatus: 'unknown',
        unemploymentStatus: 'unknown',
        careInsuranceChildStatus: 'unknown',
        childrenUnderRelevantAge: 0,
        health: { healthInsuranceType: 'unknown' },
      },
    }

    expect(unknown.scope.crossBorderTreatmentRequired).toBe('unknown')
    expect(unknown.social.childrenUnderRelevantAge).toBe(0)
    expect(unknown.compensation.regularAdditionalCash.amount.amount).toBe(
      '5000.00',
    )
  })

  it('restricts salary alternatives to compensation and comparison overrides', () => {
    const salaryIncrease = {
      current: {
        ...baseScenario,
        social: {
          pensionStatus: option('compulsory'),
          unemploymentStatus: option('compulsory'),
          careInsuranceChildStatus: 'childless',
          childrenUnderRelevantAge: 0,
          health: {
            healthInsuranceType: 'statutory',
            additionalRateMode: 'published_average',
          },
        },
      },
      alternative: {
        scenarioLabel: 'After raise' as ScenarioLabel,
        compensation: {
          baseSalary: {
            period: 'annual',
            grossAmount: euro('90000.00'),
            paymentsPerYear: 12,
          },
        },
      },
    } satisfies SalaryAlternativeInput

    expect(
      salaryIncrease.alternative.compensation.baseSalary.grossAmount.amount,
    ).toBe('90000.00')
  })
})
