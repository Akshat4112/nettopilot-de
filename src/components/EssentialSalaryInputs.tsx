import { useState } from 'react'
import { AdvancedSalaryInputs } from './AdvancedSalaryInputs'

const stateOptions = [
  ['DE-BB', 'Brandenburg'],
  ['DE-BE', 'Berlin'],
  ['DE-BW', 'Baden-Württemberg'],
  ['DE-BY', 'Bavaria'],
  ['DE-HB', 'Bremen'],
  ['DE-HE', 'Hesse'],
  ['DE-HH', 'Hamburg'],
  ['DE-MV', 'Mecklenburg-Vorpommern'],
  ['DE-NI', 'Lower Saxony'],
  ['DE-NW', 'North Rhine-Westphalia'],
  ['DE-RP', 'Rhineland-Palatinate'],
  ['DE-SH', 'Schleswig-Holstein'],
  ['DE-SL', 'Saarland'],
  ['DE-SN', 'Saxony'],
  ['DE-ST', 'Saxony-Anhalt'],
  ['DE-TH', 'Thuringia'],
] as const

export interface EssentialSalaryDraft {
  readonly gross: string
  readonly period: 'monthly' | 'annual'
  readonly year: '2026'
  readonly taxClass: string
  readonly federalState: string
  readonly churchTax: '' | 'liable' | 'not_liable' | 'unknown'
  readonly dateOfBirth: string
  readonly children: string
  readonly insurance: '' | 'statutory' | 'private' | 'unknown'
}

const empty: EssentialSalaryDraft = {
  gross: '',
  period: 'monthly',
  year: '2026',
  taxClass: '',
  federalState: '',
  churchTax: '',
  dateOfBirth: '',
  children: '',
  insurance: '',
}

type Field = keyof EssentialSalaryDraft

