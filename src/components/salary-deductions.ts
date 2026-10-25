import type { SalaryPeriodTotals2026 } from '../domain/salary/salary-aggregation'

interface DeductionLine {
  readonly key: keyof SalaryPeriodTotals2026
  readonly name: string
  readonly explanation: string
  readonly source: string
  readonly amountCents: number
}

const definitions = [
  {
    key: 'wageTaxCents',
    name: 'Wage tax',
    explanation:
      'The 2026 BMF payroll-tax algorithm determines withholding based on the admitted wage, tax class and statutory allowances.',
    source: 'DE-BMF-PAP-2026-A1',
  },
  {
    key: 'solidarityCents',
    name: 'Solidarity surcharge',
    explanation:
      'Calculated from the wage-tax assessment base under the 2026 exemption and transition rules; this is not a flat percentage of gross salary.',
    source: '2026 solidarity surcharge rules',
  },
  {
    key: 'churchTaxCents',
    name: 'Church tax',
    explanation:
      'Only non-liable scenarios are currently admitted by the calculator; church-tax-liable cases require additional rule evidence.',
    source: 'NP-CALC-012',
  },
  {
    key: 'employeePensionCents',
    name: 'Employee pension insurance',
    explanation:
      'The pension-insurance module calculates the employee contribution from pension-liable earnings, its 2026 ceiling and contribution rate.',
    source: 'DE-DRV-SV-VALUES-2026',
  },
  {
    key: 'employeeUnemploymentCents',
    name: 'Employee unemployment insurance',
    explanation:
      'The unemployment-insurance module calculates the employee share using 2026 assessable wages, the contribution ceiling and rounding rules.',
    source: 'DE-SGBIII-341',
  },
  {
    key: 'employeeHealthCents',
    name: 'Employee statutory health insurance',
    explanation:
      'The health-insurance module uses the 2026 general rate and the selected additional rate, subject to the statutory contribution ceiling.',
    source: 'DE-SGBV-241 / DE-SGBV-242',
  },
  {
    key: 'employeeCareCents',
    name: 'Employee long-term care insurance',
    explanation:
      'The care-insurance module considers the employment state, age, child status, applicable reductions, 2026 rates and assessable-pay ceiling.',
    source: 'DE-SGBXI-55 / DE-SGBXI-58',
  },
  {
    key: 'oneOffEmployeeSocialInsuranceCents',
    name: 'Insurance on one-off payments',
    explanation:
      'One-off contributions require independently admitted settlement and must not be treated as recurring monthly insurance.',
    source: 'NP-CALC-014',
  },
  {
    key: 'privateInsuranceOutflowCents',
    name: 'Private insurance cash outflow',
    explanation:
      'This is an external premium payment after the applicable employer subsidy, not a payroll-net deduction.',
    source: 'NP-CALC-013',
  },
] as const satisfies readonly {
  key: keyof SalaryPeriodTotals2026
  name: string
  explanation: string
  source: string
}[]

export const buildDeductionLines2026 = (
  totals: SalaryPeriodTotals2026,
): readonly DeductionLine[] =>
  definitions.map((definition) => ({
    ...definition,
    amountCents: totals[definition.key],
  }))

/** Share of gross (not an insurance or tax rate); integer-cent arithmetic. */
export const percentageOfGross = (
  amountCents: number,
  grossCents: number,
): string => {
  if (grossCents === 0) return '—'
  if (!Number.isSafeInteger(amountCents) || !Number.isSafeInteger(grossCents))
    throw new RangeError('Deduction percentage requires safe integer cents')
  const hundredths =
    (BigInt(amountCents) * 10_000n + BigInt(grossCents) / 2n) /
    BigInt(grossCents)
  return (
    (hundredths / 100n).toString() +
    '.' +
    (hundredths % 100n).toString().padStart(2, '0') +
    '%'
  )
}

