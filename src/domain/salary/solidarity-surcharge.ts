export type SolidaritySurchargePaymentPeriod =
  'annual' | 'monthly' | 'weekly' | 'daily'

export type SolidaritySurchargeZone = 'zero' | 'taper' | 'full_rate'

export interface SolidaritySurchargeInput {
  /** Annual child-adjusted BMF assessment base (JBMG), in integer cents. */
  readonly annualAssessmentBaseCents: number
  /** BMF KZTAB: 2 for the splitting path, otherwise 1. */
  readonly tariffMultiplier: 1 | 2
  readonly paymentPeriod: SolidaritySurchargePaymentPeriod
  readonly calculationYear: number
}

export interface SolidaritySurchargeResult {
  readonly state: 'calculated'
  readonly calculationYear: 2026
  readonly assumptionSetId: 'de-solidarity-surcharge-2026-v1'
  readonly sourceIds: readonly [
    'DE-SOLZG-3',
    'DE-SOLZG-4',
    'DE-SOLZG-6',
    'DE-BMF-PAP-2026-A1',
  ]
  readonly zone: SolidaritySurchargeZone
  readonly annualAssessmentBaseCents: number
  readonly annualThresholdCents: number
  readonly tariffMultiplier: 1 | 2
  readonly fullRatePercent: '5.5'
  readonly taperRatePercent: '11.9'
  readonly paymentPeriod: SolidaritySurchargePaymentPeriod
  readonly annualSurchargeCents: number
  readonly surchargeCents: number
}

export interface OtherRemunerationSolidaritySurchargeInput {
  /** Annual child-adjusted assessment base after the payment, in cents. */
  readonly annualAssessmentBaseAfterPaymentCents: number
  readonly wageTaxOnOtherRemunerationCents: number
  readonly tariffMultiplier: 1 | 2
  readonly calculationYear: number
}

export interface OtherRemunerationSolidaritySurchargeResult {
  readonly state: 'calculated'
  readonly calculationYear: 2026
  readonly assumptionSetId: 'de-solidarity-surcharge-2026-v1'
  readonly sourceIds: readonly [
    'DE-SOLZG-3',
    'DE-SOLZG-4',
    'DE-SOLZG-6',
    'DE-BMF-PAP-2026-A1',
  ]
  readonly thresholdPassed: boolean
  readonly annualAssessmentBaseAfterPaymentCents: number
  readonly annualThresholdCents: number
  readonly tariffMultiplier: 1 | 2
  readonly fullRatePercent: '5.5'
  readonly wageTaxOnOtherRemunerationCents: number
  readonly surchargeCents: number
}

const BASIC_THRESHOLD_CENTS = 2_035_000n
const FULL_RATE_NUMERATOR = 55n
const TAPER_RATE_NUMERATOR = 119n
const RATE_DENOMINATOR = 1_000n

const assert2026 = (calculationYear: number): void => {
  if (calculationYear !== 2026)
    throw new RangeError(
      'Only 2026 solidarity-surcharge assumptions are implemented',
    )
}

const toBigInt = (value: number, name: string): bigint => {
  if (!Number.isSafeInteger(value) || value < 0)
    throw new RangeError(name + ' must be a non-negative safe integer')
  return BigInt(value)
}

const toSafeNumber = (value: bigint): number => {
  const result = Number(value)
  if (!Number.isSafeInteger(result))
    throw new RangeError(
      'Solidarity-surcharge result exceeds the safe integer range',
    )
  return result
}

const thresholdFor = (tariffMultiplier: 1 | 2): bigint =>
  BASIC_THRESHOLD_CENTS * BigInt(tariffMultiplier)

const allocateToPeriod = (
  annualCents: bigint,
  period: SolidaritySurchargePaymentPeriod,
): bigint => {
  switch (period) {
    case 'annual':
      return annualCents
    case 'monthly':
      return annualCents / 12n
    case 'weekly':
      return (annualCents * 7n) / 360n
    case 'daily':
      return annualCents / 360n
  }
}

const metadata = {
  calculationYear: 2026,
  assumptionSetId: 'de-solidarity-surcharge-2026-v1',
  sourceIds: ['DE-SOLZG-3', 'DE-SOLZG-4', 'DE-SOLZG-6', 'DE-BMF-PAP-2026-A1'],
} as const

export const calculateSolidaritySurcharge2026 = (
  input: SolidaritySurchargeInput,
): SolidaritySurchargeResult => {
  assert2026(input.calculationYear)
  const assessmentBase = toBigInt(
    input.annualAssessmentBaseCents,
    'annualAssessmentBaseCents',
  )
  const threshold = thresholdFor(input.tariffMultiplier)

  let zone: SolidaritySurchargeZone = 'zero'
  let annualSurcharge = 0n
  if (assessmentBase > threshold) {
    const fullAmount = (assessmentBase * FULL_RATE_NUMERATOR) / RATE_DENOMINATOR
    const taperAmount =
      ((assessmentBase - threshold) * TAPER_RATE_NUMERATOR) / RATE_DENOMINATOR
    if (fullAmount <= taperAmount) {
      zone = 'full_rate'
      annualSurcharge = fullAmount
    } else {
      zone = 'taper'
      annualSurcharge = taperAmount
    }
  }

  return {
    state: 'calculated',
    ...metadata,
    zone,
    annualAssessmentBaseCents: input.annualAssessmentBaseCents,
    annualThresholdCents: toSafeNumber(threshold),
    tariffMultiplier: input.tariffMultiplier,
    fullRatePercent: '5.5',
    taperRatePercent: '11.9',
    paymentPeriod: input.paymentPeriod,
    annualSurchargeCents: toSafeNumber(annualSurcharge),
    surchargeCents: toSafeNumber(
      allocateToPeriod(annualSurcharge, input.paymentPeriod),
    ),
  }
}

export const calculateOtherRemunerationSolidaritySurcharge2026 = (
  input: OtherRemunerationSolidaritySurchargeInput,
): OtherRemunerationSolidaritySurchargeResult => {
  assert2026(input.calculationYear)
  const assessmentBase = toBigInt(
    input.annualAssessmentBaseAfterPaymentCents,
    'annualAssessmentBaseAfterPaymentCents',
  )
  const otherWageTax = toBigInt(
    input.wageTaxOnOtherRemunerationCents,
    'wageTaxOnOtherRemunerationCents',
  )
  const threshold = thresholdFor(input.tariffMultiplier)
  const thresholdPassed = assessmentBase > threshold
  const surcharge = thresholdPassed
    ? (otherWageTax * FULL_RATE_NUMERATOR) / RATE_DENOMINATOR
    : 0n

  return {
    state: 'calculated',
    ...metadata,
    thresholdPassed,
    annualAssessmentBaseAfterPaymentCents:
      input.annualAssessmentBaseAfterPaymentCents,
    annualThresholdCents: toSafeNumber(threshold),
    tariffMultiplier: input.tariffMultiplier,
    fullRatePercent: '5.5',
    wageTaxOnOtherRemunerationCents: input.wageTaxOnOtherRemunerationCents,
    surchargeCents: toSafeNumber(surcharge),
  }
}
