import type { WorkingTimeEntry } from '../domain/comparison/working-time'

export function OfferWorkingTimeInputs({
  id,
  label,
  value,
  onChange,
  errorId,
}: {
  readonly errorId?: string | undefined
  readonly id: string
  readonly label: string
  readonly value: WorkingTimeEntry
  readonly onChange: (next: WorkingTimeEntry) => void
}) {
  const description = [id + '-working-help', errorId].filter(Boolean).join(' ')
  return (
    <div
      className="offer-working-time"
      role="group"
      aria-label={label + ' working time and vacation'}
      aria-invalid={Boolean(errorId)}
      aria-describedby={description}
    >
      <h3>Working time and vacation</h3>
      <p id={id + '-working-help'}>
        Optional, contractual terms. No public holidays or overtime are deducted
        from the standardized 52-week estimate.
      </p>
      <div className="np-field">
        <label htmlFor={id + '-weekly-hours'}>
          {label} contractual weekly hours
        </label>
        <input
          id={id + '-weekly-hours'}
          aria-describedby={description}
          type="text"
          inputMode="decimal"
          value={value.weeklyHours}
          onChange={(event) => {
            onChange({ ...value, weeklyHours: event.target.value })
          }}
        />
      </div>
      <div className="np-field">
        <label htmlFor={id + '-working-days'}>
          {label} working days per week
        </label>
        <select
          id={id + '-working-days'}
          aria-describedby={description}
          value={value.workingDaysPerWeek}
          onChange={(event) => {
            onChange({ ...value, workingDaysPerWeek: event.target.value })
          }}
        >
          <option value="">Not specified</option>
          {Array.from({ length: 7 }, (_, index) => (
            <option key={index + 1} value={String(index + 1)}>
              {index + 1}
            </option>
          ))}
        </select>
      </div>
      <div className="np-field">
        <label htmlFor={id + '-vacation-days'}>
          {label} paid vacation days per year
        </label>
        <input
          id={id + '-vacation-days'}
          aria-describedby={description}
          type="text"
          inputMode="numeric"
          value={value.paidVacationDaysAnnual}
          onChange={(event) => {
            onChange({
              ...value,
              paidVacationDaysAnnual: event.target.value,
            })
          }}
        />
      </div>
    </div>
  )
}
