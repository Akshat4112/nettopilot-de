# NP-CMP-009 — Employer pension and personal benefit values

Each offer independently captures the annual employer pension contribution in
EUR, its certainty (unknown, guaranteed or conditional), and an optional
eligibility or vesting note. This records the employer contribution only;
employee salary conversion, pension tax treatment and future pension outcomes
are outside this simplified comparison.

Users can add and remove up to 20 named benefit rows per offer. Each row has a
stable id, certainty, an optional description, and two independent annual EUR values:

- Employer-stated annual value: the employer's advertised or declared value.
- User-assigned annual value: the user's personal estimate of usefulness.

An employer-stated value never supplies a missing personal value. The two values
are alternative perspectives on the same benefit and are never added together.
Users should enter each benefit once; the tool cannot infer whether a generic
benefit duplicates a pension, cash payment, remote-work allowance or another row.
These captured figures are excluded from cash compensation and payroll totals.
There is no benefit total, cash equivalent, net value, tax saving, deduction or
claim about tax exemption. The evaluation explicitly reports
`taxTreatment: 'not_calculated'` and `cashIntegration: 'excluded'`.

Blank monetary inputs remain unknown. Explicit zero stays a provided EUR 0.00.
Annual amounts accept non-negative decimal text with at most two decimals.
Each employer-stated or user-assigned benefit value is limited to EUR 1,000,000,
and trimmed benefit labels must contain 1–120 characters, as specified in
[NP-PD-004 §6](../product/NP-PD-004-salary-calculator-inputs.md#6-comparison-only-inputs).
Parsing and formatting use integer cents. The pension contribution retains the safe maximum
EUR 90,071,992,547,409.91 (JavaScript's maximum safe integer cents); negative,
sub-cent, malformed and overflowing inputs are rejected without rounding.
The technical ceiling is not a suggested or realistic benefit amount.

`blankBenefits`, `blankBenefit`, `evaluateBenefits` and `attachBenefits` form the
domain API. Valid entries attach to the existing `OfferEmployerPension` and
`OfferBenefit` model fields with source `user_entry`; entering an employer value
does not verify an employer document. A label of 1–120 trimmed characters and
unique non-empty id are required for each retained benefit row. Invalid entries
leave that offer's previous valid
terms intact, while the other offer can update independently. Compensation,
working time, commute and remote-work data remain independent.

Domain tests cover blank versus zero, independent employer and personal values,
cent precision and the safe boundary, benefit row/label/value product limits, rejected inputs, required labels and ids,
offer independence and preservation of unrelated comparison dimensions.
