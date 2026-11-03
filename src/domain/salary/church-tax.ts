import type { PayrollTaxResult } from './payroll-tax'
import type { ChurchTaxStatus, FederalStateCode } from './types'

export type ChurchTaxEvidenceStatus = 'approved' | 'candidate' | 'missing'
export type ChurchTaxExceptionStatus = 'applies' | 'does_not_apply' | 'unknown'
export type ChurchTaxCalculationScope =
  | 'ordinary_payroll'
  | 'capping'
  | 'minimum_tax'
  | 'church_money'
  | 'flat_rate_payroll'
  | 'final_assessment'
  | 'cross_border'

export interface ChurchTaxStateRecord2026 {
  readonly state: FederalStateCode
  readonly candidateRateBasisPoints: 800 | 900
  readonly rateEvidence: ChurchTaxEvidenceStatus
  readonly finalCentEvidence: ChurchTaxEvidenceStatus
  readonly rateSourceIds: readonly string[]
  readonly finalCentSourceIds: readonly string[]
  readonly exceptionControl: 'none' | 'bw_bad_wimpfen'
}

export interface ApprovedChurchTaxRule2026 {
  readonly state: FederalStateCode
  readonly rateBasisPoints: 800 | 900
  readonly finalCentRule: 'truncate'
  readonly rateSourceIds: readonly [string, ...string[]]
  readonly finalCentSourceIds: readonly [string, ...string[]]
  readonly effectiveFrom: '2026-01-01'
  readonly effectiveTo: '2026-12-31'
  readonly supportStatus: 'approved'
}

export interface ChurchTaxInput2026 {
  readonly calculationYear: number
  readonly status: ChurchTaxStatus
  readonly payrollMarkerEvidence: 'confirmed' | 'unknown'
  readonly payrollEstablishmentState?: FederalStateCode | 'unknown' | undefined
  readonly childAllowanceFactorKnown: boolean
  readonly recurringAssessmentBaseCents: number
  readonly otherRemunerationAssessmentBaseCents: number
  readonly payrollEstablishmentPostcode?: string | undefined
  readonly bwExceptionStatus?: ChurchTaxExceptionStatus | undefined
  readonly scope?: ChurchTaxCalculationScope | undefined
}

export type ChurchTaxUnavailableReason =
  | 'unknown_church_tax_status'
  | 'unconfirmed_payroll_marker'
  | 'unknown_payroll_establishment_state'
  | 'unknown_child_allowance_factor'
  | 'missing_bw_postcode'
  | 'unknown_bw_exception_status'
  | 'state_evidence_not_approved'
  | 'special_case_unsupported'

export interface ChurchTaxUnavailableResult {
  readonly state: 'incomplete' | 'unsupported'
  readonly calculationYear: 2026
  readonly assumptionSetId: 'de-church-wage-tax-2026-v1'
  readonly reason: ChurchTaxUnavailableReason
  readonly payrollEstablishmentState?: FederalStateCode | undefined
  readonly candidateRateBasisPoints?: 800 | 900 | undefined
  readonly missingEvidence?: readonly ('governing_rate' | 'final_cent_rule')[]
}

export interface ChurchTaxCalculatedResult {
  readonly state: 'calculated'
  readonly calculationYear: 2026
  readonly assumptionSetId: 'de-church-wage-tax-2026-v1'
  readonly papSourceId: 'DE-BMF-PAP-2026-A1'
  readonly resultQuality: 'exact' | 'no_deduction'
  readonly payrollEstablishmentState?: FederalStateCode | undefined
  readonly rateBasisPoints: 0 | 800 | 900
  readonly finalCentRule: 'truncate' | 'not_applicable'
  readonly recurringAssessmentBaseCents: number
  readonly otherRemunerationAssessmentBaseCents: number
  readonly recurringChurchTaxCents: number
  readonly otherRemunerationChurchTaxCents: number
  readonly totalChurchTaxCents: number
  readonly sourceIds: readonly string[]
  readonly warnings: readonly string[]
}

export type ChurchTaxResult =
  ChurchTaxCalculatedResult | ChurchTaxUnavailableResult

