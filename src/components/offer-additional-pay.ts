import type { DecimalString, RegistryOptionId } from '../domain/salary/types'
import type {
  OfferComparisonDraft,
  OfferSide,
} from '../domain/comparison/offer-model'

export interface AdditionalPayEntry {
  readonly expectedVariableEur: string
  readonly oneOffEur: string
  readonly oneOffMonth: string
  readonly oneOffGuarantee: 'guaranteed' | 'variable'
  readonly oneOffClassification:
    | 'performance_bonus'
    | 'thirteenth_salary'
    | 'christmas_payment'
    | 'holiday_payment'
    | 'gratuity'
}

export const emptyAdditionalPay = (): AdditionalPayEntry => ({
  expectedVariableEur: '',
  oneOffEur: '',
  oneOffMonth: '',
  oneOffGuarantee: 'variable',
  oneOffClassification: 'performance_bonus',
})

const amountPattern = /^(?:0|[1-9]\d*)(?:\.\d{1,2})?$/

/** Missing optional pay remains absent, not a zero-valued item. */
export const validateAdditionalPay = (
  entry: AdditionalPayEntry,
): readonly string[] => {
  const issues: string[] = []
  for (const [label, value] of [
    ['Expected variable compensation', entry.expectedVariableEur],
    ['One-time payment', entry.oneOffEur],
  ] as const) {
    if (value === '') continue
    if (!amountPattern.test(value)) {
      issues.push(label + ' must be a positive EUR amount with up to two decimals.')
      continue
    }
    const [whole = '0', fraction = ''] = value.split('.')
    const cents = BigInt(whole) * 100n + BigInt(fraction.padEnd(2, '0'))
    if (cents < 1n || cents > 1_000_000_000n)
      issues.push(label + ' must be between €0.01 and €10,000,000.')
  }
  if (entry.oneOffEur !== '') {
    if (!/^(?:[1-9]|1[0-2])$/.test(entry.oneOffMonth))
      issues.push('Choose the payment month for the one-time payment.')
  } else if (entry.oneOffMonth !== '') {
    issues.push('Enter a one-time payment or clear its payment month.')
  }
  return issues
}

const asEuro = (amount: string) => ({
  amount: amount as DecimalString,
  currency: 'EUR' as const,
})

/** Builds optional components without adding amounts to unvalidated payroll. */
export const applyAdditionalPay = (
  draft: OfferComparisonDraft,
  entries: readonly [AdditionalPayEntry, AdditionalPayEntry],
): OfferComparisonDraft => {
  const applied = draft.offers.map((offer, index): OfferSide => {
    const entry = entries[index]
    if (entry === undefined || validateAdditionalPay(entry).length > 0)
      return offer
    return {
      ...offer,
      compensation: {
        ...offer.compensation,
        variableCash:
          entry.expectedVariableEur === ''
            ? []
            : [
                {
                  label: 'Expected variable cash',
                  expectedAmount: asEuro(entry.expectedVariableEur),
                  period: 'annual',
                  source: 'user_entry',
                },
              ],
        oneOffPayments:
          entry.oneOffEur === '' || entry.oneOffMonth === ''
            ? []
            : [
                {
                  amount: asEuro(entry.oneOffEur),
                  paymentMonth: Number(entry.oneOffMonth) as
                    | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12,
                  classification: entry.oneOffClassification as RegistryOptionId,
                  guarantee: entry.oneOffGuarantee,
                  label: 'User-entered one-time payment' as never,
                },
              ],
      },
    }
  })
  const [a, b] = applied
  if (a === undefined || b === undefined) throw new Error('Two offers required')
  return {
    ...draft,
    offers: [
      { ...a, id: 'offer_a', label: 'Offer A' },
      { ...b, id: 'offer_b', label: 'Offer B' },
    ],
  }
}
