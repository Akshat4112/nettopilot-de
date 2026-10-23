import type { PapInput } from './taxable-pay'
import { calculatePayrollTax2026 } from './payroll-tax'

export type BonusClass2026 =
  | 'monthly_recurring_bonus'
  | 'performance_bonus'
  | 'thirteenth_salary'
  | 'christmas_payment'
  | 'holiday_payment'
  | 'gratuity'

export const BONUS_CLASS_REGISTRY_2026 = {
  monthly_recurring_bonus: {
    tax: 'running',
    social: 'recurring',
  },
  performance_bonus: {
    tax: 'other',
    social: 'one_time',
  },
  thirteenth_salary: {
    tax: 'other',
    social: 'one_time',
  },
  christmas_payment: {
    tax: 'other',
    social: 'one_time',
  },
  holiday_payment: {
    tax: 'other',
    social: 'one_time',
  },
  gratuity: {
    tax: 'other',
    social: 'one_time',
  },
} as const

export interface BonusPreparationInput2026 {
  readonly calculationYear: 2026
  readonly classification: BonusClass2026 | 'unknown'
  readonly paymentMonth: number
  readonly grossPaymentCents: number
  readonly expectedRunningAnnualPayCents: number
  readonly priorOtherRemunerationCents: number
  readonly contributionDays: number | 'unknown'
  readonly priorKvPvContributoryPayCents: number | 'unknown'
  readonly priorRvAvContributoryPayCents: number | 'unknown'
  readonly insurancePath: 'statutory' | 'private' | 'unknown'
  readonly sameEmployerPreviousYear: boolean | 'unknown'
  readonly pap: PapInput
  readonly specialCase?: boolean
}

export type BonusPreparationResult2026 =
  | {
      readonly state: 'incomplete' | 'unsupported'
      readonly reason: string
    }
  | {
      readonly state: 'prepared'
      readonly classification: Exclude<BonusClass2026, 'monthly_recurring_bonus'>
      readonly paymentMonth: number
      readonly grossPaymentCents: number
      readonly expectedAnnualTaxBaseCents: number
      readonly kvPvLiableCents: number
      readonly rvAvLiableCents: number
      readonly otherRemunerationWageTaxCents: number
      readonly otherRemunerationSoliCents: number
      readonly otherRemunerationChurchBaseCents: number
      readonly sourceIds: readonly string[]
    }

const checked = (value: number, name: string): bigint => {
  if (!Number.isSafeInteger(value) || value < 0)
    throw new RangeError(name + ' must be a non-negative safe integer')
  return BigInt(value)
}

const safe = (value: bigint): number => {
  const result = Number(value)
  if (!Number.isSafeInteger(result))
    throw new RangeError('Bonus calculation exceeds safe integer range')
  return result
}

const liableAmount = (
  bonus: bigint,
  annualCap: bigint,
  days: bigint,
  prior: bigint,
): bigint => {
  const proportion = (annualCap * days) / 360n
  const headroom = proportion > prior ? proportion - prior : 0n
  return bonus < headroom ? bonus : headroom
}

export const prepareBonus2026 = (
  input: BonusPreparationInput2026,
): BonusPreparationResult2026 => {
  if (input.calculationYear !== 2026 || input.pap.calculationYear !== 2026)
    throw new RangeError('Only 2026 bonus rules are supported')
  const gross = checked(input.grossPaymentCents, 'grossPaymentCents')
  const running = checked(
    input.expectedRunningAnnualPayCents,
    'expectedRunningAnnualPayCents',
  )
  const earlier = checked(
    input.priorOtherRemunerationCents,
    'priorOtherRemunerationCents',
  )
  if (!Number.isInteger(input.paymentMonth) ||
      input.paymentMonth < 1 || input.paymentMonth > 12)
    throw new RangeError('paymentMonth must be 1 through 12')
  if (gross === 0n)
    return { state: 'incomplete', reason: 'payment_amount_required' }
  if (input.specialCase)
    return { state: 'unsupported', reason: 'special_payment_unsupported' }
  if (input.classification === 'unknown')
    return { state: 'incomplete', reason: 'classification_unknown' }
  if (input.classification === 'monthly_recurring_bonus')
    return { state: 'incomplete', reason: 'running_pay_period_required' }
  if (input.insurancePath === 'unknown')
    return { state: 'incomplete', reason: 'insurance_path_unknown' }
  if (input.contributionDays === 'unknown' ||
      input.priorKvPvContributoryPayCents === 'unknown' ||
      input.priorRvAvContributoryPayCents === 'unknown')
    return { state: 'incomplete', reason: 'contribution_history_required' }
  if (!Number.isInteger(input.contributionDays) ||
      input.contributionDays < 0 || input.contributionDays > 360)
    throw new RangeError('contributionDays must be 0 through 360')
  const days = BigInt(input.contributionDays)
  const priorKv = checked(
    input.priorKvPvContributoryPayCents,
    'priorKvPvContributoryPayCents',
  )
  const priorRv = checked(
    input.priorRvAvContributoryPayCents,
    'priorRvAvContributoryPayCents',
  )
  const kv = input.insurancePath === 'private'
    ? 0n
    : liableAmount(gross, 6_975_000n, days, priorKv)
  const rv = liableAmount(gross, 10_140_000n, days, priorRv)
  if (input.paymentMonth <= 3) {
    if (input.sameEmployerPreviousYear === 'unknown')
      return { state: 'incomplete', reason: 'march_clause_history_unknown' }
    if (input.sameEmployerPreviousYear &&
        (input.insurancePath === 'statutory' ? kv < gross : rv < gross))
      return { state: 'unsupported', reason: 'march_clause_prior_year' }
  }
  const annualBase = running + earlier
  const tax = calculatePayrollTax2026({
    ...input.pap,
    JRE4: safe(annualBase),
    SONSTB: safe(gross),
  })
  return {
    state: 'prepared',
    classification: input.classification,
    paymentMonth: input.paymentMonth,
    grossPaymentCents: safe(gross),
    expectedAnnualTaxBaseCents: safe(annualBase),
    kvPvLiableCents: safe(kv),
    rvAvLiableCents: safe(rv),
    otherRemunerationWageTaxCents: tax.otherRemunerationWageTaxCents,
    otherRemunerationSoliCents: tax.otherRemunerationSolidaritySurchargeCents,
    otherRemunerationChurchBaseCents:
      tax.otherRemunerationChurchTaxAssessmentBaseCents,
    sourceIds: [
      'DE-BMF-PAP-2026-A1',
      'DE-SGB4-23A',
      'DE-BMF-LSTH-2026-R39B6',
    ],
  }
}
