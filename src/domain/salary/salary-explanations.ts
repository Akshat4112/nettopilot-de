import type { SalaryPeriodTotals2026 } from './salary-aggregation'

export const SALARY_EXPLANATION_FIELDS_2026 = [
  'grossCents',
  'recurringGrossCents',
  'oneOffGrossCents',
  'guaranteedGrossCents',
  'variableGrossCents',
  'wageTaxCents',
  'solidarityCents',
  'churchTaxCents',
  'employeePensionCents',
  'employeeUnemploymentCents',
  'employeeHealthCents',
  'employeeCareCents',
  'oneOffEmployeeSocialInsuranceCents',
  'employeeSocialInsuranceCents',
  'privateInsuranceOutflowCents',
  'allDeductionsCents',
  'netPayrollCents',
  'disposableAfterPrivateInsuranceCents',
  'employerPensionCents',
  'employerUnemploymentCents',
  'employerHealthCents',
  'employerCareCents',
  'oneOffEmployerSocialInsuranceCents',
  'employerSocialInsuranceCents',
  'employerCostCents',
] as const satisfies readonly (keyof SalaryPeriodTotals2026)[]

export type SalaryExplanationField2026 =
  (typeof SALARY_EXPLANATION_FIELDS_2026)[number]

export interface SalaryLineItemProvenance2026 {
  readonly assumptionSetId: string
  readonly assumptionVersion: string
  readonly sourceIds: readonly [string, ...string[]]
  readonly formulaId: string
  /** A human-readable explanation of the reviewed formula, not executable code. */
  readonly formulaDescription: { readonly de: string; readonly en: string }
}

export interface SalaryExplanationInput2026 {
  readonly period: 'monthly' | 'annual'
  readonly totals: SalaryPeriodTotals2026
  readonly provenance: Readonly<
    Partial<Record<SalaryExplanationField2026, SalaryLineItemProvenance2026>>
  >
}

export interface SalaryExplanationLineItem2026 {
  readonly field: SalaryExplanationField2026
  readonly label: { readonly de: string; readonly en: string }
  readonly amountCents: number
  readonly unit: 'EUR_CENTS'
  readonly category: 'earnings' | 'tax' | 'employee_insurance' | 'employer_insurance' | 'cash' | 'employer_cost'
  readonly assumptionSetId: string
  readonly assumptionVersion: string
  readonly sourceIds: readonly string[]
  readonly formulaId: string
  readonly formulaDescription: { readonly de: string; readonly en: string }
}

export type SalaryExplanation2026 =
  | { readonly state: 'incomplete'; readonly reason: 'provenance_missing'; readonly field: SalaryExplanationField2026 }
  | {
      readonly state: 'calculated'
      readonly calculationYear: 2026
      readonly period: 'monthly' | 'annual'
      readonly lines: readonly SalaryExplanationLineItem2026[]
    }

type Group = SalaryExplanationLineItem2026['category']

