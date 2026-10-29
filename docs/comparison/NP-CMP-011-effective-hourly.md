# NP-CMP-011 — Effective hourly compensation

This user-adjusted comparison estimate combines the existing annual base-pay
net, entered commute costs and documented work/commute time measures:

`effective hourly net = (annual net payroll − annual entered commute costs) / (annual contractual work hours + annual commute hours)`

The original annual net stays visible beside the adjustment. This does not
alter payroll, assign a euro value to travel time, or produce an overall offer
score. Benefits, employer pension benefits, employer social contributions and
personal benefit valuations do not enter the numerator. The current admitted
payroll view supports base salary only; additional pay remains subject to the
existing payroll admission rules.

## Calculation basis

- Annual net comes from each current `OfferNetCompensationResult` offer, using
  the supported 2026 salary calculation. It is never inferred from monthly net.
- NP-CMP-006 supplies annual costs in integer EUR cents. Every daily category
  must be entered, including explicit zero for a confirmed free category.
- NP-CMP-004 supplies annual contractual hours in hundredths of an hour:
  `weekly hours × (52 − paid vacation / working days per week)`.
- NP-CMP-007 supplies round-trip annual commute hours in hundredths of an hour:
  `office days × (52 − paid vacation / working days per week) × one-way minutes × 2 / 60`.
- These existing time modules round their respective annual outputs half-up to
  0.01 hour. The denominator adds those documented outputs. No further hour
  rounding or whole-day rounding is introduced.
- Working days and paid leave must agree across all three schedules; cost and
  time must share office frequency. Each offer may have its own schedule.
- Public holidays, sickness, overtime, unpaid leave and actual clocked hours are
  excluded. This is an estimate per work-plus-commute hour, not a payslip rate.

Hourly arithmetic uses BigInt rational division and final half-up rounding to
integer EUR cents per hour. Negative adjusted net is allowed when entered costs
exceed net; ties round away from zero. The signed difference is Offer B minus
Offer A, calculated from the exact ratios before rounding the difference to
cents. Subtracting the two displayed rounded hourly amounts can therefore differ
from the displayed delta by one cent. Swapping the offers reverses the delta.

## Missing and unavailable results

Each offer is evaluated independently. An incomplete or unsupported payroll
result retains its original reason. Missing or invalid time/cost inputs retain
the affected input's reason. An unknown input never means zero. Mismatched
schedules are invalid, and zero total annual hours makes the hourly rate
unavailable. A usable offer remains visible when the other is blocked, while
the pair delta is withheld.

## Integration

`EffectiveHourlyComparison` accepts `netResult`, `working`, `commuteCosts` and
`commuteTime`. Each input tuple contains current raw entries for Offer A and
Offer B. Render the component after the current payroll results using the same
freshly calculated `netResult`. It recalculates directly from props on every
render; it stores no result and does not read browser persistence.

The pure `calculateEffectiveHourlyComparison` uses the same input interface and
returns independent offer results and a comparable/unavailable B-minus-A result.
