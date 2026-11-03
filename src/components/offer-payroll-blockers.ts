import type { AdditionalPayEntry } from './offer-additional-pay'
import type { OfferSalaryEntry } from './offer-input-validation'
import { evaluateOfferEntryScope } from './offer-entry-scope'

const paymentNames: Readonly<
  Record<AdditionalPayEntry['oneOffClassification'], string>
> = {
  performance_bonus: 'Performance bonus',
  thirteenth_salary: '13th salary',
  christmas_payment: 'Christmas payment',
  holiday_payment: 'Holiday payment',
  gratuity: 'Gratuity',
}

/** Explain current raw cash entries even when invalid data is omitted by model admission.
 * These labels never determine payroll eligibility or calculate settlement. */
export function offerPayrollBlockers(
  salary: OfferSalaryEntry,
  additional: AdditionalPayEntry,
): readonly string[] {
  const scope = evaluateOfferEntryScope(salary, additional)
  const blockers: string[] = []
  if (additional.expectedVariableEur !== '')
    blockers.push(
      'Expected variable pay is outside this base-pay net estimate.',
    )
  if (additional.oneOffEur !== '' || additional.oneOffMonth !== '') {
    const month =
      additional.oneOffMonth === ''
        ? 'payment month not supplied'
        : 'month ' + additional.oneOffMonth
    blockers.push(
      `One-time payment — ${paymentNames[additional.oneOffClassification]}, ${month} — is outside this base-pay net estimate.`,
    )
  }
  return [
    ...blockers,
    ...scope.inputErrors,
    ...scope.issues
      .filter(
        (issue) => issue.reason !== 'advanced_payroll_settlement_not_connected',
      )
      .map((issue) => issue.message),
  ]
}
