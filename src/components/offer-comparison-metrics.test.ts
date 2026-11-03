import { describe, expect, it } from 'vitest'
import { comparisonInputs } from '../test/offer-comparison-inputs'
import {
  calculateOfferComparisonMetrics,
  comparisonDifference,
  formatComparisonEuro,
} from './offer-comparison-metrics'

describe('shared current comparison metrics', () => {
  it('projects canonical payroll, work and travel values without changing the input', () => {
    const data = comparisonInputs()
    const snapshot = JSON.stringify(data)
    const result = calculateOfferComparisonMetrics(data)
    expect(result.offers[0]).toMatchObject({
      gross: { amount: 4_800_000 },
      deductions: { amount: 1_673_400 },
      net: { amount: 3_126_600 },
      work: { amount: 192_000 },
      workingDays: { amount: 5 },
      commuteCost: { amount: 120_000 },
      commuteTime: { amount: 24_000 },
      totalHours: { amount: 216_000 },
      afterCommute: { amount: 3_006_600 },
    })
    expect(result.offers[1].net.amount).toBe(3_756_108)
    expect(comparisonDifference(result, 'gross')).toBe(1_200_000)
    expect(comparisonDifference(result, 'net')).toBe(629_508)
    expect(JSON.stringify(data)).toBe(snapshot)
  })

  it('uses payroll deductions rather than an out-of-payroll private-insurance outflow', () => {
    const data = comparisonInputs()
    const a = data.netResult.offers[0]
    if (a.state !== 'calculated') throw new Error('Expected fixture payroll')
    const result = calculateOfferComparisonMetrics({
      ...data,
      netResult: {
        ...data.netResult,
        offers: [
          {
            ...a,
            annual: {
              ...a.annual,
              allDeductionsCents: a.annual.allDeductionsCents + 12_345,
              privateInsuranceOutflowCents: 12_345,
            },
          },
          data.netResult.offers[1],
        ],
      },
    })
    expect(result.offers[0].deductions.amount).toBe(1_673_400)
    expect(result.offers[0].net.amount).toBe(3_126_600)
  })

  it('preserves independent unknown/invalid measures and valid opposite values', () => {
    const data = comparisonInputs()
    const result = calculateOfferComparisonMetrics({
      ...data,
      commuteCosts: [
        data.commuteCosts[0],
        { ...data.commuteCosts[1], fuelPerOfficeDayEur: '' },
      ],
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
    expect(result.offers[0].net.amount).toBeNull()
    expect(result.offers[0].net.reason).toMatch(/Additional.*not supported/)
    expect(result.offers[1].net.amount).toBe(3_756_108)
    expect(result.offers[0].work.amount).toBe(192_000)
    expect(result.offers[1].commuteTime.amount).toBe(23_500)
    expect(result.offers[1].afterCommute.amount).toBeNull()
    expect(comparisonDifference(result, 'net')).toBeNull()
    expect(comparisonDifference(result, 'commuteCost')).toBeNull()
  })

  it('retains exact pension limit cents and reverses a one-cent difference on swap', () => {
    const data = comparisonInputs()
    const benefits = [
      {
        ...data.benefits[0],
        employerContributionAnnualEur: '90071992547409.90',
      },
      {
        ...data.benefits[1],
        employerContributionAnnualEur: '90071992547409.91',
      },
    ] as const
    const forward = calculateOfferComparisonMetrics({ ...data, benefits })
    const reverse = calculateOfferComparisonMetrics({
      ...data,
      benefits: [benefits[1], benefits[0]],
    })
    const a = forward.offers[0].pension.amount
    const b = forward.offers[1].pension.amount
    if (a === null || b === null)
      throw new Error('Expected supplied fixture pensions')
    expect(formatComparisonEuro(a)).toBe('€90,071,992,547,409.90')
    expect(formatComparisonEuro(b)).toBe('€90,071,992,547,409.91')
    expect(comparisonDifference(forward, 'pension')).toBe(1)
    expect(comparisonDifference(reverse, 'pension')).toBe(-1)
  })
})
