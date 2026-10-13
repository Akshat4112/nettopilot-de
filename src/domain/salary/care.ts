import type { ExactEuroQuotient, NormalizedCompensation } from './frequency'

export type CareInsurancePath =
  | 'statutory'
  | 'private'
  | 'unknown'
  | 'transition_range'
  | 'minijob'
  | 'student'
  | 'pensioner'
  | 'cross_border'

export type CareEmploymentState = 'saxony' | 'other' | 'ambiguous' | 'unknown'
export type CareParentStatus = 'parent' | 'childless' | 'unknown'
export type CareEvidenceStatus = 'confirmed' | 'scenario'

export interface CareContributionInput {
  readonly liablePayCents: number
  readonly contributionDays: number
  readonly insurancePath: CareInsurancePath
  readonly employmentState: CareEmploymentState
  readonly payrollYear: number
  readonly payrollMonth: number
  readonly birthDate?: string | undefined
  readonly parentStatus: CareParentStatus
  readonly qualifyingChildren?: number | undefined
  readonly evidenceStatus?: CareEvidenceStatus | undefined
  readonly possibleSurchargeException?: boolean | undefined
  readonly includesOneOffPay?: boolean | undefined
  readonly calculationYear: number
}

export interface CareContributionAmount {
  readonly employeeCents: number
  readonly employerCents: number
  readonly totalCents: number
}

export type CareUnavailableReason =
  | 'unknown_insurance_path'
  | 'private_insurance_separate_path'
  | 'transition_range_unsupported'
  | 'minijob_unsupported'
  | 'student_unsupported'
  | 'pensioner_unsupported'
  | 'cross_border_unsupported'
  | 'unknown_employment_state'
  | 'ambiguous_saxony_treatment'
  | 'missing_birth_date'
  | 'unknown_parent_status'
  | 'missing_qualifying_child_count'
  | 'possible_surcharge_exception'
  | 'one_off_allocation_required'

export interface CareUnavailableResult {
  readonly state: 'unsupported' | 'incomplete'
  readonly calculationYear: 2026
  readonly assumptionSetId: 'de-social-care-insurance-2026-v1'
  readonly reason: CareUnavailableReason
}

export interface CareContributionResult {
  readonly state: 'calculated'
  readonly calculationYear: 2026
  readonly assumptionSetId: 'de-social-care-insurance-2026-v1'
  readonly sourceIds: readonly [
    'DE-PBAV-2025-1',
    'DE-SGBXI-55',
    'DE-SGBXI-58',
    'DE-BMG-PV-FINANCE-2026',
    'DE-BMAS-SV-VALUES-2026',
    'DE-BVV-1',
    'DE-BVV-2',
  ]
  readonly resultQuality: 'exact' | 'scenario_estimate'
  readonly payrollYear: 2026
  readonly payrollMonth: number
  readonly contributionDays: number
  readonly liablePayCents: number
  readonly monthlyCeilingCents: 581_250
  readonly annualCeilingCents: 6_975_000
  readonly appliedCeilingCents: number
  readonly contributionBaseCents: number
  readonly ceilingReached: boolean
  readonly saxonyAllocationApplied: boolean
  readonly parentStatus: Exclude<CareParentStatus, 'unknown'>
  readonly qualifyingChildren: number
  readonly reductionCount: number
  readonly ageBoundaryState:
    'before_or_during_23rd_birthday_month' | 'after_23rd_birthday_month'
  readonly employeeBaseRatePercent: string
  readonly employerRatePercent: string
  readonly childlessSurchargeRatePercent: string
  readonly childReductionRatePercent: string
  readonly employeeRatePercent: string
  readonly contribution: CareContributionAmount
}

export type CareResult = CareContributionResult | CareUnavailableResult

export interface AnnualCareContributionResult {
  readonly state: 'calculated'
  readonly calculationYear: 2026
  readonly assumptionSetId: 'de-social-care-insurance-2026-v1'
  readonly months: readonly CareContributionResult[]
  readonly contributionBaseCents: number
  readonly contribution: CareContributionAmount
  readonly ceilingReachedInMonths: readonly number[]
  readonly surchargeMonths: readonly number[]
  readonly scenarioEstimateMonths: readonly number[]
}

export interface AnnualCareContributionInput {
  readonly monthlyLiablePayCents: readonly number[]
  readonly monthlyQualifyingChildren?: readonly number[] | undefined
  readonly insurancePath: CareInsurancePath
  readonly employmentState: CareEmploymentState
  readonly birthDate?: string | undefined
  readonly parentStatus: CareParentStatus
  readonly evidenceStatus?: CareEvidenceStatus | undefined
  readonly possibleSurchargeException?: boolean | undefined
}

