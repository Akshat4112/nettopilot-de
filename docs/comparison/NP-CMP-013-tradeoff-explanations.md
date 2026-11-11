# NP-CMP-013 — Explain entered comparison factors

The comparison explains which current entered dimensions account for differences, without an overall recommendation, combined valuation or inferred preferences. The implementation is deterministic browser code; it uses no language model, external requests, persistence or expanded payroll rules.

## Shared source of truth

`offer-comparison-metrics.ts` extracts the current-props projection previously used by `OfferComparisonSummary`. It reuses the existing working-time, commute-cost/time, remote, benefits and effective-hourly evaluators, retains their reasons and unknown states, and preserves exact integer-cent formatting and the canonical exact-ratio hourly difference. The summary's public input type and twelve rows stay compatible.

`explainOfferComparison` consumes these same typed metrics and returns five explanation sections. `OfferComparisonTradeoffs` presents a concise current primary fact in each native disclosure summary; opening it reveals A/B values, factual differences, reasons and calculation basis. The section is rendered only inside requested current results, so reset, live invalidation, keyboard focus and existing print/URL privacy boundaries apply unchanged.

## Facts and boundaries

- **Pay:** annual base gross, payroll deductions and base-pay net. Payroll deductions are canonical annual gross minus payroll net, rather than `allDeductionsCents`, which can include an out-of-payroll private-insurance outflow. Per-offer reconciliation and B − A reconciliation describe admitted payroll results, without estimating isolated tax effects.
- **Commuting adjustment:** annual payroll net minus entered annual commute costs. Unknown costs never imply zero. Costs use entered office frequency, paid vacation and daily categories; no route prices, transport choices, tax deduction or home-office saving is inferred.
- **Effective hourly:** adjusted annual net divided by annual contractual work plus commute hours. Both numerator and denominator are shown. Mismatched or otherwise invalid inputs are named as unavailable and are not presented as a usable formula. No euro value or causal weight is assigned to time. Hourly deltas use the existing exact ratios and independent final cent rounding. A zero-cent hourly difference is described as rounded to zero, not proof that the exact rates are equal.
- **Time and location:** modelled annual work/commute hours, entered paid-vacation day counts and remote days. Vacation counts are qualified by each offer's working days per week; different weekly schedules do not make raw counts equivalent leave durations. Time retains the 52-week/paid-leave convention, two commute trips per office day, 0.01-hour rounding and exclusions for public holidays, sickness, overtime and unpaid leave.
- **Separate benefits:** pension, employer-stated values and user-assigned personal valuations remain separate annual EUR terms. They are not added to net pay or to one another. Certainty, eligibility and vesting remain qualified in the inputs; personal valuations are not guaranteed employer payments.

Only pairs with current usable values get factual directions or ties. Known opposite-side values and independent dimensions remain visible when another value is missing or unsupported. Confirmed zero remains distinct from missing amounts. No wage allocation, benefit valuation, ranking, score or preference is inferred.

## Verification

Meaningful RED/GREEN tests cover missing result integration, shared projection compatibility, gross/net payroll deductions independent of private outflow, current blocked-side preservation, unknown/zero values, swapped directions and equal values, differing weekly vacation bases, independent commute invalidation, mismatched hourly schedules, safe-integer-limit pension cents, and canonical hourly rounding (10.56/13.33 with a 2.78 difference, plus differing displayed rates whose difference rounds to zero). Browser checks exercise visible facts, native disclosure keyboard behavior, current invalidation, retained valid opposite-side reconciliation, reset and print/URL privacy, with 375px and 1280px visual artifacts.
