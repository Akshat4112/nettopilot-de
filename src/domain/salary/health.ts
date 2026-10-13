import type { ExactEuroQuotient, NormalizedCompensation } from './frequency'

export type HealthCoverageStatus =
  | 'statutory_mandatory_general'
  | 'statutory_voluntary_employee'
  | 'statutory_reduced_rate'
  | 'private'
  | 'family_insured'
  | 'transition_range'
  | 'minijob'
  | 'student'
  | 'pensioner'
  | 'cross_border'
  | 'unknown'

export type HealthAdditionalRateInput =
  | { readonly mode: 'published_average' }
  | {
      readonly mode: 'insurer_specific'
      readonly ratePercent: string
      readonly effectiveMonth?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
    }

export interface HealthContributionInput {
  readonly liablePayCents: number
  readonly contributionDays: number
  readonly coverageStatus: HealthCoverageStatus
  readonly additionalRate: HealthAdditionalRateInput
  readonly calculationYear: number
  readonly voluntaryOtherIncomeStatus?: 'none' | 'unknown_or_present'
  readonly includesOneOffPay?: boolean
}

export type HealthUnavailableReason =
  | 'unknown_coverage_status'
  | 'reduced_rate_unsupported'
  | 'private_insurance_separate_path'
  | 'family_insurance_unsupported'
  | 'transition_range_unsupported'
  | 'minijob_unsupported'
  | 'student_unsupported'
  | 'pensioner_unsupported'
  | 'cross_border_unsupported'
  | 'voluntary_other_income_unknown'
  | 'one_off_allocation_required'

export interface HealthContributionAmount {
  readonly employeeCents: number
  readonly employerCents: number
  readonly totalCents: number
}

export interface HealthContributionResult {
  readonly state: 'calculated'
  readonly calculationYear: 2026
  readonly assumptionSetId: 'de-statutory-health-insurance-2026-v1'
  readonly sourceIds: readonly [
    'DE-SGBV-241',
    'DE-SGBV-242',
    'DE-SGBV-249',
    'DE-SGBV-226',
    'DE-BMAS-SV-VALUES-2026',
    'DE-BVV-1-2',
  ]
  readonly coverageStatus:
    'statutory_mandatory_general' | 'statutory_voluntary_employee'
  readonly resultQuality: 'insurer_exact' | 'published_average_estimate'
  readonly contributionDays: number
  readonly liablePayCents: number
  readonly monthlyCeilingCents: 581_250
  readonly annualCeilingCents: 6_975_000
  readonly appliedCeilingCents: number
  readonly contributionBaseCents: number
  readonly ceilingReached: boolean
  readonly generalRatePercent: '14.6'
  readonly additionalRateMode: HealthAdditionalRateInput['mode']
  readonly additionalRatePercent: string
  readonly combinedRatePercent: string
  readonly employeeRatePercent: string
  readonly employerRatePercent: string
  readonly contribution: HealthContributionAmount
  readonly memberTotalCents: number
  readonly employerSubsidyCents: number
  readonly estimateWarning: boolean
}

export interface HealthUnavailableResult {
  readonly state: 'unsupported' | 'incomplete'
  readonly calculationYear: 2026
  readonly assumptionSetId: 'de-statutory-health-insurance-2026-v1'
  readonly coverageStatus: HealthCoverageStatus
  readonly reason: HealthUnavailableReason
}

export type HealthResult = HealthContributionResult | HealthUnavailableResult

export interface AnnualHealthContributionResult {
  readonly state: 'calculated'
  readonly calculationYear: 2026
  readonly assumptionSetId: 'de-statutory-health-insurance-2026-v1'
  readonly months: readonly HealthContributionResult[]
  readonly contributionBaseCents: number
  readonly contribution: HealthContributionAmount
  readonly memberTotalCents: number
  readonly ceilingReachedInMonths: readonly number[]
  readonly estimateMonths: readonly number[]
}

interface DecimalParts {
  readonly coefficient: bigint
  readonly scale: number
  readonly canonical: string
}

const MONTHLY_CEILING_CENTS = 581_250n
const CONTRIBUTION_MONTH_DAYS = 30n
const PUBLISHED_AVERAGE_RATE = '2.9'
const decimalPattern = /^(0|[1-9]\d*)(?:\.(\d+))?$/

const parseNonNegativeDecimal = (value: string, name: string): DecimalParts => {
  const match = decimalPattern.exec(value)
  if (match === null)
    throw new TypeError(name + ' must be a non-negative decimal')
  const whole = match[1] ?? '0'
  const fraction = match[2] ?? ''
  const raw = whole + fraction
  const coefficient = BigInt(raw)
  const canonicalFraction = fraction.replace(/0+$/, '')
  return {
    coefficient,
    scale: fraction.length,
    canonical:
      canonicalFraction.length === 0 ? whole : whole + '.' + canonicalFraction,
  }
}

