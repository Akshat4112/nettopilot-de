# NP-UX-002: Explain the payroll scope before completion

The existing adapter supports 2026 ordinary employment for twelve equal payroll
months, compulsory GKV with standard statutory pension and unemployment
insurance, no children or church tax, and no allowance adjustments, private
premiums or special payments. Monthly gross must be strictly above EUR 2,000 and
strictly below EUR 5,800. Birth dates must fall from 1963-01-01 through 2002-12-31,
inclusive. Annual gross must divide exactly into twelve monthly amounts in cents.
This change describes that existing boundary; it does not expand admission.

`PAYROLL_SCOPE_2026` and `getPayrollScopeIssues` in `payroll-scope.ts` are the shared
contract for the calculator adapter and early guidance. The calculator preserves
its validation and employment-confirmation checks before admission.
`evaluatePayrollScope` inspects each valid draft field independently, so an
unrelated missing or invalid field cannot hide an already-known unsupported
insurance, family, date, salary or optional-pay selection. It returns unsupported
issues separately from missing fields, invalid fields, advanced validation errors
and the outstanding employment confirmation. No payroll engine is called for
this guidance.

`PayrollScopeSummary` describes the contract before fields. `PayrollScopeGuidance`
uses current salary or shared payroll draft values in a polite live region.
Unsupported messages retain the user's entered facts and explain the available
action without suggesting a fictional supported scenario.

`evaluateOfferEntryScope` checks raw salary and additional-pay entries before model
admission. Shared personal payroll fields remain unknown. This catches additional
pay even when a payment month is missing, and checks salary range and annual-cent
allocation independently of the tax profile. A base salary inside the boundary is
labelled `within_base_scope`, which does not claim a complete or admitted profile.

Targeted tests cover strict salary and inclusive birth-date boundaries, annual cent
allocation, missing and malformed drafts, independently known unsupported cases,
optional-pay presence, insurer-rate validation, live UI updates and the unchanged
calculator and offer-net adapter behavior.
