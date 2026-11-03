# NP-UX-008 — One comparison calculation action

`Calculate net compensation` is the single primary comparison action. It invokes the parent's input validation callback and the existing calculation request together. The previous `Check both offers` action and combined success/failure status are removed.

## Separate readiness concerns

The named optional-comparison review status uses the current raw category statuses introduced by NP-UX-007. It reports incomplete entered categories and explicitly keeps payroll readiness separate. Unknown values are not zero; a valid optional category does not mean that every possible value was provided.

Per-offer payroll admission remains in `calculateOfferNetCompensation`, with the existing raw additional-pay validity flags and base-salary model admission. Shared tax, insurance and confirmation requirements are unchanged. Working time, commute cost/time, remote terms, pension and benefit completeness do not become payroll gates. Their affected comparison dimensions keep their own unavailable states while supported base-pay net remains visible.

## Specific raw cash blockers

`offerPayrollBlockers` creates display-only explanations from the current raw salary/additional-pay entries and `evaluateOfferEntryScope`. It names expected variable pay and each selected one-time payment type/month separately. Missing payment months, stray months and invalid text retain the existing validation explanations even when `applyAdditionalPay` omits that invalid entry from the admitted model. No amount is inferred or cleared, and no new settlement rule is introduced.

The result component shows these explanations next to the affected offer's existing engine reason. The opposite supported offer stays visible. These labels do not determine admission or calculate a value, and pension/benefit errors never enter this blocker list.

## Current values and focus

Payroll amounts and the comparison summary remain absent before the user requests calculation. Thereafter results derive directly from the current props and shared context. Editing a field removes invalidated amounts/differences immediately, preserves the other offer and leaves keyboard focus on the edited control. A deliberate Calculate activation focuses the current result region. Reset removes the calculation request and shared context and focuses the tax-class control. Existing disclosure state, help/error IDs, per-offer values, mobile summary presentation and print/URL privacy remain intact.

## Verification

Six action tests first reproduced missing parent validation, duplicate action and missing specific raw blocker explanations. They cover the single action, absence before calculation, optional errors independent from supported payroll, named variable/one-time pay, missing payment month, invalid raw variable text, current recovery and preservation of the valid opposite offer. Existing category, copy/clear, semantics and validation tests migrate to the primary action with all interactions retained. Browser verification exercises the combined action at 375px, deliberate/live-edit/reset focus, raw blockers, optional errors with supported payroll, and print/URL privacy.
