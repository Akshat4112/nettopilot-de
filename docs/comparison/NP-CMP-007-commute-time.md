# NP-CMP-007 — Annual commute-time contract

Commute **time** is a separate dimension from transport **cost**. The user
enters whole one-way minutes for each offer, together with contractual
working days, expected office days per week and paid vacation days per year.

Expected annual office days follow the same 52-week convention as
NP-CMP-006: `office days per week × (52 − paid vacation / workdays per week)`.

Annual commute hours are calculated from exact rational minutes:
`annual office days × one-way minutes × 2 / 60`. Round **once** half-up
to 0.01 hour; never round office attendance to whole days first.

Unknown inputs remain unavailable. Explicit zero means zero travel time or
confirmed zero office days, rather than an inferred remote arrangement.
Public holidays, sickness, overtime and unpaid leave are excluded from the
estimate, and the UI must say so.

No conversion of commute hours to euro value, net pay or ranked job offers
is included in NP-CMP-007. Later effective-hourly compensation is a separate
task.
