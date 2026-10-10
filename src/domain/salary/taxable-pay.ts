/**
 * NP-CALC-005 — Taxable-pay preparation
 *
 * Transforms the normalized compensation and user profile into the exact input
 * fields required by the 2026 BMF payroll-tax algorithm (Anlage 1, final status
 * 12 November 2025). This module performs no legal calculation; it only assembles
 * and validates the interface fields that the PAP core will consume.
 *
 * Key responsibilities:
 * - Annualise recurring pay using the statutory LZZ fractions.
 * - Compute the Vorsorgepauschale deduction (pension, health, care, unemployment).
 * - Apply fixed payroll allowances (employee expense, pension expense, special expense).
 * - Apply child allowances, single-parent relief, pension/age allowances.
 * - Prepare RE4, RE4ENT, JRE4, SONSTB, LZZFREIB, LZZHINZU, etc.
 * - Return a structured, validated `PapInput` object for the PAP core.
 */

import type {
  EuroAmount,
  OneOffPayment,
  RegistryOptionId,
  SocialInsuranceInput,
  WageTaxInput,
} from './types'
import { euroAmountToCents as precisionEuroAmountToCents } from './precision'
import {
  type NormalizedCompensation,
  exactEuroQuotientToCents,
  normalizeCompensation,
  sumExactEuroQuotients,
} from './frequency'

/** BMF 2026 LZZ values. */
export type LzzValue = 1 | 2 | 3 | 4

/** Tax class values accepted by the PAP. */
export type StklValue = 1 | 2 | 3 | 4 | 5 | 6

/** Factor-method flag: only valid when STKL = 4 and F is provided. */
export type AfValue = 0 | 1

/** Pension/age relief flag: 1 when age 64 completed before the relevant calendar year. */
export type Alter1Value = 0 | 1

/** Unemployment-insurance status for Vorsorgepauschale. 0 = general ceiling, 1 = otherwise. */
export type AlvValue = 0 | 1

/** Pension-insurance status for Vorsorgepauschale. 0 = general ceiling, 1 = otherwise. */
export type krvValue = 0 | 1

/** Health-insurance system: 0 = statutory, 1 = exclusively private. */
export type PkvValue = 0 | 1

/** Care-insurance childless surcharge flag. */
export type PvzValue = 0 | 1

/** Care-insurance multiple-child discount count (0–4). */
export type PvaValue = 0 | 1 | 2 | 3 | 4

/** Saxony care-insurance special-rule flag. */
export type PvsValue = 0 | 1

/** Month of other-remuneration payment (1–12). */
export type SonstbMonth = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12

/**
 * Complete, validated input set for the 2026 BMF machine plan (Anlage 1).
 * Every field is a plain value at the official algorithm boundary (integer cents
 * for money, raw enums/flags for discrete inputs). The PAP core must receive
 * exactly these keys with the documented types and constraints.
 */
export interface PapInput {
  /** Calendar year following completion of age 64 (required when ALTER1 = 1). */
  AJAHR?: number
  /** Age-relief flag. */
  ALTER1: Alter1Value
  /** Unemployment-insurance status for Vorsorgepauschale. */
  ALV: AlvValue
  /** Factor-method factor, three decimals (factor method only, STKL = 4). */
  F?: number
  /** Annual allowance for other remuneration and section 19a benefits (cents). */
  JFREIB: number
  /** Annual addition for other remuneration (cents). Zero when absent. */
  JHINZU: number
  /** Expected annual employment income excluding current other remuneration (cents). Required when SONSTB supplied. */
  JRE4: number
  /** Taxable section 19a benefits included in JRE4 (cents). */
  JRE4ENT: number
  /** Pension payments included in JRE4 (cents). */
  JVBEZ: number
  /** Pension-insurance status for Vorsorgepauschale. */
  KRV: krvValue
  /** Applicable full insurer-specific additional GKV contribution rate (percent with two decimals). */
  KVZ: number
  /** Wage-payment period: 1=year, 2=month, 3=week, 4=day. */
  LZZ: LzzValue
  /** Allowance for the wage-payment period (cents). ELStAM/certificate value. */
  LZZFREIB: number
  /** Addition for the wage-payment period (cents). ELStAM/certificate value. */
  LZZHINZU: number
  /** Non-taxed section 19a benefit (cents). */
  MBV: number
  /** Private basic health and mandatory care-insurance contribution (monthly cents). Always monthly regardless of LZZ. */
  PKPV: number
  /** Tax-free employer subsidy for private health/care insurance (monthly cents). Always monthly regardless of LZZ. */
  PKPVAGZ: number
  /** Health-insurance system: 0 = statutory, 1 = exclusively private. */
  PKV: PkvValue
  /** Number of care-insurance discounts for multiple children (0–4). */
  PVA: PvaValue
  /** Saxony care-insurance special-rule flag. */
  PVS: PvsValue
  /** Childless care-insurance surcharge flag. */
  PVZ: PvzValue
  /** Employee religious-community code from ELStAM/certificate. 0 = no affiliation. */
  R: number
  /** Taxable wage for the payment period before pension/age/ELStAM adjustments (cents). Must not be negative. */
  RE4: number
  /** Other remuneration including named benefits/death benefits/capital payments (cents). Zero when absent. */
  SONSTB: number
  /** Taxable section 19a benefits included in SONSTB (cents). */
  SONSTENT: number
  /** Death benefit and named capital payments included in SONSTB (cents). */
  STERBE: number
  /** Tax class (1–6). */
  STKL: StklValue
  /** Pension benefits included in RE4 (cents). Must be ≤ RE4. */
  VBEZ: number
  /** Monthly reference amount for pension benefits (cents). Pension-benefit path. */
  VBEZM: number
  /** Expected pension special payments in first benefit year (cents). Pension-benefit path. */
  VBEZS: number
  /** Pension benefits included in SONSTB (cents). */
  VBS: number
  /** First calendar year of pension benefit. Pension-benefit path. */
  VJAHR?: number
  /** Number of child allowances, one decimal (tax classes I–IV only). */
  ZKF: number
  /** Number of months in which pension benefits were received. Pension-benefit path. */
  ZMVB?: number