const powerOfTen = (exponent: number): bigint => 10n ** BigInt(exponent)

const divideHalfUp = (numerator: bigint, denominator: bigint): bigint => {
  if (denominator <= 0n) throw new RangeError('Denominator must be positive')
  const quotient = numerator / denominator
  const remainder = numerator % denominator
  return remainder * 2n >= denominator ? quotient + 1n : quotient
}

const toSafeNumber = (value: bigint): number => {
  const result = Number(value)
  if (!Number.isSafeInteger(result))
    throw new RangeError(
      'Health-insurance result exceeds the safe integer range',
    )
  return result
}

const assertSafeNonNegativeInteger = (value: number, name: string): bigint => {
  if (!Number.isSafeInteger(value) || value < 0)
    throw new RangeError(name + ' must be a non-negative safe integer')
  return BigInt(value)
}

const formatDecimal = (coefficient: bigint, scale: number): string => {
  if (scale === 0) return coefficient.toString()
  const digits = coefficient.toString().padStart(scale + 1, '0')
  const value = digits.slice(0, -scale) + '.' + digits.slice(-scale)
  return value.replace(/\.0+$/, '').replace(/(\.\d*?)0+$/, '$1')
}

const resolveRates = (input: HealthAdditionalRateInput) => {
  const additional = parseNonNegativeDecimal(
    input.mode === 'published_average'
      ? PUBLISHED_AVERAGE_RATE
      : input.ratePercent,
    'additional health-insurance rate',
  )
  const scale = Math.max(1, additional.scale)
  const generalCoefficient = 146n * powerOfTen(scale - 1)
  const additionalCoefficient =
    additional.coefficient * powerOfTen(scale - additional.scale)
  const combinedCoefficient = generalCoefficient + additionalCoefficient
  const halfRateIsExactAtCurrentScale = combinedCoefficient % 2n === 0n
  const halfRateCoefficient = halfRateIsExactAtCurrentScale
    ? combinedCoefficient / 2n
    : combinedCoefficient * 5n
  const halfRateScale = halfRateIsExactAtCurrentScale ? scale : scale + 1
  return {
    additionalRatePercent: additional.canonical,
    combinedRatePercent: formatDecimal(combinedCoefficient, scale),
    halfRatePercent: formatDecimal(halfRateCoefficient, halfRateScale),
    combinedCoefficient,
    percentScale: scale,
  }
}

const unavailable = (
  input: HealthContributionInput,
  state: HealthUnavailableResult['state'],
  reason: HealthUnavailableReason,
): HealthUnavailableResult => ({
  state,
  calculationYear: 2026,
  assumptionSetId: 'de-statutory-health-insurance-2026-v1',
  coverageStatus: input.coverageStatus,
  reason,
})

const contributionResult = (
  input: HealthContributionInput,
  baseNumerator: bigint,
  baseDenominator: bigint,
  appliedCeilingCents: bigint,
  ceilingReached: boolean,
): HealthContributionResult => {
  const rates = resolveRates(input.additionalRate)
  const rateScale = powerOfTen(rates.percentScale)
  const halfContribution = divideHalfUp(
    baseNumerator * rates.combinedCoefficient,
    baseDenominator * 200n * rateScale,
  )
  const fullContribution = divideHalfUp(
    baseNumerator * rates.combinedCoefficient,
    baseDenominator * 100n * rateScale,
  )
  const mandatory = input.coverageStatus === 'statutory_mandatory_general'
  const employer = halfContribution
  const employee = mandatory ? halfContribution : fullContribution - employer
  const total = mandatory ? halfContribution * 2n : fullContribution

  return {
    state: 'calculated',
    calculationYear: 2026,
    assumptionSetId: 'de-statutory-health-insurance-2026-v1',
    sourceIds: [
      'DE-SGBV-241',
      'DE-SGBV-242',
      'DE-SGBV-249',
      'DE-SGBV-226',
      'DE-BMAS-SV-VALUES-2026',
      'DE-BVV-1-2',
    ],
    coverageStatus: input.coverageStatus as
      'statutory_mandatory_general' | 'statutory_voluntary_employee',
    resultQuality:
      input.additionalRate.mode === 'insurer_specific'
        ? 'insurer_exact'
        : 'published_average_estimate',
    contributionDays: input.contributionDays,
    liablePayCents: input.liablePayCents,
    monthlyCeilingCents: 581_250,
    annualCeilingCents: 6_975_000,
    appliedCeilingCents: toSafeNumber(appliedCeilingCents),
    contributionBaseCents: toSafeNumber(
      divideHalfUp(baseNumerator, baseDenominator),
    ),
    ceilingReached,
    generalRatePercent: '14.6',
    additionalRateMode: input.additionalRate.mode,
    additionalRatePercent: rates.additionalRatePercent,
    combinedRatePercent: rates.combinedRatePercent,
    employeeRatePercent: rates.halfRatePercent,
    employerRatePercent: rates.halfRatePercent,
    contribution: {
      employeeCents: toSafeNumber(employee),
      employerCents: toSafeNumber(employer),
      totalCents: toSafeNumber(total),
    },
    memberTotalCents: toSafeNumber(total),
    employerSubsidyCents: toSafeNumber(employer),
    estimateWarning: input.additionalRate.mode === 'published_average',
  }
}

