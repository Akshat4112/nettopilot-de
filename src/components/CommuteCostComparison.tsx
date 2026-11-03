import {
  calculateCommuteCosts,
  type CommuteCostEntry,
  type CommuteCostResult,
} from '../domain/comparison/commute-costs'

const euro = (cents: number) =>
  (cents / 100).toLocaleString('en-DE', {
    style: 'currency',
    currency: 'EUR',
  })

function Amounts({
  label,
  result,
}: {
  readonly label: string
  readonly result: Extract<CommuteCostResult, { state: 'calculated' }>
}) {
  return (
    <div>
      <dt>{label} estimated annual commute expense</dt>
      <dd>{euro(result.annualTotalCents)}</dd>
      <p>{result.annualOfficeDaysHundredths / 100} expected office days</p>
    </div>
  )
}

export function CommuteCostComparison({
  offerA,
  offerB,
}: {
  readonly offerA: CommuteCostEntry
  readonly offerB: CommuteCostEntry
}) {
  const a = calculateCommuteCosts(offerA)
  const b = calculateCommuteCosts(offerB)
  const both = a.state === 'calculated' && b.state === 'calculated'
  return (
    <section
      className="commute-cost-comparison"
      aria-labelledby="commute-cost-heading"
    >
      <h3 id="commute-cost-heading">Estimated annual commute costs</h3>
      {a.state === 'calculated' && b.state === 'calculated' ? (
        <>
          <dl className="vacation-comparison-values">
            <Amounts label="Offer A" result={a} />
            <Amounts label="Offer B" result={b} />
          </dl>
          <p>
            Annual commute difference (B − A):{' '}
            {euro(b.annualTotalCents - a.annualTotalCents)}
          </p>
          <p>
            Figures are user-entered travel expenses, not payroll deductions or
            a calculated net-income difference.
          </p>
        </>
      ) : (
        <p>
          Annual commute cost comparison unavailable.
          {a.state !== 'calculated' ? ' Complete Offer A costs.' : ''}
          {b.state !== 'calculated' ? ' Complete Offer B costs.' : ''}
        </p>
      )}
      <p className="vacation-method">
        52-week convention, adjusted proportionally for stated paid leave. All
        four costs must be entered; 0 means confirmed free.
        {both
          ? ' Totals combine four independently rounded annual amounts.'
          : ''}
      </p>
    </section>
  )
}
