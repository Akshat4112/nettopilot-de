import { describe, expect, it } from 'vitest'
import { buildOfferPairFromEntries } from './offer-input-validation'
import {
  applyAdditionalPay,
  emptyAdditionalPay,
  validateAdditionalPay,
} from './offer-additional-pay'

const base = () =>
  buildOfferPairFromEntries(
    { grossEur: '85000', period: 'annual' },
    { grossEur: '90000', period: 'annual' },
  )

describe('NP-CMP-003 additional compensation', () => {
  it('keeps blank optional amounts absent rather than treating them as zero', () => {
    const draft = applyAdditionalPay(base(), [
      emptyAdditionalPay(),
      emptyAdditionalPay(),
    ])
    expect(draft.offers[0].compensation.variableCash).toEqual([])
    expect(draft.offers[1].compensation.oneOffPayments).toEqual([])
  })

  it('keeps expected variable pay separate from guaranteed one-time payments', () => {
    const draft = applyAdditionalPay(base(), [
      {
        ...emptyAdditionalPay(),
        expectedVariableEur: '5000.25',
        oneOffEur: '2000',
        oneOffMonth: '12',
        oneOffGuarantee: 'guaranteed',
        oneOffClassification: 'christmas_payment',
      },
      emptyAdditionalPay(),
    ])
    expect(draft.offers[0].compensation.variableCash).toMatchObject([
      { expectedAmount: { amount: '5000.25' }, period: 'annual' },
    ])
    expect(draft.offers[0].compensation.oneOffPayments).toMatchObject([
      {
        amount: { amount: '2000' },
        paymentMonth: 12,
        guarantee: 'guaranteed',
        classification: 'christmas_payment',
      },
    ])
    expect(draft.offers[1].compensation.variableCash).toEqual([])
    expect(draft.offers[1].compensation.oneOffPayments).toEqual([])
  })

  it('refuses invalid amounts and incomplete one-time months', () => {
    expect(
      validateAdditionalPay({
        ...emptyAdditionalPay(),
        expectedVariableEur: '-10',
      }),
    ).toHaveLength(1)
    expect(
      validateAdditionalPay({ ...emptyAdditionalPay(), oneOffEur: '50.001' }),
    ).toHaveLength(2)
    expect(
      validateAdditionalPay({ ...emptyAdditionalPay(), oneOffEur: '50' }),
    ).toEqual(['Choose the payment month for the one-time payment.'])
    expect(
      validateAdditionalPay({ ...emptyAdditionalPay(), oneOffMonth: '12' }),
    ).toHaveLength(1)
    const draft = applyAdditionalPay(base(), [
      { ...emptyAdditionalPay(), oneOffEur: '100' },
      emptyAdditionalPay(),
    ])
    expect(draft.offers[0].compensation.oneOffPayments).toEqual([])
  })
})
