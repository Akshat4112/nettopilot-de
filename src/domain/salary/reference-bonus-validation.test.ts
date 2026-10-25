import { describe, expect, it } from 'vitest'
import references from '../../../fixtures/reference/2026/nettopilot-reference-scenarios.json'
import { prepareBonus2026, type BonusPreparationInput2026 } from './bonus'
import type { PapInput } from './taxable-pay'

const pap: PapInput = {
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
  R: 0,
  RE4: 500000,
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
}

const base: BonusPreparationInput2026 = {
  calculationYear: 2026,
  classification: 'performance_bonus',
  paymentMonth: 12,
  grossPaymentCents: 2_000_000,
  expectedRunningAnnualPayCents: 6_000_000,
  priorOtherRemunerationCents: 0,
  contributionDays: 360,
  priorKvPvContributoryPayCents: 4_000_000,
  priorRvAvContributoryPayCents: 6_000_000,
  insurancePath: 'statutory',
  statutoryHealthCoverage: 'mandatory',
  sameEmployerPreviousYear: false,
  pap,
}

const find = (id: string) => {
  const fixture = references.scenarios.find((scenario) => scenario.id === id)
  if (!fixture) throw new Error('Reference scenario missing: ' + id)
  return fixture
}

describe('NP-CALC-017 bonus and March admission reference fixtures', () => {
  it('matches approved July proportional ceiling and bonus liability', () => {
    const fixture = find('BONUS-JULY-FULL-LIABLE')
    if (
      !('currentBonusCents' in fixture.inputs) ||
      !('socialInsuranceDays' in fixture.inputs) ||
      !('priorRecurringPayThroughPaymentMonthCents' in fixture.inputs) ||
      !('kvPvLiableBonusCents' in fixture.expected) ||
      !('rvAvLiableBonusCents' in fixture.expected)
    )
      throw new Error('Invalid July bonus reference')
    const result = prepareBonus2026({
      ...base,
      paymentMonth: 7,
      grossPaymentCents: fixture.inputs.currentBonusCents,
      contributionDays: fixture.inputs.socialInsuranceDays,
      priorKvPvContributoryPayCents:
        fixture.inputs.priorRecurringPayThroughPaymentMonthCents,
      priorRvAvContributoryPayCents:
        fixture.inputs.priorRecurringPayThroughPaymentMonthCents,
      sameEmployerPreviousYear: false,
    })
    expect(result.state).toBe('prepared')
    if (result.state !== 'prepared')
      throw new Error('Unexpected July bonus admission')
    expect(result.kvPvLiableCents).toBe(fixture.expected.kvPvLiableBonusCents)
    expect(result.rvAvLiableCents).toBe(fixture.expected.rvAvLiableBonusCents)
  })

  it('preserves incomplete March state instead of fabricating previous-year allocation', () => {
    const fixture = find('BONUS-MARCH-PRIOR-YEAR-UNKNOWN')
    if (
      !('currentBonusCents' in fixture.inputs) ||
      !('resultState' in fixture.expected)
    )
      throw new Error('Invalid March fixture')
    const result = prepareBonus2026({
      ...base,
      paymentMonth: 3,
      grossPaymentCents: fixture.inputs.currentBonusCents,
      sameEmployerPreviousYear: 'unknown',
    })
    expect(result.state).toBe(fixture.expected.resultState)
    if (result.state !== 'prepared')
      expect(result.reason).toBe('march_clause_history_unknown')
  })
})
