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
}: {
  readonly insurance: string
  readonly onErrorsChange: (errors: readonly string[]) => void
}) {
  const [draft, setDraft] = useState<AdvancedSalaryDraft>(empty)
  const change = (field: keyof AdvancedSalaryDraft, value: string) => {
    const next = { ...draft, [field]: value }
    setDraft(next)
    onErrorsChange(validateAdvancedSalaryDraft(next, insurance))
  }
  return (
    <details className="np-panel">
      <summary>Advanced settings (optional)</summary>
      <p>
        Only fill in items on your payroll record. Amounts are not stored or
        sent to a server.
      </p>
      <div className="np-field">
        <label htmlFor="np-allowance">Annual tax allowance (EUR)</label>
        <input
          id="np-allowance"
          inputMode="decimal"
          value={draft.annualTaxAllowanceEur}
          onChange={(event) => {
            change('annualTaxAllowanceEur', event.target.value)
          }}
        />
        <small>
          Use an officially confirmed annual allowance, not a guess.
        </small>
      </div>
      <div className="np-field">
        <label htmlFor="np-addition">Annual taxable addition (EUR)</label>
        <input
          id="np-addition"
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
            inputMode="decimal"
            value={draft.additionalHealthRatePercent}
            onChange={(event) => {
              change('additionalHealthRatePercent', event.target.value)
            }}
          />
          <small>
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
        <small>Bonuses are not treated as recurring monthly salary.</small>
      </div>
    </details>
  )
}
