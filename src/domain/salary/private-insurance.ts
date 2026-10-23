/** NP-CALC-013: source-backed 2026 private PKV and mandatory PPV payroll inputs. */
import type { FederalStateCode } from './types'

export type PrivateInsuranceValueSource =
  | 'elstam'
  | 'payslip'
  | 'insurer_notice'
  | 'user_estimate'

export interface PrivateInsuranceInput2026 {
  readonly calculationYear: number
  readonly coverageConfirmed: boolean
  readonly employerSubsidyEligibility: 'eligible' | 'not_eligible' | 'unknown'
  readonly employmentState: FederalStateCode | 'unknown'
  readonly valueSource: PrivateInsuranceValueSource
  readonly totalHealthPremiumCents: number
  readonly totalCarePremiumCents: number
  readonly subsidyEligibleHealthPremiumCents?: number
  readonly subsidyEligibleCarePremiumCents?: number
  readonly payrollBasicCoverageCents?: number
  readonly assessableEmploymentIncomeCents?: number
  readonly actualEmployerHealthSubsidyCents?: number
  readonly actualEmployerCareSubsidyCents?: number
  readonly disputedElstam?: boolean
  readonly unsupportedSpecialCase?: boolean
}

export type PrivateInsuranceResult2026 =
  | {
      readonly state: 'incomplete' | 'unsupported'
      readonly reason: string
      readonly assumptionSetId: 'de-private-health-insurance-2026-v1'
    }
  | {
      readonly state: 'calculated'
      readonly calculationYear: 2026
      readonly assumptionSetId: 'de-private-health-insurance-2026-v1'
      readonly resultQuality: 'payroll_aligned' | 'guided_estimate'
      readonly sourceIds: readonly string[]
      readonly totalHealthPremiumCents: number
      readonly totalCarePremiumCents: number
      readonly healthEmployerCapCents: number
      readonly careEmployerCapCents: number
      readonly employerHealthSubsidyCents: number
      readonly employerCareSubsidyCents: number
      readonly employerSubsidyTotalCents: number
      readonly employeeHealthCostCents: number
      readonly employeeCareCostCents: number
      readonly employeeAfterInsuranceCostCents: number
      readonly pap: {
        readonly PKV: 1
        readonly PKPV: number
        readonly PKPVAGZ: number
      }
    }

const missing = (
  state: 'incomplete' | 'unsupported',
  reason: string,
): PrivateInsuranceResult2026 => ({
  state,
  reason,
  assumptionSetId: 'de-private-health-insurance-2026-v1',
})

const checked = (
  amount: number | undefined,
  name: string,
): bigint | undefined => {
  if (amount === undefined) return undefined
  if (!Number.isSafeInteger(amount) || amount < 0) {
    throw new RangeError(name + ' must be a non-negative safe integer in cents')
  }
  return BigInt(amount)
}

const cents = (value: bigint): number => {
  const result = Number(value)
  if (!Number.isSafeInteger(result))
    throw new RangeError('Result exceeds safe integer range')
  return result
}

const halfUp = (numerator: bigint, denominator: bigint): bigint =>
  (numerator * 2n + denominator) / (2n * denominator)

const minimum = (left: bigint, right: bigint): bigint =>
  left < right ? left : right

