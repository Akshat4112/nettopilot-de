import type { ExactEuroQuotient, NormalizedCompensation } from './frequency'

export type PensionCoverageStatus =
  | 'general_statutory_mandatory'
  | 'statutory_exempt'
  | 'professional_scheme'
  | 'miners_scheme'
  | 'minijob'
  | 'transition_range'
  | 'unknown'

export interface PensionContributionInput {
  readonly liablePayCents: number
  readonly contributionDays: number
  readonly coverageStatus: PensionCoverageStatus
  readonly calculationYear: number
  readonly exemptionValidated?: boolean
  readonly includesOneOffPay?: boolean
}

export type PensionUnavailableReason =
  | 'unknown_coverage_status'
  | 'exemption_not_validated'
  | 'professional_scheme_requires_scheme_amount'
  | 'miners_scheme_unsupported'
  | 'minijob_unsupported'
  | 'transition_range_unsupported'
  | 'one_off_allocation_required'

export interface PensionContributionAmount {
  readonly employeeCents: number
  readonly employerCents: number
  readonly totalCents: number
}

export interface PensionContributionResult {
  readonly state: 'calculated'
  readonly calculationYear: 2026
  readonly assumptionSetId: 'de-pension-insurance-2026-v1'
  readonly sourceIds: readonly [
    'DE-SVBEZGRV-2026-4',
    'DE-DRV-SV-VALUES-2026',
    'DE-BVV-1-2',
  ]
  readonly coverageStatus: 'general_statutory_mandatory' | 'statutory_exempt'
  readonly contributionDays: number
  readonly liablePayCents: number
  readonly monthlyCeilingCents: 845_000
  readonly appliedCeilingCents: number
  readonly contributionBaseCents: number
  readonly ceilingReached: boolean
  readonly employeeRate: '0.093'
  readonly employerRate: '0.093'
  readonly contribution: PensionContributionAmount
}

export interface PensionUnavailableResult {
  readonly state: 'unsupported' | 'incomplete'
  readonly calculationYear: 2026
  readonly assumptionSetId: 'de-pension-insurance-2026-v1'
  readonly coverageStatus: PensionCoverageStatus
  readonly reason: PensionUnavailableReason
}

export type PensionResult = PensionContributionResult | PensionUnavailableResult

export interface AnnualPensionContributionResult {
  readonly state: 'calculated'
  readonly calculationYear: 2026
  readonly assumptionSetId: 'de-pension-insurance-2026-v1'
  readonly months: readonly PensionContributionResult[]
  readonly contributionBaseCents: number
  readonly contribution: PensionContributionAmount
  readonly ceilingReachedInMonths: readonly number[]
}

const MONTHLY_CEILING_CENTS = 845_000n
const CONTRIBUTION_MONTH_DAYS = 30n
const RATE_NUMERATOR = 93n
const RATE_DENOMINATOR = 1_000n

const assertSafeNonNegativeInteger = (value: number, name: string): bigint => {
  if (!Number.isSafeInteger(value) || value < 0)
    throw new RangeError(`${name} must be a non-negative safe integer`)
  return BigInt(value)
}

const toSafeNumber = (value: bigint): number => {
  const number = Number(value)
  if (!Number.isSafeInteger(number))
    throw new RangeError('Pension result exceeds the safe integer range')
  return number
}

/** Exact half-up division for non-negative monetary values. */
const divideHalfUp = (numerator: bigint, denominator: bigint): bigint => {
  if (denominator <= 0n) throw new RangeError('Denominator must be positive')
  const quotient = numerator / denominator
  const remainder = numerator % denominator
  return remainder * 2n >= denominator ? quotient + 1n : quotient
}

const unavailable = (
  input: PensionContributionInput,
  state: PensionUnavailableResult['state'],
  reason: PensionUnavailableReason,
): PensionUnavailableResult => ({
  state,
  calculationYear: 2026,
  assumptionSetId: 'de-pension-insurance-2026-v1',
  coverageStatus: input.coverageStatus,
  reason,
})

const contributionResult = (
  input: PensionContributionInput,
  baseCentsNumerator: bigint,
  appliedCeilingCents: bigint,
  baseCentsDenominator = 1n,
  ceilingReached = BigInt(input.liablePayCents) > appliedCeilingCents,
): PensionContributionResult => {
  const share = divideHalfUp(
    baseCentsNumerator * RATE_NUMERATOR,
    baseCentsDenominator * RATE_DENOMINATOR,
  )
  const employeeCents = toSafeNumber(share)
  const employerCents = employeeCents

  return {
    state: 'calculated',
    calculationYear: 2026,
    assumptionSetId: 'de-pension-insurance-2026-v1',
    sourceIds: ['DE-SVBEZGRV-2026-4', 'DE-DRV-SV-VALUES-2026', 'DE-BVV-1-2'],
    coverageStatus: input.coverageStatus as
      'general_statutory_mandatory' | 'statutory_exempt',
    contributionDays: input.contributionDays,
    liablePayCents: input.liablePayCents,
    monthlyCeilingCents: 845_000,
    appliedCeilingCents: toSafeNumber(appliedCeilingCents),
    contributionBaseCents: toSafeNumber(
      divideHalfUp(baseCentsNumerator, baseCentsDenominator),
    ),
    ceilingReached,
    employeeRate: '0.093',
    employerRate: '0.093',
    contribution: {
      employeeCents,
      employerCents,
      totalCents: employeeCents + employerCents,
    },
  }
}

