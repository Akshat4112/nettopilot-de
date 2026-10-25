import {
  exactEuroQuotientToCents,
  type ExactEuroQuotient,
  type NormalizedCompensation,
} from './frequency'

export type UnemploymentCoverageStatus =
  | 'mandatory_standard'
  | 'exempt_validated'
  | 'standard_retirement_age_employer_only'
  | 'transition_range'
  | 'minijob'
  | 'trainee_special'
  | 'voluntary_self_insurance'
  | 'cross_border'
  | 'unknown'

export interface UnemploymentContributionInput {
  readonly liablePayCents: number
  readonly contributionDays: number
  readonly coverageStatus: UnemploymentCoverageStatus
  readonly calculationYear: number
  readonly exemptionEvidenceValidated?: boolean
  readonly includesOneOffPay?: boolean
}

export type UnemploymentUnavailableReason =
  | 'unknown_coverage_status'
  | 'exemption_evidence_required'
  | 'retirement_age_employer_only_unsupported'
  | 'transition_range_unsupported'
  | 'minijob_unsupported'
  | 'trainee_special_unsupported'
  | 'voluntary_self_insurance_unsupported'
  | 'cross_border_unsupported'
  | 'one_off_allocation_required'

export interface UnemploymentContributionAmount {
  readonly employeeCents: number
  readonly employerCents: number
  readonly totalCents: number
}

export interface UnemploymentContributionResult {
  readonly state: 'calculated'
  readonly calculationYear: 2026
  readonly assumptionSetId: 'de-unemployment-insurance-2026-v1'
  readonly sourceIds: readonly [
    'DE-SGBIII-341',
    'DE-SGBIII-342',
    'DE-SGBIII-346',
    'DE-SVBEZGRV-2026-4',
    'DE-BVV-1-2',
  ]
  readonly coverageStatus: 'mandatory_standard' | 'exempt_validated'
  readonly contributionDays: number
  readonly liablePayCents: number
  readonly monthlyCeilingCents: 845_000
  readonly annualCeilingCents: 10_140_000
  readonly appliedCeilingCents: number
  readonly contributionBaseCents: number
  readonly ceilingReached: boolean
  readonly employeeRate: '0.013'
  readonly employerRate: '0.013'
  readonly contribution: UnemploymentContributionAmount
}

export interface UnemploymentUnavailableResult {
  readonly state: 'unsupported' | 'incomplete'
  readonly calculationYear: 2026
  readonly assumptionSetId: 'de-unemployment-insurance-2026-v1'
  readonly coverageStatus: UnemploymentCoverageStatus
  readonly reason: UnemploymentUnavailableReason
}

export type UnemploymentResult =
  UnemploymentContributionResult | UnemploymentUnavailableResult

export interface AnnualUnemploymentContributionResult {
  readonly state: 'calculated'
  readonly calculationYear: 2026
  readonly assumptionSetId: 'de-unemployment-insurance-2026-v1'
  readonly months: readonly UnemploymentContributionResult[]
  readonly contributionBaseCents: number
  readonly contribution: UnemploymentContributionAmount
  readonly ceilingReachedInMonths: readonly number[]
}

const MONTHLY_CEILING_CENTS = 845_000n
const ANNUAL_CEILING_CENTS = 10_140_000
const CONTRIBUTION_MONTH_DAYS = 30n
const RATE_NUMERATOR = 13n
const RATE_DENOMINATOR = 1_000n

const assertSafeNonNegativeInteger = (value: number, name: string): bigint => {
  if (!Number.isSafeInteger(value) || value < 0)
    throw new RangeError(`${name} must be a non-negative safe integer`)
  return BigInt(value)
}

const toSafeNumber = (value: bigint): number => {
  const number = Number(value)
  if (!Number.isSafeInteger(number))
    throw new RangeError('Unemployment result exceeds the safe integer range')
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
  input: UnemploymentContributionInput,
  state: UnemploymentUnavailableResult['state'],
  reason: UnemploymentUnavailableReason,
): UnemploymentUnavailableResult => ({
  state,
  calculationYear: 2026,
  assumptionSetId: 'de-unemployment-insurance-2026-v1',
  coverageStatus: input.coverageStatus,
  reason,
})

const contributionResult = (
  input: UnemploymentContributionInput,
  baseCentsNumerator: bigint,
  appliedCeilingCents: bigint,
  baseCentsDenominator = 1n,
  ceilingReached = BigInt(input.liablePayCents) > appliedCeilingCents,
): UnemploymentContributionResult => {
  const share = divideHalfUp(
    baseCentsNumerator * RATE_NUMERATOR,
    baseCentsDenominator * RATE_DENOMINATOR,
  )
  const employeeCents = toSafeNumber(share)
  const employerCents = employeeCents

  return {
    state: 'calculated',
    calculationYear: 2026,
    assumptionSetId: 'de-unemployment-insurance-2026-v1',
    sourceIds: [
      'DE-SGBIII-341',
      'DE-SGBIII-342',
      'DE-SGBIII-346',
      'DE-SVBEZGRV-2026-4',
      'DE-BVV-1-2',
    ],
    coverageStatus: input.coverageStatus as
      'mandatory_standard' | 'exempt_validated',
    contributionDays: input.contributionDays,
    liablePayCents: input.liablePayCents,
    monthlyCeilingCents: 845_000,
    annualCeilingCents: ANNUAL_CEILING_CENTS,
    appliedCeilingCents: toSafeNumber(appliedCeilingCents),
    contributionBaseCents: toSafeNumber(
      divideHalfUp(baseCentsNumerator, baseCentsDenominator),
    ),
    ceilingReached,
    employeeRate: '0.013',
    employerRate: '0.013',
    contribution: {
      employeeCents,
      employerCents,
      totalCents: employeeCents + employerCents,
    },
  }
}

