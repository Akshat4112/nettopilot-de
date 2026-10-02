/**
 * Canonical salary-domain vocabulary.
 *
 * These types describe meaning and units only. NP-CALC-002 owns parsing and
 * runtime validation, while year-specific legal options come from the approved
 * assumption registry.
 */

declare const salaryDomainBrand: unique symbol

type Brand<Value, Name extends string> = Value & {
  readonly [salaryDomainBrand]: Name
}

export type CalculationYear = Brand<number, 'CalculationYear'>
export type DecimalString = Brand<string, 'DecimalString'>
export type IsoDate = Brand<string, 'IsoDate'>
export type ScenarioLabel = Brand<string, 'ScenarioLabel'>
export type BenefitLabel = Brand<string, 'BenefitLabel'>
export type RegistryOptionId = Brand<string, 'RegistryOptionId'>
export type AssumptionSetId = Brand<string, 'AssumptionSetId'>
export type SemverString = Brand<string, 'SemverString'>

export type ExplicitUnknown = 'unknown'
export type Locale = 'de-DE' | 'en-DE'
export type Currency = 'EUR'
export type PayPeriod = 'monthly' | 'annual'
export type CompensationGuarantee = 'guaranteed' | 'variable'
export type BenefitCertainty = 'guaranteed' | 'conditional' | ExplicitUnknown

export interface EuroAmount {
  readonly amount: DecimalString
  readonly currency: Currency
}

export interface PercentageRate {
  /** Percentage points as entered or published, for example `2.5` for 2.5%. */
  readonly value: DecimalString
  readonly unit: 'percent'
}

export interface CalculationContext {
  readonly calculationYear: CalculationYear
  readonly locale: Locale
  readonly currency: Currency
  readonly scenarioLabel?: ScenarioLabel
}

export interface ResolvedScenarioMetadata {
  readonly scopeVersion: SemverString
  readonly inputContractVersion: SemverString
  readonly assumptionSetId: AssumptionSetId
  readonly calculationEngineVersion: SemverString
}

export type EmploymentCategory =
  | 'regular_employee_full_time'
  | 'regular_employee_part_time'
  | 'unsupported_other'

export type PayrollCountry = 'DE' | 'unsupported_other'

export type SpecialEmploymentCase =
  | 'none'
  | 'mini_job'
  | 'midijob'
  | 'working_student'
  | 'short_time_work'
  | 'severance'
  | 'company_car'
  | 'complex_equity'
  | 'other'
  | ExplicitUnknown

export interface ScopeAdmissionInput {
  readonly employmentCategory: EmploymentCategory
  readonly payrollCountry: PayrollCountry
  readonly crossBorderTreatmentRequired: boolean | ExplicitUnknown
  readonly simultaneousEmploymentCount: number | ExplicitUnknown
  readonly specialEmploymentCase: SpecialEmploymentCase
}

export interface BaseSalary {
  readonly period: PayPeriod
  readonly grossAmount: EuroAmount
  readonly paymentsPerYear: 12
}

export type RegularAdditionalCash =
  | {
      readonly kind: 'none'
      readonly amount: EuroAmount
    }
  | {
      readonly kind: 'included'
      readonly amount: EuroAmount
      readonly period: PayPeriod
      readonly guarantee: CompensationGuarantee
    }

export interface OneOffPayment {
  readonly amount: EuroAmount
  readonly paymentMonth: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
  readonly classification: RegistryOptionId
  readonly guarantee: CompensationGuarantee
  readonly label?: ScenarioLabel
}

export interface CompensationInput {
  readonly baseSalary: BaseSalary
  readonly regularAdditionalCash: RegularAdditionalCash
  readonly oneOffPayments: readonly OneOffPayment[]
}

export type FederalStateCode =
  | 'DE-BB'
  | 'DE-BE'
  | 'DE-BW'
  | 'DE-BY'
  | 'DE-HB'
  | 'DE-HE'
  | 'DE-HH'
  | 'DE-MV'
  | 'DE-NI'
  | 'DE-NW'
  | 'DE-RP'
  | 'DE-SH'
  | 'DE-SL'
  | 'DE-SN'
  | 'DE-ST'
  | 'DE-TH'

