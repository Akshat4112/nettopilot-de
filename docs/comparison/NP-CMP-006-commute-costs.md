# NP-CMP-006 — Commute cost contract

All four cost categories (public transport, fuel, parking and other) are
**user-entered costs per office day**. No fare, distance, vehicle consumption,
tax-deductibility, fuel price or employer reimbursement is inferred.

Annual office-day estimate follows the NP-CMP-004 time convention:

`office days per week × (52 − annual vacation days / working days per week)`

The result is an estimate: fractional expected office days may arise from
proportional vacation adjustments. A cost-category's annual cents are rounded
half-up from its exact rational value; annual total is the sum of the four
independently rounded category amounts. This keeps visible line items
reconciled with their total.

All categories must be entered explicitly. Enter `0` for confirmed free
categories; a blank field remains unknown and makes the total unavailable.
Working days per week, office days per week and annual paid vacation must
be provided and within physically valid ranges.

Commuting time stays separate from these monetary costs. Expenses are not
subtracted from payroll net income without an explicit future adjusted-view
calculation; there is no employment-offer winner score.