export const calculatePrivateInsurance2026 = (
  input: PrivateInsuranceInput2026,
): PrivateInsuranceResult2026 => {
  if (input.calculationYear !== 2026) {
    throw new RangeError('Only 2026 private-insurance rules are implemented')
  }
  const health = checked(
    input.totalHealthPremiumCents,
    'totalHealthPremiumCents',
  )
  const care = checked(
    input.totalCarePremiumCents,
    'totalCarePremiumCents',
  )
  const healthEligible = checked(
    input.subsidyEligibleHealthPremiumCents,
    'subsidyEligibleHealthPremiumCents',
  )
  const careEligible = checked(
    input.subsidyEligibleCarePremiumCents,
    'subsidyEligibleCarePremiumCents',
  )
  const basic = checked(
    input.payrollBasicCoverageCents,
    'payrollBasicCoverageCents',
  )
  const income = checked(
    input.assessableEmploymentIncomeCents,
    'assessableEmploymentIncomeCents',
  )
  const actualHealth = checked(
    input.actualEmployerHealthSubsidyCents,
    'actualEmployerHealthSubsidyCents',
  )
  const actualCare = checked(
    input.actualEmployerCareSubsidyCents,
    'actualEmployerCareSubsidyCents',
  )

  if (input.unsupportedSpecialCase)
    return missing('unsupported', 'special_employment_case')
  if (!input.coverageConfirmed)
    return missing('incomplete', 'private_coverage_not_confirmed')
  if (input.disputedElstam)
    return missing('incomplete', 'elstam_disputed')
  if (input.employerSubsidyEligibility === 'unknown')
    return missing('incomplete', 'subsidy_eligibility_unknown')
  if (input.employmentState === 'unknown')
    return missing('incomplete', 'employment_state_unknown')
  if (basic === undefined)
    return missing('incomplete', 'tax_eligible_amount_missing')
  if (income === undefined)
    return missing('incomplete', 'assessable_income_missing')
  if (health === undefined || care === undefined)
    return missing('incomplete', 'total_premium_missing')
  if (basic > health + care)
    return missing('unsupported', 'basic_contribution_exceeds_total')
  if (healthEligible !== undefined && healthEligible > health) {
    return missing('unsupported', 'eligible_health_exceeds_total')
  }
  if (careEligible !== undefined && careEligible > care) {
    return missing('unsupported', 'eligible_care_exceeds_total')
  }

  const cappedIncome = minimum(income, 581250n)
  const healthCap = halfUp(cappedIncome * 875n, 10000n)
  const careRate = input.employmentState === 'DE-SN' ? 130n : 180n
  const careCap = halfUp(cappedIncome * careRate, 10000n)
  if (
    input.employerSubsidyEligibility === 'eligible' &&
    ((healthEligible === undefined && actualHealth === undefined) ||
      (careEligible === undefined && actualCare === undefined))
  ) {
    return missing('incomplete', 'subsidy_eligible_contribution_missing')
  }
  const maxHealth =
    healthEligible === undefined
      ? healthCap
      : minimum(halfUp(healthEligible, 2n), healthCap)
  const maxCare =
    careEligible === undefined
      ? careCap
      : minimum(halfUp(careEligible, 2n), careCap)

  if (
    input.employerSubsidyEligibility === 'not_eligible' &&
    ((actualHealth ?? 0n) > 0n || (actualCare ?? 0n) > 0n)
  ) {
    return missing('unsupported', 'ineligible_employee_has_subsidy')
  }
  const employerHealth =
    input.employerSubsidyEligibility === 'not_eligible'
      ? 0n
      : (actualHealth ?? maxHealth)
  const employerCare =
    input.employerSubsidyEligibility === 'not_eligible'
      ? 0n
      : (actualCare ?? maxCare)
  if (employerHealth > maxHealth || employerCare > maxCare) {
    return missing('unsupported', 'employer_subsidy_exceeds_statutory_cap')
  }
  if (employerHealth > health || employerCare > care) {
    return missing('unsupported', 'employer_subsidy_exceeds_premium')
  }
  if (
    (healthEligible !== undefined &&
      employerHealth * 2n > healthEligible + 1n) ||
    (careEligible !== undefined && employerCare * 2n > careEligible + 1n)
  ) {
    return missing('unsupported', 'employer_subsidy_exceeds_eligible_half')
  }
  const subsidy = employerHealth + employerCare
  if (subsidy > basic) {
    return missing(
      'unsupported',
      'subsidy_exceeds_tax_eligible_basic_contribution',
    )
  }
  return {
    state: 'calculated',
    calculationYear: 2026,
    assumptionSetId: 'de-private-health-insurance-2026-v1',
    resultQuality:
      actualHealth !== undefined &&
      actualCare !== undefined &&
      (input.valueSource === 'elstam' || input.valueSource === 'payslip')
        ? 'payroll_aligned'
        : 'guided_estimate',
    sourceIds: [
      'DE-SGB5-257',
      'DE-SGB11-61',
      'DE-SGB11-58',
      'DE-BMF-PAP-2026-A1',
    ],
    totalHealthPremiumCents: cents(health),
    totalCarePremiumCents: cents(care),
    healthEmployerCapCents: cents(healthCap),
    careEmployerCapCents: cents(careCap),
    employerHealthSubsidyCents: cents(employerHealth),
    employerCareSubsidyCents: cents(employerCare),
    employerSubsidyTotalCents: cents(subsidy),
    employeeHealthCostCents: cents(health - employerHealth),
    employeeCareCostCents: cents(care - employerCare),
    employeeAfterInsuranceCostCents: cents(health + care - subsidy),
    pap: { PKV: 1, PKPV: cents(basic), PKPVAGZ: cents(subsidy) },
  }
}
