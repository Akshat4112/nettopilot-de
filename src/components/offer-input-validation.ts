import type { BaseSalary, DecimalString } from '../domain/salary/types'
import {
  createEmptyOfferComparison,
  type OfferComparisonDraft,
  type OfferInput,
} from '../domain/comparison/offer-model'

export interface OfferSalaryEntry {
  readonly grossEur: string
  readonly period: 'monthly' | 'annual'
}

export type OfferSalaryValidation =
  | { readonly state: 'incomplete'; readonly reason: string }
  | { readonly state: 'invalid'; readonly reason: string }
  | { readonly state: 'valid'; readonly amountCents: number }

export const validateOfferSalary = (
  entry: OfferSalaryEntry,
): OfferSalaryValidation => {
  if (entry.grossEur.trim() === '')
    return { state: 'incomplete', reason: 'Enter a gross salary.' }
  if (!/^(?:0|[1-9]\d*)(?:\.\d{1,2})?$/.test(entry.grossEur))
    return {
      state: 'invalid',
      reason: 'Enter a positive amount in EUR with at most two decimals.',
    }
  const [whole = '0', fraction = ''] = entry.grossEur.split('.')
  const cents = BigInt(whole) * 100n + BigInt(fraction.padEnd(2, '0'))
  if (cents === 0n || cents > 1_000_000_000n)
    return {
      state: 'invalid',
      reason: 'Gross salary must be positive and no more than €10,000,000.',
    }
  return { state: 'valid', amountCents: Number(cents) }
}

const admittedBase = (entry: OfferSalaryEntry): OfferInput<BaseSalary> => {
  if (validateOfferSalary(entry).state !== 'valid') return { state: 'unknown' }
  return {
    state: 'provided',
    source: 'user_entry',
    value: {
      period: entry.period,
      paymentsPerYear: 12,
      grossAmount: {
        amount: entry.grossEur as DecimalString,
        currency: 'EUR',
      },
    },
  }
}

/**
 * Only independently validated base-pay inputs enter the domain model.
 * Calculated tax and offer deltas are explicitly not produced here.
 */
export const buildOfferPairFromEntries = (
  offerA: OfferSalaryEntry,
  offerB: OfferSalaryEntry,
): OfferComparisonDraft => {
  const empty = createEmptyOfferComparison()
  return {
    ...empty,
    offers: [
      {
        ...empty.offers[0],
        compensation: {
          ...empty.offers[0].compensation,
          baseSalary: admittedBase(offerA),
        },
      },
      {
        ...empty.offers[1],
        compensation: {
          ...empty.offers[1].compensation,
          baseSalary: admittedBase(offerB),
        },
      },
    ],
  }
}
