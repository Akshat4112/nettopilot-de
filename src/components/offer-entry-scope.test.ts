import { describe, expect, it } from 'vitest'
import { evaluateOfferEntryScope } from './offer-entry-scope'
import { emptyAdditionalPay } from './offer-additional-pay'

describe('early raw offer payroll scope', () => {
  it('reports an unsupported salary while the shared payroll profile is unknown', () => {
    const result = evaluateOfferEntryScope(
      { grossEur: '85000', period: 'annual' },
      emptyAdditionalPay(),
    )
    expect(result.state).toBe('unsupported')
    expect(result.issues.map((issue) => issue.reason)).toContain(
      'special_or_voluntary_insurance_check_required',
    )
  })

  it('identifies annual cent allocation independently of the payroll profile', () => {
    const result = evaluateOfferEntryScope(
      { grossEur: '48000.01', period: 'annual' },
      emptyAdditionalPay(),
    )
    expect(result.issues.map((issue) => issue.reason)).toEqual([
      'annual_salary_requires_monthly_cent_allocation',
    ])
  })

  it('reports special payments even if the salary and payment month are missing', () => {
    const result = evaluateOfferEntryScope(
      { grossEur: '', period: 'annual' },
      { ...emptyAdditionalPay(), oneOffEur: '500' },
    )
    expect(result.state).toBe('unsupported')
    expect(result.issues.map((issue) => issue.reason)).toContain(
      'advanced_payroll_settlement_not_connected',
    )
    expect(result.inputErrors).toContain(
      'Choose the payment month for the one-time payment.',
    )
  })

  it('reports variable pay separately from base salary', () => {
    expect(
      evaluateOfferEntryScope(
        { grossEur: '4000', period: 'monthly' },
        { ...emptyAdditionalPay(), expectedVariableEur: '100' },
      ).state,
    ).toBe('unsupported')
  })

  it('distinguishes missing and malformed base salary from a base salary in scope', () => {
    expect(
      evaluateOfferEntryScope(
        { grossEur: '', period: 'annual' },
        emptyAdditionalPay(),
      ).state,
    ).toBe('incomplete')
    const invalid = evaluateOfferEntryScope(
      { grossEur: 'abc', period: 'annual' },
      emptyAdditionalPay(),
    )
    expect(invalid.state).toBe('invalid')
    expect(invalid.issues).toEqual([])
    expect(
      evaluateOfferEntryScope(
        { grossEur: '48000', period: 'annual' },
        emptyAdditionalPay(),
      ).state,
    ).toBe('within_base_scope')
  })
})
