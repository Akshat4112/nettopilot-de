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

const amount = (cents: number): string =>
  new Intl.NumberFormat('en-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(cents / 100)

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

export function SalaryDeductionBreakdown({
  totals,
}: {
  readonly totals: SalaryPeriodTotals2026
}) {
  const lines = buildDeductionLines2026(totals)
  const listedTotal = lines.reduce((sum, line) => sum + line.amountCents, 0)
  if (listedTotal !== totals.allDeductionsCents)
    return (
      <p role="alert">
        Deduction details are unavailable because the line items do not
        reconcile with the total.
      </p>
    )

  return (
    <section aria-labelledby="deduction-heading">
      <h3 id="deduction-heading">Deduction breakdown</h3>
      <p>
        Annual 2026 amounts. Percentages show each deduction as a share of
        gross salary, not the statutory tax or insurance rate.
      </p>
      <div className="salary-deduction-scroll">
        <table className="salary-deduction-table">
          <caption>Annual employee deductions and external insurance costs</caption>
          <thead>
            <tr>
              <th scope="col">Deduction</th>
              <th scope="col">Amount</th>
              <th scope="col">Share of gross</th>
            </tr>
          </thead>
          <tbody>
            {lines.map((line) => (
              <tr key={line.key}>
                <th scope="row">
                  <span>{line.name}</span>
                  <details>
                    <summary>How {line.name.toLowerCase()} is calculated</summary>
                    <p>{line.explanation}</p>
                    <small>Source: {line.source}</small>
                  </details>
                </th>
                <td>{amount(line.amountCents)}</td>
                <td>{percentageOfGross(line.amountCents, totals.grossCents)}</td>
              </tr>
            ))}
            <tr>
              <th scope="row">Total deductions (including outside-payroll costs)</th>
              <td>{amount(totals.allDeductionsCents)}</td>
              <td>{percentageOfGross(totals.allDeductionsCents, totals.grossCents)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  )
}
