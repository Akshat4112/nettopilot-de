import { useRef } from 'react'
import {
  blankBenefit,
  evaluateBenefits,
  type BenefitsEntry,
  type BenefitEntry,
} from '../domain/comparison/benefits'
import type { EuroAmount } from '../domain/salary/types'
import type { OfferInput } from '../domain/comparison/offer-model'

const displayMoney = (value: OfferInput<EuroAmount>): string => {
  if (value.state === 'unknown') return 'Not specified'
  const [whole = '0', fraction = '00'] = value.value.amount.split('.')
  // Format whole euros separately so values near the cent limit never drift.
  return (
    '€' +
    new Intl.NumberFormat('en-GB').format(BigInt(whole)) +
    '.' +
    fraction +
    ' per year'
  )
}

function CertaintyInput({
  id,
  label,
  value,
  onChange,
}: {
  readonly id: string
  readonly label: string
  readonly value: BenefitEntry['certainty']
  readonly onChange: (next: BenefitEntry['certainty']) => void
}) {
  return (
    <div className="np-field">
      <label htmlFor={id}>{label}</label>
      <select
        id={id}
        value={value}
        onChange={(event) => {
          const next = event.target.value
          onChange(
            next === 'guaranteed' || next === 'conditional' ? next : 'unknown',
          )
        }}
      >
        <option value="unknown">Not specified</option>
        <option value="guaranteed">Guaranteed</option>
        <option value="conditional">Conditional</option>
      </select>
    </div>
  )
}