export const calculateStatutoryHealthContribution2026 = (
  input: HealthContributionInput,
): HealthResult => {
  if (input.calculationYear !== 2026)
    throw new RangeError(
      'Only 2026 statutory health assumptions are implemented',
    )

  const liablePay = assertSafeNonNegativeInteger(
    input.liablePayCents,
    'liablePayCents',
  )
  if (
    !Number.isSafeInteger(input.contributionDays) ||
    input.contributionDays < 1 ||
    input.contributionDays > 30
  )
    throw new RangeError(
      'contributionDays must be an integer from 1 through 30',
    )

  resolveRates(input.additionalRate)

  if (input.includesOneOffPay === true)
    return unavailable(input, 'incomplete', 'one_off_allocation_required')

  switch (input.coverageStatus) {
    case 'unknown':
      return unavailable(input, 'incomplete', 'unknown_coverage_status')
    case 'statutory_reduced_rate':
      return unavailable(input, 'unsupported', 'reduced_rate_unsupported')
    case 'private':
      return unavailable(
        input,
        'unsupported',
        'private_insurance_separate_path',
      )
    case 'family_insured':
      return unavailable(input, 'unsupported', 'family_insurance_unsupported')
    case 'transition_range':
      return unavailable(input, 'unsupported', 'transition_range_unsupported')
    case 'minijob':
      return unavailable(input, 'unsupported', 'minijob_unsupported')
    case 'student':
      return unavailable(input, 'unsupported', 'student_unsupported')
    case 'pensioner':
      return unavailable(input, 'unsupported', 'pensioner_unsupported')
    case 'cross_border':
      return unavailable(input, 'unsupported', 'cross_border_unsupported')
    case 'statutory_voluntary_employee':
      if (
        liablePay * CONTRIBUTION_MONTH_DAYS <
          MONTHLY_CEILING_CENTS * BigInt(input.contributionDays) &&
        input.voluntaryOtherIncomeStatus !== 'none'
      )
        return unavailable(
          input,
          'incomplete',
          'voluntary_other_income_unknown',
        )
      break
    case 'statutory_mandatory_general':
      break
  }

  const ceilingNumerator =
    MONTHLY_CEILING_CENTS * BigInt(input.contributionDays)
  const liableNumerator = liablePay * CONTRIBUTION_MONTH_DAYS
  const ceilingReached = liableNumerator > ceilingNumerator
  const baseNumerator = ceilingReached ? ceilingNumerator : liableNumerator
  const reportedCeiling = divideHalfUp(
    ceilingNumerator,
    CONTRIBUTION_MONTH_DAYS,
  )
  return contributionResult(
    input,
    baseNumerator,
    CONTRIBUTION_MONTH_DAYS,
    reportedCeiling,
    ceilingReached,
  )
}

const aggregateAnnualResult = (
  months: readonly HealthContributionResult[],
): AnnualHealthContributionResult => ({
  state: 'calculated',
  calculationYear: 2026,
  assumptionSetId: 'de-statutory-health-insurance-2026-v1',
  months,
  contributionBaseCents: months.reduce(
    (sum, month) => sum + month.contributionBaseCents,
    0,
  ),
  contribution: {
    employeeCents: months.reduce(
      (sum, month) => sum + month.contribution.employeeCents,
      0,
    ),
    employerCents: months.reduce(
      (sum, month) => sum + month.contribution.employerCents,
      0,
    ),
    totalCents: months.reduce(
      (sum, month) => sum + month.contribution.totalCents,
      0,
    ),
  },
  memberTotalCents: months.reduce(
    (sum, month) => sum + month.memberTotalCents,
    0,
  ),
  ceilingReachedInMonths: months
    .map((month, index) => (month.ceilingReached ? index + 1 : 0))
    .filter((month) => month !== 0),
  estimateMonths: months
    .map((month, index) => (month.estimateWarning ? index + 1 : 0))
    .filter((month) => month !== 0),
})

