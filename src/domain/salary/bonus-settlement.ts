import { prepareBonus2026, type BonusPreparationInput2026 } from './bonus'
import { calculatePensionContribution2026, type PensionCoverageStatus } from './pension'
import { calculateUnemploymentContribution2026, type UnemploymentCoverageStatus } from './unemployment'
import { calculateStatutoryHealthContribution2026, type HealthAdditionalRateInput } from './health'
import { calculateCareContribution2026, type CareContributionInput } from './care'

export interface BonusSettlementInput2026 {
  readonly bonus: BonusPreparationInput2026
  readonly pensionCoverage: PensionCoverageStatus
  readonly unemploymentCoverage: UnemploymentCoverageStatus
  readonly healthRate: HealthAdditionalRateInput
  readonly care: Omit<CareContributionInput, 'liablePayCents' | 'contributionDays' | 'includesOneOffPay' | 'payrollMonth'>
  /** Verified 2026 state-specific church tax on the PAP other-remuneration base. */
  readonly churchTaxCents: number | 'unknown'
}

export type BonusSettlement2026 =
  | { readonly state: 'incomplete' | 'unsupported'; readonly reason: string }
  | {
      readonly state: 'calculated'
      readonly grossCents: number
      readonly wageTaxCents: number
      readonly solidarityCents: number
      readonly churchTaxCents: number
      readonly employeeInsuranceCents: number
      readonly employerInsuranceCents: number
      readonly netBonusCents: number
      readonly incrementalEmployerCostCents: number
    }

const sum = (...numbers: number[]): number => {
  const value = numbers.reduce((total, n) => total + BigInt(n), 0n)
  const result = Number(value)
  if (!Number.isSafeInteger(result)) throw new RangeError('Bonus amounts exceed safe cents')
  return result
}

export const calculateBonusSettlement2026 = (
  input: BonusSettlementInput2026,
): BonusSettlement2026 => {
  const bonus = prepareBonus2026(input.bonus)
  if (bonus.state !== 'prepared') return { state: bonus.state, reason: bonus.reason }
  if (input.churchTaxCents === 'unknown')
    return { state: 'incomplete', reason: 'church_tax_calculation_required' }
  if (!Number.isSafeInteger(input.churchTaxCents) || input.churchTaxCents < 0)
    throw new RangeError('churchTaxCents must be non-negative integer cents')
  // Existing monthly insurance modules cap the contribution basis at one month.
  // Do not undercharge a large one-time payment by applying that cap twice.
  if (bonus.rvAvLiableCents > 845000 || bonus.kvPvLiableCents > 581250)
    return { state: 'unsupported', reason: 'one_time_above_monthly_module_limit' }
  const pension = calculatePensionContribution2026({
    calculationYear: 2026, contributionDays: 30,
    liablePayCents: bonus.rvAvLiableCents, coverageStatus: input.pensionCoverage,
  })
  const unemployment = calculateUnemploymentContribution2026({
    calculationYear: 2026, contributionDays: 30,
    liablePayCents: bonus.rvAvLiableCents, coverageStatus: input.unemploymentCoverage,
  })
  if (pension.state !== 'calculated' || unemployment.state !== 'calculated')
    return { state: 'unsupported', reason: 'pension_or_unemployment_scope_unsupported' }
  let employeeHealth = 0
  let employerHealth = 0
  let employeeCare = 0
  let employerCare = 0
  if (input.bonus.insurancePath === 'statutory') {
    const health = calculateStatutoryHealthContribution2026({
      calculationYear: 2026, contributionDays: 30,
      liablePayCents: bonus.kvPvLiableCents,
      coverageStatus: 'statutory_mandatory_general',
      additionalRate: input.healthRate,
    })
    const care = calculateCareContribution2026({
      ...input.care, calculationYear: 2026,
      payrollMonth: input.bonus.paymentMonth, contributionDays: 30,
      liablePayCents: bonus.kvPvLiableCents,
    })
    if (health.state !== 'calculated' || care.state !== 'calculated')
      return { state: 'unsupported', reason: 'health_or_care_scope_unsupported' }
    employeeHealth = health.contribution.employeeCents
    employerHealth = health.contribution.employerCents
    employeeCare = care.contribution.employeeCents
    employerCare = care.contribution.employerCents
  }
  const employeeInsuranceCents = sum(
    pension.contribution.employeeCents, unemployment.contribution.employeeCents,
    employeeHealth, employeeCare,
  )
  const employerInsuranceCents = sum(
    pension.contribution.employerCents, unemployment.contribution.employerCents,
    employerHealth, employerCare,
  )
  return {
    state: 'calculated',
    grossCents: bonus.grossPaymentCents,
    wageTaxCents: bonus.otherRemunerationWageTaxCents,
    solidarityCents: bonus.otherRemunerationSoliCents,
    churchTaxCents: input.churchTaxCents,
    employeeInsuranceCents,
    employerInsuranceCents,
    netBonusCents: sum(
      bonus.grossPaymentCents,
      -bonus.otherRemunerationWageTaxCents,
      -bonus.otherRemunerationSoliCents,
      -input.churchTaxCents,
      -employeeInsuranceCents,
    ),
    incrementalEmployerCostCents: sum(bonus.grossPaymentCents, employerInsuranceCents),
  }
}
