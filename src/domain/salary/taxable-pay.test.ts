import { describe, expect, it } from 'vitest'

import { normalizeCompensation } from './frequency'
import { buildPapInput, prepareTaxablePay } from './taxable-pay'

const validScenario = () => ({
  compensation: {
    baseSalary: {
      period: 'annual',
      grossAmount: { amount: '85000.00', currency: 'EUR' },
      paymentsPerYear: 12,
    },
    regularAdditionalCash: {
      kind: 'included',
      amount: { amount: '5000.00', currency: 'EUR' },
      period: 'annual',
      guarantee: 'variable',
    },
    oneOffPayments: [
      {
        amount: { amount: '2000.00', currency: 'EUR' },
        paymentMonth: 12,
        classification: 'yearly_bonus',
        guarantee: 'variable',
      },
    ],
  },
  tax: {
    taxClass: 'tax_class_1',
    federalState: 'DE-BW',
    churchTaxStatus: 'not_liable',
    dateOfBirth: '1995-01-01',
    childAllowanceFactor: '0',
    annualAllowanceAmount: { amount: '0.00', currency: 'EUR' },
    annualAdditionalAmount: { amount: '0.00', currency: 'EUR' },
  },
  social: {
    pensionStatus: 'compulsory',
    unemploymentStatus: 'compulsory',
    careInsuranceChildStatus: 'childless',
    childrenUnderRelevantAge: 0,
    health: {
      healthInsuranceType: 'statutory',
      additionalRateMode: 'published_average',
    },
  },
  calculationYear: 2026,
})

type MutableScenario = ReturnType<typeof validScenario> &
  Record<string, unknown>

const prepare = (scenario: MutableScenario) => {
  const normalized = normalizeCompensation(scenario.compensation as never)
  return prepareTaxablePay(
    normalized,
    scenario.tax as never,
    scenario.social as never,
    scenario.calculationYear,
  )
}

