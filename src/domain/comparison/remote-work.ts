import type { DecimalString, EuroAmount } from '../salary/types'
import type {
  OfferComparisonDraft,
  OfferInput,
  OfferRemoteWork,
} from './offer-model'

export type WorkArrangement = 'unknown' | 'onsite' | 'hybrid' | 'remote'

export interface RemoteWorkEntry {
  readonly arrangement: WorkArrangement
  readonly workingDaysPerWeek: string
  readonly officeDaysPerWeek: string
  readonly employerAllowanceMonthlyEur: string
  readonly homeOfficeCostMonthlyEur: string
}

export const blankRemoteWork = (): RemoteWorkEntry => ({
  arrangement: 'unknown',
  workingDaysPerWeek: '',
  officeDaysPerWeek: '',
  employerAllowanceMonthlyEur: '',
  homeOfficeCostMonthlyEur: '',
})

type Known<T> =
  | { readonly state: 'unknown' }
  | { readonly state: 'provided'; readonly value: T }

export type RemoteWorkEvaluation =
  | { readonly state: 'invalid'; readonly reason: string }
  | {
      readonly state: 'valid'
      readonly arrangement: WorkArrangement
      readonly officeDaysPerWeek: Known<number>
      readonly remoteDaysPerWeek: Known<number>
      readonly employerAllowanceMonthlyCents: Known<number>
      readonly homeOfficeCostMonthlyCents: Known<number>
      readonly allowanceTaxTreatment: 'not_calculated'
    }

const unknown = <T>(): Known<T> => ({ state: 'unknown' })
const provided = <T>(value: T): Known<T> => ({
  state: 'provided',
  value,
})

const optionalMoney = (raw: string): Known<number> | null => {
  if (raw === '') return unknown<number>()
  if (!/^(?:0|[1-9]\d*)(?:\.\d{1,2})?$/.test(raw)) return null
  const [whole = '0', fraction = ''] = raw.split('.')
  const cents = BigInt(whole) * 100n + BigInt(fraction.padEnd(2, '0'))
  if (cents > 1_000_000n) return null
  return provided(Number(cents))
}

/**
 * Work location, employer allowance and actual home costs remain independent.
 * Never imply employer subsidies offset household expenses or calculate tax.
 */
export const evaluateRemoteWork = (
  entry: RemoteWorkEntry,
): RemoteWorkEvaluation => {
  const allowance = optionalMoney(entry.employerAllowanceMonthlyEur)
  const cost = optionalMoney(entry.homeOfficeCostMonthlyEur)
  if (allowance === null || cost === null)
    return {
      state: 'invalid',
      reason:
        'Monthly allowance and costs must be 0–10,000 EUR, to two decimals.',
    }

  let officeDays: Known<number> = unknown()
  let remoteDays: Known<number> = unknown()
  const hasWorkingDays = entry.workingDaysPerWeek !== ''
  const hasOfficeDays = entry.officeDaysPerWeek !== ''
  if (
    (hasWorkingDays && !/^[1-7]$/.test(entry.workingDaysPerWeek)) ||
    (hasOfficeDays && !/^[0-7]$/.test(entry.officeDaysPerWeek)) ||
    (hasWorkingDays &&
      hasOfficeDays &&
      Number(entry.officeDaysPerWeek) > Number(entry.workingDaysPerWeek))
  )
    return {
      state: 'invalid',
      reason: 'Workdays must be 1–7 and office days 0–workdays when supplied.',
    }
  if (hasOfficeDays) {
    const office = Number(entry.officeDaysPerWeek)
    if (
      (entry.arrangement === 'onsite' &&
        (office === 0 ||
          (hasWorkingDays && office !== Number(entry.workingDaysPerWeek)))) ||
      (entry.arrangement === 'remote' && office !== 0)
    )
      return {
        state: 'invalid',
        reason:
          'Office-day inputs conflict with the selected work arrangement.',
      }
    officeDays = provided(office)
    if (hasWorkingDays)
      remoteDays = provided(Number(entry.workingDaysPerWeek) - office)
  }

  return {
    state: 'valid',
    arrangement: entry.arrangement,
    officeDaysPerWeek: officeDays,
    remoteDaysPerWeek: remoteDays,
    employerAllowanceMonthlyCents: allowance,
    homeOfficeCostMonthlyCents: cost,
    allowanceTaxTreatment: 'not_calculated',
  }
}

const toInput = (value: Known<number>): OfferInput<number> =>
  value.state === 'unknown'
    ? { state: 'unknown' }
    : { state: 'provided', value: value.value, source: 'user_entry' }

const toEuroInput = (value: Known<number>): OfferInput<EuroAmount> =>
  value.state === 'unknown'
    ? { state: 'unknown' }
    : {
        state: 'provided',
        source: 'user_entry',
        value: {
          amount: (value.value / 100).toFixed(2) as DecimalString,
          currency: 'EUR',
        },
      }

/** Does not discard salaries or other independently captured offer fields. */
export const attachRemoteWork = (
  draft: OfferComparisonDraft,
  inputs: readonly [RemoteWorkEntry, RemoteWorkEntry],
): OfferComparisonDraft => {
  const [a, b] = inputs.map(evaluateRemoteWork)
  const apply = (
    original: OfferRemoteWork,
    value: RemoteWorkEvaluation | undefined,
  ) => {
    if (value === undefined || value.state === 'invalid') return original
    return {
      ...original,
      arrangement: value.arrangement,
      remoteDaysPerWeek: toInput(value.remoteDaysPerWeek),
      homeOfficeCostMonthly: toEuroInput(value.homeOfficeCostMonthlyCents),
      employerAllowanceMonthly: toEuroInput(
        value.employerAllowanceMonthlyCents,
      ),
    }
  }
  return {
    ...draft,
    offers: [
      {
        ...draft.offers[0],
        remoteWork: apply(draft.offers[0].remoteWork, a),
      },
      {
        ...draft.offers[1],
        remoteWork: apply(draft.offers[1].remoteWork, b),
      },
    ],
  }
}
