import { describe, expect, it } from 'vitest'
import {
  admitSalaryBoundary2026,
  type SalaryBoundaryInput2026,
} from './salary-boundary'

const base: SalaryBoundaryInput2026 = {
  calculationYear: 2026,
  annualGrossCents: 6000000,
  employment: 'ordinary_employee',
  taxClass: 1,
  healthCoverage: 'statutory',
  contributionDays: 360,
  taxEvidenceConfirmed: true,
  result: { state: 'incomplete', month: 1, reason: 'payroll_details_missing' },
}

describe('2026 salary boundary admission', () => {
  it('fails closed for unsupported calculation years and employment', () => {
    expect(
      admitSalaryBoundary2026({ ...base, calculationYear: 2025 }),
    ).toMatchObject({
      state: 'unsupported',
      reason: 'calculation_year_unsupported',
    })
    expect(
      admitSalaryBoundary2026({ ...base, employment: 'cross_border' }),
    ).toMatchObject({
      state: 'unsupported',
      reason: 'employment_type_unsupported',
    })
  })

  it('reports missing gross and payroll evidence without estimating zero', () => {
    expect(
      admitSalaryBoundary2026({ ...base, annualGrossCents: null }),
    ).toMatchObject({
      state: 'incomplete',
      reason: 'gross_salary_required',
    })
    expect(
      admitSalaryBoundary2026({ ...base, taxEvidenceConfirmed: false }),
    ).toMatchObject({
      state: 'incomplete',
      reason: 'tax_evidence_unconfirmed',
    })
  })

  it('propagates incomplete monthly payroll states', () => {
    expect(admitSalaryBoundary2026(base)).toMatchObject({
      state: 'incomplete',
      reason: 'payroll_details_missing',
    })
  })

  it('rejects negative money and contribution days', () => {
    expect(() =>
      admitSalaryBoundary2026({ ...base, annualGrossCents: -1 }),
    ).toThrow(RangeError)
    expect(() =>
      admitSalaryBoundary2026({ ...base, contributionDays: 361 }),
    ).toThrow(RangeError)
  })
  it('requests employment, tax class, insurance and contribution history separately', () => {
    expect(admitSalaryBoundary2026({ ...base, employment: 'unknown' })).toMatchObject({
      state: 'incomplete', reason: 'employment_type_required',
    })
    expect(admitSalaryBoundary2026({ ...base, taxClass: 'unknown' })).toMatchObject({
      state: 'incomplete', reason: 'tax_class_required',
    })
    expect(admitSalaryBoundary2026({ ...base, healthCoverage: 'unknown' })).toMatchObject({
      state: 'incomplete', reason: 'health_coverage_required',
    })
    expect(admitSalaryBoundary2026({ ...base, contributionDays: null })).toMatchObject({
      state: 'incomplete', reason: 'contribution_history_required',
    })
  })

  it('does not admit mismatched annual pay as a valid result', () => {
    const result = admitSalaryBoundary2026({
      ...base,
      result: {
        state: 'calculated',
        calculationYear: 2026,
        months: [],
        annual: { grossCents: 5000000 } as never,
        recurringMonthlyNetCents: null,
        recurringMonthlyNetIsStable: false,
      },
    })
    expect(result).toMatchObject({
      state: 'unsupported', reason: 'annual_gross_reconciliation_mismatch',
    })
  })

})