describe('taxable-pay preparation (NP-CALC-005)', () => {
  it('maps the base scenario to the BMF PAP interface', () => {
    const { input, prepared } = prepare(validScenario())

    expect(input.calculationYear).toBe(2026)
    expect(input.LZZ).toBe(2)
    expect(input.STKL).toBe(1)
    expect(input.RE4).toBeGreaterThan(0)
    expect(input.SONSTB).toBe(200000)
    expect(input.KVZ).toBe(290)
    expect(input.PKV).toBe(0)
    expect(input.PKPV).toBe(0)
    expect(input.PKPVAGZ).toBe(0)
    expect(input.ALV).toBe(0)
    expect(input.KRV).toBe(0)
    expect(input.PVZ).toBe(1)
    expect(input.PVA).toBe(0)
    expect(input.PVS).toBe(0)
    expect(input.R).toBe(0)
    expect(input.F).toBeUndefined()
    expect(input.ALTER1).toBe(0)

    expect(prepared.annualRecurringGross).toBe(9000000)
    expect(prepared.annualOneOffGross).toBe(200000)
    expect(prepared.employeeExpenseLumpSum).toBe(123000)
    expect(prepared.pensionExpenseLumpSum).toBe(10200)
    expect(prepared.specialExpenseLumpSum).toBe(3600)
    expect(prepared.singleParentRelief).toBe(0)
    expect(prepared.childAllowanceForSoli).toBe(0)
    expect(prepared.finalRe4).toBe(input.RE4)
    expect(prepared.finalSonstb).toBe(input.SONSTB)
  })

  it('computes RE4 from recurring gross minus allowances', () => {
    const scenario = validScenario()
    const { input } = prepare(scenario)

    // 90,000 recurring annual − (1,230 + 102 + 36) allowances = 88,632; /12 → 7,386
    expect(input.RE4).toBe(738600)
  })

  it('gives tax class II the single-parent relief', () => {
    const scenario = validScenario()
    ;(scenario.tax as Record<string, unknown>).taxClass = 'tax_class_2'
    const { input, prepared } = prepare(scenario)

    expect(input.STKL).toBe(2)
    expect(prepared.singleParentRelief).toBe(426000)
    // (90,000 − 1,368 − 4,260) / 12 = 7,031
    expect(input.RE4).toBe(703100)
  })

  it('omits employee and pension expense lump sums for classes V and VI', () => {
    for (const taxClass of ['tax_class_5', 'tax_class_6']) {
      const scenario = validScenario()
      ;(scenario.tax as Record<string, unknown>).taxClass = taxClass
      const { input, prepared } = prepare(scenario)

      expect(prepared.employeeExpenseLumpSum).toBe(0)
      expect(prepared.pensionExpenseLumpSum).toBe(0)
      expect(prepared.specialExpenseLumpSum).toBe(3600)
      expect(prepared.childAllowanceForSoli).toBe(0)
      expect(input.STKL).toBe(Number(taxClass.slice(-1)))
    }
  })

  it('doubles the child allowance share for tax class III', () => {
    const scenario = validScenario()
    const tax = scenario.tax as Record<string, unknown>
    tax.taxClass = 'tax_class_3'
    tax.childAllowanceFactor = '1'
    const { input, prepared } = prepare(scenario)

    expect(input.STKL).toBe(3)
    expect(input.ZKF).toBe(1)
    expect(prepared.childAllowanceForSoli).toBe(975600)
  })

  it('keeps one-off payments out of RE4 and maps them to SONSTB', () => {
    const scenario = validScenario()
    ;(scenario.compensation as Record<string, unknown>).baseSalary = {
      period: 'annual',
      grossAmount: { amount: '60000.00', currency: 'EUR' },
      paymentsPerYear: 12,
    }
    ;(scenario.compensation as Record<string, unknown>).regularAdditionalCash =
      { kind: 'none' }
    ;(scenario.compensation as Record<string, unknown>).oneOffPayments = [
      {
        amount: { amount: '5000.00', currency: 'EUR' },
        paymentMonth: 7,
        classification: 'yearly_bonus',
        guarantee: 'variable',
      },
    ]

    const { input, prepared } = prepare(scenario)

    expect(input.SONSTB).toBe(500000)
    expect(prepared.annualOneOffGross).toBe(500000)
    // RE4 from 60,000 recurring only: (6,000,000 − 136,800) / 12 = 488,600 cents
    expect(input.RE4).toBe(488600)
  })

  it('maps the insurer-specific additional rate to KVZ basis points', () => {
    const scenario = validScenario()
    ;(scenario.social as Record<string, unknown>).health = {
      healthInsuranceType: 'statutory',
      additionalRateMode: 'insurer_specific',
      additionalContributionRate: { value: '1.6', unit: 'percent' },
    }
    const { input } = prepare(scenario)

    expect(input.KVZ).toBe(160)
  })

  it('sets the private-insurance path fields', () => {
    const scenario = validScenario()
    ;(scenario.social as Record<string, unknown>).health = {
      healthInsuranceType: 'private',
      totalHealthPremiumMonthly: { amount: '400.00', currency: 'EUR' },
      totalCarePremiumMonthly: { amount: '80.00', currency: 'EUR' },
      payrollBasicCoverageAmountMonthly: { amount: '200.00', currency: 'EUR' },
      employerContributionKnown: false,
    }
    const { input } = prepare(scenario)

    expect(input.PKV).toBe(1)
    expect(input.PKPV).toBe(48000)
    expect(input.PKPVAGZ).toBe(0)
  })

  it('sets PVZ from child status and PVA from qualifying children', () => {
    const scenario = validScenario()
    const social = scenario.social as Record<string, unknown>
    social.careInsuranceChildStatus = 'has_child'
    social.childrenUnderRelevantAge = 2
    const { input } = prepare(scenario)

    expect(input.PVZ).toBe(0)
    expect(input.PVA).toBe(2)
  })

  it('caps PVA at four discounts', () => {
    const scenario = validScenario()
    const social = scenario.social as Record<string, unknown>
    social.careInsuranceChildStatus = 'has_child'
    social.childrenUnderRelevantAge = 7
    const { input } = prepare(scenario)

    expect(input.PVA).toBe(4)
  })

  it('sets the Saxony flag from the care-insurance employment state', () => {
    const scenario = validScenario()
    const social = scenario.social as Record<string, unknown>
    social.careInsuranceEmploymentState = 'DE-SN'
    const { input } = prepare(scenario)

    expect(input.PVS).toBe(1)
  })

  it('sets the religion code from church-tax status', () => {
    const scenario = validScenario()
    ;(scenario.tax as Record<string, unknown>).churchTaxStatus = 'liable'
    const { input } = prepare(scenario)

    expect(input.R).toBe(1)
  })

  it('rejects a calculation year without an approved plan', () => {
    const scenario = validScenario()
    scenario.calculationYear = 2025
    expect(() => prepare(scenario)).toThrow(
      'NP-CALC-005 only implements the 2026 BMF plan',
    )
  })

  it('builds the same interface through the convenience wrapper', () => {
    const direct = prepare(validScenario())
    const wrapper = buildPapInput(validScenario() as never)

    expect(wrapper.input).toEqual(direct.input)
    expect(wrapper.prepared).toEqual(direct.prepared)
  })
})