  /** Internal: calculation year for tracing. */
  calculationYear: number
}

/**
 * Derived intermediate values for transparency and testing.
 */
export interface PapPrepared {
  /** Annualised recurring gross before allowances (cents). */
  annualRecurringGross: number
  /** Annualised one-off gross (cents). */
  annualOneOffGross: number
  /** Employee expense lump sum applied (cents). */
  employeeExpenseLumpSum: number
  /** Pension expense lump sum applied (cents). */
  pensionExpenseLumpSum: number
  /** Special expense lump sum applied (cents). */
  specialExpenseLumpSum: number
  /** Single-parent relief applied (cents). */
  singleParentRelief: number
  /** Child allowance applied for Soli/church bases (cents). */
  childAllowanceForSoli: number
  /** Pension allowance applied (cents). */
  pensionAllowance: number
  /** Age relief applied (cents). */
  ageRelief: number
  /** Vorsorgepauschale base for recurring pay (cents). */
  vorsorgepauschaleRecurringBase: number
  /** Final RE4 passed to the PAP core (cents). */
  finalRe4: number
  /** Final RE4ENT passed to the PAP core (cents). */
  finalRe4ent: number
  /** Final SONSTB passed to the PAP core (cents). */
  finalSonstb: number
}

/**
 * Prepare the exact BMF 2026 PAP input from the normalized compensation and
 * the user's tax/social profile.
 *
 * @param normalized Output of `normalizeCompensation`.
 * @param tax User tax inputs (validated by NP-CALC-002).
 * @param social User social-insurance inputs (validated by NP-CALC-002).
 * @param calculationYear Must be 2026 for this version.
 * @returns PapInput ready for the PAP core, plus transparent derived values.
 */
