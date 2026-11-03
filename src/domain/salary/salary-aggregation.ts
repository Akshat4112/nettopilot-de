import type { BonusSettlement2026 } from './bonus-settlement'

/**
 * NP-CALC-015: pure monthly/annual arithmetic over independently validated
 * payroll results. No tax rates or contribution amounts are inferred here.
 * Every money value is integer EUR cents.
 */
export interface SalaryMonthComponents2026 {
  readonly month: number
  readonly recurringGrossCents: number
  readonly recurringWageTaxCents: number
  readonly recurringSolidarityCents: number
  readonly recurringChurchTaxCents: number
  readonly employeePensionCents: number
  readonly employeeUnemploymentCents: number
  readonly employeeHealthCents: number
  readonly employeeCareCents: number
  readonly employerPensionCents: number
  readonly employerUnemploymentCents: number
  readonly employerHealthCents: number
  readonly employerCareCents: number
  /** For PKV: premiums minus employer subsidy, paid outside regular payroll. */
  readonly privateInsuranceOutflowCents: number
  /** Guaranteed recurring amounts, for reliable offer comparison. */
  readonly guaranteedRecurringGrossCents: number
  /** One-off amounts must have been settled by the bonus domain module. */
  readonly oneOffPayments: readonly AggregatedBonus2026[]
}

export interface AggregatedBonus2026 {
  readonly guarantee: 'guaranteed' | 'variable'
  readonly settlement: BonusSettlement2026
}

export type SalaryMonthAdmission2026 =
  | { readonly state: 'calculated'; readonly value: SalaryMonthComponents2026 }
  | { readonly state: 'incomplete' | 'unsupported'; readonly reason: string }

export interface SalaryPeriodTotals2026 {
  readonly grossCents: number
  readonly recurringGrossCents: number
  readonly guaranteedGrossCents: number
  readonly variableGrossCents: number
  readonly oneOffGrossCents: number
  readonly wageTaxCents: number
  readonly solidarityCents: number
  readonly churchTaxCents: number
  readonly employeePensionCents: number
  readonly employeeUnemploymentCents: number
  readonly employeeHealthCents: number
  readonly employeeCareCents: number
  readonly oneOffEmployeeSocialInsuranceCents: number
  readonly employeeSocialInsuranceCents: number
  readonly privateInsuranceOutflowCents: number
  readonly allDeductionsCents: number
  readonly netPayrollCents: number
  readonly disposableAfterPrivateInsuranceCents: number
  readonly employerPensionCents: number
  readonly employerUnemploymentCents: number
  readonly employerHealthCents: number
  readonly employerCareCents: number
  readonly oneOffEmployerSocialInsuranceCents: number
  readonly employerSocialInsuranceCents: number
  readonly employerCostCents: number
  /** Effective deduction ratio to 6 decimal places, not a tax rate. */
  readonly effectiveDeductionRatePartsPerMillion: number | null
}

export type SalaryAggregationResult2026 =
  | {
      readonly state: 'incomplete' | 'unsupported'
      readonly month: number
      readonly reason: string
    }
  | {
      readonly state: 'calculated'
      readonly calculationYear: 2026
      readonly months: readonly (SalaryPeriodTotals2026 & {
        readonly month: number
      })[]
      readonly annual: SalaryPeriodTotals2026
      readonly recurringMonthlyNetCents: number | null
      readonly recurringMonthlyNetIsStable: boolean
    }

const money = (value: number, name: string): bigint => {
  if (!Number.isSafeInteger(value) || value < 0)
    throw new RangeError(name + ' must be non-negative safe integer cents')
  return BigInt(value)
}
const safe = (value: bigint): number => {
  const number = Number(value)
  if (!Number.isSafeInteger(number))
    throw new RangeError('Salary total exceeds safe cents')
  return number
}
const sum = (values: readonly number[]): number =>
  safe(values.reduce((value, next) => value + BigInt(next), 0n))
const ratio = (deductions: number, gross: number): number | null =>
  gross === 0
    ? null
    : safe(
        (BigInt(deductions) * 1_000_000n + BigInt(gross) / 2n) / BigInt(gross),
      )

