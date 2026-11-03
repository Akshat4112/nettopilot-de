import {
  evaluateBenefits,
  type BenefitsEntry,
} from '../domain/comparison/benefits'
import {
  calculateCommuteCosts,
  type CommuteCostEntry,
} from '../domain/comparison/commute-costs'
import { calculateAnnualCommuteTime } from '../domain/comparison/commute-time'
import {
  evaluateRemoteWork,
  type RemoteWorkEntry,
} from '../domain/comparison/remote-work'
import {
  calculateAnnualContractualHours,
  type WorkingTimeEntry,
} from '../domain/comparison/working-time'
import {
  validateAdditionalPay,
  type AdditionalPayEntry,
} from './offer-additional-pay'

export type OptionalCategory =
  'cash' | 'working' | 'commute' | 'remote' | 'benefits'
export type CategoryStatus = 'Not supplied' | 'Incomplete' | 'Supplied'

interface CategoryEntries {
  readonly additional: AdditionalPayEntry
  readonly working: WorkingTimeEntry
  readonly commute: CommuteCostEntry
  readonly oneWayMinutes: string
  readonly remote: RemoteWorkEntry
  readonly benefits: BenefitsEntry
}

const status = (started: boolean, valid: boolean): CategoryStatus =>
  !started ? 'Not supplied' : valid ? 'Supplied' : 'Incomplete'

/** Presentation only: valid supplied terms do not imply absent optional values are zero. */
export function optionalCategoryStatuses(
  entry: CategoryEntries,
): Readonly<Record<OptionalCategory, CategoryStatus>> {
  const { additional, working, commute, remote, benefits, oneWayMinutes } =
    entry
  const costsStarted = [
    commute.publicTransportPerOfficeDayEur,
    commute.fuelPerOfficeDayEur,
    commute.parkingPerOfficeDayEur,
    commute.otherPerOfficeDayEur,
  ].some((value) => value !== '')
  const commuteStarted =
    costsStarted || commute.officeDaysPerWeek !== '' || oneWayMinutes !== ''
  const commuteEntry = {
    ...commute,
    workingDaysPerWeek: working.workingDaysPerWeek,
    paidVacationDaysAnnual: working.paidVacationDaysAnnual,
  }
  const remoteEntry = {
    ...remote,
    workingDaysPerWeek: working.workingDaysPerWeek,
    officeDaysPerWeek: commute.officeDaysPerWeek,
  }
  const benefitsStarted =
    benefits.employerContributionAnnualEur !== '' ||
    benefits.pensionCertainty !== 'unknown' ||
    benefits.eligibilityOrVestingNote !== '' ||
    benefits.benefits.length > 0
  return {
    cash: status(
      additional.expectedVariableEur !== '' ||
        additional.oneOffEur !== '' ||
        additional.oneOffMonth !== '' ||
        additional.oneOffGuarantee !== 'variable' ||
        additional.oneOffClassification !== 'performance_bonus',
      (additional.expectedVariableEur !== '' || additional.oneOffEur !== '') &&
        validateAdditionalPay(additional).length === 0,
    ),
    working: status(
      Object.values(working).some((value) => value !== ''),
      calculateAnnualContractualHours(working).state === 'calculated',
    ),
    commute: status(
      commuteStarted,
      (costsStarted || oneWayMinutes !== '') &&
        (!costsStarted ||
          calculateCommuteCosts(commuteEntry).state === 'calculated') &&
        (oneWayMinutes === '' ||
          calculateAnnualCommuteTime({ ...commuteEntry, oneWayMinutes })
            .state === 'calculated'),
    ),
    remote: status(
      remote.arrangement !== 'unknown' ||
        remote.employerAllowanceMonthlyEur !== '' ||
        remote.homeOfficeCostMonthlyEur !== '',
      evaluateRemoteWork(remoteEntry).state === 'valid',
    ),
    benefits: status(
      benefitsStarted,
      evaluateBenefits(benefits).state === 'valid',
    ),
  }
}
