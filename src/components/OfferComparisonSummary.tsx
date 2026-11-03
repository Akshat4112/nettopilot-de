import {
  calculateOfferComparisonMetrics,
  formatComparisonEuro as euro,
  formatComparisonHours as hours,
  formatComparisonDays as days,
  formatComparisonWeeklyDays as weeklyDays,
  type ComparisonValue as SummaryValue,
  type ComparisonFormatter as Formatter,
  type ComparisonMetric,
  type OfferComparisonMetricsInputs,
} from './offer-comparison-metrics'

export type OfferComparisonSummaryInputs = OfferComparisonMetricsInputs

function SummaryRow({
  label,
  values,
  format,
  difference,
}: {
  readonly label: string
  readonly values: readonly [SummaryValue, SummaryValue]
  readonly format: Formatter
  readonly difference?: number | undefined
}) {
  const [a, b] = values
  const delta =
    a.amount === null || b.amount === null
      ? null
      : (difference ?? b.amount - a.amount)
  return (
    <tr role="row">
      <th scope="row" role="rowheader">
        {label}
      </th>
      {values.map((value, index) => (
        <td key={index} role="cell">
          <span className="offer-summary-mobile-label" aria-hidden="true">
            {index === 0 ? 'Offer A' : 'Offer B'}
          </span>
          <div className="offer-summary-value">
            {value.amount !== null ? (
              <span className="offer-summary-number">
                {format(value.amount)}
              </span>
            ) : value.reason === undefined ? (
              value.missing
            ) : (
              <details>
                <summary>{value.missing}</summary>
                <p>{value.reason}</p>
              </details>
            )}
          </div>
        </td>
      ))}
      <td role="cell">
        <span className="offer-summary-mobile-label" aria-hidden="true">
          B − A
        </span>
        <div className="offer-summary-value">
          {delta === null ? (
            'Unavailable'
          ) : (
            <span className="offer-summary-number">
              {(delta < 0 ? '−' : delta > 0 ? '+' : '') +
                format(Math.abs(delta))}
            </span>
          )}
        </div>
      </td>
    </tr>
  )
}

/** A current-props projection of admitted results; no cached amounts or ranking. */
export function OfferComparisonSummary(props: OfferComparisonSummaryInputs) {
  const metrics = calculateOfferComparisonMetrics(props)
  const values = (
    key: ComparisonMetric,
  ): readonly [SummaryValue, SummaryValue] => [
    metrics.offers[0][key],
    metrics.offers[1][key],
  ]

  return (
    <section aria-label="Offer comparison summary">
      <h4>Offer comparison summary</h4>
      <p>
        EUR, 2026 base pay only under the shared payroll assumptions. B − A is a
        signed difference; higher values are not a recommendation. Unknown
        inputs are not zero.
      </p>
      <table className="offer-comparison-summary-table" role="table">
        <caption>Current offer comparison — EUR, 2026</caption>
        <thead role="rowgroup">
          <tr role="row">
            <th scope="col" role="columnheader">
              Measure
            </th>
            <th scope="col" role="columnheader">
              Offer A
            </th>
            <th scope="col" role="columnheader">
              Offer B
            </th>
            <th scope="col" role="columnheader">
              B − A
            </th>
          </tr>
        </thead>
        <tbody role="rowgroup">
          <SummaryRow
            label="Annual base gross"
            values={values('gross')}
            format={euro}
          />
          <SummaryRow
            label="Annual base-pay net"
            values={values('net')}
            format={euro}
          />
          <SummaryRow
            label="Annual net after entered commute costs"
            values={values('afterCommute')}
            format={euro}
          />
          <SummaryRow
            label="Effective net after commute cost per hour"
            values={values('hourly')}
            format={(value) => euro(value) + ' / hour'}
            difference={metrics.hourlyDifference ?? undefined}
          />
          <SummaryRow
            label="Annual contractual work hours"
            values={values('work')}
            format={hours}
          />
          <SummaryRow
            label="Paid vacation days"
            values={values('vacation')}
            format={days}
          />
          <SummaryRow
            label="Annual entered commute costs"
            values={values('commuteCost')}
            format={euro}
          />
          <SummaryRow
            label="Annual commute time"
            values={values('commuteTime')}
            format={hours}
          />
          <SummaryRow
            label="Remote days per week"
            values={values('remote')}
            format={weeklyDays}
          />
          <SummaryRow
            label="Employer pension contribution — annual"
            values={values('pension')}
            format={euro}
          />
          <SummaryRow
            label="Employer-stated benefit values — annual"
            values={values('employerBenefits')}
            format={euro}
          />
          <SummaryRow
            label="User-assigned benefit values — annual"
            values={values('personalBenefits')}
            format={euro}
          />
        </tbody>
      </table>
      <p>
        Annual net is the admitted 2026 annual payroll result for 12 equal
        base-pay months, not a monthly figure multiplied by 12. Time uses 52
        weeks adjusted for paid vacation and two commute trips per office day.
        Public holidays, sickness, overtime and unpaid leave are excluded. Work
        and commute hours round to 0.01 hour. Effective hourly values and their
        difference round independently to EUR cents from exact ratios.
      </p>
      <p>
        Employer pension, employer-stated benefit values and user-assigned
        benefit values are separate annual EUR amounts, not added to net pay or
        combined. Benefit valuations are summed within each column only when
        every listed benefit has a supplied value. Certainty, eligibility and
        vesting remain in the benefit inputs. Remote days describe the entered
        location schedule; remote allowances and home-office costs are excluded
        from these net figures.
      </p>
    </section>
  )
}