const aggregate = (
  values: readonly SalaryPeriodTotals2026[],
): SalaryPeriodTotals2026 => {
  const item = (key: keyof SalaryPeriodTotals2026): number =>
    sum(
      values.map((value) => {
        const numeric = value[key]
        if (typeof numeric !== 'number')
          throw new TypeError('Expected numeric salary component')
        return numeric
      }),
    )
  const grossCents = item('grossCents')
  const allDeductionsCents = item('allDeductionsCents')
  return {
    grossCents,
    recurringGrossCents: item('recurringGrossCents'),
    guaranteedGrossCents: item('guaranteedGrossCents'),
    variableGrossCents: item('variableGrossCents'),
    oneOffGrossCents: item('oneOffGrossCents'),
    wageTaxCents: item('wageTaxCents'),
    solidarityCents: item('solidarityCents'),
    churchTaxCents: item('churchTaxCents'),
    employeePensionCents: item('employeePensionCents'),
    employeeUnemploymentCents: item('employeeUnemploymentCents'),
    employeeHealthCents: item('employeeHealthCents'),
    employeeCareCents: item('employeeCareCents'),
    oneOffEmployeeSocialInsuranceCents: item(
      'oneOffEmployeeSocialInsuranceCents',
    ),
    employeeSocialInsuranceCents: item('employeeSocialInsuranceCents'),
    privateInsuranceOutflowCents: item('privateInsuranceOutflowCents'),
    allDeductionsCents,
    netPayrollCents: item('netPayrollCents'),
    disposableAfterPrivateInsuranceCents: item(
      'disposableAfterPrivateInsuranceCents',
    ),
    employerPensionCents: item('employerPensionCents'),
    employerUnemploymentCents: item('employerUnemploymentCents'),
    employerHealthCents: item('employerHealthCents'),
    employerCareCents: item('employerCareCents'),
    oneOffEmployerSocialInsuranceCents: item(
      'oneOffEmployerSocialInsuranceCents',
    ),
    employerSocialInsuranceCents: item('employerSocialInsuranceCents'),
    employerCostCents: item('employerCostCents'),
    effectiveDeductionRatePartsPerMillion: ratio(
      allDeductionsCents,
      grossCents,
    ),
  }
}

const calculateMonth = (
  month: SalaryMonthComponents2026,
):
  | SalaryPeriodTotals2026
  | { state: 'incomplete' | 'unsupported'; reason: string } => {
  const primitiveKeys = [
    'recurringGrossCents',
    'recurringWageTaxCents',
    'recurringSolidarityCents',
    'recurringChurchTaxCents',
    'employeePensionCents',
    'employeeUnemploymentCents',
    'employeeHealthCents',
    'employeeCareCents',
    'employerPensionCents',
    'employerUnemploymentCents',
    'employerHealthCents',
    'employerCareCents',
    'privateInsuranceOutflowCents',
    'guaranteedRecurringGrossCents',
  ] as const
  for (const key of primitiveKeys) money(month[key], key)
  if (month.guaranteedRecurringGrossCents > month.recurringGrossCents)
    return {
      state: 'unsupported',
      reason: 'guaranteed_recurring_exceeds_total',
    }
  const extras: Extract<BonusSettlement2026, { state: 'calculated' }>[] = []
  let guaranteedExtras = 0
  for (const entry of month.oneOffPayments) {
    if (entry.settlement.state !== 'calculated')
      return { state: entry.settlement.state, reason: entry.settlement.reason }
    const bonus = entry.settlement
    for (const key of [
      'grossCents',
      'wageTaxCents',
      'solidarityCents',
      'churchTaxCents',
      'employeeInsuranceCents',
      'employerInsuranceCents',
      'netBonusCents',
      'incrementalEmployerCostCents',
    ] as const) {
      if (key === 'netBonusCents') {
        if (!Number.isSafeInteger(bonus[key]))
          throw new RangeError('netBonusCents must be safe integer cents')
      } else money(bonus[key], key)
    }
    if (
      bonus.netBonusCents !==
      bonus.grossCents -
        bonus.wageTaxCents -
        bonus.solidarityCents -
        bonus.churchTaxCents -
        bonus.employeeInsuranceCents
    )
      return {
        state: 'unsupported',
        reason: 'bonus_cash_reconciliation_failed',
      }
    if (
      bonus.incrementalEmployerCostCents !==
      bonus.grossCents + bonus.employerInsuranceCents
    )
      return {
        state: 'unsupported',
        reason: 'bonus_employer_reconciliation_failed',
      }
    if (entry.guarantee === 'guaranteed') guaranteedExtras += bonus.grossCents
    extras.push(bonus)
  }
  const grossExtras = sum(extras.map((bonus) => bonus.grossCents))
  const grossCents = safe(
    BigInt(month.recurringGrossCents) + BigInt(grossExtras),
  )
  const recurringEmployeeInsurance = sum([
    month.employeePensionCents,
    month.employeeUnemploymentCents,
    month.employeeHealthCents,
    month.employeeCareCents,
  ])
  const bonusEmployeeInsurance = sum(
    extras.map((bonus) => bonus.employeeInsuranceCents),
  )
  const employeeSocialInsuranceCents = sum([
    recurringEmployeeInsurance,
    bonusEmployeeInsurance,
  ])
  const recurringEmployerInsurance = sum([
    month.employerPensionCents,
    month.employerUnemploymentCents,
    month.employerHealthCents,
    month.employerCareCents,
  ])
  const employerSocialInsuranceCents = sum([
    recurringEmployerInsurance,
    sum(extras.map((bonus) => bonus.employerInsuranceCents)),
  ])
  const wageTaxCents = sum([
    month.recurringWageTaxCents,
    ...extras.map((bonus) => bonus.wageTaxCents),
  ])
  const solidarityCents = sum([
    month.recurringSolidarityCents,
    ...extras.map((bonus) => bonus.solidarityCents),
  ])
  const churchTaxCents = sum([
    month.recurringChurchTaxCents,
    ...extras.map((bonus) => bonus.churchTaxCents),
  ])
  const payrollDeductions = sum([
    wageTaxCents,
    solidarityCents,
    churchTaxCents,
    employeeSocialInsuranceCents,
  ])
  const allDeductionsCents = sum([
    payrollDeductions,
    month.privateInsuranceOutflowCents,
  ])
  const netPayrollCents = safe(BigInt(grossCents) - BigInt(payrollDeductions))
  const disposableAfterPrivateInsuranceCents = safe(
    BigInt(netPayrollCents) - BigInt(month.privateInsuranceOutflowCents),
  )
  return {
    grossCents,
    recurringGrossCents: month.recurringGrossCents,
    guaranteedGrossCents: sum([
      month.guaranteedRecurringGrossCents,
      guaranteedExtras,
    ]),
    variableGrossCents: safe(
      BigInt(grossCents) -
        BigInt(month.guaranteedRecurringGrossCents) -
        BigInt(guaranteedExtras),
    ),
    oneOffGrossCents: grossExtras,
    wageTaxCents,
    solidarityCents,
    churchTaxCents,
    employeePensionCents: month.employeePensionCents,
    employeeUnemploymentCents: month.employeeUnemploymentCents,
    employeeHealthCents: month.employeeHealthCents,
    employeeCareCents: month.employeeCareCents,
    oneOffEmployeeSocialInsuranceCents: bonusEmployeeInsurance,
    employeeSocialInsuranceCents,
    privateInsuranceOutflowCents: month.privateInsuranceOutflowCents,
    allDeductionsCents,
    netPayrollCents,
    disposableAfterPrivateInsuranceCents,
    employerPensionCents: month.employerPensionCents,
    employerUnemploymentCents: month.employerUnemploymentCents,
    employerHealthCents: month.employerHealthCents,
    employerCareCents: month.employerCareCents,
    oneOffEmployerSocialInsuranceCents: sum(
      extras.map((bonus) => bonus.employerInsuranceCents),
    ),
    employerSocialInsuranceCents,
    employerCostCents: sum([grossCents, employerSocialInsuranceCents]),
    effectiveDeductionRatePartsPerMillion: ratio(
      allDeductionsCents,
      grossCents,
    ),
  }
}

