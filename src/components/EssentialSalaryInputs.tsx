import { useState } from 'react'
import { AdvancedSalaryInputs } from './AdvancedSalaryInputs'
import { validateEssentialSalaryDraft } from './essential-salary-validation'
import { SalarySummary } from './SalarySummary'
import { calculateSimpleSalary2026 } from './calculate-simple-salary'
import type { AdvancedSalaryDraft } from './advanced-salary-validation'

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

const emptyAdvanced: AdvancedSalaryDraft = {
  annualTaxAllowanceEur: '',
  annualTaxAdditionEur: '',
  additionalHealthRatePercent: '',
  privateHealthPremiumEur: '',
  privateCarePremiumEur: '',
  oneOffBonusEur: '',
  oneOffBonusMonth: '',
}

const examples = [
  {
    id: 'monthly-class-i',
    label: '€3,500 monthly · Class I · Baden-Württemberg',
    draft: {
      ...empty,
      gross: '3500',
      period: 'monthly',
      taxClass: '1',
      federalState: 'DE-BW',
      churchTax: 'not_liable',
      dateOfBirth: '1995-05-01',
      children: '0',
      insurance: 'statutory',
    },
  },
  {
    id: 'annual-class-iv',
    label: '€48,000 annually · Class IV · Berlin',
    draft: {
      ...empty,
      gross: '48000',
      period: 'annual',
      taxClass: '4',
      federalState: 'DE-BE',
      churchTax: 'not_liable',
      dateOfBirth: '1990-05-01',
      children: '0',
      insurance: 'statutory',
    },
  },
] as const satisfies readonly {
  readonly id: string
  readonly label: string
  readonly draft: EssentialSalaryDraft
}[]

type Field = keyof EssentialSalaryDraft