const STATES: readonly FederalStateCode[] = [
  'DE-BB',
  'DE-BE',
  'DE-BW',
  'DE-BY',
  'DE-HB',
  'DE-HE',
  'DE-HH',
  'DE-MV',
  'DE-NI',
  'DE-NW',
  'DE-RP',
  'DE-SH',
  'DE-SL',
  'DE-SN',
  'DE-ST',
  'DE-TH',
]

const candidateRate = (state: FederalStateCode): 800 | 900 =>
  state === 'DE-BW' || state === 'DE-BY' ? 800 : 900

export const CHURCH_TAX_STATE_REGISTRY_2026: readonly ChurchTaxStateRecord2026[] =
  STATES.map((state) => ({
    state,
    candidateRateBasisPoints: candidateRate(state),
    rateEvidence:
      state === 'DE-BW' ? ('approved' as const) : ('candidate' as const),
    finalCentEvidence:
      state === 'DE-NI' ? ('candidate' as const) : ('missing' as const),
    rateSourceIds:
      state === 'DE-BW'
        ? ['DE-BW-KIST-2026']
        : state === 'DE-BY'
          ? ['DE-BY-KIST']
          : state === 'DE-BB'
            ? ['DE-BB-KIST']
            : state === 'DE-BE'
              ? ['DE-BE-KIST-SERVICE']
              : [],
    finalCentSourceIds: state === 'DE-NI' ? ['DE-NI-KIST-RG-11'] : [],
    exceptionControl: state === 'DE-BW' ? 'bw_bad_wimpfen' : 'none',
  }))

const metadata = {
  calculationYear: 2026,
  assumptionSetId: 'de-church-wage-tax-2026-v1',
} as const

const assert2026 = (year: number): void => {
  if (year !== 2026)
    throw new RangeError('Only 2026 church-tax assumptions are implemented')
}

const toBigInt = (value: number, name: string): bigint => {
  if (!Number.isSafeInteger(value) || value < 0)
    throw new RangeError(name + ' must be a non-negative safe integer')
  return BigInt(value)
}

const toSafeNumber = (value: bigint): number => {
  const result = Number(value)
  if (!Number.isSafeInteger(result))
    throw new RangeError('Church-tax result exceeds the safe integer range')
  return result
}

const validateBases = (input: ChurchTaxInput2026): void => {
  toBigInt(input.recurringAssessmentBaseCents, 'recurringAssessmentBaseCents')
  toBigInt(
    input.otherRemunerationAssessmentBaseCents,
    'otherRemunerationAssessmentBaseCents',
  )
}

const unavailable = (
  state: ChurchTaxUnavailableResult['state'],
  reason: ChurchTaxUnavailableReason,
  details: Omit<
    ChurchTaxUnavailableResult,
    'state' | 'reason' | 'calculationYear' | 'assumptionSetId'
  > = {},
): ChurchTaxUnavailableResult => ({ state, reason, ...metadata, ...details })

const calculateComponent = (
  baseCents: number,
  rateBasisPoints: 800 | 900,
): number =>
  toSafeNumber((BigInt(baseCents) * BigInt(rateBasisPoints)) / 10_000n)

/** Exact arithmetic only; not evidence that a state rate is legally approved. */
export const calculateChurchTaxComponent2026 = (
  assessmentBaseCents: number,
  rateBasisPoints: 800 | 900,
): number => {
  toBigInt(assessmentBaseCents, 'assessmentBaseCents')
  return calculateComponent(assessmentBaseCents, rateBasisPoints)
}