export function OfferBenefitsInputs({
  id,
  label,
  value,
  checked,
  onChange,
}: {
  readonly id: string
  readonly label: string
  readonly value: BenefitsEntry
  readonly checked: boolean
  readonly onChange: (next: BenefitsEntry) => void
}) {
  const sequence = useRef(0)
  const result = evaluateBenefits(value)
  const errorId = id + '-benefits-error'
  const invalid = checked && result.state === 'invalid'
  const setBenefit = (index: number, next: BenefitEntry): void => {
    onChange({
      ...value,
      benefits: value.benefits.map((entry, i) => (i === index ? next : entry)),
    })
  }
  return (
    <div className="offer-benefits">
      <h3>Employer pension and benefits</h3>
      <p>
        Optional annual EUR values. Leave unknown amounts blank; enter zero only
        when confirmed. Pension and benefits remain separate from salary.
      </p>
      <div className="np-field">
        <label htmlFor={id + '-pension'}>
          {label} employer pension annual (EUR)
        </label>
        <input
          id={id + '-pension'}
          type="text"
          inputMode="decimal"
          value={value.employerContributionAnnualEur}
          onChange={(event) => {
            onChange({
              ...value,
              employerContributionAnnualEur: event.target.value,
            })
          }}
          aria-invalid={invalid}
          aria-describedby={invalid ? errorId : undefined}
        />
      </div>
      <CertaintyInput
        id={id + '-pension-certainty'}
        label={label + ' pension certainty'}
        value={value.pensionCertainty}
        onChange={(pensionCertainty) => {
          onChange({ ...value, pensionCertainty })
        }}
      />
      <div className="np-field">
        <label htmlFor={id + '-pension-note'}>
          {label} pension eligibility or vesting note
        </label>
        <input
          id={id + '-pension-note'}
          type="text"
          maxLength={2000}
          value={value.eligibilityOrVestingNote}
          onChange={(event) => {
            onChange({ ...value, eligibilityOrVestingNote: event.target.value })
          }}
        />
      </div>
      {value.benefits.map((benefit, index) => {
        const fieldId = id + '-benefit-' + benefit.id
        const fieldLabel = label + ' benefit ' + String(index + 1)
        return (
          <fieldset key={benefit.id}>
            <legend>{fieldLabel}</legend>
            <div className="np-field">
              <label htmlFor={fieldId + '-label'}>{fieldLabel} label</label>
              <input
                id={fieldId + '-label'}
                type="text"
                maxLength={120}
                value={benefit.label}
                onChange={(event) => {
                  setBenefit(index, { ...benefit, label: event.target.value })
                }}
                aria-invalid={invalid}
                aria-describedby={invalid ? errorId : undefined}
              />
            </div>
            {(
              [
                'employerStatedAnnualValueEur',
                'userAssignedAnnualValueEur',
              ] as const
            ).map((key) => (
              <div className="np-field" key={key}>
                <label htmlFor={fieldId + '-' + key}>
                  {fieldLabel}{' '}
                  {key === 'employerStatedAnnualValueEur'
                    ? 'employer-stated'
                    : 'user-assigned'}{' '}
                  annual value (EUR)
                </label>
                <input
                  id={fieldId + '-' + key}
                  type="text"
                  inputMode="decimal"
                  value={benefit[key]}
                  onChange={(event) => {
                    setBenefit(index, { ...benefit, [key]: event.target.value })
                  }}
                  aria-invalid={invalid}
                  aria-describedby={invalid ? errorId : undefined}
                />
              </div>
            ))}
            <CertaintyInput
              id={fieldId + '-certainty'}
              label={fieldLabel + ' certainty'}
              value={benefit.certainty}
              onChange={(certainty) => {
                setBenefit(index, { ...benefit, certainty })
              }}
            />
            <div className="np-field">
              <label htmlFor={fieldId + '-description'}>
                {fieldLabel} description or eligibility note
              </label>
              <input
                id={fieldId + '-description'}
                type="text"
                maxLength={2000}
                value={benefit.description}
                onChange={(event) => {
                  setBenefit(index, {
                    ...benefit,
                    description: event.target.value,
                  })
                }}
              />
            </div>
            <button
              type="button"
              className="np-button-secondary"
              onClick={() => {
                onChange({
                  ...value,
                  benefits: value.benefits.filter((_, i) => i !== index),
                })
              }}
            >
              Remove {fieldLabel}
            </button>
          </fieldset>
        )
      })}
      <button
        type="button"
        className="np-button-secondary"
        disabled={value.benefits.length >= 20}
        onClick={() => {
          let nextId: string
          do {
            sequence.current += 1
            nextId = id + '-' + String(sequence.current)
          } while (value.benefits.some((entry) => entry.id === nextId))
          onChange({
            ...value,
            benefits: [...value.benefits, blankBenefit(nextId)],
          })
        }}
      >
        Add benefit to {label}
      </button>
      <p>
        Up to 20 benefits per offer. Each annual benefit value may be
        0–1,000,000 EUR.
      </p>
      {invalid && (
        <p id={errorId} role="alert">
          {label}: {result.reason}
        </p>
      )}
      <section aria-label={label + ' pension and benefits summary'}>
        {result.state === 'valid' ? (
          <>
            <p>
              Employer pension:{' '}
              {displayMoney(result.employerPension.employerContributionAnnual)}{' '}
              · Certainty: {result.employerPension.certainty}
            </p>
            {result.employerPension.eligibilityOrVestingNote.state ===
              'provided' && (
              <p>{result.employerPension.eligibilityOrVestingNote.value}</p>
            )}
            {result.benefits.map((benefit) => (
              <div key={benefit.id}>
                <h4>{benefit.label}</h4>
                <p>
                  Employer-stated:{' '}
                  {displayMoney(benefit.employerStatedAnnualValue)}
                </p>
                <p>
                  User-assigned: {displayMoney(benefit.userAssignedAnnualValue)}
                </p>
                <p>Certainty: {benefit.certainty}</p>
                {benefit.description.state === 'provided' && (
                  <p>{benefit.description.value}</p>
                )}
              </div>
            ))}
          </>
        ) : (
          <p>
            Summary unavailable until pension and benefit entries are valid.
          </p>
        )}
        <p>
          Tax treatment is not calculated. Values are shown separately, never
          added together or included in net pay. Pension is not spendable cash;
          no investment return is assumed.
        </p>
      </section>
    </div>
  )
}