/** Calculate an ordinary 2026 German unemployment-insurance contribution. */
export const calculateUnemploymentContribution2026 = (
  input: UnemploymentContributionInput,
): UnemploymentResult => {
  if (input.calculationYear !== 2026)
    throw new RangeError('Only 2026 unemployment assumptions are implemented')

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
    case 'standard_retirement_age_employer_only':
      return unavailable(
        input,
        'unsupported',
        'retirement_age_employer_only_unsupported',
      )
    case 'transition_range':
      return unavailable(input, 'unsupported', 'transition_range_unsupported')
    case 'minijob':
      return unavailable(input, 'unsupported', 'minijob_unsupported')
    case 'trainee_special':
      return unavailable(input, 'unsupported', 'trainee_special_unsupported')
    case 'voluntary_self_insurance':
      return unavailable(
        input,
        'unsupported',
        'voluntary_self_insurance_unsupported',
      )
    case 'cross_border':
      return unavailable(input, 'unsupported', 'cross_border_unsupported')
    case 'exempt_validated':
      if (input.exemptionEvidenceValidated !== true)
        return unavailable(input, 'incomplete', 'exemption_evidence_required')
      return contributionResult(input, 0n, 0n, 1n, false)
    case 'mandatory_standard': {
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

/** Calculate an already-allocated one-time contribution base without applying a second monthly ceiling. */
export const calculateAllocatedOneOffUnemploymentContribution2026 = (
  input: UnemploymentContributionInput,
): UnemploymentResult => {
  const admission = calculateUnemploymentContribution2026({
    ...input,
    liablePayCents: 0,
    includesOneOffPay: false,
  })
  if (admission.state !== 'calculated') return admission
  if (!Number.isSafeInteger(input.liablePayCents) || input.liablePayCents < 0)
    throw new RangeError('Allocated bonus base must be safe non-negative cents')
  return contributionResult(input, BigInt(input.liablePayCents), BigInt(input.liablePayCents), 1n, false)
}

const aggregateAnnualResult = (
  months: readonly UnemploymentContributionResult[],
): AnnualUnemploymentContributionResult => ({
  state: 'calculated',
  calculationYear: 2026,
  assumptionSetId: 'de-unemployment-insurance-2026-v1',
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

export const calculateAnnualUnemploymentContribution2026 = (
  monthlyLiablePayCents: readonly number[],
): AnnualUnemploymentContributionResult => {
  if (monthlyLiablePayCents.length !== 12)
    throw new RangeError(
      'Annual unemployment calculation requires exactly 12 months',
    )

  const months = monthlyLiablePayCents.map((liablePayCents) => {
    const result = calculateUnemploymentContribution2026({
      liablePayCents,
      contributionDays: 30,
      coverageStatus: 'mandatory_standard',
      calculationYear: 2026,
    })
    if (result.state !== 'calculated')
      throw new Error('Ordinary annual unemployment month was not calculated')
    return result
  })
  return aggregateAnnualResult(months)
}

const powerOfTen = (exponent: number): bigint => 10n ** BigInt(exponent)

const calculateExactMonthlyUnemploymentContribution = (
  pay: ExactEuroQuotient,
): UnemploymentContributionResult => {
  if (pay.dividend.coefficient < 0n)
    throw new RangeError(
      'Normalized unemployment-liable pay must be non-negative',
    )

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
      coverageStatus: 'mandatory_standard',
      calculationYear: 2026,
    },
    baseNumerator,
    MONTHLY_CEILING_CENTS,
    payCentsDenominator,
    ceilingReached,
  )
}

export const calculateUnemploymentFromNormalizedCompensation2026 = (
  compensation: NormalizedCompensation,
  coverageStatus: UnemploymentCoverageStatus,
  exemptionEvidenceValidated = false,
): AnnualUnemploymentContributionResult | UnemploymentUnavailableResult => {
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

  if (coverageStatus === 'exempt_validated' && exemptionEvidenceValidated) {
    const months = compensation.months.map((month) => {
      const result = calculateUnemploymentContribution2026({
        liablePayCents: Number(
          exactEuroQuotientToCents(month.totalRecurringGross, 'half_up'),
        ),
        contributionDays: 30,
        coverageStatus,
        calculationYear: 2026,
        exemptionEvidenceValidated,
      })
      if (result.state !== 'calculated')
        throw new Error('Validated annual exemption was not calculated')
      return result
    })
    return aggregateAnnualResult(months)
  }

  if (coverageStatus !== 'mandatory_standard')
    return calculateUnemploymentContribution2026({
      liablePayCents: 0,
      contributionDays: 30,
      coverageStatus,
      calculationYear: 2026,
      exemptionEvidenceValidated,
    }) as UnemploymentUnavailableResult

  const months = compensation.months.map((month) =>
    calculateExactMonthlyUnemploymentContribution(month.totalRecurringGross),
  )
  return aggregateAnnualResult(months)
}
