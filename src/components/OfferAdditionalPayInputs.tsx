import type { AdditionalPayEntry } from './offer-additional-pay'

export function OfferAdditionalPayInputs({
  id,
  label,
  value,
  onChange,
  errorId,
}: {
  readonly errorId?: string | undefined
  readonly id: string
  readonly label: string
  readonly value: AdditionalPayEntry
  readonly onChange: (next: AdditionalPayEntry) => void
}) {
  const description = [id + '-additional-help', errorId]
    .filter(Boolean)
    .join(' ')
  return (
    <div
      className="offer-extra"
      role="group"
      aria-invalid={Boolean(errorId)}
      aria-describedby={description}
      aria-label={label + ' additional compensation'}
    >
      <h3>Additional compensation</h3>
      <p id={id + '-additional-help'}>
        Optional amounts are not guaranteed take-home pay. Expected variable
        compensation is annual; one-time payments retain their payout month.
      </p>
      <div className="np-field">
        <label htmlFor={id + '-variable'}>
          {label} expected annual variable pay (EUR)
        </label>
        <input
          id={id + '-variable'}
          aria-describedby={description}
          type="text"
          inputMode="decimal"
          value={value.expectedVariableEur}
          onChange={(event) => {
            onChange({ ...value, expectedVariableEur: event.target.value })
          }}
        />
      </div>
      <div className="np-field">
        <label htmlFor={id + '-oneoff'}>{label} one-time payment (EUR)</label>
        <input
          id={id + '-oneoff'}
          aria-describedby={description}
          type="text"
          inputMode="decimal"
          value={value.oneOffEur}
          onChange={(event) => {
            onChange({ ...value, oneOffEur: event.target.value })
          }}
        />
      </div>
      <div className="np-field">
        <label htmlFor={id + '-month'}>{label} one-time payment month</label>
        <select
          id={id + '-month'}
          aria-describedby={description}
          value={value.oneOffMonth}
          onChange={(event) => {
            onChange({ ...value, oneOffMonth: event.target.value })
          }}
        >
          <option value="">Not set</option>
          {Array.from({ length: 12 }, (_, index) => (
            <option key={index + 1} value={String(index + 1)}>
              Month {index + 1}
            </option>
          ))}
        </select>
      </div>
      <div className="np-field">
        <label htmlFor={id + '-oneoff-guarantee'}>
          {label} one-time payment certainty
        </label>
        <select
          id={id + '-oneoff-guarantee'}
          aria-describedby={description}
          value={value.oneOffGuarantee}
          onChange={(event) => {
            onChange({
              ...value,
              oneOffGuarantee:
                event.target.value === 'guaranteed' ? 'guaranteed' : 'variable',
            })
          }}
        >
          <option value="variable">Expected / variable</option>
          <option value="guaranteed">Guaranteed</option>
        </select>
      </div>
      <div className="np-field">
        <label htmlFor={id + '-oneoff-classification'}>
          {label} one-time payment type
        </label>
        <select
          id={id + '-oneoff-classification'}
          aria-describedby={description}
          value={value.oneOffClassification}
          onChange={(event) => {
            onChange({
              ...value,
              oneOffClassification: event.target
                .value as AdditionalPayEntry['oneOffClassification'],
            })
          }}
        >
          <option value="performance_bonus">Performance bonus</option>
          <option value="thirteenth_salary">13th salary</option>
          <option value="christmas_payment">Christmas payment</option>
          <option value="holiday_payment">Holiday payment</option>
          <option value="gratuity">Gratuity</option>
        </select>
      </div>
    </div>
  )
}
