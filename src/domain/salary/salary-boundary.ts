import type { SalaryAggregationResult2026 } from './salary-aggregation'

export interface SalaryBoundaryInput2026 {
  readonly calculationYear: number
  readonly annualGrossCents: number | null
  readonly employment:
    | 'ordinary_employee'
    | 'multiple_employers'
    | 'cross_border'
    | 'mini_job'
    | 'midijob'
    | 'civil_servant'
    | 'self_employed'
    | 'unknown'
  readonly taxClass: 1 | 2 | 3 | 4 | 5 | 6 | 'unknown'
  readonly healthCoverage: 'statutory' | 'private' | 'unknown'
  readonly contributionDays: number | null
  readonly taxEvidenceConfirmed: boolean
  readonly result: SalaryAggregationResult2026
}

export type SalaryBoundaryDecision2026 =
  | { readonly state: 'incomplete' | 'unsupported'; readonly reason: string }
  | {
      readonly state: 'calculated'
      readonly calculationYear: 2026
      readonly warnings: readonly string[]
      readonly result: Extract<SalaryAggregationResult2026, { state: 'calculated' }>
    }

export const admitSalaryBoundary2026 = (
  input: SalaryBoundaryInput2026,
): SalaryBoundaryDecision2026 => {
  if (input.calculationYear !== 2026)
    return { state: 'unsupported', reason: 'calculation_year_unsupported' }
  if (input.employment === 'unknown')
    return { state: 'incomplete', reason: 'employment_type_required' }
  if (input.employment !== 'ordinary_employee')
    return { state: 'unsupported', reason: 'employment_type_unsupported' }
  if (input.annualGrossCents === null)
    return { state: 'incomplete', reason: 'gross_salary_required' }
  if (!Number.isSafeInteger(input.annualGrossCents) || input.annualGrossCents < 0)
    throw new RangeError('Annual gross must be non-negative safe integer cents')
  if (input.taxClass === 'unknown')
    return { state: 'incomplete', reason: 'tax_class_required' }
  if (input.healthCoverage === 'unknown')
    return { state: 'incomplete', reason: 'health_coverage_required' }
  if (input.contributionDays === null)
    return { state: 'incomplete', reason: 'contribution_history_required' }
  if (!Number.isInteger(input.contributionDays) ||
      input.contributionDays < 0 || input.contributionDays > 360)
    throw new RangeError('Contribution days must be within 0–360')
  if (!input.taxEvidenceConfirmed)
    return { state: 'incomplete', reason: 'tax_evidence_unconfirmed' }
  if (input.result.state !== 'calculated')
    return { state: input.result.state, reason: input.result.reason }
  if (input.result.annual.grossCents !== input.annualGrossCents)
    return { state: 'unsupported', reason: 'annual_gross_reconciliation_mismatch' }

  return {
    state: 'calculated',
    calculationYear: 2026,
    warnings: input.annualGrossCents === 0 ? ['zero_salary'] : [],
    result: input.result,
  }
}
