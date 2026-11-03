import type { CommuteCostEntry } from '../domain/comparison/commute-costs'

type CostField =
  | 'publicTransportPerOfficeDayEur'
  | 'fuelPerOfficeDayEur'
  | 'parkingPerOfficeDayEur'
  | 'otherPerOfficeDayEur'

const categories: readonly { key: CostField; label: string }[] = [
  { key: 'publicTransportPerOfficeDayEur', label: 'Public transport' },
  { key: 'fuelPerOfficeDayEur', label: 'Fuel' },
  { key: 'parkingPerOfficeDayEur', label: 'Parking' },
  { key: 'otherPerOfficeDayEur', label: 'Other costs' },
]

export function OfferCommuteCostInputs({
  id,
  label,
  value,
  onChange,
  errorId,
}: {
  readonly errorId?: string | undefined
  readonly id: string
  readonly label: string
  readonly value: CommuteCostEntry
  readonly onChange: (next: CommuteCostEntry) => void
}) {
  const description = [id + '-commute-help', errorId].filter(Boolean).join(' ')
  return (
    <div
      className="offer-commute-inputs"
      role="group"
      aria-label={label + ' commute costs'}
      aria-invalid={Boolean(errorId)}
      aria-describedby={description}
    >
      <h3>Commute costs</h3>
      <p id={id + '-commute-help'}>
        Enter costs per office day. Use 0 for a confirmed free category; leave
        unknown amounts blank. Paid vacation and workdays are shared with this
        offer’s working-time inputs.
      </p>
      <div className="np-field">
        <label htmlFor={id + '-office-days'}>
          {label} office days per week
        </label>
        <select
          id={id + '-office-days'}
          aria-describedby={description}
          value={value.officeDaysPerWeek}
          onChange={(event) => {
            onChange({ ...value, officeDaysPerWeek: event.target.value })
          }}
        >
          <option value="">Not specified</option>
          {Array.from({ length: 8 }, (_, index) => (
            <option key={index} value={String(index)}>
              {index}
            </option>
          ))}
        </select>
      </div>
      {categories.map(({ key, label: category }) => (
        <div className="np-field" key={key}>
          <label htmlFor={id + '-' + key}>
            {label} {category.toLowerCase()} per office day (EUR)
          </label>
          <input
            id={id + '-' + key}
            aria-describedby={description}
            type="text"
            inputMode="decimal"
            value={value[key]}
            onChange={(event) => {
              onChange({ ...value, [key]: event.target.value })
            }}
          />
        </div>
      ))}
    </div>
  )
}
