import {
  validateAdditionalPay,
  type AdditionalPayEntry,
} from './offer-additional-pay'
import {
  validateOfferSalary,
  type OfferSalaryEntry,
} from './offer-input-validation'
import { getPayrollScopeIssues, type PayrollScopeIssue } from './payroll-scope'

export interface OfferEntryScopeResult {
  readonly state: 'unsupported' | 'incomplete' | 'invalid' | 'within_base_scope'
  readonly issues: readonly PayrollScopeIssue[]
  readonly inputErrors: readonly string[]
}

/** Inspect raw form entries before model admission can omit invalid or incomplete
 * optional pay. Tax and insurance facts stay unknown until the shared profile is entered. */
export function evaluateOfferEntryScope(
  entry: OfferSalaryEntry,
  additional: AdditionalPayEntry,
): OfferEntryScopeResult {
  const salary = validateOfferSalary(entry)
  const additionalErrors = validateAdditionalPay(additional)
  const issues = getPayrollScopeIssues({
    essential: {
      gross: entry.grossEur,
      period: entry.period,
      year: '2026',
      taxClass: '',
      federalState: '',
      churchTax: '',
      dateOfBirth: '',
      children: '',
      insurance: '',
    },
    advanced: {
      annualTaxAllowanceEur: '',
      annualTaxAdditionEur: '',
      additionalHealthRatePercent: '',
      privateHealthPremiumEur: '',
      privateCarePremiumEur: '',
      // Only presence is classified here; variable pay is never calculated as a bonus.
      oneOffBonusEur: additional.oneOffEur || additional.expectedVariableEur,
      oneOffBonusMonth: additional.oneOffMonth,
    },
  })
  return {
    state:
      issues.length > 0
        ? 'unsupported'
        : salary.state === 'invalid' || additionalErrors.length > 0
          ? 'invalid'
          : salary.state === 'incomplete'
            ? 'incomplete'
            : 'within_base_scope',
    issues,
    inputErrors: [
      ...(salary.state === 'valid' ? [] : [salary.reason]),
      ...additionalErrors,
    ],
  }
}
