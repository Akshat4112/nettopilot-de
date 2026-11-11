import {
  comparisonDifference,
  formatComparisonDifference,
  formatComparisonEuro as euro,
  formatComparisonHours as hours,
  formatComparisonDays as days,
  formatComparisonWeeklyDays as weeklyDays,
  type ComparisonFormatter,
  type ComparisonMetric,
  type ComparisonValue,
  type OfferComparisonMetrics,
} from './offer-comparison-metrics'

export interface TradeoffFact {
  readonly label: string
  readonly description: string
  readonly comparison: string
  readonly difference: number | null
  readonly offerA: string
  readonly offerB: string
}

export interface TradeoffSection {
  readonly id: 'pay' | 'commute' | 'hourly' | 'time' | 'benefits'
  readonly heading: string
  readonly headline: string
  readonly facts: readonly TradeoffFact[]
  readonly basis: readonly string[]
}

const valueText = (
  value: ComparisonValue,
  format: ComparisonFormatter,
): string => (value.amount === null ? value.missing : format(value.amount))
const reasonText = (value: ComparisonValue): string =>
  value.amount === null && value.reason !== undefined
    ? ' — ' + value.reason
    : ''

/** Factual arithmetic over current validated metrics; no preference or causal weights. */
export function explainOfferComparison(
  metrics: OfferComparisonMetrics,
): readonly TradeoffSection[] {
  const fact = (
    key: ComparisonMetric,
    label: string,
    format: ComparisonFormatter,
  ): TradeoffFact => {
    const [a, b] = [metrics.offers[0][key], metrics.offers[1][key]]
    const difference = comparisonDifference(metrics, key)
    const offerA = valueText(a, format)
    const offerB = valueText(b, format)
    const comparison =
      difference === null
        ? 'Difference unavailable until both values are supplied and supported.'
        : key === 'hourly' && difference === 0
          ? 'The hourly difference rounds to €0.00 / hour at cent precision.'
          : `B − A: ${formatComparisonDifference(difference, format)} (${difference === 0 ? 'equal on this measure' : difference > 0 ? 'Offer B is higher on this measure' : 'Offer B is lower on this measure'}).`
    return {
      label,
      offerA,
      offerB,
      difference,
      comparison,
      description: `${label} — Offer A: ${offerA}${reasonText(a)}. Offer B: ${offerB}${reasonText(b)}. ${comparison}`,
    }
  }
  const section = (
    id: TradeoffSection['id'],
    heading: string,
    facts: readonly TradeoffFact[],
    basis: readonly string[],
    primary: TradeoffFact,
  ): TradeoffSection => ({
    id,
    heading,
    facts,
    basis,
    headline:
      primary.label +
      ': ' +
      (primary.difference === null
        ? `Difference unavailable. Offer A: ${primary.offerA}; Offer B: ${primary.offerB}.`
        : primary.comparison),
  })
  const gross = fact('gross', 'Annual base gross', euro)
  const deductions = fact('deductions', 'Annual payroll deductions', euro)
  const net = fact('net', 'Annual base-pay net', euro)
  const commuteCost = fact('commuteCost', 'Annual entered commute costs', euro)
  const adjusted = fact(
    'afterCommute',
    'Annual net after entered commute costs',
    euro,
  )
  const hourly = fact(
    'hourly',
    'Effective net after commute cost per hour',
    (value) => euro(value) + ' / hour',
  )
  const work = fact('work', 'Annual contractual work hours', hours)
  const vacation = fact('vacation', 'Entered paid vacation day count', days)
  const commuteTime = fact('commuteTime', 'Annual commute time', hours)
  const remote = fact('remote', 'Remote days per week', weeklyDays)
  const pension = fact('pension', 'Annual employer occupational pension contribution', euro)
  const employerBenefits = fact(
    'employerBenefits',
    'Annual employer-stated benefit values',
    euro,
  )
  const personalBenefits = fact(
    'personalBenefits',
    'Annual user-assigned benefit values',
    euro,
  )
  const payrollBasis = metrics.offers.map((offer, index) =>
    offer.gross.amount !== null &&
    offer.deductions.amount !== null &&
    offer.net.amount !== null
      ? `Offer ${index === 0 ? 'A' : 'B'}: ${euro(offer.gross.amount)} − ${euro(offer.deductions.amount)} = ${euro(offer.net.amount)} (annual base gross − payroll deductions = base-pay net).`
      : `Offer ${index === 0 ? 'A' : 'B'} payroll reconciliation is unavailable. ${offer.net.reason ?? offer.net.missing}`,
  )
  const grossDelta = comparisonDifference(metrics, 'gross')
  const deductionsDelta = comparisonDifference(metrics, 'deductions')
  const netDelta = comparisonDifference(metrics, 'net')
  if (grossDelta !== null && deductionsDelta !== null && netDelta !== null)
    payrollBasis.push(
      `Pay difference reconciliation (B − A): ${euro(grossDelta)} − ${euro(deductionsDelta)} = ${euro(netDelta)}. These are differences in supported payroll results, not separate estimates of individual tax effects.`,
    )
  const commuteBasis = metrics.offers.map((offer, index) =>
    offer.net.amount !== null &&
    offer.commuteCost.amount !== null &&
    offer.afterCommute.amount !== null
      ? `Offer ${index === 0 ? 'A' : 'B'}: ${euro(offer.net.amount)} − ${euro(offer.commuteCost.amount)} = ${euro(offer.afterCommute.amount)} (annual base-pay net − entered commute costs).`
      : `Offer ${index === 0 ? 'A' : 'B'} adjustment requires supported annual net and all entered commute costs; missing costs do not mean zero.`,
  )
  commuteBasis.push(
    'Commute costs use entered office frequency, paid vacation and each entered daily cost category. This does not infer route prices, transport choices or a tax deduction.',
  )
  const hourlyBasis = metrics.offers.map((offer, index) =>
    offer.hourly.amount !== null
      ? `Offer ${index === 0 ? 'A' : 'B'} uses ${valueText(offer.afterCommute, euro)} / (${valueText(offer.work, hours)} + ${valueText(offer.commuteTime, hours)}): adjusted annual net / (annual work + commute time).`
      : `Offer ${index === 0 ? 'A' : 'B'} hourly inputs cannot be combined. ${offer.hourly.reason ?? offer.hourly.missing} Entered basis: ${valueText(offer.afterCommute, euro)} adjusted annual net; ${valueText(offer.work, hours)} annual work; ${valueText(offer.commuteTime, hours)} annual commute.`,
  )
  hourlyBasis.push(
    'Both adjusted net and total time affect this ratio. No euro value is assigned to travel time. Hourly values and their difference round independently from exact ratios, so subtracting the displayed rates can differ by one cent.',
  )
  const timeFacts = [work, vacation, commuteTime, remote]
  const benefitFacts = [pension, employerBenefits, personalBenefits]
  return [
    section(
      'pay',
      'Base pay and payroll deductions',
      [gross, deductions, net],
      payrollBasis,
      net,
    ),
    section(
      'commute',
      'Entered commuting costs and adjusted net',
      [commuteCost, adjusted],
      commuteBasis,
      adjusted.difference === null && commuteCost.difference !== null
        ? commuteCost
        : adjusted,
    ),
    section(
      'hourly',
      'Effective hourly compensation basis',
      [hourly],
      hourlyBasis,
      hourly,
    ),
    section(
      'time',
      'Working time, vacation and location',
      timeFacts,
      [
        `Vacation values are entered day counts, read alongside the working week: Offer A: ${valueText(metrics.offers[0].workingDays, weeklyDays)}; Offer B: ${valueText(metrics.offers[1].workingDays, weeklyDays)}. Different weekly schedules do not make raw day counts equivalent leave durations.`,
        'Annual work and commute time use 52 weeks adjusted for paid vacation, entered office frequency and two trips per office day. Public holidays, sickness, overtime and unpaid leave are excluded; time outputs round to 0.01 hour. Remote days describe the entered location schedule; no home-office savings or allowance tax effect is inferred.',
      ],
      timeFacts.find((item) => item.difference !== null) ?? work,
    ),
    section(
      'benefits',
      'Separate pension and benefit valuations',
      benefitFacts,
      [
        'These are separate annual EUR terms, not added to net pay or to each other. Pension is not spendable payroll cash. Employer-stated values and user-assigned personal valuations are different sources, not guaranteed take-home pay. Check certainty, eligibility and vesting in the entered benefit details.',
        'Each valuation column is summed only when every listed benefit has that valuation. Missing values stay unknown; entered zero remains zero. No overall offer value is calculated.',
      ],
      benefitFacts.find((item) => item.difference !== null) ?? pension,
    ),
  ]
}
