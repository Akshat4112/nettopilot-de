import { useState } from 'react'
import { OfferAdditionalPayInputs } from './OfferAdditionalPayInputs'
import { OfferWorkingTimeInputs } from './OfferWorkingTimeInputs'
import { VacationComparison } from './VacationComparison'
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
  const [additional, setAdditional] = useState<
    readonly [AdditionalPayEntry, AdditionalPayEntry]
  >([emptyAdditionalPay(), emptyAdditionalPay()])

  const setWorkingEntry = (side: 0 | 1, next: WorkingTimeEntry) => {
    setWorking((current) =>
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
    setChecked(false)
  }
  const validation = offers.map(validateOfferSalary)
  const extrasValid = additional.every(
    (entry) => validateAdditionalPay(entry).length === 0,
  )
  const workingValid = working.every((entry) => {
    const empty = Object.values(entry).every((value) => value === '')
    return empty || calculateAnnualContractualHours(entry).state === 'calculated'
  })
  const accepted =
    extrasValid && workingValid &&
    validation.every((result) => result.state === 'valid')
  const model = attachWorkingTime(
    applyAdditionalPay(
      buildOfferPairFromEntries(offers[0], offers[1]),
      additional,
    ),
    working,
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
          const timeEntry = working[side]
          const timeResult = calculateAnnualContractualHours(timeEntry)
          const timeStarted = Object.values(timeEntry).some((value) => value !== '')
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