const MONTHLY_CEILING_CENTS = 581_250n
const CONTRIBUTION_MONTH_DAYS = 30n

const divideHalfUp = (numerator: bigint, denominator: bigint): bigint => {
  if (denominator <= 0n) throw new RangeError('Denominator must be positive')
  const quotient = numerator / denominator
  const remainder = numerator % denominator
  return remainder * 2n >= denominator ? quotient + 1n : quotient
}

const toSafeNumber = (value: bigint): number => {
  const result = Number(value)
  if (!Number.isSafeInteger(result))
    throw new RangeError('Care-insurance result exceeds the safe integer range')
  return result
}

const assertSafeNonNegativeInteger = (value: number, name: string): bigint => {
  if (!Number.isSafeInteger(value) || value < 0)
    throw new RangeError(name + ' must be a non-negative safe integer')
  return BigInt(value)
}

const unavailable = (
  state: CareUnavailableResult['state'],
  reason: CareUnavailableReason,
): CareUnavailableResult => ({
  state,
  calculationYear: 2026,
  assumptionSetId: 'de-social-care-insurance-2026-v1',
  reason,
})

interface ParsedBirthDate {
  readonly year: number
  readonly month: number
}

const parseBirthDate = (value: string): ParsedBirthDate => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (match === null) throw new RangeError('birthDate must use YYYY-MM-DD')
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const date = new Date(Date.UTC(year, month - 1, day))
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  )
    throw new RangeError('birthDate must be a valid calendar date')
  return { year, month }
}

const surchargeApplies = (
  birthDate: ParsedBirthDate,
  payrollYear: number,
  payrollMonth: number,
): boolean => {
  const payrollIndex = payrollYear * 12 + payrollMonth - 1
  const birthdayMonthIndex = (birthDate.year + 23) * 12 + birthDate.month - 1
  return payrollIndex > birthdayMonthIndex
}

const formatBasisPoints = (basisPoints: number): string => {
  const whole = Math.trunc(basisPoints / 100)
  const fraction = Math.abs(basisPoints % 100)
    .toString()
    .padStart(2, '0')
  return fraction === '00'
    ? whole.toString()
    : whole.toString() + '.' + fraction.replace(/0$/, '')
}

const calculateFromExactBase = (
  input: CareContributionInput,
  baseNumerator: bigint,
  baseDenominator: bigint,
  appliedCeilingCents: bigint,
  ceilingReached: boolean,
  birthDate: ParsedBirthDate,
): CareContributionResult => {
  const saxony = input.employmentState === 'saxony'
  const employeeBaseRate = saxony ? 230 : 180
  const employerRate = saxony ? 130 : 180
  const afterBirthdayMonth = surchargeApplies(
    birthDate,
    input.payrollYear,
    input.payrollMonth,
  )
  const qualifyingChildren =
    input.parentStatus === 'parent' ? (input.qualifyingChildren ?? 0) : 0
  const reductionCount =
    input.parentStatus === 'parent'
      ? Math.min(Math.max(qualifyingChildren - 1, 0), 4)
      : 0
  const surchargeRate =
    input.parentStatus === 'childless' && afterBirthdayMonth ? 60 : 0
  const reductionRate = reductionCount * 25
  const employeeRate = employeeBaseRate + surchargeRate - reductionRate
  const employee = divideHalfUp(
    baseNumerator * BigInt(employeeRate),
    baseDenominator * 10_000n,
  )
  const employer = divideHalfUp(
    baseNumerator * BigInt(employerRate),
    baseDenominator * 10_000n,
  )

  return {
    state: 'calculated',
    calculationYear: 2026,
    assumptionSetId: 'de-social-care-insurance-2026-v1',
    sourceIds: [
      'DE-PBAV-2025-1',
      'DE-SGBXI-55',
      'DE-SGBXI-58',
      'DE-BMG-PV-FINANCE-2026',
      'DE-BMAS-SV-VALUES-2026',
      'DE-BVV-1',
      'DE-BVV-2',
    ],
    resultQuality:
      input.evidenceStatus === 'confirmed' ? 'exact' : 'scenario_estimate',
    payrollYear: 2026,
    payrollMonth: input.payrollMonth,
    contributionDays: input.contributionDays,
    liablePayCents: input.liablePayCents,
    monthlyCeilingCents: 581_250,
    annualCeilingCents: 6_975_000,
    appliedCeilingCents: toSafeNumber(appliedCeilingCents),
    contributionBaseCents: toSafeNumber(
      divideHalfUp(baseNumerator, baseDenominator),
    ),
    ceilingReached,
    saxonyAllocationApplied: saxony,
    parentStatus: input.parentStatus as Exclude<CareParentStatus, 'unknown'>,
    qualifyingChildren,
    reductionCount,
    ageBoundaryState: afterBirthdayMonth
      ? 'after_23rd_birthday_month'
      : 'before_or_during_23rd_birthday_month',
    employeeBaseRatePercent: formatBasisPoints(employeeBaseRate),
    employerRatePercent: formatBasisPoints(employerRate),
    childlessSurchargeRatePercent: formatBasisPoints(surchargeRate),
    childReductionRatePercent: formatBasisPoints(reductionRate),
    employeeRatePercent: formatBasisPoints(employeeRate),
    contribution: {
      employeeCents: toSafeNumber(employee),
      employerCents: toSafeNumber(employer),
      totalCents: toSafeNumber(employee + employer),
    },
  }
}

