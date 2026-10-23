import { describe, expect, it } from 'vitest'

import {
  CHURCH_TAX_STATE_REGISTRY_2026,
  calculateChurchTax2026,
  calculateChurchTaxFromApprovedRule2026,
  calculateChurchTaxFromPayrollTax2026,
  type ApprovedChurchTaxRule2026,
  type ChurchTaxInput2026,
} from './church-tax'
import { calculatePayrollTax2026 } from './payroll-tax'
import type { FederalStateCode } from './types'

const liableInput = (
  state: FederalStateCode | 'unknown' = 'DE-BY',
  overrides: Partial<ChurchTaxInput2026> = {},
): ChurchTaxInput2026 => ({
  calculationYear: 2026,
  status: 'liable',
  payrollMarkerEvidence: 'confirmed',
  payrollEstablishmentState: state,
  childAllowanceFactorKnown: true,
  recurringAssessmentBaseCents: 12_345,
  otherRemunerationAssessmentBaseCents: 1_111,
  scope: 'ordinary_payroll',
  ...overrides,
})

const approvedRule = (
  state: FederalStateCode,
  rateBasisPoints: 800 | 900,
): ApprovedChurchTaxRule2026 => ({
  state,
  rateBasisPoints,
  finalCentRule: 'truncate',
  rateSourceIds: ['TEST-GOVERNING-RATE'],
  finalCentSourceIds: ['TEST-FINAL-CENT-RULE'],
  effectiveFrom: '2026-01-01',
  effectiveTo: '2026-12-31',
  supportStatus: 'approved',
})

describe('2026 church-tax production admission', () => {
  it('returns a neutral zero deduction for a non-liable payroll marker', () => {
    const result = calculateChurchTax2026({
      ...liableInput('unknown'),
      status: 'not_liable',
      payrollMarkerEvidence: 'unknown',
      childAllowanceFactorKnown: false,
    })

    expect(result).toMatchObject({
      state: 'calculated',
      resultQuality: 'no_deduction',
      rateBasisPoints: 0,
      recurringChurchTaxCents: 0,
      otherRemunerationChurchTaxCents: 0,
      totalChurchTaxCents: 0,
    })
  })

  it.each([
    [{ status: 'unknown' }, 'unknown_church_tax_status'],
    [{ payrollMarkerEvidence: 'unknown' }, 'unconfirmed_payroll_marker'],
    [{ childAllowanceFactorKnown: false }, 'unknown_child_allowance_factor'],
    [
      { payrollEstablishmentState: 'unknown' },
      'unknown_payroll_establishment_state',
    ],
  ] as const)('returns incomplete for %o', (overrides, reason) => {
    expect(
      calculateChurchTax2026({ ...liableInput(), ...overrides }),
    ).toMatchObject({ state: 'incomplete', reason })
  })

  it.each([
    'capping',
    'minimum_tax',
    'church_money',
    'flat_rate_payroll',
    'final_assessment',
    'cross_border',
  ] as const)('rejects the deferred %s scope', (scope) => {
    expect(
      calculateChurchTax2026(liableInput('DE-BY', { scope })),
    ).toMatchObject({
      state: 'unsupported',
      reason: 'special_case_unsupported',
    })
  })

  it('contains one source-gated record for every federal state', () => {
    expect(CHURCH_TAX_STATE_REGISTRY_2026).toHaveLength(16)
    expect(
      new Set(CHURCH_TAX_STATE_REGISTRY_2026.map((record) => record.state))
        .size,
    ).toBe(16)
  })

  it.each(CHURCH_TAX_STATE_REGISTRY_2026)(
    'fails closed for $state until both source gates are approved',
    (record) => {
      const input = liableInput(record.state, {
        payrollEstablishmentPostcode:
          record.state === 'DE-BW' ? '70173' : undefined,
      })
      const result = calculateChurchTax2026(input)

      expect(result).toMatchObject({
        state: 'unsupported',
        reason: 'state_evidence_not_approved',
        payrollEstablishmentState: record.state,
        candidateRateBasisPoints: record.candidateRateBasisPoints,
      })
      if (result.state === 'unsupported')
        expect(result.missingEvidence?.length).toBeGreaterThan(0)
    },
  )

  it('requires Baden-Württemberg payroll-establishment postcode evidence', () => {
    expect(calculateChurchTax2026(liableInput('DE-BW'))).toMatchObject({
      state: 'incomplete',
      reason: 'missing_bw_postcode',
    })
  })

  it('requires an explicit Bad Wimpfen exception decision', () => {
    expect(
      calculateChurchTax2026(
        liableInput('DE-BW', { payrollEstablishmentPostcode: '74206' }),
      ),
    ).toMatchObject({
      state: 'incomplete',
      reason: 'unknown_bw_exception_status',
    })
  })

  it('retains the 9% Bad Wimpfen candidate without activating it', () => {
    expect(
      calculateChurchTax2026(
        liableInput('DE-BW', {
          payrollEstablishmentPostcode: '74206',
          bwExceptionStatus: 'applies',
        }),
      ),
    ).toMatchObject({
      state: 'unsupported',
      candidateRateBasisPoints: 900,
      reason: 'state_evidence_not_approved',
    })
  })

  it('rejects invalid money, postcode and calculation-year inputs', () => {
    expect(() =>
      calculateChurchTax2026(
        liableInput('DE-BY', { recurringAssessmentBaseCents: -1 }),
      ),
    ).toThrow(RangeError)
    expect(() =>
      calculateChurchTax2026(
        liableInput('DE-BW', { payrollEstablishmentPostcode: '7017' }),
      ),
    ).toThrow(RangeError)
    expect(() =>
      calculateChurchTax2026(liableInput('DE-BY', { calculationYear: 2025 })),
    ).toThrow(RangeError)
  })
})

