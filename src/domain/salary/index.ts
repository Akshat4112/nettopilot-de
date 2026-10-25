export type {
  AssumptionSetId,
  BaseSalary,
  BenefitCertainty,
  BenefitLabel,
  CalculationContext,
  CalculationYear,
  CareInsuranceChildStatus,
  ChurchTaxStatus,
  ComparisonBenefit,
  ComparisonInput,
  CompensationGuarantee,
  CompensationInput,
  CoupleScenarioInput,
  Currency,
  DecimalString,
  EmploymentCategory,
  EmployerContributionInput,
  EuroAmount,
  ExplicitUnknown,
  FederalStateCode,
  HealthInsuranceInput,
  IndividualSalaryScenarioInput,
  IsoDate,
  Locale,
  OfferComparisonInput,
  OneOffPayment,
  PayPeriod,
  PayrollCountry,
  PercentageRate,
  PrivateHealthInsuranceInput,
  RegistryOptionId,
  RegularAdditionalCash,
  ResolvedScenarioMetadata,
  SalaryAlternativeInput,
  SalaryAlternativeOverrides,
  ScenarioLabel,
  ScopeAdmissionInput,
  SemverString,
  SocialInsuranceInput,
  SpecialEmploymentCase,
  StatutoryHealthInsuranceInput,
  UnknownHealthInsuranceInput,
  WageTaxInput,
} from './types'

export { validateIndividualSalaryScenario } from './validation'
export {
  ExactDecimal,
  addDecimals,
  addEuroCents,
  compareDecimals,
  decimal,
  divideDecimals,
  euroAmountToCents,
  euroCentsToAmount,
  formatEuroCents,
  fromEuroCents,
  multiplyByPercentage,
  multiplyCentsByPercentage,
  multiplyDecimals,
  percentToRatio,
  quantizeDecimal,
  subtractDecimals,
  subtractEuroCents,
  sumEuroCents,
  toEuroCents,
} from './precision'
export type { CentConversionMode, EuroCents, RoundingMode } from './precision'
export {
  addExactEuroQuotients,
  exactEuroQuotientToCents,
  exactEuroQuotientToDecimal,
  normalizeCompensation,
  sumExactEuroQuotients,
  sumExactEuroQuotientsToCents,
} from './frequency'
export type {
  ExactEuroQuotient,
  NormalizedAnnualCompensation,
  NormalizedCompensation,
  NormalizedMonthlyCompensation,
  NormalizedOneOffPayment,
  NormalizedRecurringComponent,
  PayrollMonth,
} from './frequency'
export {
  type PapInput,
  type PapPrepared,
  prepareTaxablePay,
  buildPapInput,
} from './taxable-pay'
export type {
  LocalizedValidationMessage,
  SalaryValidationIssue,
  SalaryValidationResult,
  SalaryValidationRules,
  ValidationIssueCode,
} from './validation'
export { calculatePayrollTax2026 } from './payroll-tax'
export type { PayrollTaxResult, PayrollTaxTrace } from './payroll-tax'
export {
  calculateOtherRemunerationSolidaritySurcharge2026,
  calculateSolidaritySurcharge2026,
} from './solidarity-surcharge'
export {
  CHURCH_TAX_STATE_REGISTRY_2026,
  calculateChurchTax2026,
  calculateChurchTaxFromPayrollTax2026,
} from './church-tax'
export type {
  ApprovedChurchTaxRule2026,
  ChurchTaxCalculatedResult,
  ChurchTaxCalculationScope,
  ChurchTaxEvidenceStatus,
  ChurchTaxExceptionStatus,
  ChurchTaxInput2026,
  ChurchTaxResult,
  ChurchTaxStateRecord2026,
  ChurchTaxUnavailableReason,
  ChurchTaxUnavailableResult,
} from './church-tax'
export type {
  OtherRemunerationSolidaritySurchargeInput,
  OtherRemunerationSolidaritySurchargeResult,
  SolidaritySurchargeInput,
  SolidaritySurchargePaymentPeriod,
  SolidaritySurchargeResult,
  SolidaritySurchargeZone,
} from './solidarity-surcharge'
export {
  calculateAnnualPensionContribution2026,
  calculatePensionContribution2026,
  calculatePensionFromNormalizedCompensation2026,
} from './pension'
export {
  calculateAnnualUnemploymentContribution2026,
  calculateUnemploymentContribution2026,
  calculateUnemploymentFromNormalizedCompensation2026,
} from './unemployment'
export type {
  AnnualUnemploymentContributionResult,
  UnemploymentContributionAmount,
  UnemploymentContributionInput,
  UnemploymentContributionResult,
  UnemploymentCoverageStatus,
  UnemploymentResult,
  UnemploymentUnavailableReason,
  UnemploymentUnavailableResult,
} from './unemployment'
export type {
  AnnualPensionContributionResult,
  PensionContributionAmount,
  PensionContributionInput,
  PensionContributionResult,
  PensionCoverageStatus,
  PensionResult,
  PensionUnavailableReason,
  PensionUnavailableResult,
} from './pension'

