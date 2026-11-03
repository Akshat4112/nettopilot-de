import { describe, expect, it } from 'vitest'
import { comparisonInputs } from '../test/offer-comparison-inputs'
import { calculateOfferComparisonMetrics } from './offer-comparison-metrics'
import { explainOfferComparison } from './offer-comparison-tradeoffs'

const explanation = (data = comparisonInputs()): string =>
  JSON.stringify(explainOfferComparison(calculateOfferComparisonMetrics(data)))

describe('NP-CMP-013 deterministic entered-factor explanations', () => {
  it('reconciles pay and commuting adjustments while explaining both hourly inputs', () => {
    const text = explanation()
    expect(text).toContain('€48,000.00 − €16,734.00 = €31,266.00')
    expect(text).toContain('€60,000.00 − €22,438.92 = €37,561.08')
    expect(text).toContain('€31,266.00 − €1,200.00 = €30,066.00')
    expect(text).toContain('€30,066.00 / (1,920 hours + 240 hours)')
    expect(text).toContain('+€6,295.08')
    expect(text).toContain('entered office frequency')
    expect(text).not.toMatch(
      /winner|best offer|recommend choosing|overall score|cheaper route|shorter route/i,
    )
  })

  it('shows equal values explicitly and reverses factual directions when both offers are swapped', () => {
    const data = comparisonInputs()
    const equal = explanation({
      ...data,
      netResult: {
        ...data.netResult,
        offers: [data.netResult.offers[0], data.netResult.offers[0]],
      },
    })
    expect(equal).toContain('equal on this measure')
    const reverse = explanation({
      netResult: {
        ...data.netResult,
        offers: [data.netResult.offers[1], data.netResult.offers[0]],
      },
      working: [data.working[1], data.working[0]],
      commuteCosts: [data.commuteCosts[1], data.commuteCosts[0]],
      commuteTime: [data.commuteTime[1], data.commuteTime[0]],
      remote: [data.remote[1], data.remote[0]],
      benefits: [data.benefits[1], data.benefits[0]],
    })
    expect(reverse).toContain('−€6,295.08')
    expect(reverse).toContain('Offer B is lower on this measure')
  })

  it('names a blocked side and keeps valid other figures and independent time facts', () => {
    const data = comparisonInputs()
    const text = explanation({
      ...data,
      netResult: {
        ...data.netResult,
        offers: [
          {
            state: 'unsupported',
            month: 0,
            reason: 'offer_additional_compensation_not_supported',
          },
          data.netResult.offers[1],
        ],
      },
    })
    expect(text).toContain('Offer A: Unavailable')
    expect(text).toContain('Offer B: €60,000.00')
    expect(text).toContain(
      'Additional recurring, variable or one-time pay is not supported',
    )
    expect(text).toContain('Difference unavailable')
    expect(text).toContain('1,920 hours')
    expect(text).not.toContain('+€6,295.08')
  })

  it('distinguishes missing benefits from zero and qualifies independent valuation sources', () => {
    const data = comparisonInputs()
    const benefit = data.benefits[1].benefits[0]
    if (benefit === undefined) throw new Error('Expected fixture benefit')
    const text = explanation({
      ...data,
      benefits: [
        {
          ...data.benefits[0],
          employerContributionAnnualEur: '',
          benefits: [],
        },
        {
          ...data.benefits[1],
          employerContributionAnnualEur: '0',
          benefits: [
            {
              ...benefit,
              userAssignedAnnualValueEur: '',
            },
          ],
        },
      ],
    })
    expect(text).toContain('Not supplied')
    expect(text).toContain('Unknown — values missing')
    expect(text).toContain('Offer B: €0.00')
    expect(text).toContain('personal valuations')
    expect(text).toContain('not added to net pay or to each other')
  })

  it('qualifies vacation counts by the entered weekly day basis', () => {
    const data = comparisonInputs()
    const text = explanation({
      ...data,
      working: [
        data.working[0],
        { ...data.working[1], workingDaysPerWeek: '4' },
      ],
    })
    expect(text).toContain('Offer A: 5 days / week; Offer B: 4 days / week')
    expect(text).toContain('entered day counts')
    expect(text).not.toMatch(/more leave|better vacation|extra time off/i)
  })

  it('uses the canonical hourly delta rather than subtracting the displayed rates', () => {
    const data = comparisonInputs()
    const [a, b] = data.netResult.offers
    if (a.state !== 'calculated' || b.state !== 'calculated')
      throw new Error('Expected fixture payroll')
    const text = explanation({
      ...data,
      working: [data.working[0], data.working[0]],
      commuteCosts: [data.commuteCosts[0], data.commuteCosts[0]],
      commuteTime: [data.commuteTime[0], data.commuteTime[0]],
      netResult: {
        ...data.netResult,
        offers: [
          { ...a, annual: { ...a.annual, netPayrollCents: 2_400_000 } },
          { ...b, annual: { ...b.annual, netPayrollCents: 3_000_000 } },
        ],
      },
    })
    expect(text).toContain('Offer A: €10.56 / hour')
    expect(text).toContain('Offer B: €13.33 / hour')
    expect(text).toContain('+€2.78 / hour')
    expect(text).not.toContain('+€2.77 / hour')
  })
})

