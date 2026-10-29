import type {
  OfferComparisonDraft,
  OfferSide,
} from '../domain/comparison/offer-model'
import type { SalaryAggregationResult2026 } from '../domain/salary/salary-aggregation'
import type { EssentialSalaryDraft } from './EssentialSalaryInputs'
import { calculateSimpleSalary2026 } from './calculate-simple-salary'

export interface ComparisonPayrollContext {
  readonly essential: Omit<EssentialSalaryDraft, 'gross' | 'period'>
  readonly additionalHealthRatePercent: string
  readonly standardEmploymentConfirmed: boolean
}

export const emptyComparisonPayrollContext = (): ComparisonPayrollContext => ({
  essential: {
    year: '2026',
    taxClass: '',
    federalState: '',
    churchTax: 'not_liable',
    dateOfBirth: '',
    children: '0',
    insurance: 'statutory',
  },
  additionalHealthRatePercent: '',
  standardEmploymentConfirmed: false,
})

export interface OfferNetCompensationResult {
  readonly offers: readonly [
    SalaryAggregationResult2026,
    SalaryAggregationResult2026,
  ]
  readonly comparison:
    | {
        readonly state: 'calculated'
        /** Signed differences use Offer A as the reference: B minus A. */
        readonly annualNetDifferenceCents: number
        readonly monthlyNetDifferenceCents: number | null
      }
    | { readonly state: 'unavailable' }
  readonly provenance: {
    readonly profileId: string
    readonly calculationYear: 2026
    readonly sourceIds: readonly string[]
    readonly assumptionSetIds: readonly string[]
  }
}

/** Adapter profile, not an approved aggregate assumption manifest. These IDs
 * identify the existing BMF, pension, unemployment, GKV and care modules. */
const provenance: OfferNetCompensationResult['provenance'] = {
  profileId: 'de-offer-base-net-2026-v1',
  calculationYear: 2026,
  sourceIds: [
    'DE-BMF-PAP-2026-A1',
    'DE-SVBEZGRV-2026-4',
    'DE-DRV-SV-VALUES-2026',
    'DE-BVV-1-2',
    'DE-SGBIII-341',
    'DE-SGBIII-342',
    'DE-SGBIII-346',
    'DE-SGBV-241',
    'DE-SGBV-242',
    'DE-SGBV-249',
    'DE-SGBV-226',
    'DE-BMAS-SV-VALUES-2026',
    'DE-PBAV-2025-1',
    'DE-SGBXI-55',
    'DE-SGBXI-58',
    'DE-BMG-PV-FINANCE-2026',
    'DE-BVV-1',
    'DE-BVV-2',
  ],
  assumptionSetIds: [
    'de-pension-insurance-2026-v1',
    'de-unemployment-insurance-2026-v1',
    'de-statutory-health-insurance-2026-v1',
    'de-social-care-insurance-2026-v1',
  ],
}

const unavailable = (
  state: 'incomplete' | 'unsupported',
  reason: string,
): SalaryAggregationResult2026 => ({ state, reason, month: 0 })

/** Literal types describe admitted data; runtime callers may still violate it. */
const matchesRuntimeValue = (
  value: unknown,
  expected: string | number,
): boolean => value === expected

const calculateOffer = (
  offer: OfferSide,
  context: ComparisonPayrollContext,
  inputsValid: boolean,
): SalaryAggregationResult2026 => {
  if (!inputsValid) return unavailable('incomplete', 'offer_inputs_invalid')
  const { baseSalary, recurringAdditionalCash, variableCash, oneOffPayments } =
    offer.compensation
  if (baseSalary.state !== 'provided')
    return unavailable('incomplete', 'offer_base_salary_required')
  if (!matchesRuntimeValue(baseSalary.value.grossAmount.currency, 'EUR'))
    return unavailable('unsupported', 'comparison_currency_unsupported')
  if (!matchesRuntimeValue(baseSalary.value.paymentsPerYear, 12))
    return unavailable('unsupported', 'offer_payment_frequency_not_supported')
  if (
    recurringAdditionalCash.length > 0 ||
    variableCash.length > 0 ||
    oneOffPayments.length > 0
  )
    return unavailable(
      'unsupported',
      'offer_additional_compensation_not_supported',
    )

  return calculateSimpleSalary2026({
    essential: {
      ...context.essential,
      gross: baseSalary.value.grossAmount.amount,
      period: baseSalary.value.period,
    },
    advanced: {
      annualTaxAllowanceEur: '',
      annualTaxAdditionEur: '',
      additionalHealthRatePercent: context.additionalHealthRatePercent,
      privateHealthPremiumEur: '',
      privateCarePremiumEur: '',
      oneOffBonusEur: '',
      oneOffBonusMonth: '',
    },
    standardEmploymentConfirmed: context.standardEmploymentConfirmed,
  })
}

