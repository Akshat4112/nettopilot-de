import { describe, expect, it } from 'vitest'
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
  sameEmployerPreviousYear: false,
  pap,
}

describe('2026 bonus preparation', () => {
  it('uses the other-remuneration PAP and separate insurance ceilings', () => {
    const result = prepareBonus2026(base)
    expect(result).toMatchObject({
      state: 'prepared',
      grossPaymentCents: 2_000_000,
      kvPvLiableCents: 2_000_000,
      rvAvLiableCents: 2_000_000,
      expectedAnnualTaxBaseCents: 6_000_000,
    })
    if (result.state === 'prepared')
      expect(result.otherRemunerationWageTaxCents).toBeGreaterThan(0)
  })

  it('prevents a bonus from creating statutory KV/PV on the PKV path', () => {
    expect(prepareBonus2026({
      ...base,
      insurancePath: 'private',
    })).toMatchObject({
      state: 'prepared',
      kvPvLiableCents: 0,
    })
  })

  it('requires January-March history for a one-time payment', () => {
    expect(prepareBonus2026({
      ...base,
      paymentMonth: 2,
      sameEmployerPreviousYear: 'unknown',
    })).toMatchObject({
      state: 'incomplete',
      reason: 'march_clause_history_unknown',
    })
  })

  it('blocks previous-year allocation when the March clause may apply', () => {
    expect(prepareBonus2026({
      ...base,
      paymentMonth: 2,
      sameEmployerPreviousYear: true,
      priorKvPvContributoryPayCents: 6_900_000,
    })).toMatchObject({
      state: 'unsupported',
      reason: 'march_clause_prior_year',
    })
  })

  it('rejects unknown legal classification and missing contribution history', () => {
    expect(prepareBonus2026({
      ...base,
      classification: 'unknown',
    })).toMatchObject({
      state: 'incomplete',
      reason: 'classification_unknown',
    })
    expect(prepareBonus2026({
      ...base,
      contributionDays: 'unknown',
    })).toMatchObject({
      state: 'incomplete',
      reason: 'contribution_history_required',
    })
  })
})
