import { describe, expect, it } from 'vitest'
import reference from '../../../fixtures/reference/2026/nettopilot-reference-scenarios.json'
import { calculatePayrollTax2026 } from './payroll-tax'
import type { PapInput } from './taxable-pay'

type AnnualTaxFixture = {
  id: string
  family: string
  verificationTier: string
  inputs: {
    oracleMode?: string
    tableType?: string
    taxClass?: number
    grossReferenceCents?: number
    kvzPercent?: string
  }
  expected: { annualWageTaxCents?: number }
  toleranceCents: number
  sources: string[]
}

// Annex 2 rows are table ranges, not direct PAP gross-salary observations.
// The upper step endpoints below have been separately verified against the
// BMF machine PAP in NP-CALC-006. The named mapping makes that conversion
// explicit and independently auditable.
const annualTableUpperStepCents: Readonly<Record<string, number>> = {
  'BMF-GEN-030K-I': 3_002_399,
  'BMF-GEN-050K-II': 5_000_399,
  'BMF-GEN-060K-III': 6_001_199,
  'BMF-GEN-100K-IV': 10_000_799,
  'BMF-GEN-040K-V': 4_003_199,
  'BMF-GEN-070K-VI': 7_001_999,
}

const annualInput = (
  grossCents: number,
  taxClass: number,
  kvzPercent: number,
): PapInput => ({
  ALTER1: 0,
  ALV: 0,
  JFREIB: 0,
  JHINZU: 0,
  JRE4: 0,
  JRE4ENT: 0,
  JVBEZ: 0,
  KRV: 0,
  KVZ: kvzPercent,
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
  STKL: taxClass as PapInput['STKL'],
  VBEZ: 0,
  VBEZM: 0,
  VBEZS: 0,
  VBS: 0,
  ZKF: 0,
  calculationYear: 2026,
})

const selected = (reference.scenarios as AnnualTaxFixture[]).filter(
  (scenario) =>
    scenario.family === 'payroll_tax' &&
    scenario.verificationTier === 'official_exact' &&
    scenario.inputs.oracleMode === 'bmf_annual_table' &&
    scenario.inputs.tableType === 'general',
)

describe('NP-CALC-017 official BMF annual-table conformance', () => {
  it('records a coherent, sourced 2026 oracle and covers tax classes I–VI', () => {
    expect(reference.fixtureSetId).toBe('de-payroll-reference-2026-v1')
    expect(reference.calculationYear).toBe(2026)
    expect(selected).toHaveLength(6)
    expect(selected.map((scenario) => scenario.inputs.taxClass).sort()).toEqual([
      1, 2, 3, 4, 5, 6,
    ])
    for (const fixture of selected) {
      expect(fixture.sources).toContain('DE-BMF-PAP-2026-A2')
      expect(fixture.toleranceCents).toBe(0)
      expect(annualTableUpperStepCents[fixture.id]).toBeDefined()
    }
  })

  it.each(selected)(
    'matches official annual-table tax for $id exactly',
    (fixture) => {
      const gross = annualTableUpperStepCents[fixture.id]
      const taxClass = fixture.inputs.taxClass
      const expected = fixture.expected.annualWageTaxCents
      if (gross === undefined || taxClass === undefined || expected === undefined)
        throw new Error('Incomplete official BMF reference fixture')
      const result = calculatePayrollTax2026(
        annualInput(gross, taxClass, Number(fixture.inputs.kvzPercent ?? '2.90')),
      )
      expect(Math.abs(result.wageTaxCents - expected)).toBeLessThanOrEqual(
        fixture.toleranceCents,
      )
      expect(result.sourceId).toBe('DE-BMF-PAP-2026-A1')
    },
  )

  it('distinguishes the annual check table from twelve monthly payroll events', () => {
    const yearGross = 6_000_000
    const annual = calculatePayrollTax2026(annualInput(yearGross, 1, 2.9))
    const month = calculatePayrollTax2026({
      ...annualInput(500_000, 1, 2.9),
      LZZ: 2,
    })
    expect(annual.wageTaxCents).toBeGreaterThan(0)
    expect(month.wageTaxCents).toBe(Math.trunc(annual.wageTaxCents / 12))
    // This assertion documents the oracle-mode boundary, not a universal
    // promise that every monthly scenario equals an annual-table result.
  })

  it('does not treat special-table references as supported ordinary employment', () => {
    const special = (reference.scenarios as AnnualTaxFixture[]).find(
      (fixture) => fixture.id === 'BMF-SPECIAL-060K-I',
    )
    expect(special?.verificationTier).toBe('official_exact')
    expect(special?.inputs.tableType).toBe('special')
    expect(special?.family).toBe('payroll_tax_adapter')
  })
})