const validateSupportedInput = (
  input: CareContributionInput,
): ParsedBirthDate | CareUnavailableResult => {
  if (input.calculationYear !== 2026 || input.payrollYear !== 2026)
    throw new RangeError('Only 2026 care-insurance assumptions are implemented')
  if (
    !Number.isSafeInteger(input.payrollMonth) ||
    input.payrollMonth < 1 ||
    input.payrollMonth > 12
  )
    throw new RangeError('payrollMonth must be an integer from 1 through 12')
  if (
    !Number.isSafeInteger(input.contributionDays) ||
    input.contributionDays < 1 ||
    input.contributionDays > 30
  )
    throw new RangeError(
      'contributionDays must be an integer from 1 through 30',
    )
  if (input.includesOneOffPay === true)
    return unavailable('incomplete', 'one_off_allocation_required')

  switch (input.insurancePath) {
    case 'unknown':
      return unavailable('incomplete', 'unknown_insurance_path')
    case 'private':
      return unavailable('unsupported', 'private_insurance_separate_path')
    case 'transition_range':
      return unavailable('unsupported', 'transition_range_unsupported')
    case 'minijob':
      return unavailable('unsupported', 'minijob_unsupported')
    case 'student':
      return unavailable('unsupported', 'student_unsupported')
    case 'pensioner':
      return unavailable('unsupported', 'pensioner_unsupported')
    case 'cross_border':
      return unavailable('unsupported', 'cross_border_unsupported')
    case 'statutory':
      break
  }

  if (input.employmentState === 'unknown')
    return unavailable('incomplete', 'unknown_employment_state')
  if (input.employmentState === 'ambiguous')
    return unavailable('incomplete', 'ambiguous_saxony_treatment')
  if (input.birthDate === undefined)
    return unavailable('incomplete', 'missing_birth_date')
  if (input.parentStatus === 'unknown')
    return unavailable('incomplete', 'unknown_parent_status')
  if (input.parentStatus === 'parent' && input.qualifyingChildren === undefined)
    return unavailable('incomplete', 'missing_qualifying_child_count')
  if (
    input.qualifyingChildren !== undefined &&
    (!Number.isSafeInteger(input.qualifyingChildren) ||
      input.qualifyingChildren < 0)
  )
    throw new RangeError(
      'qualifyingChildren must be a non-negative safe integer',
    )
  if (input.possibleSurchargeException === true)
    return unavailable('unsupported', 'possible_surcharge_exception')

  const birthDate = parseBirthDate(input.birthDate)
  if (input.parentStatus === 'childless' && birthDate.year < 1940)
    return unavailable('unsupported', 'possible_surcharge_exception')
  return birthDate
}

export const calculateCareContribution2026 = (
  input: CareContributionInput,
): CareResult => {
  const liablePay = assertSafeNonNegativeInteger(
    input.liablePayCents,
    'liablePayCents',
  )
  const validation = validateSupportedInput(input)
  if ('state' in validation) return validation

  const ceilingNumerator =
    MONTHLY_CEILING_CENTS * BigInt(input.contributionDays)
  const liableNumerator = liablePay * CONTRIBUTION_MONTH_DAYS
  const ceilingReached = liableNumerator > ceilingNumerator
  return calculateFromExactBase(
    input,
    ceilingReached ? ceilingNumerator : liableNumerator,
    CONTRIBUTION_MONTH_DAYS,
    divideHalfUp(ceilingNumerator, CONTRIBUTION_MONTH_DAYS),
    ceilingReached,
    validation,
  )
}

