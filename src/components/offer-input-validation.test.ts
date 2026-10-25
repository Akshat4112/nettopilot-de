import { describe, expect, it } from 'vitest'
import {
  buildOfferPairFromEntries,
  validateOfferSalary,
} from './offer-input-validation'

describe('NP-CMP-002 validated offer base salary admission', () => {
  it('preserves unknown instead of treating empty or invalid as zero', () => {
    expect(validateOfferSalary({ grossEur: '', period: 'annual' }).state).toBe(
      'incomplete',
    )
    expect(
      validateOfferSalary({ grossEur: '100.123', period: 'annual' }).state,
    ).toBe('invalid')
    expect(
      validateOfferSalary({ grossEur: '0', period: 'monthly' }).state,
    ).toBe('invalid')
    const draft = buildOfferPairFromEntries(
      { grossEur: '45000', period: 'annual' },
      { grossEur: '', period: 'monthly' },
    )
    expect(draft.offers[0].compensation.baseSalary.state).toBe('provided')
    expect(draft.offers[1].compensation.baseSalary.state).toBe('unknown')
    expect(draft.payrollMetadata.state).toBe('unknown')
  })

  it('retains exact euro cent precision for both salaries', () => {
    const result = validateOfferSalary({
      grossEur: '45000.45',
      period: 'annual',
    })
    expect(result).toEqual({ state: 'valid', amountCents: 4_500_045 })
    const draft = buildOfferPairFromEntries(
      { grossEur: '45000.45', period: 'annual' },
      { grossEur: '6000.01', period: 'monthly' },
    )
    expect(draft.offers[0].compensation.baseSalary).toMatchObject({
      state: 'provided',
      value: {
        period: 'annual',
        grossAmount: { amount: '45000.45', currency: 'EUR' },
      },
    })
    expect(draft.offers[1].compensation.baseSalary).toMatchObject({
      state: 'provided',
      value: { period: 'monthly' },
    })
  })
})
