import { useState } from 'react'
import { OfferAdditionalPayInputs } from './OfferAdditionalPayInputs'
import { OfferWorkingTimeInputs } from './OfferWorkingTimeInputs'
import { VacationComparison } from './VacationComparison'
import { OfferCommuteCostInputs } from './OfferCommuteCostInputs'
import { CommuteCostComparison } from './CommuteCostComparison'
import { CommuteTimeComparison } from './CommuteTimeComparison'
import { RemoteWorkComparison } from './RemoteWorkComparison'
import {
  attachRemoteWork,
  blankRemoteWork,
  evaluateRemoteWork,
  type RemoteWorkEntry,
} from '../domain/comparison/remote-work'
import {
  calculateAnnualCommuteTime,
  type CommuteTimeEntry,
} from '../domain/comparison/commute-time'
import {
  blankCommuteCostEntry,
  calculateCommuteCosts,
  type CommuteCostEntry,
} from '../domain/comparison/commute-costs'
import {
  attachWorkingTime,
  blankWorkingTime,
  calculateAnnualContractualHours,
  type WorkingTimeEntry,
} from '../domain/comparison/working-time'
import {
  applyAdditionalPay,
  emptyAdditionalPay,
  validateAdditionalPay,
  type AdditionalPayEntry,
} from './offer-additional-pay'
import {
  buildOfferPairFromEntries,
  validateOfferSalary,
  type OfferSalaryEntry,
} from './offer-input-validation'

const blank = (): OfferSalaryEntry => ({ grossEur: '', period: 'annual' })