const labels: Readonly<Record<SalaryExplanationField2026, { de: string; en: string; category: Group }>> = {
  grossCents: { de: 'Brutto gesamt', en: 'Total gross', category: 'earnings' },
  recurringGrossCents: { de: 'Laufendes Brutto', en: 'Recurring gross', category: 'earnings' },
  oneOffGrossCents: { de: 'Einmalzahlungen', en: 'One-off gross', category: 'earnings' },
  guaranteedGrossCents: { de: 'Garantiertes Brutto', en: 'Guaranteed gross', category: 'earnings' },
  variableGrossCents: { de: 'Variables Brutto', en: 'Variable gross', category: 'earnings' },
  wageTaxCents: { de: 'Lohnsteuer', en: 'Wage tax', category: 'tax' },
  solidarityCents: { de: 'Solidaritätszuschlag', en: 'Solidarity surcharge', category: 'tax' },
  churchTaxCents: { de: 'Kirchensteuer', en: 'Church tax', category: 'tax' },
  employeePensionCents: { de: 'Rentenversicherung (AN, laufend)', en: 'Employee pension (recurring)', category: 'employee_insurance' },
  employeeUnemploymentCents: { de: 'Arbeitslosenversicherung (AN, laufend)', en: 'Employee unemployment (recurring)', category: 'employee_insurance' },
  employeeHealthCents: { de: 'Krankenversicherung (AN, laufend)', en: 'Employee health (recurring)', category: 'employee_insurance' },
  employeeCareCents: { de: 'Pflegeversicherung (AN, laufend)', en: 'Employee care (recurring)', category: 'employee_insurance' },
  oneOffEmployeeSocialInsuranceCents: { de: 'Sozialversicherung auf Einmalzahlungen (AN)', en: 'Employee insurance on one-off payments', category: 'employee_insurance' },
  employeeSocialInsuranceCents: { de: 'Sozialversicherung (AN gesamt)', en: 'Total employee insurance', category: 'employee_insurance' },
  privateInsuranceOutflowCents: { de: 'Private Versicherungszahlung nach Zuschuss', en: 'Private insurance cash cost after subsidy', category: 'cash' },
  allDeductionsCents: { de: 'Abzüge einschließlich PKV', en: 'Total deductions including PKV', category: 'cash' },
  netPayrollCents: { de: 'Netto laut Abrechnung', en: 'Payroll net', category: 'cash' },
  disposableAfterPrivateInsuranceCents: { de: 'Verfügbar nach PKV', en: 'Disposable after private insurance', category: 'cash' },
  employerPensionCents: { de: 'Rentenversicherung (AG, laufend)', en: 'Employer pension (recurring)', category: 'employer_insurance' },
  employerUnemploymentCents: { de: 'Arbeitslosenversicherung (AG, laufend)', en: 'Employer unemployment (recurring)', category: 'employer_insurance' },
  employerHealthCents: { de: 'Krankenversicherung (AG, laufend)', en: 'Employer health (recurring)', category: 'employer_insurance' },
  employerCareCents: { de: 'Pflegeversicherung (AG, laufend)', en: 'Employer care (recurring)', category: 'employer_insurance' },
  oneOffEmployerSocialInsuranceCents: { de: 'Sozialversicherung Einmalzahlungen (AG)', en: 'Employer insurance on one-off payments', category: 'employer_insurance' },
  employerSocialInsuranceCents: { de: 'Sozialversicherung (AG gesamt)', en: 'Total employer insurance', category: 'employer_insurance' },
  employerCostCents: { de: 'Arbeitgeberkosten', en: 'Employer costs', category: 'employer_cost' },
}

export const explainSalaryResults2026 = (
  input: SalaryExplanationInput2026,
): SalaryExplanation2026 => {
  const lines: SalaryExplanationLineItem2026[] = []
  for (const field of SALARY_EXPLANATION_FIELDS_2026) {
    const evidence = input.provenance[field]
    if (
      evidence === undefined ||
      !evidence.assumptionSetId.trim() ||
      !evidence.assumptionVersion.trim() ||
      !evidence.formulaId.trim() ||
      !evidence.formulaDescription.de.trim() ||
      !evidence.formulaDescription.en.trim() ||
      evidence.sourceIds.length === 0 ||
      evidence.sourceIds.some((id) => !id.trim())
    )
      return { state: 'incomplete', reason: 'provenance_missing', field }
    const amount = input.totals[field]
    if (!Number.isSafeInteger(amount))
      throw new RangeError('Explainable salary amounts must be safe integer cents')
    const label = labels[field]
    lines.push({
      field,
      label: { de: label.de, en: label.en },
      amountCents: amount,
      unit: 'EUR_CENTS',
      category: label.category,
      assumptionSetId: evidence.assumptionSetId,
      assumptionVersion: evidence.assumptionVersion,
      sourceIds: evidence.sourceIds,
      formulaId: evidence.formulaId,
      formulaDescription: evidence.formulaDescription,
    })
  }
  return { state: 'calculated', calculationYear: 2026, period: input.period, lines }
}
