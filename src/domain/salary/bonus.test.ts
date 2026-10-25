import { describe, expect, it } from 'vitest'
import { prepareBonus2026, type BonusPreparationInput2026 } from './bonus'
import { prepareBonusSequence2026 } from './bonus-sequence'
import { calculateBonusSettlement2026 } from './bonus-settlement'
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
    expect(
      prepareBonus2026({
        ...base,
        insurancePath: 'private',
      }),
    ).toMatchObject({
      state: 'prepared',
      kvPvLiableCents: 0,
    })
  })

  it('requires January-March history for a one-time payment', () => {
    expect(
      prepareBonus2026({
        ...base,
        paymentMonth: 2,
        sameEmployerPreviousYear: 'unknown',
      }),
    ).toMatchObject({
      state: 'incomplete',
      reason: 'march_clause_history_unknown',
    })
  })

  it('blocks previous-year allocation when the March clause may apply', () => {
    expect(
      prepareBonus2026({
        ...base,
        paymentMonth: 2,
        sameEmployerPreviousYear: true,
        priorKvPvContributoryPayCents: 6_900_000,
      }),
    ).toMatchObject({
      state: 'unsupported',
      reason: 'march_clause_prior_year',
    })
  })

  it('rejects unknown legal classification and missing contribution history', () => {
    expect(
      prepareBonus2026({
        ...base,
        classification: 'unknown',
      }),
    ).toMatchObject({
      state: 'incomplete',
      reason: 'classification_unknown',
    })
    expect(
      prepareBonus2026({
        ...base,
        contributionDays: 'unknown',
      }),
    ).toMatchObject({
      state: 'incomplete',
      reason: 'contribution_history_required',
    })
  })

  it('rejects zero bonuses and unsupported special cases', () => {
    expect(prepareBonus2026({ ...base, grossPaymentCents: 0 })).toMatchObject({
      state: 'incomplete',
      reason: 'payment_amount_required',
    })
    expect(prepareBonus2026({ ...base, specialCase: true })).toMatchObject({
      state: 'unsupported',
      reason: 'special_payment_unsupported',
    })
  })

  it('requires period context for a monthly recurring bonus', () => {
    expect(
      prepareBonus2026({
        ...base,
        classification: 'monthly_recurring_bonus',
      }),
    ).toMatchObject({
      state: 'incomplete',
      reason: 'running_pay_period_required',
    })
  })

  it('rejects unknown insurance path and invalid payment month', () => {
    expect(
      prepareBonus2026({ ...base, insurancePath: 'unknown' }),
    ).toMatchObject({
      state: 'incomplete',
      reason: 'insurance_path_unknown',
    })
    expect(() => prepareBonus2026({ ...base, paymentMonth: 13 })).toThrow(
      'paymentMonth',
    )
  })

  it('fails closed when church-tax basis is not resolved', () => {
    const result = calculateBonusSettlement2026({
      bonus: { ...base, grossPaymentCents: 100000, insurancePath: 'private' },
      pensionCoverage: 'general_statutory_mandatory',
      unemploymentCoverage: 'mandatory_standard',
      healthRate: { mode: 'published_average' },
      care: {
        calculationYear: 2026,
        payrollYear: 2026,
        insurancePath: 'private',
        employmentState: 'other',
        parentStatus: 'childless',
      },
      churchTaxStatus: 'unknown',
    })
    expect(result).toMatchObject({
      state: 'incomplete',
      reason: 'church_tax_calculation_required',
    })
  })

  it('rejects liable church-tax states without approved evidence', () => {
    expect(
      calculateBonusSettlement2026({
        bonus: { ...base, grossPaymentCents: 100000, insurancePath: 'private' },
        pensionCoverage: 'general_statutory_mandatory',
        unemploymentCoverage: 'mandatory_standard',
        healthRate: { mode: 'published_average' },
        care: {
          calculationYear: 2026,
          payrollYear: 2026,
          insurancePath: 'private',
          employmentState: 'other',
          parentStatus: 'childless',
        },
        churchTaxStatus: 'liable',
      }),
    ).toMatchObject({
      state: 'unsupported',
      reason: 'church_tax_rate_evidence_not_approved',
    })
  })

  it('rejects unsupported pension coverage without inventing net pay', () => {
    const result = calculateBonusSettlement2026({
      bonus: { ...base, grossPaymentCents: 100000, insurancePath: 'private' },
      pensionCoverage: 'unknown',
      unemploymentCoverage: 'mandatory_standard',
      healthRate: { mode: 'published_average' },
      care: {
        calculationYear: 2026,
        payrollYear: 2026,
        insurancePath: 'private',
        employmentState: 'other',
        parentStatus: 'childless',
      },
      churchTaxStatus: 'not_liable',
    })
    expect(result).toMatchObject({
      state: 'unsupported',
      reason: 'pension_or_unemployment_scope_unsupported',
    })
  })


  it('allows a January bonus when previous-year employment is ruled out', () => {
    const result = prepareBonus2026({
      ...base,
      paymentMonth: 1,
      sameEmployerPreviousYear: false,
      grossPaymentCents: 100000,
    })
    expect(result.state).toBe('prepared')
  })

  it('uses zero remaining KV headroom when the full annual ceiling was consumed', () => {
    const result = prepareBonus2026({
      ...base,
      grossPaymentCents: 100000,
      priorKvPvContributoryPayCents: 6975000,
      priorRvAvContributoryPayCents: 10140000,
    })
    expect(result).toMatchObject({
      state: 'prepared',
      kvPvLiableCents: 0,
      rvAvLiableCents: 0,
    })
  })

  it('rejects invalid contribution days without inventing insurance amounts', () => {
    expect(() =>
      prepareBonus2026({
        ...base,
        contributionDays: 361,
      }),
    ).toThrow('contributionDays')
  })

  it('applies bonuses in chronological order without counting future bonuses in JRE4', () => {
    const result = prepareBonusSequence2026([
      { ...base, paymentMonth: 11, grossPaymentCents: 100000 },
      { ...base, paymentMonth: 12, grossPaymentCents: 200000 },
    ])
    expect(result).toMatchObject({
      state: 'prepared',
      totalGrossCents: 300000,
      payments: [
        { expectedAnnualTaxBaseCents: 6000000, grossPaymentCents: 100000 },
        { expectedAnnualTaxBaseCents: 6100000, grossPaymentCents: 200000 },
      ],
    })
  })

  it('rejects reverse chronological payments', () => {
    expect(
      prepareBonusSequence2026([
        { ...base, paymentMonth: 12 },
        { ...base, paymentMonth: 11 },
      ]),
    ).toMatchObject({
      state: 'unsupported',
      reason: 'payments_not_chronological',
      paymentIndex: 1,
    })
  })
  it('reconciles a supported private bonus without statutory health deductions', () => {
    const result = calculateBonusSettlement2026({
      bonus: {
        ...base,
        insurancePath: 'private',
        grossPaymentCents: 100000,
        priorOtherRemunerationCents: 0,
      },
      pensionCoverage: 'general_statutory_mandatory',
      unemploymentCoverage: 'mandatory_standard',
      healthRate: { mode: 'published_average' },
      care: {
        calculationYear: 2026,
        payrollYear: 2026,
        insurancePath: 'private',
        employmentState: 'other',
        parentStatus: 'childless',
      },
      churchTaxStatus: 'not_liable',
    })
    expect(result.state).toBe('calculated')
    if (result.state === 'calculated') {
      expect(result.grossCents).toBe(100000)
      expect(
        result.netBonusCents +
          result.wageTaxCents +
          result.solidarityCents +
          result.churchTaxCents +
          result.employeeInsuranceCents,
      ).toBe(result.grossCents)
      expect(result.incrementalEmployerCostCents).toBe(
        result.grossCents + result.employerInsuranceCents,
      )
    }
  })

  it('calculates larger one-time bases using proportional headroom without a monthly re-cap', () => {
    const result = calculateBonusSettlement2026({
      bonus: { ...base, grossPaymentCents: 2000000 },
      pensionCoverage: 'general_statutory_mandatory',
      unemploymentCoverage: 'mandatory_standard',
      healthRate: { mode: 'published_average' },
      care: {
        calculationYear: 2026,
        payrollYear: 2026,
        insurancePath: 'statutory',
        employmentState: 'other',
        parentStatus: 'childless',
        birthDate: '1990-01-01',
      },
      churchTaxStatus: 'not_liable',
    })
    expect(result.state).toBe('calculated')
    if (result.state === 'calculated') {
      expect(result.grossCents).toBe(2000000)
      expect(result.employeeInsuranceCents).toBeGreaterThan(0)
      expect(result.employerInsuranceCents).toBeGreaterThan(0)
    }
  })
})