export {
  calculateAnnualStatutoryHealthContribution2026,
  calculateHealthFromNormalizedCompensation2026,
  calculateStatutoryHealthContribution2026,
} from './health'
export type {
  AnnualHealthContributionResult,
  HealthAdditionalRateInput,
  HealthContributionAmount,
  HealthContributionInput,
  HealthContributionResult,
  HealthCoverageStatus,
  HealthResult,
  HealthUnavailableReason,
  HealthUnavailableResult,
} from './health'

export {
  calculateAnnualCareContribution2026,
  calculateCareContribution2026,
  calculateCareFromNormalizedCompensation2026,
} from './care'
export type {
  AnnualCareContributionInput,
  AnnualCareContributionResult,
  CareContributionAmount,
  CareContributionInput,
  CareContributionResult,
  CareEmploymentState,
  CareEvidenceStatus,
  CareInsurancePath,
  CareParentStatus,
  CareResult,
  CareUnavailableReason,
  CareUnavailableResult,
} from './care'

export { calculatePrivateInsurance2026 } from './private-insurance'
export type {
  PrivateInsuranceInput2026,
  PrivateInsuranceResult2026,
  PrivateInsuranceValueSource,
} from './private-insurance'

export { calculateAnnualPrivateInsurance2026 } from './private-insurance-annual'
export type { PrivateInsuranceAnnualResult2026 } from './private-insurance-annual'

export { prepareBonus2026, BONUS_CLASS_REGISTRY_2026 } from './bonus'
export type {
  BonusClass2026,
  BonusPreparationInput2026,
  BonusPreparationResult2026,
} from './bonus'

export { prepareBonusSequence2026 } from './bonus-sequence'
export type { BonusSequence2026 } from './bonus-sequence'

export { calculateBonusSettlement2026 } from './bonus-settlement'
export type {
  BonusSettlementInput2026,
  BonusSettlement2026,
} from './bonus-settlement'

export { calculateBonusSettlementSequence2026 } from './bonus-settlement-sequence'
export type { BonusSettlementSequence2026 } from './bonus-settlement-sequence'

export { aggregateSalaryResults2026 } from './salary-aggregation'
export type {
  SalaryMonthAdmission2026,
  SalaryMonthComponents2026,
  SalaryPeriodTotals2026,
  SalaryAggregationResult2026,
  AggregatedBonus2026,
} from './salary-aggregation'

export { explainSalaryResults2026, SALARY_EXPLANATION_FIELDS_2026 } from './salary-explanations'
export type { SalaryExplanation2026, SalaryExplanationField2026, SalaryExplanationInput2026, SalaryExplanationLineItem2026, SalaryLineItemProvenance2026 } from './salary-explanations'
