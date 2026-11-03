import type { DecimalString, EuroAmount } from '../salary/types'
import type {
  OfferBenefit,
  OfferComparisonDraft,
  OfferEmployerPension,
  OfferInput,
} from './offer-model'

export type BenefitCertainty = OfferBenefit['certainty']

export interface BenefitEntry {
  readonly id: string
  readonly label: string
  readonly certainty: BenefitCertainty
  readonly employerStatedAnnualValueEur: string
  readonly userAssignedAnnualValueEur: string
  readonly description: string
}

export interface BenefitsEntry {
  readonly employerContributionAnnualEur: string
  readonly pensionCertainty: BenefitCertainty
  readonly eligibilityOrVestingNote: string
  readonly benefits: readonly BenefitEntry[]
}

export const blankBenefit = (id: string): BenefitEntry => ({
  id,
  label: '',
  certainty: 'unknown',
  employerStatedAnnualValueEur: '',
  userAssignedAnnualValueEur: '',
  description: '',
})

export const blankBenefits = (): BenefitsEntry => ({
  employerContributionAnnualEur: '',
  pensionCertainty: 'unknown',
  eligibilityOrVestingNote: '',
  benefits: [],
})

export type BenefitsEvaluation =
  | { readonly state: 'invalid'; readonly reason: string }
  | {
      readonly state: 'valid'
      readonly employerPension: OfferEmployerPension
      readonly benefits: readonly OfferBenefit[]
      readonly taxTreatment: 'not_calculated'
      readonly cashIntegration: 'excluded'
    }

/** Parse cents without binary floating point or rounding sub-cent inputs. */
const optionalAnnualMoney = (
  raw: string,
  maximumCents = BigInt(Number.MAX_SAFE_INTEGER),
): OfferInput<EuroAmount> | null => {
  if (raw === '') return { state: 'unknown' }
  if (!/^(?:0|[1-9]\d*)(?:\.\d{1,2})?$/.test(raw)) return null
  const [whole = '0', fraction = ''] = raw.split('.')
  const cents = BigInt(whole) * 100n + BigInt(fraction.padEnd(2, '0'))
  if (cents > maximumCents) return null
  return {
    state: 'provided',
    source: 'user_entry',
    value: {
      amount:
        `${(cents / 100n).toString()}.${(cents % 100n).toString().padStart(2, '0')}` as DecimalString,
      currency: 'EUR',
    },
  }
}

const optionalText = (raw: string): OfferInput<string> =>
  raw.trim() === ''
    ? { state: 'unknown' }
    : { state: 'provided', source: 'user_entry', value: raw.trim() }

/**
 * Captures annual offer terms and personal estimates independently. No value
 * enters payroll, cash compensation, a net result or a combined benefit total.
 */
export const evaluateBenefits = (entry: BenefitsEntry): BenefitsEvaluation => {
  if (entry.benefits.length > 20)
    return {
      state: 'invalid',
      reason: 'Each offer supports at most 20 benefit rows.',
    }

  const pension = optionalAnnualMoney(entry.employerContributionAnnualEur)
  if (pension === null)
    return {
      state: 'invalid',
      reason:
        'Employer pension contribution must be non-negative annual EUR, to two decimals, within the safe cent range.',
    }

  const benefits: OfferBenefit[] = []
  const ids = new Set<string>()
  for (const row of entry.benefits) {
    const id = row.id.trim()
    const label = row.label.trim()
    if (id === '' || ids.has(id) || label === '' || label.length > 120)
      return {
        state: 'invalid',
        reason:
          'Each benefit needs a trimmed label of 1–120 characters and a unique non-empty id.',
      }
    ids.add(id)

    const employerValue = optionalAnnualMoney(
      row.employerStatedAnnualValueEur,
      100_000_000n,
    )
    const personalValue = optionalAnnualMoney(
      row.userAssignedAnnualValueEur,
      100_000_000n,
    )
    if (employerValue === null || personalValue === null)
      return {
        state: 'invalid',
        reason:
          'Benefit values must be 0–1,000,000 annual EUR, to two decimals.',
      }
    benefits.push({
      id,
      label,
      certainty: row.certainty,
      employerStatedAnnualValue: employerValue,
      userAssignedAnnualValue: personalValue,
      description: optionalText(row.description),
    })
  }

  return {
    state: 'valid',
    employerPension: {
      employerContributionAnnual: pension,
      certainty: entry.pensionCertainty,
      eligibilityOrVestingNote: optionalText(entry.eligibilityOrVestingNote),
    },
    benefits,
    taxTreatment: 'not_calculated',
    cashIntegration: 'excluded',
  }
}

/** Invalid inputs preserve that offer's previous terms; valid offers update independently. */
export const attachBenefits = (
  draft: OfferComparisonDraft,
  entries: readonly [BenefitsEntry, BenefitsEntry],
): OfferComparisonDraft => {
  const a = evaluateBenefits(entries[0])
  const b = evaluateBenefits(entries[1])
  return {
    ...draft,
    offers: [
      {
        ...draft.offers[0],
        ...(a.state === 'valid'
          ? { employerPension: a.employerPension, benefits: a.benefits }
          : {}),
      },
      {
        ...draft.offers[1],
        ...(b.state === 'valid'
          ? { employerPension: b.employerPension, benefits: b.benefits }
          : {}),
      },
    ],
  }
}
