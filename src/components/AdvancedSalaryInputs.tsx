import { useState } from 'react'

export interface AdvancedSalaryDraft {
  readonly annualTaxAllowanceEur: string
  readonly annualTaxAdditionEur: string
  readonly additionalHealthRatePercent: string
  readonly privateHealthPremiumEur: string
  readonly privateCarePremiumEur: string
  readonly oneOffBonusEur: string
  readonly oneOffBonusMonth: string
}

const empty: AdvancedSalaryDraft = {
  annualTaxAllowanceEur: '',
  annualTaxAdditionEur: '',
  additionalHealthRatePercent: '',
  privateHealthPremiumEur: '',
  privateCarePremiumEur: '',
  oneOffBonusEur: '',
  oneOffBonusMonth: '',
}

const euro = (value: string): boolean =>
  value === '' || /^(?:0|[1-9]\d{0,7})(?:\.\d{1,2})?$/.test(value)

export function validateAdvancedSalaryDraft(
  draft: AdvancedSalaryDraft,
  insurance: string,
): readonly string[] {
  const errors: string[] = []
  for (const [field, value] of [
    ['Annual allowance', draft.annualTaxAllowanceEur],
    ['Annual addition', draft.annualTaxAdditionEur],
    ['Private health premium', draft.privateHealthPremiumEur],
    ['Private care premium', draft.privateCarePremiumEur],
    ['One-off bonus', draft.oneOffBonusEur],
  ]) {
    if (!euro(value))
      errors.push(
        field + ' must be a non-negative EUR amount with up to two decimals.',
      )
  }
  if (
    draft.additionalHealthRatePercent &&
    (!/^\d{1,2}(?:\.\d{1,3})?$/.test(draft.additionalHealthRatePercent) ||
      Number(draft.additionalHealthRatePercent) > 10)
  )
    errors.push('Additional statutory health rate must be between 0 and 10%.')
  if (
    draft.oneOffBonusEur &&
    (!draft.oneOffBonusMonth ||
      Number(draft.oneOffBonusMonth) < 1 ||
      Number(draft.oneOffBonusMonth) > 12)
  )
    errors.push('Choose a payment month for the one-off bonus.')
  if (!draft.oneOffBonusEur && draft.oneOffBonusMonth)
    errors.push('Enter the one-off amount or clear the payment month.')
  if (
    insurance !== 'private' &&
    (draft.privateHealthPremiumEur || draft.privateCarePremiumEur)
  )
    errors.push(
      'Private premiums are available only with private health insurance.',
    )
  if (insurance !== 'statutory' && draft.additionalHealthRatePercent)
    errors.push(
      'Statutory additional rate is available only with statutory health insurance.',
    )
  return errors
}

export function AdvancedSalaryInputs({
  insurance,
  resetToken,
  onErrorsChange,
}: {
  readonly insurance: string
  readonly resetToken: number
  readonly onErrorsChange: (errors: readonly string[]) => void
}) {
  const [previousResetToken, setPreviousResetToken] = useState(resetToken)
  const [draft, setDraft] = useState<AdvancedSalaryDraft>(empty)
  const [expanded, setExpanded] = useState(false)
  if (previousResetToken !== resetToken) {
    setPreviousResetToken(resetToken)
    setDraft(empty)
    setExpanded(false)
  }
  const change = (field: keyof AdvancedSalaryDraft, value: string) => {
    const next = { ...draft, [field]: value }
    setDraft(next)
    onErrorsChange(validateAdvancedSalaryDraft(next, insurance))
  }
  return (
    <details
      open={expanded}
      onToggle={(event) => {
        setExpanded(event.currentTarget.open)
      }}
      className="np-panel"
    >
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
          onChange={(event) =>
            change('annualTaxAllowanceEur', event.target.value)
          }
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
          onChange={(event) =>
            change('annualTaxAdditionEur', event.target.value)
          }
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
            onChange={(event) =>
              change('additionalHealthRatePercent', event.target.value)
            }
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
              onChange={(event) =>
                change('privateHealthPremiumEur', event.target.value)
              }
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
              onChange={(event) =>
                change('privateCarePremiumEur', event.target.value)
              }
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
          onChange={(event) => change('oneOffBonusEur', event.target.value)}
        />
      </div>
      <div className="np-field">
        <label htmlFor="np-bonus-month">Bonus payment month</label>
        <select
          id="np-bonus-month"
          value={draft.oneOffBonusMonth}
          onChange={(event) => change('oneOffBonusMonth', event.target.value)}
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
