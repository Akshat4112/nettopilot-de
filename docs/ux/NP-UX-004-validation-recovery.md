# NP-UX-004 — Actionable validation recovery

## Behavior
- A failed salary form check leaves unresolved field errors visible when a *different* input is corrected.
- A concise linked summary names missing/invalid fields and separately names the standard-employment confirmation step.
- Correction links focus the corresponding input. The advanced-settings link opens the disclosure first and focuses the earliest invalid advanced field.
- Existing valid input values, comparison drafts, browser-only data and payroll eligibility rules are unchanged.
- After a successful calculation, editing a value hides the now-stale net result. A new deliberate **Check inputs** submission is required to display a calculation from the new draft; never recalculate as a side effect of typing.
- Reset or loading a fictional example clears prior submitted feedback.

## Tests
`e2e/validation-recovery.spec.ts` covers linked errors remaining after editing one field, focus to tax class, advanced-error disclosure and fresh confirmation after edit. Existing keyboard, scope, privacy and calculator suites remain required.

## Non-goals
This PR does not expand payroll scope, add auto-suggestions, persist salary details, or implement full screen-reader-result announcements (NP-A11Y-003). It does not claim NP-UX-006 is completed.
