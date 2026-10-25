import { describe, expect, it } from 'vitest'
import { validateEssentialSalaryDraft } from './essential-salary-validation'
import type { EssentialSalaryDraft } from './EssentialSalaryInputs'

const valid: EssentialSalaryDraft = {
  gross: '5000.00',
  period: 'monthly',
  year: '2026',
  taxClass: '4',
  federalState: 'DE-BW',
  churchTax: 'not_liable',
  dateOfBirth: '1990-01-01',
  children: '0',
  insurance: 'statutory',
}

describe('essential payroll field validation', () => {
  it('accepts complete supported inputs', () => {
    expect(validateEssentialSalaryDraft(valid)).toEqual({})
  })
  it('reports field-specific missing and unknown choices', () => {
    const result = validateEssentialSalaryDraft({
      ...valid,
      gross: '',
      churchTax: 'unknown',
      insurance: 'unknown',
    })
    expect(result.gross).toBeDefined()
    expect(result.churchTax).toContain('Confirm')
    expect(result.insurance).toContain('Confirm')
  })
  it('rejects impossible dates, cents, unsupported states and children', () => {
    const result = validateEssentialSalaryDraft({
      ...valid,
      gross: '10.999',
      dateOfBirth: '2026-02-30',
      federalState: 'XX',
      children: '21',
    })
    expect(Object.keys(result)).toEqual(
      expect.arrayContaining([
        'gross',
        'dateOfBirth',
        'federalState',
        'children',
      ]),
    )
  })
  it('applies annual gross threshold consistently', () => {
    expect(
      validateEssentialSalaryDraft({
        ...valid,
        gross: '900000',
        period: 'monthly',
      }).gross,
    ).toBeDefined()
    expect(
      validateEssentialSalaryDraft({
        ...valid,
        gross: '900000',
        period: 'annual',
      }).gross,
    ).toBeUndefined()
  })
})
