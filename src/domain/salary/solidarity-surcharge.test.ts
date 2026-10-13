import { describe, expect, it } from 'vitest'

import {
  calculateOtherRemunerationSolidaritySurcharge2026,
  calculateSolidaritySurcharge2026,
  type SolidaritySurchargePaymentPeriod,
} from './solidarity-surcharge'

const recurring = (
  annualAssessmentBaseCents: number,
  paymentPeriod: SolidaritySurchargePaymentPeriod = 'annual',
  tariffMultiplier: 1 | 2 = 1,
) =>
  calculateSolidaritySurcharge2026({
    annualAssessmentBaseCents,
    tariffMultiplier,
    paymentPeriod,
    calculationYear: 2026,
  })

describe('2026 recurring-pay solidarity surcharge', () => {
  it.each([
    [2_034_999, 'zero', 0],
    [2_035_000, 'zero', 0],
    [2_035_001, 'taper', 0],
    [2_500_000, 'taper', 55_335],
    [4_000_000, 'full_rate', 220_000],
  ] as const)(
    'classifies the basic path at %i cents',
    (assessmentBase, zone, annualSurcharge) => {
      const result = recurring(assessmentBase)

      expect(result.zone).toBe(zone)
      expect(result.annualSurchargeCents).toBe(annualSurcharge)
      expect(result.surchargeCents).toBe(annualSurcharge)
      expect(result.annualThresholdCents).toBe(2_035_000)
    },
  )

  it.each([
    [4_070_000, 'zero', 0],
    [5_000_000, 'taper', 110_670],
    [8_000_000, 'full_rate', 440_000],
  ] as const)(
    'uses the doubled splitting threshold at %i cents',
    (assessmentBase, zone, annualSurcharge) => {
      const result = recurring(assessmentBase, 'annual', 2)

      expect(result.zone).toBe(zone)
      expect(result.annualSurchargeCents).toBe(annualSurcharge)
      expect(result.annualThresholdCents).toBe(4_070_000)
    },
  )

  it.each([
    ['annual', 55_335],
    ['monthly', 4_611],
    ['weekly', 1_075],
    ['daily', 153],
  ] as const)('allocates annual cents to the %s period', (period, expected) => {
    expect(recurring(2_500_000, period).surchargeCents).toBe(expected)
  })

  it('selects the lower result across the taper crossover', () => {
    expect(recurring(3_783_828).zone).toBe('taper')
    expect(recurring(3_783_829).zone).toBe('full_rate')
  })

  it('preserves fractional annual cents until weekly allocation', () => {
    const result = recurring(2_036_300, 'weekly')

    expect(result.zone).toBe('taper')
    expect(result.annualSurchargeCents).toBe(154)
    expect(result.surchargeCents).toBe(3)
  })

  it('truncates fractions of a cent', () => {
    expect(recurring(2_035_009).annualSurchargeCents).toBe(1)
    expect(recurring(2_035_009, 'monthly').surchargeCents).toBe(0)
  })

  it('returns versioned assumptions and sources', () => {
    const result = recurring(2_500_000)

    expect(result.assumptionSetId).toBe('de-solidarity-surcharge-2026-v1')
    expect(result.sourceIds).toEqual([
      'DE-SOLZG-3',
      'DE-SOLZG-4',
      'DE-SOLZG-6',
      'DE-BMF-PAP-2026-A1',
    ])
  })

  it.each([
    [{ annualAssessmentBaseCents: -1 }, RangeError],
    [{ annualAssessmentBaseCents: 1.5 }, RangeError],
    [{ calculationYear: 2025 }, RangeError],
  ])('rejects invalid input %o', (overrides, error) => {
    expect(() =>
      calculateSolidaritySurcharge2026({
        annualAssessmentBaseCents: 2_500_000,
        tariffMultiplier: 1,
        paymentPeriod: 'annual',
        calculationYear: 2026,
        ...overrides,
      }),
    ).toThrow(error)
  })
})

describe('2026 other-remuneration solidarity surcharge', () => {
  it('returns zero while the annual gate is not passed', () => {
    const result = calculateOtherRemunerationSolidaritySurcharge2026({
      annualAssessmentBaseAfterPaymentCents: 2_035_000,
      wageTaxOnOtherRemunerationCents: 100_000,
      tariffMultiplier: 1,
      calculationYear: 2026,
    })

    expect(result.thresholdPassed).toBe(false)
    expect(result.surchargeCents).toBe(0)
  })

  it('applies 5.5% without the recurring-pay taper after the gate', () => {
    const result = calculateOtherRemunerationSolidaritySurcharge2026({
      annualAssessmentBaseAfterPaymentCents: 2_035_001,
      wageTaxOnOtherRemunerationCents: 100_019,
      tariffMultiplier: 1,
      calculationYear: 2026,
    })

    expect(result.thresholdPassed).toBe(true)
    expect(result.surchargeCents).toBe(5_501)
  })

  it('uses the splitting gate for tariff multiplier two', () => {
    const result = calculateOtherRemunerationSolidaritySurcharge2026({
      annualAssessmentBaseAfterPaymentCents: 4_000_000,
      wageTaxOnOtherRemunerationCents: 100_000,
      tariffMultiplier: 2,
      calculationYear: 2026,
    })

    expect(result.thresholdPassed).toBe(false)
    expect(result.annualThresholdCents).toBe(4_070_000)
  })

  it.each([
    [{ annualAssessmentBaseAfterPaymentCents: -1 }, RangeError],
    [{ wageTaxOnOtherRemunerationCents: -1 }, RangeError],
    [{ calculationYear: 2027 }, RangeError],
  ])('rejects invalid other-remuneration input %o', (overrides, error) => {
    expect(() =>
      calculateOtherRemunerationSolidaritySurcharge2026({
        annualAssessmentBaseAfterPaymentCents: 3_000_000,
        wageTaxOnOtherRemunerationCents: 100_000,
        tariffMultiplier: 1,
        calculationYear: 2026,
        ...overrides,
      }),
    ).toThrow(error)
  })
})