describe('approved church-tax rule admission', () => {
  it('rejects fabricated source IDs even when a rule claims approved status', () => {
    expect(() =>
      calculateChurchTaxFromApprovedRule2026(
        liableInput('DE-BY'),
        approvedRule('DE-BY', 900),
      ),
    ).toThrow('not approved by the production evidence registry')
  })

  it('rejects unsupported payroll scopes even for non-liable employees', () => {
    for (const scope of [
      'flat_rate_payroll',
      'cross_border',
      'final_assessment',
    ] as const) {
      expect(
        calculateChurchTax2026({
          ...liableInput('DE-BY'),
          status: 'not_liable',
          scope,
        }),
      ).toMatchObject({
        state: 'unsupported',
        reason: 'special_case_unsupported',
      })
    }
  })

  it('continues to reject unconfirmed payroll-marker evidence', () => {
    expect(() =>
      calculateChurchTaxFromApprovedRule2026(
        liableInput('DE-BY', { payrollMarkerEvidence: 'unknown' }),
        approvedRule('DE-BY', 900),
      ),
    ).toThrow('confirmed payroll-marker evidence')
  })
})

describe('payroll-tax adapter', () => {
  it('passes the PAP BK and BKS outputs into the church module', () => {
    const payrollTax = calculatePayrollTax2026({
      ALTER1: 0,
      ALV: 0,
      JFREIB: 0,
      JHINZU: 0,
      JRE4: 0,
      JRE4ENT: 0,
      JVBEZ: 0,
      KRV: 0,
      KVZ: 2.9,
      LZZ: 2,
      LZZFREIB: 0,
      LZZHINZU: 0,
      MBV: 0,
      PKPV: 0,
      PKPVAGZ: 0,
      PKV: 0,
      PVA: 0,
      PVS: 0,
      PVZ: 0,
      R: 1,
      RE4: 500_000,
      SONSTB: 0,
      SONSTENT: 0,
      STERBE: 0,
      STKL: 1,
      VBEZ: 0,
      VBEZM: 0,
      VBEZS: 0,
      VBS: 0,
      ZKF: 0,
      calculationYear: 2026,
    })
    const result = calculateChurchTaxFromPayrollTax2026(payrollTax, {
      status: 'not_liable',
      payrollMarkerEvidence: 'confirmed',
      payrollEstablishmentState: 'DE-BW',
      childAllowanceFactorKnown: true,
      payrollEstablishmentPostcode: '70173',
    })

    expect(result).toMatchObject({
      state: 'calculated',
      recurringAssessmentBaseCents: payrollTax.churchTaxAssessmentBaseCents,
      otherRemunerationAssessmentBaseCents:
        payrollTax.otherRemunerationChurchTaxAssessmentBaseCents,
    })
  })
})
