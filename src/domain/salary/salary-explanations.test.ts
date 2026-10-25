import { describe, expect, it } from 'vitest'
import {
  explainSalaryResults2026,
  SALARY_EXPLANATION_FIELDS_2026,
  type SalaryExplanationField2026,
  type SalaryLineItemProvenance2026,
} from './salary-explanations'
import type { SalaryPeriodTotals2026 } from './salary-aggregation'

const totals = Object.fromEntries(
  SALARY_EXPLANATION_FIELDS_2026.map((key) => [
    key,
    key === 'grossCents' ? 500000 : 0,
  ]),
) as unknown as SalaryPeriodTotals2026

const record: SalaryLineItemProvenance2026 = {
  assumptionSetId: 'de-payroll-2026-validated',
  assumptionVersion: '1.0.0',
  sourceIds: ['DE-BMF-PAP-2026-A1'],
  formulaId: 'NP-CALC-015',
  formulaDescription: {
    de: 'Ergebnis aus den geprüften monatlichen Beiträgen',
    en: 'Result from validated monthly payroll components',
  },
}

const provenance = (): Record<
  SalaryExplanationField2026,
  SalaryLineItemProvenance2026
> =>
  Object.fromEntries(
    SALARY_EXPLANATION_FIELDS_2026.map((key) => [key, record]),
  ) as Record<SalaryExplanationField2026, SalaryLineItemProvenance2026>

describe('2026 salary explainability', () => {
  it('emits one traceable bilingual line for every supported result category', () => {
    const result = explainSalaryResults2026({
      period: 'annual',
      totals,
      provenance: provenance(),
    })
    expect(result.state).toBe('calculated')
    if (result.state === 'calculated') {
      expect(result.lines).toHaveLength(SALARY_EXPLANATION_FIELDS_2026.length)
      expect(result.lines[0]).toMatchObject({
        field: 'grossCents',
        amountCents: 500000,
        sourceIds: ['DE-BMF-PAP-2026-A1'],
        assumptionVersion: '1.0.0',
        unit: 'EUR_CENTS',
      })
      expect(
        result.lines.every((line) => Boolean(line.label.de && line.label.en)),
      ).toBe(true)
    }
  })

  it('refuses missing source evidence rather than inserting a made-up label', () => {
    const sources = provenance()
    delete (sources as Partial<typeof sources>).wageTaxCents
    expect(
      explainSalaryResults2026({
        period: 'monthly',
        totals,
        provenance: sources,
      }),
    ).toMatchObject({
      state: 'incomplete',
      reason: 'provenance_missing',
      field: 'wageTaxCents',
    })
  })

  it('refuses incomplete assumption metadata', () => {
    const sources = provenance()
    sources.employerCostCents = {
      ...record,
      sourceIds: [''],
    }
    expect(
      explainSalaryResults2026({
        period: 'monthly',
        totals,
        provenance: sources,
      }),
    ).toMatchObject({
      state: 'incomplete',
      field: 'employerCostCents',
    })
  })

  it('rejects non-integer results even if source metadata exists', () => {
    const broken = { ...totals, grossCents: Number.NaN }
    expect(() =>
      explainSalaryResults2026({
        period: 'monthly',
        totals: broken,
        provenance: provenance(),
      }),
    ).toThrow(RangeError)
  })
})
