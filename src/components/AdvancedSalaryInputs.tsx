import { useState } from 'react'

import {
  validateAdvancedSalaryDraft,
  type AdvancedSalaryDraft,
} from './advanced-salary-validation'

const empty: AdvancedSalaryDraft = {
  annualTaxAllowanceEur: '',
  annualTaxAdditionEur: '',
  additionalHealthRatePercent: '',
  privateHealthPremiumEur: '',
  privateCarePremiumEur: '',
  oneOffBonusEur: '',
  oneOffBonusMonth: '',
}

export function AdvancedSalaryInputs({
  insurance,
  onErrorsChange,
  onDraftChange,
}: {
  readonly insurance: string
  readonly onErrorsChange: (errors: readonly string[]) => void
  readonly onDraftChange?: (draft: AdvancedSalaryDraft) => void
}) {
  const [draft, setDraft] = useState<AdvancedSalaryDraft>(empty)
  const change = (field: keyof AdvancedSalaryDraft, value: string) => {
    const next = { ...draft, [field]: value }
    setDraft(next)
    onDraftChange?.(next)
    onErrorsChange(validateAdvancedSalaryDraft(next, insurance))
  }
  const errors = validateAdvancedSalaryDraft(draft, insurance)
  const fieldInvalid = (field: keyof AdvancedSalaryDraft): boolean =>
    validateAdvancedSalaryDraft(
      {
        ...empty,
        [field]: draft[field],
        ...(field === 'oneOffBonusEur' || field === 'oneOffBonusMonth'
          ? {
              oneOffBonusEur: draft.oneOffBonusEur,
              oneOffBonusMonth: draft.oneOffBonusMonth,
            }
          : {}),
      },
      insurance,
    ).length > 0
  const description = (
    field: keyof AdvancedSalaryDraft,
    helpId?: string,
  ): string =>
    [
      'np-advanced-help',
      helpId,
      fieldInvalid(field) ? 'np-advanced-errors' : undefined,
    ]
      .filter(Boolean)
      .join(' ')
  return (
    <details className="np-panel">
      <summary>Advanced settings (optional)</summary>
      <p id="np-advanced-help">
        Only fill in items on your payroll record. Amounts are not stored or
        sent to a server.
      </p>
      <div className="np-field">
        <label htmlFor="np-allowance">Annual tax allowance (EUR)</label>
        <input
          id="np-allowance"
          aria-invalid={fieldInvalid('annualTaxAllowanceEur')}
          aria-describedby={
            description('annualTaxAllowanceEur', 'np-allowance-help') ||
            undefined
          }
          inputMode="decimal"
          value={draft.annualTaxAllowanceEur}
          onChange={(event) => {
            change('annualTaxAllowanceEur', event.target.value)
          }}
        />
        <small id="np-allowance-help">
          Use an officially confirmed annual allowance, not a guess.
        </small>
      </div>
      <div className="np-field">
        <label htmlFor="np-addition">Annual taxable addition (EUR)</label>
        <input
          id="np-addition"
          aria-invalid={fieldInvalid('annualTaxAdditionEur')}
          aria-describedby={description('annualTaxAdditionEur') || undefined}
          inputMode="decimal"
          value={draft.annualTaxAdditionEur}
          onChange={(event) => {
            change('annualTaxAdditionEur', event.target.value)
          }}
        />
      </div>
      {insurance === 'statutory' && (
        <div className="np-field">
          <label htmlFor="np-health-rate">
            Insurer-specific additional rate (%)
          </label>
          <input
            id="np-health-rate"
            aria-invalid={fieldInvalid('additionalHealthRatePercent')}
            aria-describedby={
              description(
                'additionalHealthRatePercent',
                'np-health-rate-help',
              ) || undefined
            }
            inputMode="decimal"
            value={draft.additionalHealthRatePercent}
            onChange={(event) => {
              change('additionalHealthRatePercent', event.target.value)
            }}
          />
          <small id="np-health-rate-help">
            Leave blank to use the published average rate assumption.
          </small>
        </div>
      )}
      {insurance === 'private' && (
        <>
          <div className="np-field">
            <label htmlFor="np-private-health">
              Monthly private health premium (EUR)
            </label>
            <input
              id="np-private-health"
              aria-invalid={fieldInvalid('privateHealthPremiumEur')}
              aria-describedby={
                description('privateHealthPremiumEur') || undefined
              }
              inputMode="decimal"
              value={draft.privateHealthPremiumEur}
              onChange={(event) => {
                change('privateHealthPremiumEur', event.target.value)
              }}
            />
          </div>
          <div className="np-field">
            <label htmlFor="np-private-care">
              Monthly private care premium (EUR)
            </label>
            <input
              id="np-private-care"
              aria-invalid={fieldInvalid('privateCarePremiumEur')}
              aria-describedby={
                description('privateCarePremiumEur') || undefined
              }
              inputMode="decimal"
              value={draft.privateCarePremiumEur}
              onChange={(event) => {
                change('privateCarePremiumEur', event.target.value)
              }}
            />
          </div>
        </>
      )}
      <div className="np-field">
        <label htmlFor="np-bonus">One-off bonus (EUR)</label>
        <input
          id="np-bonus"
          aria-invalid={fieldInvalid('oneOffBonusEur')}
          aria-describedby={
            description('oneOffBonusEur', 'np-bonus-help') || undefined
          }
          inputMode="decimal"
          value={draft.oneOffBonusEur}
          onChange={(event) => {
            change('oneOffBonusEur', event.target.value)
          }}
        />
      </div>
      <div className="np-field">
        <label htmlFor="np-bonus-month">Bonus payment month</label>
        <select
          id="np-bonus-month"
          aria-invalid={fieldInvalid('oneOffBonusMonth')}
          aria-describedby={
            description('oneOffBonusMonth', 'np-bonus-help') || undefined
          }
          value={draft.oneOffBonusMonth}
          onChange={(event) => {
            change('oneOffBonusMonth', event.target.value)
          }}
        >
          <option value="">Select month (if applicable)</option>
          {Array.from({ length: 12 }, (_, index) => (
            <option key={index + 1} value={String(index + 1)}>
              {index + 1}
            </option>
          ))}
        </select>
        <small id="np-bonus-help">
          Bonuses are not treated as recurring monthly salary.
        </small>
      </div>
      {errors.length > 0 && (
        <p id="np-advanced-errors" role="alert">
          {errors.join(' ')}
        </p>
      )}
    </details>
  )
}