export const calculateAnnualStatutoryHealthContribution2026 = (
  monthlyLiablePayCents: readonly number[],
  monthlyRateInputs: readonly HealthAdditionalRateInput[],
  coverageStatus:
    'statutory_mandatory_general' | 'statutory_voluntary_employee',
  voluntaryOtherIncomeStatus:
    'none' | 'unknown_or_present' = 'unknown_or_present',
): AnnualHealthContributionResult => {
  if (monthlyLiablePayCents.length !== 12 || monthlyRateInputs.length !== 12)
    throw new RangeError(
      'Annual health calculation requires exactly 12 months and rates',
    )

  const months = monthlyLiablePayCents.map((liablePayCents, index) => {
    const additionalRate = monthlyRateInputs[index]
    if (additionalRate === undefined)
      throw new Error('Missing monthly health rate')
    const result = calculateStatutoryHealthContribution2026({
      liablePayCents,
      contributionDays: 30,
      coverageStatus,
      additionalRate,
      calculationYear: 2026,
      voluntaryOtherIncomeStatus,
    })
    if (result.state !== 'calculated')
      throw new Error(
        'Annual health month is incomplete or unsupported: ' + result.reason,
      )
    return result
  })
  return aggregateAnnualResult(months)
}

const exactMonthlyContribution = (
  pay: ExactEuroQuotient,
  coverageStatus:
    'statutory_mandatory_general' | 'statutory_voluntary_employee',
  additionalRate: HealthAdditionalRateInput,
  voluntaryOtherIncomeStatus: 'none' | 'unknown_or_present',
): HealthContributionResult => {
  if (pay.dividend.coefficient < 0n)
    throw new RangeError('Normalized health-liable pay must be non-negative')

  const payNumerator = pay.dividend.coefficient * 100n
  const payDenominator = powerOfTen(pay.dividend.scale) * BigInt(pay.divisor)
  const ceilingNumerator = MONTHLY_CEILING_CENTS * payDenominator
  const ceilingReached = payNumerator > ceilingNumerator
  if (
    coverageStatus === 'statutory_voluntary_employee' &&
    !ceilingReached &&
    voluntaryOtherIncomeStatus !== 'none'
  )
    throw new RangeError(
      'Voluntary health calculation requires other-income status',
    )

  return contributionResult(
    {
      liablePayCents: toSafeNumber(divideHalfUp(payNumerator, payDenominator)),
      contributionDays: 30,
      coverageStatus,
      additionalRate,
      calculationYear: 2026,
      voluntaryOtherIncomeStatus,
    },
    ceilingReached ? ceilingNumerator : payNumerator,
    payDenominator,
    MONTHLY_CEILING_CENTS,
    ceilingReached,
  )
}

export const calculateHealthFromNormalizedCompensation2026 = (
  compensation: NormalizedCompensation,
  monthlyRateInputs: readonly HealthAdditionalRateInput[],
  coverageStatus:
    'statutory_mandatory_general' | 'statutory_voluntary_employee',
  voluntaryOtherIncomeStatus:
    'none' | 'unknown_or_present' = 'unknown_or_present',
): AnnualHealthContributionResult | HealthUnavailableResult => {
  if (monthlyRateInputs.length !== 12)
    throw new RangeError(
      'Normalized health calculation requires exactly 12 monthly rates',
    )

  if (
    compensation.months.some(
      (month) =>
        month.guaranteedOneOffPayments.length > 0 ||
        month.variableOneOffPayments.length > 0,
    )
  )
    return unavailable(
      {
        liablePayCents: 0,
        contributionDays: 30,
        coverageStatus,
        additionalRate: monthlyRateInputs[0] ?? { mode: 'published_average' },
        calculationYear: 2026,
      },
      'incomplete',
      'one_off_allocation_required',
    )

  if (
    coverageStatus === 'statutory_voluntary_employee' &&
    voluntaryOtherIncomeStatus !== 'none'
  ) {
    const belowCeiling = compensation.months.some((month) => {
      const payNumerator = month.totalRecurringGross.dividend.coefficient * 100n
      const payDenominator =
        powerOfTen(month.totalRecurringGross.dividend.scale) *
        BigInt(month.totalRecurringGross.divisor)
      return payNumerator < MONTHLY_CEILING_CENTS * payDenominator
    })
    if (belowCeiling)
      return unavailable(
        {
          liablePayCents: 0,
          contributionDays: 30,
          coverageStatus,
          additionalRate: monthlyRateInputs[0] ?? { mode: 'published_average' },
          calculationYear: 2026,
        },
        'incomplete',
        'voluntary_other_income_unknown',
      )
  }

  const months = compensation.months.map((month, index) => {
    const additionalRate = monthlyRateInputs[index]
    if (additionalRate === undefined)
      throw new Error('Missing monthly health rate')
    return exactMonthlyContribution(
      month.totalRecurringGross,
      coverageStatus,
      additionalRate,
      voluntaryOtherIncomeStatus,
    )
  })
  return aggregateAnnualResult(months)
}