export function OfferComparisonInputs() {
  const [offers, setOffers] = useState<
    readonly [OfferSalaryEntry, OfferSalaryEntry]
  >([blank(), blank()])
  const [checked, setChecked] = useState(false)
  const [working, setWorking] = useState<
    readonly [WorkingTimeEntry, WorkingTimeEntry]
  >([blankWorkingTime(), blankWorkingTime()])
  const [oneWayMinutes, setOneWayMinutes] = useState<readonly [string, string]>(
    ['', ''],
  )
  const [commute, setCommute] = useState<
    readonly [CommuteCostEntry, CommuteCostEntry]
  >([blankCommuteCostEntry(), blankCommuteCostEntry()])
  const [remote, setRemote] = useState<
    readonly [RemoteWorkEntry, RemoteWorkEntry]
  >([blankRemoteWork(), blankRemoteWork()])
  const [additional, setAdditional] = useState<
    readonly [AdditionalPayEntry, AdditionalPayEntry]
  >([emptyAdditionalPay(), emptyAdditionalPay()])

  const setWorkingEntry = (side: 0 | 1, next: WorkingTimeEntry) => {
    setWorking((current) =>
      side === 0 ? [next, current[1]] : [current[0], next],
    )
    setChecked(false)
  }

  const setCommuteEntry = (side: 0 | 1, next: CommuteCostEntry) => {
    setCommute((current) =>
      side === 0 ? [next, current[1]] : [current[0], next],
    )
    setChecked(false)
  }

  const setRemoteEntry = (side: 0 | 1, next: RemoteWorkEntry) => {
    setRemote((current) =>
      side === 0 ? [next, current[1]] : [current[0], next],
    )
    setChecked(false)
  }

  const setExtra = (side: 0 | 1, next: AdditionalPayEntry) => {
    setAdditional((current) =>
      side === 0 ? [next, current[1]] : [current[0], next],
    )
    setChecked(false)
  }

  const setEntry = (side: 0 | 1, next: OfferSalaryEntry) => {
    setOffers((previous) =>
      side === 0 ? [next, previous[1]] : [previous[0], next],
    )
    setChecked(false)
  }
  const copy = (source: 0 | 1) => {
    const target: 0 | 1 = source === 0 ? 1 : 0
    setOffers((previous) =>
      target === 0
        ? [{ ...previous[1] }, previous[1]]
        : [previous[0], { ...previous[0] }],
    )
    setAdditional((previous) =>
      target === 0
        ? [{ ...previous[1] }, previous[1]]
        : [previous[0], { ...previous[0] }],
    )
    setWorking((previous) =>
      target === 0
        ? [{ ...previous[1] }, previous[1]]
        : [previous[0], { ...previous[0] }],
    )
    setCommute((previous) =>
      target === 0
        ? [{ ...previous[1] }, previous[1]]
        : [previous[0], { ...previous[0] }],
    )
    setOneWayMinutes((previous) =>
      target === 0 ? [previous[1], previous[1]] : [previous[0], previous[0]],
    )
    setRemote((previous) =>
      target === 0
        ? [{ ...previous[1] }, previous[1]]
        : [previous[0], { ...previous[0] }],
    )
    setChecked(false)
  }
  const validation = offers.map(validateOfferSalary)
  const extrasValid = additional.every(
    (entry) => validateAdditionalPay(entry).length === 0,
  )
  const workingValid = working.every((entry) => {
    const empty = Object.values(entry).every((value) => value === '')
    return (
      empty || calculateAnnualContractualHours(entry).state === 'calculated'
    )
  })
  const commuteFor = (side: 0 | 1): CommuteCostEntry => ({
    ...commute[side],
    workingDaysPerWeek: working[side].workingDaysPerWeek,
    paidVacationDaysAnnual: working[side].paidVacationDaysAnnual,
  })
  const remoteFor = (side: 0 | 1): RemoteWorkEntry => ({
    ...remote[side],
    workingDaysPerWeek: working[side].workingDaysPerWeek,
    officeDaysPerWeek: commute[side].officeDaysPerWeek,
  })
  const remoteStarted = (side: 0 | 1) =>
    remote[side].arrangement !== 'unknown' ||
    remote[side].employerAllowanceMonthlyEur !== '' ||
    remote[side].homeOfficeCostMonthlyEur !== ''
  const commuteTimeFor = (side: 0 | 1): CommuteTimeEntry => ({
    workingDaysPerWeek: working[side].workingDaysPerWeek,
    officeDaysPerWeek: commute[side].officeDaysPerWeek,
    paidVacationDaysAnnual: working[side].paidVacationDaysAnnual,
    oneWayMinutes: oneWayMinutes[side],
  })
  const commuteTimeValid = ([0, 1] as const).every((side) => {
    const oneWay = oneWayMinutes[side]
    return (
      oneWay === '' ||
      calculateAnnualCommuteTime(commuteTimeFor(side)).state === 'calculated'
    )
  })
  const commuteValid = ([0, 1] as const).every((side) => {
    const entry = commute[side]
    const empty = [
      entry.officeDaysPerWeek,
      entry.publicTransportPerOfficeDayEur,
      entry.fuelPerOfficeDayEur,
      entry.parkingPerOfficeDayEur,
      entry.otherPerOfficeDayEur,
    ].every((value) => value === '')
    return (
      empty || calculateCommuteCosts(commuteFor(side)).state === 'calculated'
    )
  })
  const remoteValid = ([0, 1] as const).every(
    (side) =>
      !remoteStarted(side) ||
      evaluateRemoteWork(remoteFor(side)).state === 'valid',
  )
  const accepted =
    remoteValid &&
    commuteTimeValid &&
    commuteValid &&
    extrasValid &&
    workingValid &&
    validation.every((result) => result.state === 'valid')
  const model = attachRemoteWork(
    attachWorkingTime(
      applyAdditionalPay(
        buildOfferPairFromEntries(offers[0], offers[1]),
        additional,
      ),
      working,
    ),
    [remoteFor(0), remoteFor(1)],
  )
  const dataIsAdmitted = model.offers.every(
    (offer) => offer.compensation.baseSalary.state === 'provided',
  )

  return (
    <section
      className="np-panel offer-comparison"
      aria-labelledby="offer-input-title"
    >
      <h2 id="offer-input-title">Compare two job offers</h2>
      <p>
        Enter base salary for Offer A and Offer B. Each offer stays independent
        in this browser. Net-pay comparisons will become available after the
        separately validated comparison engine is connected.
      </p>
      <div className="offer-grid">
        {offers.map((entry, index) => {
          const side = index as 0 | 1
          const id = side === 0 ? 'offer-a' : 'offer-b'
          const label = side === 0 ? 'Offer A' : 'Offer B'
          const issue = validateOfferSalary(entry)
          const extra = additional[side]
          const extraProblems = validateAdditionalPay(extra)
          const commuteEntry = commuteFor(side)
          const commuteEntered = [
            commute[side].officeDaysPerWeek,
            commute[side].publicTransportPerOfficeDayEur,
            commute[side].fuelPerOfficeDayEur,
            commute[side].parkingPerOfficeDayEur,
            commute[side].otherPerOfficeDayEur,
          ].some((value) => value !== '')
          const commuteResult = calculateCommuteCosts(commuteEntry)
          const commuteTimeResult = calculateAnnualCommuteTime(
            commuteTimeFor(side),
          )
          const timeEntry = working[side]
          const timeResult = calculateAnnualContractualHours(timeEntry)
          const timeStarted = Object.values(timeEntry).some(
            (value) => value !== '',
          )
          const remoteEntry = remote[side]
          const remoteResult = evaluateRemoteWork(remoteFor(side))
          const showIssue = checked && issue.state !== 'valid'
          return (
            <fieldset className="offer-card" key={id}>
              <legend>{label}</legend>
              <div className="np-field">
                <label htmlFor={id + '-gross'}>
                  {label} gross salary (EUR)
                </label>
                <input
                  id={id + '-gross'}
                  type="text"
                  inputMode="decimal"
                  value={entry.grossEur}
                  onChange={(event) => {
                    setEntry(side, { ...entry, grossEur: event.target.value })
                  }}
                  aria-invalid={showIssue}
                  aria-describedby={showIssue ? id + '-error' : undefined}
                />
                {showIssue && (
                  <small id={id + '-error'} role="alert">
                    {issue.reason}
                  </small>
                )}
              </div>
              <div className="np-field">
                <label htmlFor={id + '-period'}>{label} pay frequency</label>
                <select
                  id={id + '-period'}
                  value={entry.period}
                  onChange={(event) => {
                    setEntry(side, {
                      ...entry,
                      period:
                        event.target.value === 'monthly' ? 'monthly' : 'annual',
                    })
                  }}
                >
                  <option value="annual">Annual</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              <OfferAdditionalPayInputs
                id={id}
                label={label}
                value={extra}
                onChange={(next) => {
                  setExtra(side, next)
                }}
              />
              {checked && extraProblems.length > 0 && (
                <div role="alert">
                  {extraProblems.map((problem) => (
                    <p key={problem}>{problem}</p>
                  ))}
                </div>
              )}
              <OfferWorkingTimeInputs
                id={id}
                label={label}
                value={timeEntry}
                onChange={(next) => {
                  setWorkingEntry(side, next)
                }}
              />
              {checked && timeStarted && timeResult.state !== 'calculated' && (
                <p role="alert">{timeResult.reason}</p>
              )}
              <OfferCommuteCostInputs
                id={id}
                label={label}
                value={commuteEntry}
                onChange={(next) => {
                  setCommuteEntry(side, next)
                }}
              />
              {checked &&
                commuteEntered &&
                commuteResult.state !== 'calculated' && (
                  <p role="alert">{commuteResult.reason}</p>
                )}
              <div className="np-field">
                <label htmlFor={id + '-one-way-minutes'}>
                  {label} one-way commute (minutes)
                </label>
                <input
                  id={id + '-one-way-minutes'}
                  type="text"
                  inputMode="numeric"
                  value={oneWayMinutes[side]}
                  onChange={(event) => {
                    const value = event.target.value
                    setOneWayMinutes((current) =>
                      side === 0 ? [value, current[1]] : [current[0], value],
                    )
                    setChecked(false)
                  }}
                />
              </div>
              {checked &&
                oneWayMinutes[side] !== '' &&
                commuteTimeResult.state !== 'calculated' && (
                  <p role="alert">{commuteTimeResult.reason}</p>
                )}
              <div className="offer-remote-work">
                <h3>Remote and home-office terms</h3>
                <p>
                  Working days and office days are shared with the working-time
                  and commute sections. Home-office amounts are monthly and
                  entered separately; no tax or net-pay adjustment is assumed.
                </p>
                <div className="np-field">
                  <label htmlFor={id + '-arrangement'}>
                    {label} work arrangement
                  </label>
                  <select
                    id={id + '-arrangement'}
                    value={remoteEntry.arrangement}
                    onChange={(event) => {
                      const arrangement = event.target
                        .value as RemoteWorkEntry['arrangement']
                      setRemoteEntry(side, { ...remoteEntry, arrangement })
                    }}
                  >
                    <option value="unknown">Not specified</option>
                    <option value="onsite">On-site</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="remote">Fully remote</option>
                  </select>
                </div>
                <div className="np-field">
                  <label htmlFor={id + '-home-allowance'}>
                    {label} employer home-office allowance monthly (EUR)
                  </label>
                  <input
                    id={id + '-home-allowance'}
                    type="text"
                    inputMode="decimal"
                    value={remoteEntry.employerAllowanceMonthlyEur}
                    onChange={(event) => {
                      setRemoteEntry(side, {
                        ...remoteEntry,
                        employerAllowanceMonthlyEur: event.target.value,
                      })
                    }}
                    aria-invalid={
                      checked &&
                      remoteStarted(side) &&
                      remoteResult.state === 'invalid'
                    }
                  />
                </div>
                <div className="np-field">
                  <label htmlFor={id + '-home-costs'}>
                    {label} home-office expenses monthly (EUR)
                  </label>
                  <input
                    id={id + '-home-costs'}
                    type="text"
                    inputMode="decimal"
                    value={remoteEntry.homeOfficeCostMonthlyEur}
                    onChange={(event) => {
                      setRemoteEntry(side, {
                        ...remoteEntry,
                        homeOfficeCostMonthlyEur: event.target.value,
                      })
                    }}
                    aria-invalid={
                      checked &&
                      remoteStarted(side) &&
                      remoteResult.state === 'invalid'
                    }
                  />
                </div>
                {checked &&
                  remoteStarted(side) &&
                  remoteResult.state === 'invalid' && (
                    <p role="alert">
                      {label}: {remoteResult.reason}
                    </p>
                  )}
              </div>
              <div className="offer-actions">
                <button
                  type="button"
                  className="np-button-secondary"
                  onClick={() => {
                    copy(side)
                  }}
                >
                  Copy {label} to {side === 0 ? 'Offer B' : 'Offer A'}
                </button>
                <button
                  type="button"
                  className="np-button-secondary"
                  onClick={() => {
                    setEntry(side, blank())
                    setExtra(side, emptyAdditionalPay())
                    setWorkingEntry(side, blankWorkingTime())
                    setCommuteEntry(side, blankCommuteCostEntry())
                    setOneWayMinutes((current) =>
                      side === 0 ? ['', current[1]] : [current[0], ''],
                    )
                    setRemoteEntry(side, blankRemoteWork())
                  }}
                >
                  Clear {label}
                </button>
              </div>
            </fieldset>
          )
        })}
      </div>
      <VacationComparison offerA={working[0]} offerB={working[1]} />
      <CommuteCostComparison offerA={commuteFor(0)} offerB={commuteFor(1)} />
      <CommuteTimeComparison
        offerA={commuteTimeFor(0)}
        offerB={commuteTimeFor(1)}
      />
      <RemoteWorkComparison offerA={remoteFor(0)} offerB={remoteFor(1)} />
      <div className="offer-review">
        <button
          className="np-button-primary"
          type="button"
          onClick={() => {
            setChecked(true)
          }}
        >
          Check both offers
        </button>
        {checked && accepted && dataIsAdmitted && (
          <p role="status">
            Both base salaries are valid. No net-pay difference is calculated
            yet; working time, tax and insurance assumptions must be checked
            separately.
          </p>
        )}
        {checked && !accepted && (
          <p role="status">
            Complete or correct the offer inputs to continue. Unknown inputs are
            not treated as zero.
          </p>
        )}
      </div>
    </section>
  )
}