it('describes a rounded-zero hourly difference without claiming equal rates', () => {
  const data = comparisonInputs()
  const [a, b] = data.netResult.offers
  if (a.state !== 'calculated' || b.state !== 'calculated')
    throw new Error('Expected fixture payroll')
  const working = {
    weeklyHours: '20',
    workingDaysPerWeek: '5',
    paidVacationDaysAnnual: '10',
  }
  const cost = {
    ...data.commuteCosts[0],
    paidVacationDaysAnnual: '10',
    officeDaysPerWeek: '0',
    fuelPerOfficeDayEur: '0',
  }
  const time = {
    ...data.commuteTime[0],
    paidVacationDaysAnnual: '10',
    officeDaysPerWeek: '0',
    oneWayMinutes: '0',
  }
  const sections = explainOfferComparison(
    calculateOfferComparisonMetrics({
      ...data,
      working: [working, working],
      commuteCosts: [cost, cost],
      commuteTime: [time, time],
      netResult: {
        ...data.netResult,
        offers: [
          { ...a, annual: { ...a.annual, netPayrollCents: 1_000_400 } },
          { ...b, annual: { ...b.annual, netPayrollCents: 1_000_600 } },
        ],
      },
    }),
  )
  const hourly = sections.find((section) => section.id === 'hourly')
  expect(hourly?.headline).toContain(
    'difference rounds to €0.00 / hour at cent precision',
  )
  expect(JSON.stringify(hourly)).toContain('Offer A: €10.00 / hour')
  expect(JSON.stringify(hourly)).toContain('Offer B: €10.01 / hour')
  expect(JSON.stringify(hourly)).not.toMatch(
    /equal rates|equal on this measure/,
  )
})

it('retains every pension cent in narrative values and one-cent directions', () => {
  const data = comparisonInputs()
  const text = explanation({
    ...data,
    benefits: [
      {
        ...data.benefits[0],
        employerContributionAnnualEur: '90071992547409.90',
      },
      {
        ...data.benefits[1],
        employerContributionAnnualEur: '90071992547409.91',
      },
    ],
  })
  expect(text).toContain('€90,071,992,547,409.90')
  expect(text).toContain('€90,071,992,547,409.91')
  expect(text).toContain('+€0.01')
})

it('removes a stale commuting adjustment without hiding known net or time facts', () => {
  const data = comparisonInputs()
  const text = explanation({
    ...data,
    commuteCosts: [
      data.commuteCosts[0],
      { ...data.commuteCosts[1], fuelPerOfficeDayEur: '' },
    ],
  })
  expect(text).not.toContain('+€6,320.08')
  expect(text).toContain('+€6,295.08')
  expect(text).toContain('−40 hours')
  expect(text).toContain('missing costs do not mean zero')
})

it('does not present mismatched schedules as a usable hourly formula', () => {
  const data = comparisonInputs()
  const sections = explainOfferComparison(
    calculateOfferComparisonMetrics({
      ...data,
      working: [
        data.working[0],
        { ...data.working[1], workingDaysPerWeek: '4' },
      ],
    }),
  )
  const hourly = sections.find((section) => section.id === 'hourly')
  expect(hourly?.headline).toContain('Difference unavailable')
  expect(hourly?.basis[1]).toContain('cannot be combined')
  expect(hourly?.basis[1]).toContain('Workdays and paid vacation must match')
  expect(hourly?.basis[1]).toContain('1,830 hours')
})
