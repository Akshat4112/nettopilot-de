# NP-CMP-001 — Two-offer data contract

## Scope

Exactly two separately editable offers, fixed as Offer A and Offer B. Both
represent German salaried employment in EUR for the 2026 calculation context.

The model lives in `src/domain/comparison/offer-model.ts` and is deliberately
**input only**. It does not calculate payroll, merge salary components, infer
allowances or pronounce one employment offer better.

## Independent dimensions

- Base salary, recurring cash, variable expected compensation and one-off
  payments retain their guarantees, periods and classification separately.
- Contractual weekly time, working days, vacation and overtime stay separate
  from the monetary values.
- Remote-work arrangement and actual entered home-office costs are independent
  of commute distance, time and the four entered cost categories.
- Employer pension value remains independent of present cash and records its
  certainty and eligibility/vesting note when available.
- Benefits store employer-stated and user-assigned annual values separately.
- Every optional input is a discriminated union of `provided` (with value and
  source) or `unknown`. Unknown is **never** coerced to zero.

## Comparison readiness

`haveBothBaseSalaryInputs` is only a presence check. It is not a payroll
validation or permission to calculate differences. Future comparison tasks
must independently validate and calculate both offers under compatible
calculation year, currency, scope, metadata and assumption versions before
presenting payroll deltas.

Scenario status, estimated tax, payroll results, and user-value calculations
remain owned by later tasks, not by this schema.
