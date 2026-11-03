# NP-CMP-004 — Working-time calculation contract

This is a **standardized comparison estimate**, not a record of hours worked.

Use explicit inputs for contractual weekly hours, contractual working days
per week, and annual paid vacation days. If any are missing, do not fabricate
an annual-hours measure.

Annual contractual hours are estimated as

`weekly hours × (52 − annual paid vacation days / working days per week)`

The common convention uses **52 calendar weeks**. It deliberately does not
subtract public holidays, sickness, overtime, or unpaid leave because these
depend on additional inputs and rules. Annual-hours results are rounded
half-up to 0.01 hour only at output. Invalid working schedules are rejected.

For Offer A and Offer B, maintain separate inputs and calculation results.
The comparison does not assign a cash price to leave, calculate hourly net
pay, or rank the offers. Those are separate tasks.
