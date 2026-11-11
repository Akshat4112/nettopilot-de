import {
  comparisonDifference,
  formatComparisonDays,
  formatComparisonDifference,
  formatComparisonEuro,
  formatComparisonHours,
  formatComparisonWeeklyDays,
  type ComparisonFormatter,
  type ComparisonMetric,
  type ComparisonValue,
  type OfferComparisonMetrics,
} from './offer-comparison-metrics'

interface ShareRow {
  readonly label: string
  readonly metric: ComparisonMetric
  readonly format: ComparisonFormatter
}

const euroPerHour: ComparisonFormatter = (value) =>
  formatComparisonEuro(value) + ' / hour'

const rows: readonly ShareRow[] = [
  { label: 'Annual base gross', metric: 'gross', format: formatComparisonEuro },
  { label: 'Annual base-pay net', metric: 'net', format: formatComparisonEuro },
  {
    label: 'Annual net after entered commute costs',
    metric: 'afterCommute',
    format: formatComparisonEuro,
  },
  {
    label: 'Effective net after commute cost per hour',
    metric: 'hourly',
    format: euroPerHour,
  },
  {
    label: 'Annual contractual work hours',
    metric: 'work',
    format: formatComparisonHours,
  },
  {
    label: 'Paid vacation days',
    metric: 'vacation',
    format: formatComparisonDays,
  },
  {
    label: 'Annual entered commute costs',
    metric: 'commuteCost',
    format: formatComparisonEuro,
  },
  {
    label: 'Annual commute time',
    metric: 'commuteTime',
    format: formatComparisonHours,
  },
  {
    label: 'Remote days per week',
    metric: 'remote',
    format: formatComparisonWeeklyDays,
  },
  {
    label: 'Employer pension contribution — annual',
    metric: 'pension',
    format: formatComparisonEuro,
  },
  {
    label: 'Employer-stated benefit values — annual',
    metric: 'employerBenefits',
    format: formatComparisonEuro,
  },
  {
    label: 'User-assigned benefit values — annual',
    metric: 'personalBenefits',
    format: formatComparisonEuro,
  },
]

const displayValue = (
  value: ComparisonValue,
  format: ComparisonFormatter,
): string => (value.amount === null ? value.missing : format(value.amount))

/**
 * A shareable *current-results* snapshot only. This accepts validated numeric
 * projections, never raw form fields, dates of birth, or payroll profile data.
 * It does not construct a URL, persist anything, or trigger network requests.
 */
export function formatOfferComparisonShareText(
  metrics: OfferComparisonMetrics,
): string {
  const lines = [
    'NettoPilot-DE — Job offer comparison',
    'Calculation year: 2026 | Currency: EUR',
    'Educational estimates, not tax or financial advice.',
    'B − A indicates a factual difference, not an offer ranking.',
    'Unknown or unsupported inputs are not treated as zero.',
    '',
    'Measure | Offer A | Offer B | B − A',
  ]
  for (const row of rows) {
    const a = metrics.offers[0][row.metric]
    const b = metrics.offers[1][row.metric]
    const delta = comparisonDifference(metrics, row.metric)
    lines.push(
      [
        row.label,
        displayValue(a, row.format),
        displayValue(b, row.format),
        delta === null
          ? 'Unavailable'
          : formatComparisonDifference(delta, row.format),
      ].join(' | '),
    )
  }
  lines.push(
    '',
    'Basis: admitted 2026 recurring base-pay estimates; annual work and commute',
    'follow the 52-week/paid-vacation model. Additional compensation may be',
    'unsupported. Pension and benefit values stay separate from payroll net.',
    'Remote allowances and home-office expenses are excluded from net amounts.',
    'Sharing this text reveals the figures above. It does not include the',
    'underlying birth date, tax class, or health-insurance profile.',
  )
  return lines.join('\n') + '\n'
}
