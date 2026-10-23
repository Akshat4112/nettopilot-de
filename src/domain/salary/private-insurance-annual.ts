import {
  calculatePrivateInsurance2026,
  type PrivateInsuranceInput2026,
  type PrivateInsuranceResult2026,
} from './private-insurance'

type CalculatedMonth = Extract<
  PrivateInsuranceResult2026,
  { readonly state: 'calculated' }
>

export type PrivateInsuranceAnnualResult2026 =
  | {
      readonly state: 'incomplete' | 'unsupported'
      readonly month?: number
      readonly reason: string
    }
  | {
      readonly state: 'calculated'
      readonly calculationYear: 2026
      readonly months: readonly CalculatedMonth[]
      readonly annualEmployerHealthSubsidyCents: number
      readonly annualEmployerCareSubsidyCents: number
      readonly annualPremiumsCents: number
      readonly annualAfterInsuranceCostCents: number
    }

const safeSum = (items: readonly number[]): number => {
  const sum = items.reduce((total, item) => total + BigInt(item), 0n)
  const value = Number(sum)
  if (!Number.isSafeInteger(value))
    throw new RangeError('Annual private insurance sum exceeds safe precision')
  return value
}

/**
 * Calculate each month's premium and employer subsidy separately.
 * Never extrapolate one month over an annual premium change.
 */
export const calculateAnnualPrivateInsurance2026 = (
  inputs: readonly PrivateInsuranceInput2026[],
): PrivateInsuranceAnnualResult2026 => {
  if (inputs.length !== 12)
    return { state: 'incomplete', reason: 'twelve_months_required' }
  const months: CalculatedMonth[] = []
  for (const [index, input] of inputs.entries()) {
    const result = calculatePrivateInsurance2026(input)
    if (result.state !== 'calculated')
      return { state: result.state, reason: result.reason, month: index + 1 }
    months.push(result)
  }
  return {
    state: 'calculated',
    calculationYear: 2026,
    months,
    annualEmployerHealthSubsidyCents: safeSum(
      months.map((month) => month.employerHealthSubsidyCents),
    ),
    annualEmployerCareSubsidyCents: safeSum(
      months.map((month) => month.employerCareSubsidyCents),
    ),
    annualPremiumsCents: safeSum(
      months.map(
        (month) =>
          month.totalHealthPremiumCents + month.totalCarePremiumCents,
      ),
    ),
    annualAfterInsuranceCostCents: safeSum(
      months.map((month) => month.employeeAfterInsuranceCostCents),
    ),
  }
}