/** Calculate first, compare second. No stored result or input metadata is reused.
 * Comparison-only benefits, pension, working time and commute never enter payroll. */
export const calculateOfferNetCompensation = (
  draft: OfferComparisonDraft,
  context: ComparisonPayrollContext,
  inputValidity: readonly [boolean, boolean] = [true, true],
): OfferNetCompensationResult => {
  const incompatibleReason =
    !matchesRuntimeValue(draft.calculationYear, 2026) ||
    !matchesRuntimeValue(context.essential.year, '2026')
      ? 'calculation_year_unsupported'
      : !matchesRuntimeValue(draft.currency, 'EUR')
        ? 'comparison_currency_unsupported'
        : null
  const offers: OfferNetCompensationResult['offers'] = incompatibleReason
    ? [
        unavailable('unsupported', incompatibleReason),
        unavailable('unsupported', incompatibleReason),
      ]
    : [
        calculateOffer(draft.offers[0], context, inputValidity[0]),
        calculateOffer(draft.offers[1], context, inputValidity[1]),
      ]
  const [a, b] = offers
  return {
    offers,
    comparison:
      a.state === 'calculated' && b.state === 'calculated'
        ? {
            state: 'calculated',
            annualNetDifferenceCents:
              b.annual.netPayrollCents - a.annual.netPayrollCents,
            monthlyNetDifferenceCents:
              a.recurringMonthlyNetCents === null ||
              b.recurringMonthlyNetCents === null
                ? null
                : b.recurringMonthlyNetCents - a.recurringMonthlyNetCents,
          }
        : { state: 'unavailable' },
    provenance,
  }
}

const reasonTexts: Readonly<Record<string, string>> = {
  offer_inputs_invalid:
    'Correct this offer’s salary or additional-pay inputs, including the payment month.',
  offer_base_salary_required: 'Enter a valid base salary for this offer.',
  offer_additional_compensation_not_supported:
    'Additional recurring, variable or one-time pay is not supported by this net comparison. Its payroll treatment has not been connected.',
  offer_payment_frequency_not_supported:
    'This comparison requires 12 equal payroll months.',
  comparison_currency_unsupported:
    'Both offers and their base salaries must use EUR.',
  calculation_year_unsupported:
    'Both offers and their shared payroll assumptions must use 2026.',
  essential_payroll_inputs_invalid:
    'Complete the shared payroll inputs with a valid tax class, federal state and date of birth, and check the base salary.',
  advanced_payroll_inputs_invalid:
    'Enter a valid additional GKV contribution rate between 0 and 10%, or leave it blank to use the published average estimate.',
  standard_employment_confirmation_required:
    'Confirm the shared standard employment and payroll assumptions for both offers.',
  private_insurance_payslip_details_required:
    'Private health insurance requires payslip details outside this limited comparison.',
  church_tax_evidence_not_in_scope:
    'Church-tax payroll treatment is outside this limited comparison.',
  child_allowance_and_care_status_required:
    'Child allowances and care-insurance parent status require details outside this limited comparison.',
  age_specific_pension_or_care_rules_required:
    'This date of birth requires age-specific payroll rules outside this limited comparison.',
  advanced_payroll_settlement_not_connected:
    'Allowance adjustments, private premiums and bonus settlement are outside this limited comparison.',
  invalid_gross: 'Enter a valid gross salary in EUR with up to two decimals.',
  annual_salary_requires_monthly_cent_allocation:
    'Annual gross salary must divide into 12 equal monthly amounts in EUR cents.',
  special_or_voluntary_insurance_check_required:
    'Monthly gross salary must be above EUR 2,000 and below EUR 5,800. Other amounts require additional employment or insurance checks.',
  payroll_calculation_could_not_be_validated:
    'The payroll calculation could not be validated for these inputs.',
}

export const offerNetReasonText = (reason: string): string =>
  reasonTexts[reason] ??
  'The net estimate is unavailable because this payroll case is not supported.'