const aggregateAnnualResult = (
  months: readonly CareContributionResult[],
): AnnualCareContributionResult => ({
  state: 'calculated',
  calculationYear: 2026,
  assumptionSetId: 'de-social-care-insurance-2026-v1',
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
    .map((month) => (month.ceilingReached ? month.payrollMonth : 0))
    .filter((month) => month !== 0),
  surchargeMonths: months
    .filter((month) => month.childlessSurchargeRatePercent !== '0')
    .map((month) => month.payrollMonth),
  scenarioEstimateMonths: months
    .filter((month) => month.resultQuality === 'scenario_estimate')
    .map((month) => month.payrollMonth),
})

export const calculateAnnualCareContribution2026 = (
  input: AnnualCareContributionInput,
): AnnualCareContributionResult => {
  if (input.monthlyLiablePayCents.length !== 12)
    throw new RangeError(
      'Annual care calculation requires exactly 12 pay values',
    )
  if (
    input.parentStatus === 'parent' &&
    input.monthlyQualifyingChildren?.length !== 12
  )
    throw new RangeError(
      'Annual parent calculation requires exactly 12 qualifying-child counts',
    )

  const months = input.monthlyLiablePayCents.map((liablePayCents, index) => {
    const result = calculateCareContribution2026({
      liablePayCents,
      contributionDays: 30,
      insurancePath: input.insurancePath,
      employmentState: input.employmentState,
      payrollYear: 2026,
      payrollMonth: index + 1,
      birthDate: input.birthDate,
      parentStatus: input.parentStatus,
      qualifyingChildren: input.monthlyQualifyingChildren?.[index],
      evidenceStatus: input.evidenceStatus,
      possibleSurchargeException: input.possibleSurchargeException,
      calculationYear: 2026,
    })
    if (result.state !== 'calculated')
      throw new Error(
        'Annual care month is incomplete or unsupported: ' + result.reason,
      )
    return result
  })
  return aggregateAnnualResult(months)
}

const powerOfTen = (exponent: number): bigint => 10n ** BigInt(exponent)

const exactMonthlyContribution = (
  pay: ExactEuroQuotient,
  template: Omit<CareContributionInput, 'liablePayCents' | 'payrollMonth'>,
  payrollMonth: number,
  qualifyingChildren: number | undefined,
): CareContributionResult => {
  if (pay.dividend.coefficient < 0n)
    throw new RangeError('Normalized care-liable pay must be non-negative')
  const payNumerator = pay.dividend.coefficient * 100n
  const payDenominator = powerOfTen(pay.dividend.scale) * BigInt(pay.divisor)
  const ceilingNumerator = MONTHLY_CEILING_CENTS * payDenominator
  const ceilingReached = payNumerator > ceilingNumerator
  const input: CareContributionInput = {
    ...template,
    liablePayCents: toSafeNumber(divideHalfUp(payNumerator, payDenominator)),
    payrollMonth,
    qualifyingChildren,
  }
  const validation = validateSupportedInput(input)
  if ('state' in validation)
    throw new Error(
      'Normalized care month is incomplete or unsupported: ' +
        validation.reason,
    )
  return calculateFromExactBase(
    input,
    ceilingReached ? ceilingNumerator : payNumerator,
    payDenominator,
    MONTHLY_CEILING_CENTS,
    ceilingReached,
    validation,
  )
}

export const calculateCareFromNormalizedCompensation2026 = (
  compensation: NormalizedCompensation,
  input: Omit<
    CareContributionInput,
    'liablePayCents' | 'contributionDays' | 'payrollMonth'
  >,
  monthlyQualifyingChildren?: readonly number[],
): AnnualCareContributionResult | CareUnavailableResult => {
  if (
    input.parentStatus === 'parent' &&
    monthlyQualifyingChildren?.length !== 12
  )
    return unavailable('incomplete', 'missing_qualifying_child_count')

  const normalizedInputValidation = validateSupportedInput({
    ...input,
    liablePayCents: 0,
    contributionDays: 30,
    payrollMonth: 1,
    qualifyingChildren: monthlyQualifyingChildren?.[0],
  })
  if ('state' in normalizedInputValidation) return normalizedInputValidation

  if (
    compensation.months.some(
      (month) =>
        month.guaranteedOneOffPayments.length > 0 ||
        month.variableOneOffPayments.length > 0,
    )
  )
    return unavailable('incomplete', 'one_off_allocation_required')

  const template = { ...input, contributionDays: 30 }
  const months = compensation.months.map((month, index) =>
    exactMonthlyContribution(
      month.totalRecurringGross,
      template,
      index + 1,
      monthlyQualifyingChildren?.[index],
    ),
  )
  return aggregateAnnualResult(months)
}