/**
 * Calculate an ordinary 2026 German statutory pension contribution.
 *
 * Pay and outputs are integer euro cents. Partial-month ceilings and the 9.3%
 * shares are rounded half up only at their documented legal boundaries.
 */
export const calculatePensionContribution2026 = (
  input: PensionContributionInput,
): PensionResult => {
  if (input.calculationYear !== 2026)
    throw new RangeError('Only 2026 pension assumptions are implemented')

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

  if (input.includesOneOffPay === true)
    return unavailable(input, 'incomplete', 'one_off_allocation_required')

  switch (input.coverageStatus) {
    case 'unknown':
      return unavailable(input, 'incomplete', 'unknown_coverage_status')
    case 'professional_scheme':
      return unavailable(
        input,
        'incomplete',
        'professional_scheme_requires_scheme_amount',
      )
    case 'miners_scheme':
      return unavailable(input, 'unsupported', 'miners_scheme_unsupported')
    case 'minijob':
      return unavailable(input, 'unsupported', 'minijob_unsupported')
    case 'transition_range':
      return unavailable(input, 'unsupported', 'transition_range_unsupported')
    case 'statutory_exempt':
      if (input.exemptionValidated !== true)
        return unavailable(input, 'incomplete', 'exemption_not_validated')
      return contributionResult(input, 0n, 0n, 1n, false)
    case 'general_statutory_mandatory': {
      const exactCeilingNumerator =
        MONTHLY_CEILING_CENTS * BigInt(input.contributionDays)
      const liablePayNumerator = liablePay * CONTRIBUTION_MONTH_DAYS
      const ceilingReached = liablePayNumerator > exactCeilingNumerator
      const baseNumerator = ceilingReached
        ? exactCeilingNumerator
        : liablePayNumerator
      const reportedCeiling = divideHalfUp(
        exactCeilingNumerator,
        CONTRIBUTION_MONTH_DAYS,
      )
      return contributionResult(
        input,
        baseNumerator,
        reportedCeiling,
        CONTRIBUTION_MONTH_DAYS,
        ceilingReached,
      )
    }
  }
}

export const calculateAnnualPensionContribution2026 = (
  monthlyLiablePayCents: readonly number[],
): AnnualPensionContributionResult => {
  if (monthlyLiablePayCents.length !== 12)
    throw new RangeError(
      'Annual pension calculation requires exactly 12 months',
    )

  const months = monthlyLiablePayCents.map((liablePayCents) => {
    const result = calculatePensionContribution2026({
      liablePayCents,
      contributionDays: 30,
      coverageStatus: 'general_statutory_mandatory',
      calculationYear: 2026,
    })
    if (result.state !== 'calculated')
      throw new Error('Ordinary annual pension month was not calculated')
    return result
  })

  return aggregateAnnualResult(months)
}

const aggregateAnnualResult = (
  months: readonly PensionContributionResult[],
): AnnualPensionContributionResult => ({
  state: 'calculated',
  calculationYear: 2026,
  assumptionSetId: 'de-pension-insurance-2026-v1',
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
  ceilingReachedInMonths: months
    .map((month, index) => (month.ceilingReached ? index + 1 : 0))
    .filter((month) => month !== 0),
})

const powerOfTen = (exponent: number): bigint => 10n ** BigInt(exponent)

const calculateExactMonthlyPensionContribution = (
  pay: ExactEuroQuotient,
): PensionContributionResult => {
  if (pay.dividend.coefficient < 0n)
    throw new RangeError('Normalized pension-liable pay must be non-negative')

  const payCentsNumerator = pay.dividend.coefficient * 100n
  const payCentsDenominator =
    powerOfTen(pay.dividend.scale) * BigInt(pay.divisor)
  const ceilingNumerator = MONTHLY_CEILING_CENTS * payCentsDenominator
  const ceilingReached = payCentsNumerator > ceilingNumerator
  const baseNumerator = ceilingReached ? ceilingNumerator : payCentsNumerator

  return contributionResult(
    {
      liablePayCents: toSafeNumber(
        divideHalfUp(payCentsNumerator, payCentsDenominator),
      ),
      contributionDays: 30,
      coverageStatus: 'general_statutory_mandatory',
      calculationYear: 2026,
    },
    baseNumerator,
    MONTHLY_CEILING_CENTS,
    payCentsDenominator,
    ceilingReached,
  )
}

export const calculatePensionFromNormalizedCompensation2026 = (
  compensation: NormalizedCompensation,
  coverageStatus: PensionCoverageStatus,
): AnnualPensionContributionResult | PensionUnavailableResult => {
  const hasOneOff = compensation.months.some(
    (month) =>
      month.guaranteedOneOffPayments.length > 0 ||
      month.variableOneOffPayments.length > 0,
  )
  if (hasOneOff)
    return unavailable(
      {
        liablePayCents: 0,
        contributionDays: 30,
        coverageStatus,
        calculationYear: 2026,
      },
      'incomplete',
      'one_off_allocation_required',
    )

  if (coverageStatus !== 'general_statutory_mandatory')
    return calculatePensionContribution2026({
      liablePayCents: 0,
      contributionDays: 30,
      coverageStatus,
      calculationYear: 2026,
    }) as PensionUnavailableResult

  const months = compensation.months.map((month) =>
    calculateExactMonthlyPensionContribution(month.totalRecurringGross),
  )
  return aggregateAnnualResult(months)
}
