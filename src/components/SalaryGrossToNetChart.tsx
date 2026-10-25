import type { SalaryPeriodTotals2026 } from '../domain/salary/salary-aggregation'
import { percentageOfGross } from './salary-deductions'

const money = (cents: number): string =>
  new Intl.NumberFormat('en-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(cents / 100)

/**
 * A non-interactive, explicitly labeled 2026 annual gross-to-net figure.
 * All figures come from admitted totals, never an inferred tax percentage.
 */
export function SalaryGrossToNetChart({
  totals,
}: {
  readonly totals: SalaryPeriodTotals2026
}) {
  const gross = totals.grossCents
  const deductions = totals.allDeductionsCents
  const available = totals.disposableAfterPrivateInsuranceCents
  if (
    !Number.isSafeInteger(gross) ||
    !Number.isSafeInteger(deductions) ||
    !Number.isSafeInteger(available) ||
    gross <= 0 ||
    deductions < 0 ||
    available < 0 ||
    deductions + available !== gross
  )
    return (
      <p role="alert">
        Gross-to-net visualization unavailable: verified components do not
        reconcile.
      </p>
    )

  const deductionPct = percentageOfGross(deductions, gross)
  const availablePct = percentageOfGross(available, gross)
  return (
    <figure
      className="np-gross-net-figure"
      aria-labelledby="np-gross-net-title"
      aria-describedby="np-gross-net-description"
    >
      <figcaption id="np-gross-net-title">
        From annual gross to available pay
      </figcaption>
      <p id="np-gross-net-description">
        The bar separates available annual pay from tax, social insurance and
        any external private-insurance costs. Percentages show a share of gross,
        not a statutory tax rate.
      </p>
      <div
        className="np-gross-net-bar"
        role="img"
        aria-label={`Available: ${availablePct} of gross. Deductions: ${deductionPct} of gross.`}
      >
        <span
          className="np-gross-net-available"
          style={{ width: availablePct }}
        />
        <span
          className="np-gross-net-deductions"
          style={{ width: deductionPct }}
        />
      </div>
      <dl className="np-gross-net-legend">
        <div>
          <dt>Annual gross pay</dt>
          <dd>{money(gross)}</dd>
        </div>
        <div>
          <dt>
            <span
              aria-hidden="true"
              className="np-gross-net-swatch np-gross-net-swatch-available"
            />
            Available pay ({availablePct})
          </dt>
          <dd>{money(available)}</dd>
        </div>
        <div>
          <dt>
            <span
              aria-hidden="true"
              className="np-gross-net-swatch np-gross-net-swatch-deductions"
            />
            Total deductions ({deductionPct})
          </dt>
          <dd>{money(deductions)}</dd>
        </div>
      </dl>
      <p>
        Detailed tax and insurance amounts are listed in the deduction
        breakdown below.
      </p>
    </figure>
  )
}
