import type { EssentialSalaryDraft } from './EssentialSalaryInputs'
import type { AdvancedSalaryDraft } from './advanced-salary-validation'
import { validateEssentialSalaryDraft } from './essential-salary-validation'
import { validateAdvancedSalaryDraft } from './advanced-salary-validation'
import type {
  DecimalString,
  FederalStateCode,
  IsoDate,
  RegistryOptionId,
  SocialInsuranceInput,
  WageTaxInput,
} from '../domain/salary/types'
import { buildPapInput } from '../domain/salary/taxable-pay'
import { calculatePayrollTax2026 } from '../domain/salary/payroll-tax'
import { calculatePensionContribution2026 } from '../domain/salary/pension'
import { calculateUnemploymentContribution2026 } from '../domain/salary/unemployment'
import { calculateStatutoryHealthContribution2026 } from '../domain/salary/health'
import { calculateCareContribution2026 } from '../domain/salary/care'
import {
  aggregateSalaryResults2026,
  type SalaryAggregationResult2026,
  type SalaryMonthAdmission2026,
} from '../domain/salary/salary-aggregation'
import { admitSalaryBoundary2026 } from '../domain/salary/salary-boundary'
import {
  getPayrollScopeIssues,
  parsePayrollEuroCents,
  PAYROLL_SCOPE_2026,
} from './payroll-scope'

export interface Calculator2026Input {
  readonly essential: EssentialSalaryDraft
  readonly advanced: AdvancedSalaryDraft
  /** Explicitly confirms standard ordinary employment, compulsory statutory
   * insurance, full 12-month employment and no special wage components. */
  readonly standardEmploymentConfirmed: boolean
}

const unavailable = (
  state: 'incomplete' | 'unsupported',
  reason: string,
): SalaryAggregationResult2026 => ({ state, reason, month: 0 })

const euroText = (cents: number): string =>
  String(Math.trunc(cents / 100)) + '.' + String(cents % 100).padStart(2, '0')

