import { describe, expect, it } from 'vitest'
import type {
  ComparisonValue,
  OfferComparisonMetrics,
  OfferMetrics,
} from './offer-comparison-metrics'
import { formatOfferComparisonShareText } from './offer-comparison-share'

const unknown: ComparisonValue = { amount: null, missing: 'Not supplied' }
const blank: OfferMetrics = {
  gross: unknown,
  deductions: unknown,
  net: unknown,
  afterCommute: unknown,
  hourly: unknown,
  work: unknown,
  workingDays: unknown,
  totalHours: unknown,
  vacation: unknown,
  commuteCost: unknown,
  commuteTime: unknown,
  remote: unknown,
  pension: unknown,
  employerBenefits: unknown,
  personalBenefits: unknown,
}
const known = (amount: number): ComparisonValue => ({ amount, missing: '' })

const comparison = (): OfferComparisonMetrics => ({
  offers: [
    {
      ...blank,
      gross: known(4800000),
      net: known(3126600),
      remote: known(0),
      pension: known(Number.MAX_SAFE_INTEGER),
    },
    {
      ...blank,
      gross: known(6000000),
      net: known(3756108),
      remote: { amount: null, missing: 'Unavailable' },
      employerBenefits: known(0),
    },
  ],
  hourlyDifference: null,
})

describe('NP-CMP-014 privacy-safe comparison text export', () => {
  it('has exactly the existing twelve summary rows and signed current amounts', () => {
    const report = formatOfferComparisonShareText(comparison())
    expect(report).toContain(
      'Annual base gross | €48,000.00 | €60,000.00 | +€12,000.00',
    )
    expect(report).toContain(
      'Annual base-pay net | €31,266.00 | €37,561.08 | +€6,295.08',
    )
    expect(report).toContain(
      'Remote days per week | 0 days / week | Unavailable | Unavailable',
    )
    expect(report).toContain(
      'Employer-stated benefit values — annual | Not supplied | €0.00 | Unavailable',
    )
    expect(report).toContain('€90,071,992,547,409.91')
    expect(
      report.split('\n').filter((line) => line.includes(' | ')),
    ).toHaveLength(13)
  })

  it('never includes payroll profile fields, links or hidden personal inputs', () => {
    const report = formatOfferComparisonShareText(comparison())
    expect(report).toContain('not an offer ranking')
    expect(report).toContain('not treated as zero')
    expect(report).not.toMatch(/https?:\/\//)
    expect(report).not.toContain('1990-01-01')
    expect(report).not.toContain('DE-BW')
    expect(report).not.toContain('birthDate=')
    expect(report).not.toContain('taxClass=')
  })

  it('uses the canonical hourly difference, not a subtraction of displayed rounded rates', () => {
    const a = comparison()
    const report = formatOfferComparisonShareText({
      ...a,
      offers: [
        { ...a.offers[0], hourly: known(1056) },
        { ...a.offers[1], hourly: known(1333) },
      ],
      hourlyDifference: 278,
    })
    expect(report).toContain(
      'Effective net after commute cost per hour | €10.56 / hour | €13.33 / hour | +€2.78 / hour',
    )
  })
})
