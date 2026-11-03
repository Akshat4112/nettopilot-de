import type {
  BaseSalary,
  CompensationGuarantee,
  EuroAmount,
  OneOffPayment,
  PayPeriod,
  ResolvedScenarioMetadata,
} from '../salary/types'

/** An unanswered comparison field is unknown, never implicitly zero. */
export type OfferInput<T> =
  | { readonly state: 'unknown' }
  | {
      readonly state: 'provided'
      readonly value: T
      readonly source: 'offer_document' | 'employer_statement' | 'user_entry'
    }

export interface RegularCashComponent {
  readonly label: string
  readonly amount: EuroAmount
  readonly period: PayPeriod
  readonly guarantee: CompensationGuarantee
}

export interface VariableCashComponent {
  readonly label: string
  /** The entered expected amount, not an inferred achievement probability. */
  readonly expectedAmount: EuroAmount
  readonly period: PayPeriod
  readonly source: 'offer_document' | 'employer_statement' | 'user_entry'
}

export interface OfferCompensation {
  readonly baseSalary: OfferInput<BaseSalary>
  readonly recurringAdditionalCash: readonly RegularCashComponent[]
  readonly variableCash: readonly VariableCashComponent[]
  /** One-offs retain their month, guarantee and taxable classification. */
  readonly oneOffPayments: readonly OneOffPayment[]
}

export interface OfferWorkingTime {
  readonly weeklyHours: OfferInput<number>
  readonly workingDaysPerWeek: OfferInput<number>
  readonly paidVacationDaysAnnual: OfferInput<number>
  readonly overtimeHoursAnnual: OfferInput<number>
}

export interface OfferRemoteWork {
  readonly arrangement: 'onsite' | 'hybrid' | 'remote' | 'unknown'
  readonly remoteDaysPerWeek: OfferInput<number>
  readonly homeOfficeCostMonthly: OfferInput<EuroAmount>
  readonly employerAllowanceMonthly: OfferInput<EuroAmount>
}

export interface OfferCommute {
  readonly oneWayDistanceKm: OfferInput<number>
  readonly oneWayMinutes: OfferInput<number>
  /** Do not manufacture transport costs from distance or time. */
  readonly publicTransportCostMonthly: OfferInput<EuroAmount>
  readonly fuelCostMonthly: OfferInput<EuroAmount>
  readonly parkingCostMonthly: OfferInput<EuroAmount>
  readonly otherCostMonthly: OfferInput<EuroAmount>
}

export interface OfferEmployerPension {
  readonly employerContributionAnnual: OfferInput<EuroAmount>
  readonly certainty: 'guaranteed' | 'conditional' | 'unknown'
  readonly eligibilityOrVestingNote: OfferInput<string>
}

export interface OfferBenefit {
  readonly id: string
  readonly label: string
  readonly certainty: 'guaranteed' | 'conditional' | 'unknown'
  readonly employerStatedAnnualValue: OfferInput<EuroAmount>
  readonly userAssignedAnnualValue: OfferInput<EuroAmount>
  readonly description: OfferInput<string>
}

export interface OfferSide {
  readonly id: 'offer_a' | 'offer_b'
  readonly label: 'Offer A' | 'Offer B'
  readonly compensation: OfferCompensation
  readonly workingTime: OfferWorkingTime
  readonly remoteWork: OfferRemoteWork
  readonly commute: OfferCommute
  readonly employerPension: OfferEmployerPension
  readonly benefits: readonly OfferBenefit[]
}

export interface OfferComparisonDraft {
  readonly schemaVersion: 1
  readonly calculationYear: 2026
  readonly currency: 'EUR'
  readonly selectedView:
    'recurring' | 'guaranteed_annual' | 'total_compensation'
  /** Populated only after both payroll scenarios are independently validated. */
  readonly payrollMetadata: OfferInput<ResolvedScenarioMetadata>
  readonly offers: readonly [
    OfferSide & { readonly id: 'offer_a' },
    OfferSide & {
      readonly id: 'offer_b'
    },
  ]
}

const unknown = <T>(): OfferInput<T> => ({ state: 'unknown' })

const emptySide = (id: 'offer_a' | 'offer_b'): OfferSide => ({
  id,
  label: id === 'offer_a' ? 'Offer A' : 'Offer B',
  compensation: {
    baseSalary: unknown<BaseSalary>(),
    recurringAdditionalCash: [],
    variableCash: [],
    oneOffPayments: [],
  },
  workingTime: {
    weeklyHours: unknown<number>(),
    workingDaysPerWeek: unknown<number>(),
    paidVacationDaysAnnual: unknown<number>(),
    overtimeHoursAnnual: unknown<number>(),
  },
  remoteWork: {
    arrangement: 'unknown',
    remoteDaysPerWeek: unknown<number>(),
    homeOfficeCostMonthly: unknown<EuroAmount>(),
    employerAllowanceMonthly: unknown<EuroAmount>(),
  },
  commute: {
    oneWayDistanceKm: unknown<number>(),
    oneWayMinutes: unknown<number>(),
    publicTransportCostMonthly: unknown<EuroAmount>(),
    fuelCostMonthly: unknown<EuroAmount>(),
    parkingCostMonthly: unknown<EuroAmount>(),
    otherCostMonthly: unknown<EuroAmount>(),
  },
  employerPension: {
    employerContributionAnnual: unknown<EuroAmount>(),
    certainty: 'unknown',
    eligibilityOrVestingNote: unknown<string>(),
  },
  benefits: [],
})

/** A neutral starting point for exactly two independently editable offers. */
export const createEmptyOfferComparison = (): OfferComparisonDraft => ({
  schemaVersion: 1,
  calculationYear: 2026,
  currency: 'EUR',
  selectedView: 'recurring',
  payrollMetadata: unknown<ResolvedScenarioMetadata>(),
  offers: [
    { ...emptySide('offer_a'), id: 'offer_a' },
    { ...emptySide('offer_b'), id: 'offer_b' },
  ],
})

/**
 * Input-presence check only, not proof of valid payroll calculations,
 * comparable tax assumptions or calculation-engine compatibility.
 */
export const haveBothBaseSalaryInputs = (
  value: OfferComparisonDraft,
): boolean =>
  value.offers.every(
    (offer) => offer.compensation.baseSalary.state === 'provided',
  )