export const calculateChurchTaxFromApprovedRule2026 = (
  input: ChurchTaxInput2026,
  rule: ApprovedChurchTaxRule2026,
): ChurchTaxCalculatedResult => {
  assert2026(input.calculationYear)
  validateBases(input)
  if (input.status !== 'liable')
    throw new RangeError('An approved church-tax rule requires liable status')
  if (input.payrollMarkerEvidence !== 'confirmed')
    throw new RangeError(
      'An approved church-tax rule requires confirmed payroll-marker evidence',
    )
  if (!input.childAllowanceFactorKnown)
    throw new RangeError(
      'An approved church-tax rule requires a known child-allowance factor',
    )
  if (input.scope !== undefined && input.scope !== 'ordinary_payroll')
    throw new RangeError(
      'An approved church-tax rule supports ordinary payroll only',
    )
  if (input.payrollEstablishmentState !== rule.state)
    throw new RangeError('Approved church-tax rule does not match the state')
  const registeredRule = CHURCH_TAX_STATE_REGISTRY_2026.find(
    (entry) => entry.state === rule.state,
  )
  const rateSources = rule.rateSourceIds.join('|')
  const centSources = rule.finalCentSourceIds.join('|')
  const approvedRateSources = registeredRule?.rateSourceIds.join('|')
  const approvedCentSources = registeredRule?.finalCentSourceIds.join('|')
  if (
    registeredRule?.rateEvidence !== 'approved' ||
    registeredRule.finalCentEvidence !== 'approved' ||
    rule.rateBasisPoints !== registeredRule.candidateRateBasisPoints ||
    rateSources !== approvedRateSources ||
    centSources !== approvedCentSources
  )
    throw new RangeError(
      'Church-tax rule is not approved by the production evidence registry',
    )
  if (rule.rateSourceIds.length === 0 || rule.finalCentSourceIds.length === 0)
    throw new RangeError(
      'Approved church-tax rule has incomplete source metadata',
    )
  if (rule.state === 'DE-BW') {
    if (input.payrollEstablishmentPostcode === undefined)
      throw new RangeError(
        'An approved Baden-Württemberg rule requires the payroll-establishment postcode',
      )
    if (!/^\d{5}$/.test(input.payrollEstablishmentPostcode))
      throw new RangeError(
        'payrollEstablishmentPostcode must be a five-digit German postcode',
      )
    if (input.payrollEstablishmentPostcode === '74206') {
      if (
        input.bwExceptionStatus === undefined ||
        input.bwExceptionStatus === 'unknown'
      )
        throw new RangeError(
          'The Bad Wimpfen exception status must be explicit',
        )
      const expectedRate = input.bwExceptionStatus === 'applies' ? 900 : 800
      if (rule.rateBasisPoints !== expectedRate)
        throw new RangeError(
          'Approved rule rate conflicts with the Bad Wimpfen exception status',
        )
    } else if (rule.rateBasisPoints !== 800)
      throw new RangeError('An ordinary Baden-Württemberg rule must use 8%')
  }

  const recurringChurchTaxCents = calculateComponent(
    input.recurringAssessmentBaseCents,
    rule.rateBasisPoints,
  )
  const otherRemunerationChurchTaxCents = calculateComponent(
    input.otherRemunerationAssessmentBaseCents,
    rule.rateBasisPoints,
  )

  return {
    state: 'calculated',
    ...metadata,
    papSourceId: 'DE-BMF-PAP-2026-A1',
    resultQuality: 'exact',
    payrollEstablishmentState: rule.state,
    rateBasisPoints: rule.rateBasisPoints,
    finalCentRule: rule.finalCentRule,
    recurringAssessmentBaseCents: input.recurringAssessmentBaseCents,
    otherRemunerationAssessmentBaseCents:
      input.otherRemunerationAssessmentBaseCents,
    recurringChurchTaxCents,
    otherRemunerationChurchTaxCents,
    totalChurchTaxCents:
      recurringChurchTaxCents + otherRemunerationChurchTaxCents,
    sourceIds: [
      'DE-BMF-PAP-2026-A1',
      'DE-ESTG-51A',
      ...rule.rateSourceIds,
      ...rule.finalCentSourceIds,
    ],
    warnings: [
      'Payroll withholding estimate, not final church-tax assessment.',
      "The payroll rate follows the employer's payroll tax establishment.",
      'Special church-tax rules are not included.',
    ],
  }
}

