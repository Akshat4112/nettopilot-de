import { describe, expect, it } from 'vitest'
import {
  calculatePrivateInsurance2026,
  type PrivateInsuranceInput2026,
} from './private-insurance'

const base: PrivateInsuranceInput2026 = {
  calculationYear: 2026,
  coverageConfirmed: true,
  employerSubsidyEligibility: 'eligible',
  employmentState: 'DE-BW',
  valueSource: 'elstam',
  totalHealthPremiumCents: 85000,
  totalCarePremiumCents: 18000,
  subsidyEligibleHealthPremiumCents: 85000,
  subsidyEligibleCarePremiumCents: 18000,
  payrollBasicCoverageCents: 90000,
  assessableEmploymentIncomeCents: 600000,
}

describe('2026 private health and care insurance', () => {
  it('caps employer contributions at half the eligible premium', () => {
    const result = calculatePrivateInsurance2026(base)
    expect(result).toMatchObject({
      state: 'calculated',
      healthEmployerCapCents: 50859,
      careEmployerCapCents: 10463,
      employerHealthSubsidyCents: 42500,
      employerCareSubsidyCents: 9000,
      employerSubsidyTotalCents: 51500,
      employeeAfterInsuranceCostCents: 51500,
      pap: { PKV: 1, PKPV: 90000, PKPVAGZ: 51500 },
    })
  })

  it('uses Saxony care limit and remuneration-based caps', () => {
    const result = calculatePrivateInsurance2026({
      ...base,
      employmentState: 'DE-SN',
      assessableEmploymentIncomeCents: 300000,
    })
    expect(result).toMatchObject({
      state: 'calculated',
      healthEmployerCapCents: 26250,
      careEmployerCapCents: 3900,
      employerHealthSubsidyCents: 26250,
      employerCareSubsidyCents: 3900,
    })
  })

  it('preserves actual payroll contributions when valid', () => {
    expect(
      calculatePrivateInsurance2026({
      ...base,
      actualEmployerHealthSubsidyCents: 40000,
      actualEmployerCareSubsidyCents: 8000,
      }),
    ).toMatchObject({
      state: 'calculated',
      resultQuality: 'payroll_aligned',
      pap: { PKV: 1, PKPV: 90000, PKPVAGZ: 48000 },
    })
  })

  it('returns zero subsidy for confirmed ineligible employees', () => {
    expect(
      calculatePrivateInsurance2026({
      ...base,
      employerSubsidyEligibility: 'not_eligible',
      }),
    ).toMatchObject({
      state: 'calculated',
      employerSubsidyTotalCents: 0,
      employeeAfterInsuranceCostCents: 103000,
    })
  })

  it.each([
    [{ employerSubsidyEligibility: 'unknown' }, 'subsidy_eligibility_unknown'],
    [{ employmentState: 'unknown' }, 'employment_state_unknown'],
    [{ payrollBasicCoverageCents: undefined }, 'tax_eligible_amount_missing'],
    [
      { subsidyEligibleHealthPremiumCents: undefined },
      'subsidy_eligible_contribution_missing',
    ],
    [{ disputedElstam: true }, 'elstam_disputed'],
    [{ coverageConfirmed: false }, 'private_coverage_not_confirmed'],
  ] as const)('fails closed for %o', (change, reason) => {
    expect(calculatePrivateInsurance2026({ ...base, ...change })).toMatchObject({
      state: 'incomplete',
      reason,
    })
  })

  it('rejects subsidy amounts exceeding the calculated cap', () => {
    expect(
      calculatePrivateInsurance2026({
      ...base,
      actualEmployerHealthSubsidyCents: 60000,
      }),
    ).toMatchObject({
      state: 'unsupported',
      reason: 'employer_subsidy_exceeds_statutory_cap',
    })
  })

  it('rejects a subsidy for an ineligible employee', () => {
    expect(
      calculatePrivateInsurance2026({
      ...base,
      employerSubsidyEligibility: 'not_eligible',
      actualEmployerHealthSubsidyCents: 100,
      }),
    ).toMatchObject({
      state: 'unsupported',
      reason: 'ineligible_employee_has_subsidy',
    })
  })

  it('requires care evidence when only health subsidy is documented', () => {
    expect(
      calculatePrivateInsurance2026({
      ...base,
      subsidyEligibleCarePremiumCents: undefined,
      actualEmployerHealthSubsidyCents: 40000,
      }),
    ).toMatchObject({
      state: 'incomplete',
      reason: 'subsidy_eligible_contribution_missing',
    })
  })

  it('rejects negative inputs and incorrect year', () => {
    expect(() =>
      calculatePrivateInsurance2026({
      ...base,
      totalHealthPremiumCents: -1,
      }),
    ).toThrow(RangeError)
    expect(() =>
      calculatePrivateInsurance2026({
      ...base,
      calculationYear: 2025,
      }),
    ).toThrow(RangeError)
  })
})
