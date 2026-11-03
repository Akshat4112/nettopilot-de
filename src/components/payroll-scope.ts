import type { EssentialSalaryDraft } from './EssentialSalaryInputs'
import {
  validateAdvancedSalaryDraft,
  type AdvancedSalaryDraft,
} from './advanced-salary-validation'
import {
  validateEssentialSalaryDraft,
  type EssentialField,
} from './essential-salary-validation'

/** Existing adapter admission, not a general statement of German payroll law. */
export const PAYROLL_SCOPE_2026 = {
  year: 2026,
  payrollMonths: 12,
  monthlyGrossMinExclusiveCents: 200_000,
  monthlyGrossMaxExclusiveCents: 580_000,
  birthDateMinInclusive: '1963-01-01',
  birthDateMaxInclusive: '2002-12-31',
  insurance: 'statutory',
  churchTax: 'not_liable',
  children: '0',
  unsupportedTaxClass: '2',
} as const

export interface PayrollScopeInput {
  readonly essential: EssentialSalaryDraft
  readonly advanced: AdvancedSalaryDraft
  readonly standardEmploymentConfirmed: boolean
}

const unsupportedAdvancedFields = [
  'annualTaxAllowanceEur',
  'annualTaxAdditionEur',
  'privateHealthPremiumEur',
  'privateCarePremiumEur',
  'oneOffBonusEur',
  'oneOffBonusMonth',
] as const satisfies readonly (keyof AdvancedSalaryDraft)[]

const issueMessages = {
  private_insurance_payslip_details_required:
    'Private health insurance is outside this estimate. Keep your inputs and check the case with payroll; changing to GKV is appropriate only if it matches your actual insurance.',
  church_tax_evidence_not_in_scope:
    'Church-tax liability is outside this estimate. Keep your actual status and use a payroll calculation that supports church tax.',
  child_allowance_and_care_status_required:
    'Children or tax class II require payroll rules outside this estimate. Keep your actual details and use a calculation that supports them.',
  age_specific_pension_or_care_rules_required:
    'This birth date requires age-specific payroll rules outside this estimate. Keep your actual birth date and check the case with payroll.',
  advanced_payroll_settlement_not_connected:
    'Allowance adjustments, private premiums and special payments are outside this estimate. Keep the details for payroll review, or clear an optional entry only if it does not apply.',
  annual_salary_requires_monthly_cent_allocation:
    'Annual salary cannot be split into 12 equal monthly cent amounts. Enter the actual equal monthly gross amount if known, or check the allocation with payroll.',
  special_or_voluntary_insurance_check_required:
    'This gross salary is outside the supported monthly range. Keep the actual amount and check the employment and insurance treatment with payroll.',
} as const

export type PayrollScopeReason = keyof typeof issueMessages

export interface PayrollScopeIssue {
  readonly reason: PayrollScopeReason
  readonly message: string
}

export interface PayrollScopeGuidanceResult {
  readonly state: 'within_scope' | 'incomplete' | 'unsupported'
  readonly issues: readonly PayrollScopeIssue[]
  readonly missingFields: readonly EssentialField[]
  readonly invalidFields: readonly EssentialField[]
  readonly advancedErrors: readonly string[]
  readonly confirmationRequired: boolean
}

export const parsePayrollEuroCents = (input: string): number | null => {
  if (!/^(?:0|[1-9]\d*)(?:\.\d{1,2})?$/.test(input)) return null
  const [whole = '', decimal = ''] = input.split('.')
  const result = BigInt(whole) * 100n + BigInt(decimal.padEnd(2, '0'))
  return result <= BigInt(Number.MAX_SAFE_INTEGER) ? Number(result) : null
}

/** Each known field is checked independently; missing fields never hide a known
 * unsupported selection. Invalid values remain validation errors, not inferred facts. */
export function getPayrollScopeIssues({
  essential: input,
  advanced,
}: Pick<
  PayrollScopeInput,
  'essential' | 'advanced'
>): readonly PayrollScopeIssue[] {
  const errors = validateEssentialSalaryDraft(input)
  const reasons: PayrollScopeReason[] = []
  const scope = PAYROLL_SCOPE_2026
  if (!errors.insurance && input.insurance !== scope.insurance)
    reasons.push('private_insurance_payslip_details_required')
  if (!errors.churchTax && input.churchTax !== scope.churchTax)
    reasons.push('church_tax_evidence_not_in_scope')
  if (
    (!errors.children && input.children !== scope.children) ||
    (!errors.taxClass && input.taxClass === scope.unsupportedTaxClass)
  )
    reasons.push('child_allowance_and_care_status_required')
  if (
    !errors.dateOfBirth &&
    (input.dateOfBirth < scope.birthDateMinInclusive ||
      input.dateOfBirth > scope.birthDateMaxInclusive)
  )
    reasons.push('age_specific_pension_or_care_rules_required')
  if (unsupportedAdvancedFields.some((field) => advanced[field] !== ''))
    reasons.push('advanced_payroll_settlement_not_connected')

  if (!errors.gross && !errors.period) {
    const cents = parsePayrollEuroCents(input.gross)
    if (cents !== null) {
      if (input.period === 'annual' && cents % scope.payrollMonths !== 0)
        reasons.push('annual_salary_requires_monthly_cent_allocation')
      const monthlyCents =
        input.period === 'annual' ? cents / scope.payrollMonths : cents
      if (
        monthlyCents <= scope.monthlyGrossMinExclusiveCents ||
        monthlyCents >= scope.monthlyGrossMaxExclusiveCents
      )
        reasons.push('special_or_voluntary_insurance_check_required')
    }
  }
  return reasons.map((reason) => ({ reason, message: issueMessages[reason] }))
}

export function evaluatePayrollScope(
  data: PayrollScopeInput,
): PayrollScopeGuidanceResult {
  const errors = validateEssentialSalaryDraft(data.essential)
  const fields = Object.keys(errors) as EssentialField[]
  const missingFields = fields.filter((field) => data.essential[field] === '')
  const invalidFields = fields.filter((field) => data.essential[field] !== '')
  const advancedErrors = validateAdvancedSalaryDraft(
    data.advanced,
    data.essential.insurance,
  )
  const issues = getPayrollScopeIssues(data)
  const confirmationRequired = !data.standardEmploymentConfirmed
  return {
    state:
      issues.length > 0
        ? 'unsupported'
        : fields.length > 0 || advancedErrors.length > 0 || confirmationRequired
          ? 'incomplete'
          : 'within_scope',
    issues,
    missingFields,
    invalidFields,
    advancedErrors,
    confirmationRequired,
  }
}
