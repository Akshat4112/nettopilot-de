import type { SalaryPeriodTotals2026 } from '../domain/salary/salary-aggregation'
import { buildDeductionLines2026, percentageOfGross } from './salary-deductions'

const amount = (cents: number): string =>
  new Intl.NumberFormat('en-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(cents / 100)

export function SalaryDeductionBreakdown({
  totals,
  period = 'annual',
}: {
  readonly totals: SalaryPeriodTotals2026
  readonly period?: 'monthly' | 'annual'
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
        Amounts for {period} 2026. Percentages show a share of gross salary, not
        a statutory tax or insurance rate.
      </p>
      <div className="salary-deduction-scroll">
        <table className="salary-deduction-table">
          <caption>
            {period === 'annual' ? 'Annual' : 'Monthly'} employee deductions
          </caption>
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
                    <summary>
                      How {line.name.toLowerCase()} is calculated
                    </summary>
                    <p>{line.explanation}</p>
                    <small>Source: {line.source}</small>
                  </details>
                </th>
                <td>{amount(line.amountCents)}</td>
                <td>
                  {percentageOfGross(line.amountCents, totals.grossCents)}
                </td>
              </tr>
            ))}
            <tr>
              <th scope="row">
                Total deductions (including outside-payroll costs)
              </th>
              <td>{amount(totals.allDeductionsCents)}</td>
              <td>
                {percentageOfGross(
                  totals.allDeductionsCents,
                  totals.grossCents,
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  )
}
