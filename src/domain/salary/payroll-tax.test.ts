import { describe, expect, it } from 'vitest'

import { calculatePayrollTax2026 } from './payroll-tax'
import { buildPapInput, type PapInput, type StklValue } from './taxable-pay'

const annualInput = (grossCents: number, STKL: StklValue): PapInput => ({
  ALTER1: 0,
  ALV: 0,
  JFREIB: 0,
  JHINZU: 0,
  JRE4: 0,
  JRE4ENT: 0,
  JVBEZ: 0,
  KRV: 0,
  KVZ: 2.9,
  LZZ: 1,
  LZZFREIB: 0,
  LZZHINZU: 0,
  MBV: 0,
  PKPV: 0,
  PKPVAGZ: 0,
  PKV: 0,
  PVA: 0,
  PVS: 0,
  PVZ: 0,
  R: 0,
  RE4: grossCents,
  SONSTB: 0,
  SONSTENT: 0,
  STERBE: 0,
  STKL,
  VBEZ: 0,
  VBEZM: 0,
  VBEZS: 0,
  VBS: 0,
  ZKF: 0,
  calculationYear: 2026,
})

describe('2026 BMF payroll-tax calculation (NP-CALC-006)', () => {
  it.each([
    // Annex 2's displayed reference row is represented by its inclusive
    // table-step upper boundary when passed into the machine PAP.
    [3_002_399, 1, 229_900],
    [5_000_399, 2, 558_000],
    [6_001_199, 3, 491_800],
    [10_000_799, 4, 2_342_600],
    [4_003_199, 5, 882_400],
    [7_001_999, 6, 1_944_300],
  ] as const)(
    'matches the official general annual table at gross=%i, class=%i',
    (gross, taxClass, expected) => {
      expect(
        calculatePayrollTax2026(annualInput(gross, taxClass)).wageTaxCents,
      ).toBe(expected)
    },
  )

  it('allocates annual tax to a monthly payroll period with PAP truncation', () => {
    const annual = calculatePayrollTax2026(annualInput(6_000_000, 1))
    const monthly = calculatePayrollTax2026({
      ...annualInput(500_000, 1),
      LZZ: 2,
    })

    expect(monthly.wageTaxCents).toBe(Math.trunc(annual.wageTaxCents / 12))
  })

  it('uses child allowances for Soli and church bases, not regular wage tax', () => {
    const withoutChild = calculatePayrollTax2026({
      ...annualInput(100_000_00, 1),
      R: 1,
    })
    const withChild = calculatePayrollTax2026({
      ...annualInput(100_000_00, 1),
      R: 1,
      ZKF: 1,
    })

    expect(withChild.wageTaxCents).toBe(withoutChild.wageTaxCents)
    expect(withChild.churchTaxAssessmentBaseCents).toBeLessThan(
      withoutChild.churchTaxAssessmentBaseCents,
    )
    expect(withChild.solidaritySurchargeCents).toBeLessThanOrEqual(
      withoutChild.solidaritySurchargeCents,
    )
  })

  it('calculates other remuneration separately from recurring withholding', () => {
    const result = calculatePayrollTax2026({
      ...annualInput(500_000, 1),
      LZZ: 2,
      JRE4: 6_000_000,
      SONSTB: 500_000,
      R: 1,
    })

    expect(result.otherRemunerationWageTaxCents).toBeGreaterThan(0)
    expect(result.otherRemunerationChurchTaxAssessmentBaseCents).toBe(
      result.otherRemunerationWageTaxCents,
    )
  })

  it('uses the private basic health/care amount in the Vorsorgepauschale', () => {
    const statutory = calculatePayrollTax2026(annualInput(6_000_000, 1))
    const privateResult = calculatePayrollTax2026({
      ...annualInput(6_000_000, 1),
      PKV: 1,
      PKPV: 48_000,
      PKPVAGZ: 0,
    })

    expect(privateResult.trace.vorsorgepauschaleEuro).toBe('11340.00')
    expect(privateResult.wageTaxCents).toBeGreaterThan(statutory.wageTaxCents)
  })

  it('accepts the corrected NP-CALC-005 monthly adapter output', () => {
    const prepared = buildPapInput({
      compensation: {
        baseSalary: {
          period: 'annual',
          grossAmount: { amount: '60000.00', currency: 'EUR' },
          paymentsPerYear: 12,
        },
        regularAdditionalCash: { kind: 'none' },
        oneOffPayments: [],
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
        careInsuranceChildStatus: 'parent',
        childrenUnderRelevantAge: 1,
        health: {
          healthInsuranceType: 'statutory',
          additionalRateMode: 'published_average',
        },
      },
      calculationYear: 2026,
    } as never)

    expect(prepared.input.RE4).toBe(500_000)
    expect(prepared.input.KVZ).toBe(2.9)
    expect(
      calculatePayrollTax2026(prepared.input).wageTaxCents,
    ).toBeGreaterThan(0)
  })

  it('fails closed for a non-zero deferred PAP branch', () => {
    expect(() =>
      calculatePayrollTax2026({ ...annualInput(6_000_000, 1), VBEZ: 100 }),
    ).toThrow('not admitted in v1')
  })

  it.each([
    [{ calculationYear: 2025 }, 'Only the 2026'],
    [{ LZZ: 9 }, 'LZZ must be'],
    [{ STKL: 7 }, 'STKL must be'],
    [{ RE4: -1 }, 'must be non-negative'],
    [{ VBEZ: 1 }, 'not admitted in v1'],
    [{ JRE4ENT: 1 }, 'not admitted in v1'],
    [{ LZZFREIB: 1 }, 'allowance/addition'],
    [{ F: 0.9 }, 'only valid for tax class IV'],
    [{ SONSTB: 100, JRE4: 0 }, 'JRE4 is required'],
  ] as const)(
    'rejects invalid or unsupported input %#',
    (override, message) => {
      expect(() =>
        calculatePayrollTax2026({
          ...annualInput(6_000_000, 1),
          ...override,
        } as PapInput),
      ).toThrow(message)
    },
  )

  it('covers weekly and daily period allocation', () => {
    const weekly = calculatePayrollTax2026({
      ...annualInput(100_000, 1),
      LZZ: 3,
    })
    const daily = calculatePayrollTax2026({ ...annualInput(20_000, 1), LZZ: 4 })
    expect(weekly.wageTaxCents).toBeGreaterThanOrEqual(0)
    expect(daily.wageTaxCents).toBeGreaterThanOrEqual(0)
  })

  it('covers alternative insurance, factor, and care branches', () => {
    const result = calculatePayrollTax2026({
      ...annualInput(10_000_000, 4),
      ALV: 1,
      KRV: 1,
      F: 0.9,
      PVS: 1,
      PVA: 2,
      PVZ: 0,
    })
    expect(result.wageTaxCents).toBeGreaterThan(0)
  })

  it('covers the class V/VI upper and top-rate branches', () => {
    expect(
      calculatePayrollTax2026(annualInput(10_000_000, 5)).wageTaxCents,
    ).toBeGreaterThan(0)
    expect(
      calculatePayrollTax2026(annualInput(40_000_000, 6)).wageTaxCents,
    ).toBeGreaterThan(0)
  })

  it('returns zero tax and zero Soli below the basic allowance', () => {
    const result = calculatePayrollTax2026(annualInput(5_000, 1))
    expect(result.wageTaxCents).toBe(0)
    expect(result.solidaritySurchargeCents).toBe(0)
  })

  it('exposes source and named rounding checkpoints', () => {
    const result = calculatePayrollTax2026(annualInput(6_000_000, 1))
    expect(result.sourceId).toBe('DE-BMF-PAP-2026-A1')
    expect(result.trace.annualisedRecurringPayEuro).toBe('60000.00')
    expect(result.trace.fixedAllowanceEuro).toBe('1266.00')
    expect(result.trace.vorsorgepauschaleEuro).toBe('11730.00')
    expect(result.trace.taxableIncomeEuro).toBe('47004.00')
    expect(result.trace.annualWageTaxEuro).toBe('9511.00')
    expect(result.trace.soliAssessmentTaxEuro).toBe('9511.00')
  })
})
