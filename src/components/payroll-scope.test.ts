import { describe, expect, it } from 'vitest'
import type { Calculator2026Input } from './calculate-simple-salary'
import { calculateSimpleSalary2026 } from './calculate-simple-salary'
import { evaluatePayrollScope } from './payroll-scope'

const valid: Calculator2026Input = {
  essential: {
    gross: '3500',
    period: 'monthly',
    year: '2026',
    taxClass: '1',
    federalState: 'DE-BW',
    churchTax: 'not_liable',
    dateOfBirth: '1990-01-01',
    children: '0',
    insurance: 'statutory',
  },
  advanced: {
    annualTaxAllowanceEur: '',
    annualTaxAdditionEur: '',
    additionalHealthRatePercent: '',
    privateHealthPremiumEur: '',
    privateCarePremiumEur: '',
    oneOffBonusEur: '',
    oneOffBonusMonth: '',
  },
  standardEmploymentConfirmed: true,
}

const withEssential = (
  patch: Partial<Calculator2026Input['essential']>,
): Calculator2026Input => ({
  ...valid,
  essential: { ...valid.essential, ...patch },
})

describe('early payroll scope guidance', () => {
  it.each([
    ['2000', false],
    ['2000.01', true],
    ['5799.99', true],
    ['5800', false],
  ])(
    'keeps monthly gross %s on the existing strict boundary (%s)',
    (gross, supported) => {
      const input = withEssential({ gross })
      expect(evaluatePayrollScope(input).state).toBe(
        supported ? 'within_scope' : 'unsupported',
      )
      expect(calculateSimpleSalary2026(input).state).toBe(
        supported ? 'calculated' : 'unsupported',
      )
    },
  )

  it.each([
    ['1962-12-31', false],
    ['1963-01-01', true],
    ['2002-12-31', true],
    ['2003-01-01', false],
  ])(
    'keeps birth date %s on the existing inclusive boundary (%s)',
    (dateOfBirth, supported) => {
      const input = withEssential({ dateOfBirth })
      expect(evaluatePayrollScope(input).state).toBe(
        supported ? 'within_scope' : 'unsupported',
      )
      expect(calculateSimpleSalary2026(input).state).toBe(
        supported ? 'calculated' : 'unsupported',
      )
    },
  )

  it('reveals independent unsupported selections before all essential fields are supplied', () => {
    const result = evaluatePayrollScope({
      ...withEssential({
        gross: '',
        taxClass: '',
        federalState: '',
        dateOfBirth: '',
        insurance: 'private',
      }),
      standardEmploymentConfirmed: false,
    })
    expect(result.state).toBe('unsupported')
    expect(result.issues.map((issue) => issue.reason)).toContain(
      'private_insurance_payslip_details_required',
    )
    expect(result.missingFields).toEqual([
      'gross',
      'taxClass',
      'federalState',
      'dateOfBirth',
    ])
    expect(result.confirmationRequired).toBe(true)
  })

  it('keeps invalid fields distinct and still reveals known church tax and children cases', () => {
    const result = evaluatePayrollScope(
      withEssential({
        gross: 'abc',
        dateOfBirth: '2003-02-30',
        churchTax: 'liable',
        children: '1',
      }),
    )
    expect(result.state).toBe('unsupported')
    expect(result.invalidFields).toEqual(['gross', 'dateOfBirth'])
    expect(result.issues.map((issue) => issue.reason)).toEqual([
      'church_tax_evidence_not_in_scope',
      'child_allowance_and_care_status_required',
    ])
  })

  it('does not label an invalid date or an unknown insurance choice as supported or out of scope', () => {
    const result = evaluatePayrollScope(
      withEssential({ dateOfBirth: '2003-02-30', insurance: 'unknown' }),
    )
    expect(result.state).toBe('incomplete')
    expect(result.issues).toEqual([])
    expect(result.invalidFields).toEqual(['dateOfBirth', 'insurance'])
  })

  it('explains annual cent allocation before a date or tax class is known', () => {
    const result = evaluatePayrollScope(
      withEssential({
        gross: '48000.01',
        period: 'annual',
        dateOfBirth: '',
        taxClass: '',
      }),
    )
    expect(result.issues.map((issue) => issue.reason)).toEqual([
      'annual_salary_requires_monthly_cent_allocation',
    ])
    expect(
      evaluatePayrollScope(withEssential({ gross: '48000', period: 'annual' }))
        .state,
    ).toBe('within_scope')
  })

  it.each([
    'annualTaxAllowanceEur',
    'annualTaxAdditionEur',
    'privateHealthPremiumEur',
    'privateCarePremiumEur',
    'oneOffBonusEur',
    'oneOffBonusMonth',
  ] as const)(
    'reveals %s outside the scope even when gross and payroll confirmation are missing',
    (field) => {
      const result = evaluatePayrollScope({
        ...withEssential({ gross: '' }),
        advanced: {
          ...valid.advanced,
          [field]: field === 'oneOffBonusMonth' ? '12' : '100',
        },
        standardEmploymentConfirmed: false,
      })
      expect(result.issues.map((issue) => issue.reason)).toContain(
        'advanced_payroll_settlement_not_connected',
      )
    },
  )

  it('allows an insurer rate without expanding payroll support', () => {
    expect(
      evaluatePayrollScope({
        ...valid,
        advanced: { ...valid.advanced, additionalHealthRatePercent: '3.5' },
      }).state,
    ).toBe('within_scope')
    const invalid = evaluatePayrollScope({
      ...valid,
      advanced: { ...valid.advanced, additionalHealthRatePercent: '11' },
    })
    expect(invalid.state).toBe('incomplete')
    expect(invalid.advancedErrors).toContain(
      'Additional statutory health rate must be between 0 and 10%.',
    )
  })

  it('requires confirmation without describing the unconfirmed draft as admitted', () => {
    expect(
      evaluatePayrollScope({ ...valid, standardEmploymentConfirmed: false }),
    ).toMatchObject({
      state: 'incomplete',
      confirmationRequired: true,
      issues: [],
    })
  })
})
