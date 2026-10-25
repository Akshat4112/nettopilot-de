import { describe, expect, it } from 'vitest'
import type { BaseSalary, DecimalString } from '../salary/types'
import {
  createEmptyOfferComparison,
  haveBothBaseSalaryInputs,
} from './offer-model'

const knownSalary: BaseSalary = {
  period: 'annual',
  paymentsPerYear: 12,
  grossAmount: { amount: '85000.00' as DecimalString, currency: 'EUR' },
}

describe('NP-CMP-001 two-offer comparison model', () => {
  it('creates exactly two correctly labeled independent offers', () => {
    const draft = createEmptyOfferComparison()
    expect(draft.schemaVersion).toBe(1)
    expect(draft.calculationYear).toBe(2026)
    expect(draft.currency).toBe('EUR')
    expect(draft.offers).toHaveLength(2)
    expect(draft.offers.map((offer) => offer.id)).toEqual([
      'offer_a',
      'offer_b',
    ])
    expect(draft.offers.map((offer) => offer.label)).toEqual([
      'Offer A',
      'Offer B',
    ])
    expect(draft.offers[0].benefits).not.toBe(draft.offers[1].benefits)
    expect(draft.offers[0].commute).not.toBe(draft.offers[1].commute)
    expect(draft.offers[0].compensation).not.toBe(draft.offers[1].compensation)
  })

  it('retains missing employment dimensions as unknown instead of zero', () => {
    const draft = createEmptyOfferComparison()
    for (const offer of draft.offers) {
      expect(offer.compensation.baseSalary.state).toBe('unknown')
      expect(offer.workingTime.weeklyHours.state).toBe('unknown')
      expect(offer.workingTime.paidVacationDaysAnnual.state).toBe('unknown')
      expect(offer.remoteWork.arrangement).toBe('unknown')
      expect(offer.commute.oneWayMinutes.state).toBe('unknown')
      expect(offer.commute.parkingCostMonthly.state).toBe('unknown')
      expect(offer.employerPension.certainty).toBe('unknown')
      expect(offer.employerPension.employerContributionAnnual.state).toBe(
        'unknown',
      )
    }
    expect(draft.payrollMetadata.state).toBe('unknown')
    expect(haveBothBaseSalaryInputs(draft)).toBe(false)
  })

  it('recognizes entered base pay, not validated payroll comparability', () => {
    const empty = createEmptyOfferComparison()
    const one = {
      ...empty,
      offers: [
        {
          ...empty.offers[0],
          compensation: {
            ...empty.offers[0].compensation,
            baseSalary: {
              state: 'provided',
              value: knownSalary,
              source: 'offer_document',
            } as const,
          },
        },
        empty.offers[1],
      ] as const,
    }
    expect(haveBothBaseSalaryInputs(one)).toBe(false)
    const two = {
      ...one,
      offers: [
        one.offers[0],
        {
          ...one.offers[1],
          compensation: {
            ...one.offers[1].compensation,
            baseSalary: {
              state: 'provided',
              value: knownSalary,
              source: 'employer_statement',
            } as const,
          },
        },
      ] as const,
    }
    expect(haveBothBaseSalaryInputs(two)).toBe(true)
    expect(two.payrollMetadata.state).toBe('unknown')
  })
})