export const calculateChurchTax2026 = (
  input: ChurchTaxInput2026,
): ChurchTaxResult => {
  assert2026(input.calculationYear)
  validateBases(input)

  if (input.scope !== undefined && input.scope !== 'ordinary_payroll')
    return unavailable('unsupported', 'special_case_unsupported')

  if (input.status === 'not_liable')
    return {
      state: 'calculated',
      ...metadata,
      papSourceId: 'DE-BMF-PAP-2026-A1',
      resultQuality: 'no_deduction',
      payrollEstablishmentState:
        input.payrollEstablishmentState === 'unknown'
          ? undefined
          : input.payrollEstablishmentState,
      rateBasisPoints: 0,
      finalCentRule: 'not_applicable',
      recurringAssessmentBaseCents: input.recurringAssessmentBaseCents,
      otherRemunerationAssessmentBaseCents:
        input.otherRemunerationAssessmentBaseCents,
      recurringChurchTaxCents: 0,
      otherRemunerationChurchTaxCents: 0,
      totalChurchTaxCents: 0,
      sourceIds: ['DE-BMF-PAP-2026-A1', 'DE-ELSTER-ELSTAM-FAQ'],
      warnings: [
        'No payroll church-tax deduction is estimated because no liable payroll marker was selected.',
      ],
    }

  if (input.status === 'unknown')
    return unavailable('incomplete', 'unknown_church_tax_status')
  if (input.payrollMarkerEvidence !== 'confirmed')
    return unavailable('incomplete', 'unconfirmed_payroll_marker')
  if (!input.childAllowanceFactorKnown)
    return unavailable('incomplete', 'unknown_child_allowance_factor')
  if (
    input.payrollEstablishmentState === undefined ||
    input.payrollEstablishmentState === 'unknown'
  )
    return unavailable('incomplete', 'unknown_payroll_establishment_state')

  const record = CHURCH_TAX_STATE_REGISTRY_2026.find(
    (candidate) => candidate.state === input.payrollEstablishmentState,
  )
  if (record === undefined)
    return unavailable('incomplete', 'unknown_payroll_establishment_state')

  let candidateRateBasisPoints = record.candidateRateBasisPoints
  if (record.exceptionControl === 'bw_bad_wimpfen') {
    if (input.payrollEstablishmentPostcode === undefined)
      return unavailable('incomplete', 'missing_bw_postcode', {
        payrollEstablishmentState: record.state,
        candidateRateBasisPoints,
      })
    if (!/^\d{5}$/.test(input.payrollEstablishmentPostcode))
      throw new RangeError(
        'payrollEstablishmentPostcode must be a five-digit German postcode',
      )
    if (input.payrollEstablishmentPostcode === '74206') {
      if (
        input.bwExceptionStatus === undefined ||
        input.bwExceptionStatus === 'unknown'
      )
        return unavailable('incomplete', 'unknown_bw_exception_status', {
          payrollEstablishmentState: record.state,
          candidateRateBasisPoints,
        })
      if (input.bwExceptionStatus === 'applies') candidateRateBasisPoints = 900
    }
  }

  const missingEvidence: ('governing_rate' | 'final_cent_rule')[] = []
  if (record.rateEvidence !== 'approved') missingEvidence.push('governing_rate')
  if (record.finalCentEvidence !== 'approved')
    missingEvidence.push('final_cent_rule')

  return unavailable('unsupported', 'state_evidence_not_approved', {
    payrollEstablishmentState: record.state,
    candidateRateBasisPoints,
    missingEvidence,
  })
}

export const calculateChurchTaxFromPayrollTax2026 = (
  payrollTax: PayrollTaxResult,
  input: Omit<
    ChurchTaxInput2026,
    | 'calculationYear'
    | 'recurringAssessmentBaseCents'
    | 'otherRemunerationAssessmentBaseCents'
  >,
): ChurchTaxResult =>
  calculateChurchTax2026({
    ...input,
    calculationYear: payrollTax.calculationYear,
    recurringAssessmentBaseCents: payrollTax.churchTaxAssessmentBaseCents,
    otherRemunerationAssessmentBaseCents:
      payrollTax.otherRemunerationChurchTaxAssessmentBaseCents,
  })