export function EssentialSalaryInputs() {
  const [draft, setDraft] = useState<EssentialSalaryDraft>(empty)
  const [submitted, setSubmitted] = useState(false)
  const [resetToken, setResetToken] = useState(0)
  const [advancedErrors, setAdvancedErrors] = useState<readonly string[]>([])
  const change = (field: Field, value: string) => {
    setDraft((previous) => ({ ...previous, [field]: value }))
    setSubmitted(false)
    if (field === 'insurance') {
      setResetToken((previous) => previous + 1)
      setAdvancedErrors([])
    }
  }
  const errors: string[] = []
  const gross = Number(draft.gross)
  if (
    !draft.gross ||
    !/^(?:0|[1-9]\d*)(?:\.\d{1,2})?$/.test(draft.gross) ||
    gross <= 0 ||
    gross * (draft.period === 'monthly' ? 12 : 1) > 10000000
  ) {
    errors.push('Enter a positive gross salary within the supported range.')
  }
  if (
    !draft.taxClass ||
    !draft.federalState ||
    !draft.churchTax ||
    !draft.dateOfBirth ||
    !draft.children ||
    !draft.insurance
  ) {
    errors.push('Complete all required personal and insurance details.')
  }
  if (
    draft.dateOfBirth &&
    (draft.dateOfBirth > '2026-12-31' || draft.dateOfBirth < '1900-01-01')
  ) {
    errors.push('Enter a valid date of birth.')
  }
  if (
    draft.children &&
    (!/^\d{1,2}$/.test(draft.children) || Number(draft.children) > 20)
  ) {
    errors.push('Enter a valid number of children.')
  }
  if (draft.churchTax === 'unknown' || draft.insurance === 'unknown') {
    errors.push('Resolve unknown payroll choices before calculating.')
  }
  errors.push(...advancedErrors)
  const ready = errors.length === 0

  return (
    <section
      className="np-panel salary-inputs"
      aria-labelledby="salary-input-heading"
    >
      <h2 id="salary-input-heading">Salary calculator inputs</h2>
      <p>
        Inputs are kept in your browser. This preview does not yet calculate net
        salary.
      </p>
      <form
        onSubmit={(event) => {
          event.preventDefault()
          setSubmitted(true)
        }}
        noValidate
      >
        <div className="np-field">
          <label htmlFor="np-gross">Gross salary (EUR)</label>
          <input
            id="np-gross"
            type="text"
            inputMode="decimal"
            value={draft.gross}
            onChange={(event) => {
              change('gross', event.target.value)
            }}
            required
          />
        </div>
        <div className="np-field">
          <label htmlFor="np-period">Salary frequency</label>
          <select
            id="np-period"
            value={draft.period}
            onChange={(event) => {
              change('period', event.target.value)
            }}
          >
            <option value="monthly">Monthly</option>
            <option value="annual">Annual</option>
          </select>
        </div>
        <div className="np-field">
          <label htmlFor="np-year">Tax year</label>
          <select
            id="np-year"
            value={draft.year}
            onChange={(event) => {
              change('year', event.target.value)
            }}
          >
            <option value="2026">2026</option>
          </select>
        </div>
        <div className="np-field">
          <label htmlFor="np-class">Tax class</label>
          <select
            id="np-class"
            value={draft.taxClass}
            required
            onChange={(event) => {
              change('taxClass', event.target.value)
            }}
          >
            <option value="">Choose tax class</option>
            {[1, 2, 3, 4, 5, 6].map((value) => (
              <option key={value} value={String(value)}>
                Class {value}
              </option>
            ))}
          </select>
        </div>
        <div className="np-field">
          <label htmlFor="np-state">Federal state</label>
          <select
            id="np-state"
            required
            value={draft.federalState}
            onChange={(event) => {
              change('federalState', event.target.value)
            }}
          >
            <option value="">Choose state</option>
            {stateOptions.map(([code, label]) => (
              <option key={code} value={code}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div className="np-field">
          <label htmlFor="np-church">Church-tax liability</label>
          <select
            id="np-church"
            required
            value={draft.churchTax}
            onChange={(event) => {
              change('churchTax', event.target.value)
            }}
          >
            <option value="">Choose status</option>
            <option value="liable">Liable</option>
            <option value="not_liable">Not liable</option>
            <option value="unknown">I don't know</option>
          </select>
        </div>
        <div className="np-field">
          <label htmlFor="np-birth">Date of birth</label>
          <input
            id="np-birth"
            type="date"
            value={draft.dateOfBirth}
            required
            onChange={(event) => {
              change('dateOfBirth', event.target.value)
            }}
          />
        </div>
        <div className="np-field">
          <label htmlFor="np-children">Number of children</label>
          <input
            id="np-children"
            type="number"
            min="0"
            max="20"
            step="1"
            value={draft.children}
            required
            onChange={(event) => {
              change('children', event.target.value)
            }}
          />
        </div>
        <div className="np-field">
          <label htmlFor="np-insurance">Health insurance</label>
          <select
            id="np-insurance"
            required
            value={draft.insurance}
            onChange={(event) => {
              change('insurance', event.target.value)
            }}
          >
            <option value="">Choose insurance</option>
            <option value="statutory">Statutory (GKV)</option>
            <option value="private">Private (PKV)</option>
            <option value="unknown">I don't know</option>
          </select>
        </div>
        <AdvancedSalaryInputs
          key={`${resetToken}-${draft.insurance}`}
          insurance={draft.insurance}
          resetToken={resetToken}
          onErrorsChange={setAdvancedErrors}
        />
        <div className="salary-actions">
          <button type="submit" className="np-button-primary">
            Check inputs
          </button>
          <button
            type="button"
            className="np-button-secondary"
            onClick={() => {
              setDraft(empty)
              setSubmitted(false)
              setResetToken((previous) => previous + 1)
              setAdvancedErrors([])
            }}
          >
            Reset
          </button>
        </div>
        {submitted && (
          <div role="status" aria-live="polite">
            {ready
              ? 'Essential inputs complete. Calculation is not yet available.'
              : errors.join(' ')}
          </div>
        )}
      </form>
    </section>
  )
}
