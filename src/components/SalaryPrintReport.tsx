import type { EssentialSalaryDraft } from './EssentialSalaryInputs'
import type { AdvancedSalaryDraft } from './advanced-salary-validation'
import type { SalaryPeriodTotals2026 } from '../domain/salary/salary-aggregation'

const euro = (cents: number): string =>
  new Intl.NumberFormat('en-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(cents / 100)

/**
 * Deliberately rendered only for the user's own browser Print / Save as PDF.
 * No remote export or automatic data persistence.
 */
export function SalaryPrintReport({
  inputs,
  advanced,
  totals,
  calculationYear,
  generatedOn,
}: {
  readonly inputs: EssentialSalaryDraft
  readonly advanced: AdvancedSalaryDraft
  readonly totals: SalaryPeriodTotals2026
  readonly calculationYear: number
  readonly generatedOn: string
}) {
  return (
    <section className="np-print-report" aria-label="Printable salary report">
      <h3>NettoPilot DE — 2026 Salary Calculation</h3>
      <p>
        Generated (UTC): {generatedOn}. Calculation year: {calculationYear}.
      </p>
      <p>
        Method: BMF 2026 wage-tax algorithm and separately admitted statutory
        social-insurance modules. Results are estimates, not an official
        payslip, tax assessment or independent tax verification.
      </p>
      <h4>Inputs and assumptions</h4>
      <dl>
        <div>
          <dt>Entered gross salary</dt>
          <dd>{inputs.gross} EUR ({inputs.period})</dd>
        </div>
        <div>
          <dt>Tax class and federal state</dt>
          <dd>{inputs.taxClass} / {inputs.federalState}</dd>
        </div>
        <div>
          <dt>Church-tax status</dt>
          <dd>{inputs.churchTax}</dd>
        </div>
        <div>
          <dt>Date of birth and children</dt>
          <dd>{inputs.dateOfBirth} / {inputs.children}</dd>
        </div>
        <div>
          <dt>Health insurance</dt>
          <dd>{inputs.insurance}</dd>
        </div>
        <div>
          <dt>Statutory additional rate</dt>
          <dd>
            {advanced.additionalHealthRatePercent === ''
              ? 'Published average 2026 assumption'
              : advanced.additionalHealthRatePercent + '%'}
          </dd>
        </div>
      </dl>
      <h4>Reconciled calculation summary (annual)</h4>
      <dl>
        <div>
          <dt>Annual gross</dt>
          <dd>{euro(totals.grossCents)}</dd>
        </div>
        <div>
          <dt>Annual net payroll pay</dt>
          <dd>{euro(totals.netPayrollCents)}</dd>
        </div>
        <div>
          <dt>Annual deductions</dt>
          <dd>{euro(totals.allDeductionsCents)}</dd>
        </div>
        <div>
          <dt>Annual employer cost</dt>
          <dd>{euro(totals.employerCostCents)}</dd>
        </div>
      </dl>
      <p>
        All values were calculated locally in this browser. This report
        contains personal payroll information: store and share it carefully.
      </p>
      <p>
        Report is informational and reflects only the admitted 2026 scenario
        and inputs printed above.
      </p>
    </section>
  )
}