/** Source-backed, narrow admission; no inferred special payroll treatment. */
export function calculateSimpleSalary2026(
  data: Calculator2026Input,
): SalaryAggregationResult2026 {
  const { essential: input, advanced, standardEmploymentConfirmed } = data
  if (Object.keys(validateEssentialSalaryDraft(input)).length > 0)
    return unavailable('incomplete', 'essential_payroll_inputs_invalid')
  if (validateAdvancedSalaryDraft(advanced, input.insurance).length > 0)
    return unavailable('incomplete', 'advanced_payroll_inputs_invalid')
  if (!standardEmploymentConfirmed)
    return unavailable(
      'incomplete',
      'standard_employment_confirmation_required',
    )
  const scopeIssue = getPayrollScopeIssues(data)[0]
  if (scopeIssue) return unavailable('unsupported', scopeIssue.reason)

  const enteredCents = parsePayrollEuroCents(input.gross)
  if (enteredCents === null) return unavailable('incomplete', 'invalid_gross')
  const monthlyCents =
    input.period === 'annual'
      ? enteredCents / PAYROLL_SCOPE_2026.payrollMonths
      : enteredCents

  const additionalRate =
    advanced.additionalHealthRatePercent === ''
      ? ({ mode: 'published_average' } as const)
      : ({
          mode: 'insurer_specific',
          ratePercent: advanced.additionalHealthRatePercent,
        } as const)
  const zero = { amount: '0.00' as DecimalString, currency: 'EUR' as const }
  const tax: WageTaxInput = {
    taxClass: ('tax_class_' + input.taxClass) as RegistryOptionId,
    federalState: input.federalState as FederalStateCode,
    churchTaxStatus: 'not_liable',
    dateOfBirth: input.dateOfBirth as IsoDate,
    childAllowanceFactor: '0' as DecimalString,
    annualAllowanceAmount: zero,
    annualAdditionalAmount: zero,
  }
  const social: SocialInsuranceInput = {
    pensionStatus: 'compulsory' as RegistryOptionId,
    unemploymentStatus: 'compulsory' as RegistryOptionId,
    careInsuranceChildStatus: 'childless',
    childrenUnderRelevantAge: 0,
    health:
      additionalRate.mode === 'published_average'
        ? {
            healthInsuranceType: 'statutory',
            additionalRateMode: 'published_average',
          }
        : {
            healthInsuranceType: 'statutory',
            additionalRateMode: 'insurer_specific',
            additionalContributionRate: {
              value: additionalRate.ratePercent as DecimalString,
              unit: 'percent',
            },
          },
  }

  try {
    const { input: papInput } = buildPapInput({
      compensation: {
        baseSalary: {
          period: 'monthly',
          grossAmount: { amount: euroText(monthlyCents), currency: 'EUR' },
        },
        regularAdditionalCash: { kind: 'none' },
        oneOffPayments: [],
      },
      tax,
      social,
      calculationYear: PAYROLL_SCOPE_2026.year,
    })
    const payrollTax = calculatePayrollTax2026(papInput)
    const pension = calculatePensionContribution2026({
      liablePayCents: monthlyCents,
      contributionDays: 30,
      coverageStatus: 'general_statutory_mandatory',
      calculationYear: 2026,
    })
    const unemployment = calculateUnemploymentContribution2026({
      liablePayCents: monthlyCents,
      contributionDays: 30,
      coverageStatus: 'mandatory_standard',
      calculationYear: 2026,
    })
    const health = calculateStatutoryHealthContribution2026({
      liablePayCents: monthlyCents,
      contributionDays: 30,
      coverageStatus: 'statutory_mandatory_general',
      additionalRate,
      calculationYear: 2026,
    })
    if (pension.state !== 'calculated')
      return unavailable(pension.state, pension.reason)
    if (unemployment.state !== 'calculated')
      return unavailable(unemployment.state, unemployment.reason)
    if (health.state !== 'calculated')
      return unavailable(health.state, health.reason)

    const months: SalaryMonthAdmission2026[] = []
    for (let month = 1; month <= PAYROLL_SCOPE_2026.payrollMonths; month++) {
      const care = calculateCareContribution2026({
        liablePayCents: monthlyCents,
        contributionDays: 30,
        insurancePath: 'statutory',
        employmentState: input.federalState === 'DE-SN' ? 'saxony' : 'other',
        payrollYear: 2026,
        payrollMonth: month,
        birthDate: input.dateOfBirth,
        parentStatus: 'childless',
        evidenceStatus: 'scenario',
        calculationYear: 2026,
      })
      if (care.state !== 'calculated')
        return { state: care.state, reason: care.reason, month }
      months.push({
        state: 'calculated',
        value: {
          month,
          recurringGrossCents: monthlyCents,
          recurringWageTaxCents: payrollTax.wageTaxCents,
          recurringSolidarityCents: payrollTax.solidaritySurchargeCents,
          recurringChurchTaxCents: 0,
          employeePensionCents: pension.contribution.employeeCents,
          employeeUnemploymentCents: unemployment.contribution.employeeCents,
          employeeHealthCents: health.contribution.employeeCents,
          employeeCareCents: care.contribution.employeeCents,
          employerPensionCents: pension.contribution.employerCents,
          employerUnemploymentCents: unemployment.contribution.employerCents,
          employerHealthCents: health.contribution.employerCents,
          employerCareCents: care.contribution.employerCents,
          privateInsuranceOutflowCents: 0,
          guaranteedRecurringGrossCents: monthlyCents,
          oneOffPayments: [],
        },
      })
    }
    const aggregated = aggregateSalaryResults2026(months)
    const admitted = admitSalaryBoundary2026({
      calculationYear: 2026,
      annualGrossCents: monthlyCents * PAYROLL_SCOPE_2026.payrollMonths,
      employment: 'ordinary_employee',
      taxClass: Number(input.taxClass) as 1 | 3 | 4 | 5 | 6,
      healthCoverage: 'statutory',
      contributionDays: 360,
      taxEvidenceConfirmed: standardEmploymentConfirmed,
      result: aggregated,
    })
    return admitted.state === 'calculated'
      ? admitted.result
      : unavailable(admitted.state, admitted.reason)
  } catch {
    return unavailable(
      'unsupported',
      'payroll_calculation_could_not_be_validated',
    )
  }
}
