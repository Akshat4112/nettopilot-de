export interface AdvancedSalaryDraft {
  readonly annualTaxAllowanceEur: string
  readonly annualTaxAdditionEur: string
  readonly additionalHealthRatePercent: string
  readonly privateHealthPremiumEur: string
  readonly privateCarePremiumEur: string
  readonly oneOffBonusEur: string
  readonly oneOffBonusMonth: string
}

const euro = (value: string): boolean =>
  value === '' || /^(?:0|[1-9]\d{0,7})(?:\.\d{1,2})?$/.test(value)

export function validateAdvancedSalaryDraft(
  draft: AdvancedSalaryDraft,
  insurance: string,
): readonly string[] {
  const errors: string[] = []
  for (const [field, value] of [
    ['Annual allowance', draft.annualTaxAllowanceEur],
    ['Annual addition', draft.annualTaxAdditionEur],
    ['Private health premium', draft.privateHealthPremiumEur],
    ['Private care premium', draft.privateCarePremiumEur],
    ['One-off bonus', draft.oneOffBonusEur],
  ]) {
    if (!euro(value ?? ''))
      errors.push(
        String(field) +
          ' must be a non-negative EUR amount with up to two decimals.',
      )
  }
  if (
    draft.additionalHealthRatePercent &&
    (!/^\d{1,2}(?:\.\d{1,3})?$/.test(draft.additionalHealthRatePercent) ||
      Number(draft.additionalHealthRatePercent) > 10)
  )
    errors.push('Additional statutory health rate must be between 0 and 10%.')
  if (
    draft.oneOffBonusEur &&
    (!draft.oneOffBonusMonth ||
      Number(draft.oneOffBonusMonth) < 1 ||
      Number(draft.oneOffBonusMonth) > 12)
  )
    errors.push('Choose a payment month for the one-off bonus.')
  if (!draft.oneOffBonusEur && draft.oneOffBonusMonth)
    errors.push('Enter the one-off amount or clear the payment month.')
  if (
    insurance !== 'private' &&
    (draft.privateHealthPremiumEur || draft.privateCarePremiumEur)
  )
    errors.push(
      'Private premiums are available only with private health insurance.',
    )
  if (insurance !== 'statutory' && draft.additionalHealthRatePercent)
    errors.push(
      'Statutory additional rate is available only with statutory health insurance.',
    )
  return errors
}