export const aggregateSalaryResults2026 = (
  months: readonly SalaryMonthAdmission2026[],
): SalaryAggregationResult2026 => {
  if (months.length !== 12)
    return {
      state: 'incomplete',
      month: 0,
      reason: 'twelve_payroll_months_required',
    }
  const results: (SalaryPeriodTotals2026 & { readonly month: number })[] = []
  for (const [index, admission] of months.entries()) {
    if (admission.state !== 'calculated')
      return {
        state: admission.state,
        reason: admission.reason,
        month: index + 1,
      }
    if (admission.value.month !== index + 1)
      return {
        state: 'unsupported',
        reason: 'payroll_month_order_mismatch',
        month: index + 1,
      }
    const result = calculateMonth(admission.value)
    if ('state' in result)
      return { state: result.state, reason: result.reason, month: index + 1 }
    results.push({ ...result, month: index + 1 })
  }
  const annual = aggregate(results)
  const recurringNets = results.map((_, index) => {
    const details = months[index]
    if (details?.state !== 'calculated')
      throw new Error('Missing validated month')
    const value = details.value
    const employee = sum([
      value.employeePensionCents,
      value.employeeUnemploymentCents,
      value.employeeHealthCents,
      value.employeeCareCents,
    ])
    return safe(
      BigInt(value.recurringGrossCents) -
        BigInt(value.recurringWageTaxCents) -
        BigInt(value.recurringSolidarityCents) -
        BigInt(value.recurringChurchTaxCents) -
        BigInt(employee) -
        BigInt(value.privateInsuranceOutflowCents),
    )
  })
  const stable = recurringNets.every((value) => value === recurringNets[0])
  return {
    state: 'calculated',
    calculationYear: 2026,
    months: results,
    annual,
    recurringMonthlyNetCents: stable ? (recurringNets[0] ?? null) : null,
    recurringMonthlyNetIsStable: stable,
  }
}
