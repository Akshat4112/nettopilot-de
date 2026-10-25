import { describe, expect, it } from 'vitest'
import { calculateSimpleSalary2026 } from './calculate-simple-salary'
import type { Calculator2026Input } from './calculate-simple-salary'

const valid: Calculator2026Input = {
  essential: {
    gross: '5000.00',
    period: 'monthly',
    year: '2026',
    taxClass: '4',
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

describe('2026 admitted salary calculation', () => {
  it('calculates all twelve months using the tax and insurance engines', () => {
    const result = calculateSimpleSalary2026(valid)
    expect(result.state).toBe('calculated')
    if (result.state !== 'calculated') return
    expect(result.months).toHaveLength(12)
    expect(result.annual.grossCents).toBe(6_000_000)
    expect(result.annual.wageTaxCents).toBeGreaterThan(0)
    expect(result.annual.employeeSocialInsuranceCents).toBeGreaterThan(0)
    expect(result.annual.netPayrollCents).toBeLessThan(6_000_000)
    expect(result.annual.employerCostCents).toBeGreaterThan(6_000_000)
    expect(result.annual.grossCents).toBe(
      result.annual.netPayrollCents + result.annual.allDeductionsCents,
    )
  })

  it('requires confirmation and does not silently accept private insurance', () => {
    expect(
      calculateSimpleSalary2026({
        ...valid,
        standardEmploymentConfirmed: false,
      }),
    ).toMatchObject({
      state: 'incomplete',
      reason: 'standard_employment_confirmation_required',
    })
    expect(
      calculateSimpleSalary2026({
        ...valid,
        essential: { ...valid.essential, insurance: 'private' },
      }),
    ).toMatchObject({
      state: 'unsupported',
      reason: 'private_insurance_payslip_details_required',
    })
  })

  it('rejects unsupported bonus and church-tax cases', () => {
    expect(
      calculateSimpleSalary2026({
        ...valid,
        advanced: {
          ...valid.advanced,
          oneOffBonusEur: '1000',
          oneOffBonusMonth: '10',
        },
      }).state,
    ).toBe('unsupported')
    expect(
      calculateSimpleSalary2026({
        ...valid,
        essential: { ...valid.essential, churchTax: 'liable' },
      }).state,
    ).toBe('unsupported')
  })

  it('rejects annual salaries requiring unresolved monthly cent allocations', () => {
    expect(
      calculateSimpleSalary2026({
        ...valid,
        essential: { ...valid.essential, gross: '50000.01', period: 'annual' },
      }),
    ).toMatchObject({
      state: 'unsupported',
      reason: 'annual_salary_requires_monthly_cent_allocation',
    })
  })

  it('uses separately entered insurer rate and the source-backed care state', () => {
    const average = calculateSimpleSalary2026(valid)
    const insurer = calculateSimpleSalary2026({
      ...valid,
      advanced: { ...valid.advanced, additionalHealthRatePercent: '3.5' },
      essential: { ...valid.essential, federalState: 'DE-SN' },
    })
    expect(average.state).toBe('calculated')
    expect(insurer.state).toBe('calculated')
    if (average.state !== 'calculated' || insurer.state !== 'calculated') return
    expect(average.annual.employeeHealthCents).toBeLessThan(
      insurer.annual.employeeHealthCents,
    )
    expect(average.annual.employeeCareCents).not.toBe(
      insurer.annual.employeeCareCents,
    )
  })
})