export type ChurchTaxStatus = 'liable' | 'not_liable' | ExplicitUnknown

export interface WageTaxInput {
  readonly taxClass: RegistryOptionId
  readonly federalState: FederalStateCode
  readonly churchTaxStatus: ChurchTaxStatus
  readonly dateOfBirth: IsoDate
  readonly childAllowanceFactor: DecimalString
  readonly annualAllowanceAmount: EuroAmount
  readonly annualAdditionalAmount: EuroAmount
}

export type CareInsuranceChildStatus =
  'has_child' | 'childless' | ExplicitUnknown

export type EmployerContributionInput =
  | {
      readonly employerContributionKnown: false
    }
  | {
      readonly employerContributionKnown: true
      readonly employerContributionMonthly: EuroAmount
    }

export type StatutoryHealthInsuranceInput =
  | {
      readonly healthInsuranceType: 'statutory'
      readonly additionalRateMode: 'published_average'
    }
  | {
      readonly healthInsuranceType: 'statutory'
      readonly additionalRateMode: 'insurer_specific'
      readonly additionalContributionRate: PercentageRate
    }

export type PrivateHealthInsuranceInput = {
  readonly healthInsuranceType: 'private'
  readonly totalHealthPremiumMonthly: EuroAmount
  readonly totalCarePremiumMonthly: EuroAmount
  readonly payrollBasicCoverageAmountMonthly?: EuroAmount
} & EmployerContributionInput

export interface UnknownHealthInsuranceInput {
  readonly healthInsuranceType: ExplicitUnknown
}

export type HealthInsuranceInput =
  | StatutoryHealthInsuranceInput
  | PrivateHealthInsuranceInput
  | UnknownHealthInsuranceInput

export interface SocialInsuranceInput {
  readonly pensionStatus: RegistryOptionId | ExplicitUnknown
  readonly unemploymentStatus: RegistryOptionId | ExplicitUnknown
  readonly careInsuranceChildStatus: CareInsuranceChildStatus
  readonly childrenUnderRelevantAge: number | ExplicitUnknown
  readonly health: HealthInsuranceInput
}

export interface ComparisonBenefit {
  readonly label: BenefitLabel
  readonly employerValueAnnual?: EuroAmount
  readonly userValueAnnual?: EuroAmount
  readonly certainty: BenefitCertainty
}

export interface ComparisonInput {
  readonly weeklyHours?: DecimalString
  readonly vacationDaysAnnual?: DecimalString
  readonly remoteDaysPerWeek?: DecimalString
  readonly commuteOneWayKm?: DecimalString
  readonly benefits: readonly ComparisonBenefit[]
}

export interface IndividualSalaryScenarioInput {
  readonly context: CalculationContext
  readonly scope: ScopeAdmissionInput
  readonly compensation: CompensationInput
  readonly tax: WageTaxInput
  readonly social: SocialInsuranceInput
  readonly comparison: ComparisonInput
}

export interface SalaryAlternativeOverrides {
  readonly scenarioLabel?: ScenarioLabel
  readonly compensation?: Partial<CompensationInput>
  readonly comparison?: Partial<ComparisonInput>
}

/**
 * A salary-increase scenario shares its personal, tax, insurance, scope, and
 * calculation-year assumptions with the current scenario. Only compensation
 * and comparison fields may be overridden.
 */
export interface SalaryAlternativeInput {
  readonly current: IndividualSalaryScenarioInput
  readonly alternative: SalaryAlternativeOverrides
}

export interface OfferComparisonInput {
  readonly offers: readonly [
    IndividualSalaryScenarioInput,
    IndividualSalaryScenarioInput,
  ]
}

export interface CoupleScenarioInput {
  readonly personA: IndividualSalaryScenarioInput
  readonly personB: IndividualSalaryScenarioInput
}