export function prepareTaxablePay(
  normalized: NormalizedCompensation,
  tax: WageTaxInput,
  social: SocialInsuranceInput,
  calculationYear: number,
): { input: PapInput; prepared: PapPrepared } {
  if (calculationYear !== 2026) {
    throw new Error(
      `NP-CALC-005 only implements the 2026 BMF plan. Got year ${String(calculationYear)}.`,
    )
  }

  // 1. Annual recurring gross (guaranteed + variable)
  const annualRecurringGross = exactEuroQuotientToCents(
    sumExactEuroQuotients([
      normalized.annual.baseSalary,
      normalized.annual.guaranteedRecurringAdditionalCash,
      normalized.annual.variableRecurringAdditionalCash,
    ]),
    'half_up',
  )

  // 2. Annual one-off gross (guaranteed + variable)
  const annualOneOffGross = exactEuroQuotientToCents(
    sumExactEuroQuotients([
      normalized.annual.guaranteedOneOffGross,
      normalized.annual.variableOneOffGross,
    ]),
    'half_up',
  )

  // 3. Fixed payroll allowances (2026 values from NP-RS-003)
  const EMPLOYEE_EXPENSE_LUMP_SUM = 123_000 // 1,230.00 EUR
  const PENSION_EXPENSE_LUMP_SUM = 10_200 // 102.00 EUR
  const SPECIAL_EXPENSE_LUMP_SUM = 3_600 // 36.00 EUR
  const SINGLE_PARENT_RELIEF_BASE = 426_000 // 4,260.00 EUR
  const CHILD_ALLOWANCE_PER_PARENT = 487_800 // 4,878.00 EUR (KFB unit)
  // const BASIC_ALLOWANCE = 1_234_800 // 12,348.00 EUR (documented but not used directly)

  // 4. Determine applicable allowances by tax class.
  //    Registry IDs are `tax_class_1` … `tax_class_6`; the PAP needs the digit.
  const taxClassMatch = /^tax_class_([1-6])$/.exec(tax.taxClass)
  if (taxClassMatch === null) {
    throw new Error(`Unsupported tax class registry id: ${tax.taxClass}`)
  }
  const taxClassDigit = Number(taxClassMatch[1]) as StklValue
  const isClassVOrVI = taxClassDigit === 5 || taxClassDigit === 6
  const isClassII = taxClassDigit === 2

  const employeeExpenseLumpSum = isClassVOrVI ? 0 : EMPLOYEE_EXPENSE_LUMP_SUM
  const pensionExpenseLumpSum = isClassVOrVI ? 0 : PENSION_EXPENSE_LUMP_SUM
  const specialExpenseLumpSum = SPECIAL_EXPENSE_LUMP_SUM
  const singleParentRelief = isClassII ? SINGLE_PARENT_RELIEF_BASE : 0

  // 5. Child allowance for Soli/church bases (KFB units).
  //    Classes I, II and IV use the single per-parent share; class III uses the
  //    doubled splitting share; classes V and VI receive none (NP-RS-003 §6).
  const zkfValue = parseFloat(tax.childAllowanceFactor)
  const CHILD_ALLOWANCE_DOUBLE_SHARE = 975_600 // 9,756.00 EUR per ZKF unit
  const childAllowanceUnit = isClassVOrVI
    ? 0
    : taxClassDigit === 3
      ? CHILD_ALLOWANCE_DOUBLE_SHARE
      : CHILD_ALLOWANCE_PER_PARENT
  const childAllowanceForSoli = Math.round(zkfValue * childAllowanceUnit)

  // 6. Compute RE4 (taxable recurring wage for the period)
  //    Start from annual recurring gross, subtract allowances, then annualise to period.
  const annualRecurringNetOfAllowances =
    Number(annualRecurringGross) -
    employeeExpenseLumpSum -
    pensionExpenseLumpSum -
    specialExpenseLumpSum -
    singleParentRelief

  // LZZ = 2 (monthly) is our primary v1 path.
  const LZZ = 2
  const RE4 = Math.round(annualRecurringNetOfAllowances / 12)

  // 6b. RE4ENT (taxable section 19a benefits included in RE4) — unsupported in v1
  const RE4ENT = 0

  // 7. Other remuneration (SONSTB) — from one-off payments
  const SONSTB = annualOneOffGross
  const SONSTENT = 0 // unsupported in v1
  const STERBE = 0 // unsupported in v1

  // 8. JRE4 / JRE4ENT / JVBEZ — unsupported pension path in v1
  const JRE4 = 0
  const JRE4ENT = 0
  const JVBEZ = 0

  // 9. VBEZ / VBS — pension-path subsets stay zero; VJAHR and ZMVB
  //    apply only to the pension-benefit path, which is unsupported in v1.
  const VBEZ = 0
  const VBEZM = 0
  const VBEZS = 0
  const VBS = 0

  // 10. ZKF (child allowances, one decimal)
  const ZKF = zkfValue

  // 11. LZZFREIB / LZZHINZU — ELStAM values (unsupported in v1)
  const LZZFREIB = 0
  const LZZHINZU = 0

  // 12. JFREIB / JHINZU — other remuneration allowances (unsupported)
  const JFREIB = 0
  const JHINZU = 0

  // 13. MBV — non-taxed section 19a benefit (unsupported, zeroed inline below)

  // 13b. ALTER1 — age relief flag (unsupported cohort in v1)
  const ALTER1: Alter1Value = 0
  // AJAHR is omitted: it applies only when ALTER1 = 1 (age-relief path unsupported in v1)

  // 14. ALV — unemployment status for Vorsorgepauschale
  const ALV: AlvValue = social.unemploymentStatus === 'compulsory' ? 0 : 1

  // 15. KRV — pension status for Vorsorgepauschale
  const KRV: krvValue = social.pensionStatus === 'compulsory' ? 0 : 1

  // 16. PKV / PKPV / PKPVAGZ — private health path
  const healthType = social.health.healthInsuranceType
  const PKV: PkvValue = healthType === 'private' ? 1 : 0
  const PKPV =
    healthType === 'private'
      ? precisionEuroAmountToCents(
          social.health.totalHealthPremiumMonthly,
          'half_up',
        ) +
        precisionEuroAmountToCents(
          social.health.totalCarePremiumMonthly,
          'half_up',
        )
      : 0
  const PKPVAGZ = 0 // employer subsidy handled separately in NP-CALC-010

  // 17. Care insurance flags
  const PVZ: PvzValue = social.careInsuranceChildStatus === 'childless' ? 1 : 0
  const PVA: PvaValue = Math.min(
    social.childrenUnderRelevantAge === 'unknown'
      ? 0
      : social.childrenUnderRelevantAge,
    4,
  ) as PvaValue
  const PVS: PvsValue =
    (social as SocialInsuranceInput & { careInsuranceEmploymentState?: string })
      .careInsuranceEmploymentState === 'DE-SN'
      ? 1
      : 0

  // 18. KVZ — additional GKV rate (full rate, two decimals)
  const KVZ = (() => {
    if (healthType === 'statutory') {
      const mode = social.health.additionalRateMode
      if (mode === 'insurer_specific') {
        return parseFloat(social.health.additionalContributionRate.value) * 100 // stored as basis points in PAP
      }
      // published average: 2.9% -> 290 basis points
      return 290
    }
    return 0
  })()

  // 18b. Factor method — unsupported in v1, so AF and F stay absent
  // 19. R — religious community code (ELStAM)
  const R = tax.churchTaxStatus === 'liable' ? 1 : 0 // simplified mapping

  // Build the PapInput
  const input: PapInput = {
    ALTER1,
    ALV,
    JFREIB,
    JHINZU,
    JRE4,
    JRE4ENT,
    JVBEZ,
    KRV,
    KVZ,
    LZZ,
    LZZFREIB,
    LZZHINZU,
    MBV: 0,
    PKPV: Number(PKPV),
    PKPVAGZ,
    PKV,
    PVA,
    PVS,
    PVZ,
    R,
    RE4,
    SONSTB: Number(SONSTB),
    SONSTENT,
    STERBE,
    STKL: taxClassDigit,
    VBEZ,
    VBEZM,
    VBEZS,
    VBS,
    ZKF,
    calculationYear,
  }

  // Prepared derived values for transparency
  const prepared: PapPrepared = {
    annualRecurringGross: Number(annualRecurringGross),
    annualOneOffGross: Number(annualOneOffGross),
    employeeExpenseLumpSum,
    pensionExpenseLumpSum,
    specialExpenseLumpSum,
    singleParentRelief,
    childAllowanceForSoli,
    pensionAllowance: 0, // unsupported cohort in v1
    ageRelief: 0, // unsupported cohort in v1
    vorsorgepauschaleRecurringBase: RE4,
    finalRe4: RE4,
    finalRe4ent: RE4ENT,
    finalSonstb: Number(SONSTB),
  }

  return { input, prepared }
}