export function EssentialSalaryInputs() {
  const [draft, setDraft] = useState<EssentialSalaryDraft>(empty)
  const [submitted, setSubmitted] = useState(false)
  const [resetToken, setResetToken] = useState(0)
  const [advancedErrors, setAdvancedErrors] = useState<readonly string[]>([])
  const [advancedDraft, setAdvancedDraft] =
    useState<AdvancedSalaryDraft>(emptyAdvanced)
  const [standardEmploymentConfirmed, setStandardEmploymentConfirmed] =
    useState(false)
  const change = (field: Field, value: string) => {
    setDraft((previous) => ({ ...previous, [field]: value }))
    setSubmitted(false)
    if (field === 'insurance') {
      setResetToken((previous) => previous + 1)
      setAdvancedErrors([])
      setAdvancedDraft(emptyAdvanced)
    }
  }
  const loadExample = (example: EssentialSalaryDraft) => {
    setDraft(example)
    setSubmitted(false)
    setResetToken((previous) => previous + 1)
    setAdvancedErrors([])
    setAdvancedDraft(emptyAdvanced)
    setStandardEmploymentConfirmed(false)
  }
  const fieldErrors = validateEssentialSalaryDraft(draft)
  const errors = [...Object.values(fieldErrors), ...advancedErrors]
  const ready = errors.length === 0
  const calculation =
    submitted && ready && standardEmploymentConfirmed
      ? calculateSimpleSalary2026({
          essential: draft,
          advanced: advancedDraft,
          standardEmploymentConfirmed,
        })
      : null

  const fieldError = (field: keyof EssentialSalaryDraft) =>
    submitted && fieldErrors[field] ? (
      <small id={`np-error-${field}`} role="alert">
        {fieldErrors[field]}
      </small>
    ) : null

  const errorId = (field: keyof EssentialSalaryDraft) =>
    submitted && fieldErrors[field] ? `np-error-${field}` : undefined

  return (
    <section
      className="np-panel salary-inputs"
      aria-labelledby="salary-input-heading"
    >
      <h2 id="salary-input-heading">Salary calculator inputs</h2>
      <p>
        Inputs stay in your browser. A limited 2026 standard-employee estimate
        is available after confirming the payroll assumptions.
      </p>
      <form
        onSubmit={(event) => {
          event.preventDefault()
          setSubmitted(true)
        }}
        noValidate
      >
        <div
          className="salary-actions"
          role="group"
          aria-label="Fictional salary examples"
        >
          <p>
            Try a fictional 2026 example to fill the form. Examples are
            illustrative, not personalized advice. Selecting one resets advanced
            inputs and requires a fresh payroll confirmation.
          </p>
          {examples.map((example) => (
            <button
              key={example.id}
              type="button"
              className="np-button-secondary"
              onClick={() => {
                loadExample(example.draft)
              }}
            >
              Load example: {example.label}
            </button>
          ))}
        </div>
        <div className="np-field">
          <label htmlFor="np-gross">Gross salary (EUR)</label>
          <input
            id="np-gross"
            aria-invalid={submitted && Boolean(fieldErrors.gross)}
            aria-describedby={errorId('gross')}

            type="text"
            inputMode="decimal"
            value={draft.gross}
            onChange={(event) => {
              change('gross', event.target.value)
            }}
            required
          />
          {fieldError('gross')}
        </div>
        <div className="np-field">
          <label htmlFor="np-period">Salary frequency</label>
          <select
            id="np-period"
            aria-invalid={submitted && Boolean(fieldErrors.period)}
            aria-describedby={errorId('period')}

            value={draft.period}
            onChange={(event) => {
              change('period', event.target.value)
            }}
          >
            <option value="monthly">Monthly</option>
            <option value="annual">Annual</option>
          </select>
          {fieldError('period')}
        </div>
        <div className="np-field">
          <label htmlFor="np-year">Tax year</label>
          <select
            id="np-year"
            aria-invalid={submitted && Boolean(fieldErrors.year)}
            aria-describedby={errorId('year')}

            value={draft.year}
            onChange={(event) => {
              change('year', event.target.value)
            }}
          >
            <option value="2026">2026</option>
          </select>
          {fieldError('year')}
        </div>
        <div className="np-field">
          <label htmlFor="np-class">Tax class</label>
          <select
            id="np-class"
            aria-invalid={submitted && Boolean(fieldErrors.taxClass)}
            aria-describedby={errorId('taxClass')}
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
          {fieldError('taxClass')}
        </div>
        <div className="np-field">
          <label htmlFor="np-state">Federal state</label>
          <select
            id="np-state"
            aria-invalid={submitted && Boolean(fieldErrors.federalState)}
            aria-describedby={errorId('federalState')}
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
          {fieldError('federalState')}
        </div>
        <div className="np-field">
          <label htmlFor="np-church">Church-tax liability</label>
          <select
            id="np-church"
            aria-invalid={submitted && Boolean(fieldErrors.churchTax)}
            aria-describedby={errorId('churchTax')}
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
          {fieldError('churchTax')}
        </div>
        <div className="np-field">
          <label htmlFor="np-birth">Date of birth</label>
          <input
            id="np-birth"
            aria-invalid={submitted && Boolean(fieldErrors.dateOfBirth)}
            aria-describedby={errorId('dateOfBirth')}
            type="date"
            value={draft.dateOfBirth}
            required
            onChange={(event) => {
              change('dateOfBirth', event.target.value)
            }}
          />
          {fieldError('dateOfBirth')}
        </div>
        <div className="np-field">
          <label htmlFor="np-children">Number of children</label>
          <input
            id="np-children"
            aria-invalid={submitted && Boolean(fieldErrors.children)}
            aria-describedby={errorId('children')}
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
          {fieldError('children')}
        </div>
        <div className="np-field">
          <label htmlFor="np-insurance">Health insurance</label>
          <select
            id="np-insurance"
            aria-invalid={submitted && Boolean(fieldErrors.insurance)}
            aria-describedby={errorId('insurance')}
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
          {fieldError('insurance')}
        </div>
        <AdvancedSalaryInputs
          key={`${String(resetToken)}-${draft.insurance}`}
          insurance={draft.insurance}
          onErrorsChange={setAdvancedErrors}
          onDraftChange={(next) => {
            setAdvancedDraft(next)
            setSubmitted(false)
          }}
        />
        <div className="np-field">
          <label htmlFor="np-standard-employment">
            <input
              id="np-standard-employment"
              type="checkbox"
              checked={standardEmploymentConfirmed}
              onChange={(event) => {
                setStandardEmploymentConfirmed(event.target.checked)
                setSubmitted(false)
              }}
            />
            I confirm full-year ordinary employment (12 equal payroll months),
            compulsory GKV health insurance, standard statutory pension and
            unemployment insurance, and no special payroll treatment.
          </label>
          <small>
            This confirmation does not cover bonuses, children, private health
            insurance, church tax, allowance adjustments or special employment.
            Unsupported cases will not show a fabricated net salary.
          </small>
        </div>
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
              setAdvancedDraft(emptyAdvanced)
              setStandardEmploymentConfirmed(false)
            }}
          >
            Reset
          </button>
        </div>
        {submitted && (
          <div role="status" aria-live="polite">
            {ready
              ? 'Essential inputs complete. Confirm standard employment details to view the limited calculation.'
              : errors.join(' ')}
          </div>
        )}
      </form>
      {calculation !== null && <SalarySummary result={calculation} />}
    </section>
  )
}
