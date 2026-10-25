import { describe, expect, it } from 'vitest'
import { validateAdvancedSalaryDraft, type AdvancedSalaryDraft } from './AdvancedSalaryInputs'

const blank: AdvancedSalaryDraft = {
  annualTaxAllowanceEur: '',
  annualTaxAdditionEur: '',
  additionalHealthRatePercent: '',
  privateHealthPremiumEur: '',
  privateCarePremiumEur: '',
  oneOffBonusEur: '',
  oneOffBonusMonth: '',
}

describe('2026 optional advanced salary settings', () => {
  it('allows a blank advanced section without changing essential inputs', () => {
    expect(validateAdvancedSalaryDraft(blank, 'statutory')).toEqual([])
    expect(validateAdvancedSalaryDraft(blank, 'private')).toEqual([])
  })

  it('accepts a valid one-off bonus and insurer-specific rate', () => {
    expect(validateAdvancedSalaryDraft({
      ...blank,
      annualTaxAllowanceEur: '1200.50',
      oneOffBonusEur: '5000.00',
      oneOffBonusMonth: '12',
      additionalHealthRatePercent: '2.9',
    }, 'statutory')).toEqual([])
  })

  it('requires a bonus month and rejects invalid monetary precision', () => {
    const errors = validateAdvancedSalaryDraft({
      ...blank, oneOffBonusEur: '500.123', annualTaxAdditionEur: '-1',
    }, 'statutory')
    expect(errors.some((error) => error.includes('bonus'))).toBe(true)
    expect(errors.some((error) => error.includes('addition'))).toBe(true)
  })

  it('prevents statutorily insured users from entering private premiums', () => {
    expect(validateAdvancedSalaryDraft({
      ...blank, privateHealthPremiumEur: '800.00',
    }, 'statutory')).toContain(
      'Private premiums are available only with private health insurance.',
    )
  })

  it('prevents PKV users from entering the statutory additional rate', () => {
    expect(validateAdvancedSalaryDraft({
      ...blank, additionalHealthRatePercent: '2.9',
    }, 'private')).toContain(
      'Statutory additional rate is available only with statutory health insurance.',
    )
  })
})
