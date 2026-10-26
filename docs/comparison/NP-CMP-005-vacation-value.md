# NP-CMP-005 — Paid vacation comparison

Paid annual vacation days are an employment condition, not an amount of income.

When weekly hours, working days per week and paid vacation days are **all**
supplied for both offers, show each offer's paid vacation and annual
contractual hours, plus signed **Offer B minus Offer A** differences. Calculate
the hours via NP-CMP-004's standard 52-week convention. Both sides keep
independent schedules; a 4-day and 5-day week cannot be treated as the same.

The annual-hours values are *denominators* that can affect later effective
hourly compensation calculations. NP-CMP-005 does **not** calculate net pay,
assign an invented euro value to holidays, or infer missing inputs. Future
NP-CMP-010/011 work must supply verified payroll outputs before hourly net is
shown.

Public holidays, overtime, illness and unpaid leave are excluded from this
estimate and identified visibly. No inputs are sent to a backend or written to
the share URL.
