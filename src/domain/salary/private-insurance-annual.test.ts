import { describe, expect, it } from 'vitest'
import { calculateAnnualPrivateInsurance2026 } from './private-insurance-annual'
import type { PrivateInsuranceInput2026 } from './private-insurance'

const standard: PrivateInsuranceInput2026 = {
  calculationYear: 2026,
  coverageConfirmed: true,
  employerSubsidyEligibility: 'eligible',
  employmentState: 'DE-BW',
  valueSource: 'payslip',
  totalHealthPremiumCents: 85000,
  totalCarePremiumCents: 18000,
  subsidyEligibleHealthPremiumCents: 85000,
  subsidyEligibleCarePremiumCents: 18000,
  payrollBasicCoverageCents: 90000,
  assessableEmploymentIncomeCents: 600000,
}

describe('annual 2026 private insurance', () => {
  it('sums 12 separate employer subsidy and premium months', () => {
    const result = calculateAnnualPrivateInsurance2026(
      Array.from({ length: 12 }, () => standard),
    )
    expect(result).toMatchObject({
      state: 'calculated',
      annualEmployerHealthSubsidyCents: 510000,
      annualEmployerCareSubsidyCents: 108000,
      annualPremiumsCents: 1236000,
      annualAfterInsuranceCostCents: 618000,
    })
  })

  it('preserves midyear premium changes instead of extrapolating', () => {
    const months = Array.from({ length: 12 }, (_, month) => ({
      ...standard,
      totalHealthPremiumCents: month < 6 ? 85000 : 95000,
      subsidyEligibleHealthPremiumCents: month < 6 ? 85000 : 95000,
    }))
    const result = calculateAnnualPrivateInsurance2026(months)
    expect(result).toMatchObject({
      state: 'calculated',
      annualPremiumsCents: 1296000,
      annualEmployerHealthSubsidyCents: 540000,
    })
  })

  it('propagates an incomplete month without fabricating annual net', () => {
    const months = Array.from({ length: 12 }, () => standard)
    months[4] = { ...standard, employerSubsidyEligibility: 'unknown' }
    expect(calculateAnnualPrivateInsurance2026(months)).toMatchObject({
      state: 'incomplete',
      month: 5,
      reason: 'subsidy_eligibility_unknown',
    })
  })

  it('requires exactly twelve months', () => {
    expect(calculateAnnualPrivateInsurance2026([standard])).toMatchObject({
      state: 'incomplete',
      reason: 'twelve_months_required',
    })
  })
})