/**
 * Convenience: build a complete PapInput from the high-level scenario input
 * (after it has passed NP-CALC-002 validation). Accepts plain strings for the
 * branded domain fields because validation has already run.
 */
export interface BuildPapInputScenario {
  compensation: {
    baseSalary: {
      period: 'monthly' | 'annual'
      grossAmount: { amount: string; currency: 'EUR' }
    }
    regularAdditionalCash:
      | { kind: 'none' }
      | {
          kind: 'included'
          amount: { amount: string; currency: 'EUR' }
          period: 'monthly' | 'annual'
          guarantee: 'guaranteed' | 'variable'
        }
    oneOffPayments: {
      amount: { amount: string; currency: 'EUR' }
      paymentMonth: number
      classification: string
      guarantee: 'guaranteed' | 'variable'
    }[]
  }
  tax: WageTaxInput
  social: SocialInsuranceInput
  calculationYear: number
}

export function buildPapInput(scenario: BuildPapInputScenario): {
  input: PapInput
  prepared: PapPrepared
} {
  const regular = scenario.compensation.regularAdditionalCash
  const normalized = normalizeCompensation({
    baseSalary: {
      period: scenario.compensation.baseSalary.period,
      grossAmount: scenario.compensation.baseSalary.grossAmount as EuroAmount,
      paymentsPerYear: 12,
    },
    regularAdditionalCash:
      regular.kind === 'none'
        ? {
            kind: 'none',
            amount: { amount: '0.00', currency: 'EUR' } as EuroAmount,
          }
        : {
            kind: 'included',
            amount: regular.amount as EuroAmount,
            period: regular.period,
            guarantee: regular.guarantee,
          },
    oneOffPayments: scenario.compensation.oneOffPayments.map((p) => ({
      amount: p.amount as EuroAmount,
      paymentMonth: p.paymentMonth as OneOffPayment['paymentMonth'],
      classification: p.classification as RegistryOptionId,
      guarantee: p.guarantee,
    })),
  })

  return prepareTaxablePay(
    normalized,
    scenario.tax,
    scenario.social,
    scenario.calculationYear,
  )
}
