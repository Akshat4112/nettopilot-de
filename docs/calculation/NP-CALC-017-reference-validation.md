# NP-CALC-017 — 2026 reference validation report

**Status:** In progress; PR #62.  
**Fixture set:** `de-payroll-reference-2026-v1` (NP-RS-012).  
**Date:** 2026-10-25.

## Method

The executable suites currently cover six official BMF general-table rows, four statutory insurance scenarios and two private subsidy scenarios. Additional families below remain unverified. The initial executable suite reads the checked-in fixture JSON, selects the six
`official_exact` BMF general annual check-table scenarios (classes I–VI),
and compares the 2026 PAP engine output to every explicitly sourced expected
value at zero-cent tolerance. It verifies the source IDs and fixture-set
identity. A separately maintained conversion table maps published table steps
to the machine PAP's inclusive upper reference gross values. This is **not**
an annual salary paid as twelve monthly payroll periods.

The BMF special table fixture validates a different adapter context and must
not be represented as ordinary private-health insurance payroll. Its special
branch is therefore classified separately and is not silently admitted.

## Reference coverage ledger

| Family | Tier | Execution |
| --- | --- | --- |
| General annual BMF wage tax; 6 classes | Official exact | Implemented in `reference-validation.test.ts` |
| Full 516-cell BMF check table | Official exact | Pending extended reference runner |
| BMF special annual table | Official exact | Scope/admission classification only; numeric adapter comparison pending |
| Statutory RV/AV/GKV/PV; 4 fixtures | Source-derived exact | Implemented in `reference-insurance-validation.test.ts`; CI verification pending |
| Private subsidy ceilings; 2 fixtures | Source-derived exact | Implemented in `reference-insurance-validation.test.ts`; CI verification pending |
| Soli and church-tax arithmetic | Source-derived exact | Pending fixture-driven integration runner |
| Bonus social-insurance allocation | Source-derived exact | Pending fixture-driven integration runner |
| Admission gates, March clause, source-gated church tax | Admission gate | Pending fixture-driven integration runner |
| Ordinary 12-month salary aggregation | Source-derived integration | Requires independent upstream result fixtures |

The existing component test suite includes some independently documented
values, but those are **not** counted as executed NP-CALC-017 fixture rows until
their exact mapping is part of the conformance runner. Unexecuted rows must not
be included in any denominator used to claim 100% reference coverage.

## Acceptance before marking Done

- Run every approved and supported reference scenario through its corresponding
  calculation module with documented tolerance and expected output.
- Preserve the distinct `official_exact`, `source_derived_exact` and
  `admission_gate` verification tiers.
- Identify unimplemented reference paths as blocked/unverified, never passing.
- Produce test and CI evidence from the same commit, and record any mismatch,
  affected rule, source and corrective action.
- Ensure 2026 test fixtures are neither live production assumption data nor
  read from remote services.

No user payslips, tax identifiers or confidential salary data are used.
