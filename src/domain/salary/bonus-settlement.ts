import { prepareBonus2026, type BonusPreparationInput2026 } from './bonus'
import {
  calculateAllocatedOneOffPensionContribution2026,
  type PensionCoverageStatus,
} from './pension'
import {
  calculateAllocatedOneOffUnemploymentContribution2026,
  type UnemploymentCoverageStatus,
} from './unemployment'
import {
  calculateAllocatedOneOffHealthContribution2026,
  type HealthAdditionalRateInput,
} from './health'
import {
  calculateAllocatedOneOffCareContribution2026,
  type CareContributionInput,
} from './care'

export interface BonusSettlementInput2026 {
  readonly bonus: BonusPreparationInput2026
  readonly pensionCoverage: PensionCoverageStatus
  readonly unemploymentCoverage: UnemploymentCoverageStatus
  readonly healthRate: HealthAdditionalRateInput
  readonly care: Omit<
    CareContributionInput,
    'liablePayCents' | 'contributionDays' | 'includesOneOffPay' | 'payrollMonth'
  >
  /** Only confirmed non-liability is admitted until the state-rate registry is approved. */
  readonly churchTaxStatus: 'not_liable' | 'liable' | 'unknown'
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
  if (!Number.isSafeInteger(result))
    throw new RangeError('Bonus amounts exceed safe cents')
  return result
}

export const calculateBonusSettlement2026 = (
  input: BonusSettlementInput2026,
): BonusSettlement2026 => {
  const bonus = prepareBonus2026(input.bonus)
  if (bonus.state !== 'prepared')
    return { state: bonus.state, reason: bonus.reason }
  if (input.churchTaxStatus === 'unknown')
    return { state: 'incomplete', reason: 'church_tax_status_unknown' }
  if (input.churchTaxStatus === 'liable')
    return {
      state: 'unsupported',
      reason: 'church_tax_rate_evidence_not_approved',
    }
  const pension = calculateAllocatedOneOffPensionContribution2026({
    calculationYear: 2026,
    contributionDays: 30,
    liablePayCents: bonus.rvAvLiableCents,
    coverageStatus: input.pensionCoverage,
  })
  const unemployment = calculateAllocatedOneOffUnemploymentContribution2026({
    calculationYear: 2026,
    contributionDays: 30,
    liablePayCents: bonus.rvAvLiableCents,
    coverageStatus: input.unemploymentCoverage,
  })
  if (pension.state !== 'calculated' || unemployment.state !== 'calculated')
    return {
      state: 'unsupported',
      reason: 'pension_or_unemployment_scope_unsupported',
    }
  let employeeHealth = 0
  let employerHealth = 0
  let employeeCare = 0
  let employerCare = 0
  if (input.bonus.insurancePath === 'statutory') {
    const health = calculateAllocatedOneOffHealthContribution2026({
      calculationYear: 2026,
      contributionDays: 30,
      liablePayCents: bonus.kvPvLiableCents,
      coverageStatus: 'statutory_mandatory_general',
      additionalRate: input.healthRate,
    })
    const care = calculateAllocatedOneOffCareContribution2026({
      ...input.care,
      calculationYear: 2026,
      payrollMonth: input.bonus.paymentMonth,
      contributionDays: 30,
      liablePayCents: bonus.kvPvLiableCents,
    })
    if (health.state !== 'calculated' || care.state !== 'calculated')
      return {
        state: 'unsupported',
        reason: 'health_or_care_scope_unsupported',
      }
    employeeHealth = health.contribution.employeeCents
    employerHealth = health.contribution.employerCents
    employeeCare = care.contribution.employeeCents
    employerCare = care.contribution.employerCents
  }
  const employeeInsuranceCents = sum(
    pension.contribution.employeeCents,
    unemployment.contribution.employeeCents,
    employeeHealth,
    employeeCare,
  )
  const employerInsuranceCents = sum(
    pension.contribution.employerCents,
    unemployment.contribution.employerCents,
    employerHealth,
    employerCare,
  )
  return {
    state: 'calculated',
    grossCents: bonus.grossPaymentCents,
    wageTaxCents: bonus.otherRemunerationWageTaxCents,
    solidarityCents: bonus.otherRemunerationSoliCents,
    churchTaxCents: 0,
    employeeInsuranceCents,
    employerInsuranceCents,
    netBonusCents: sum(
      bonus.grossPaymentCents,
      -bonus.otherRemunerationWageTaxCents,
      -bonus.otherRemunerationSoliCents,
      0,
      -employeeInsuranceCents,
    ),
    incrementalEmployerCostCents: sum(
      bonus.grossPaymentCents,
      employerInsuranceCents,
    ),
  }
}
