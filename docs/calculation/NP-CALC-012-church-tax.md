# NP-CALC-012 — 2026 church-tax module

**Status:** Implemented  
**Calculation year:** 2026  
**Assumption set:** de-church-wage-tax-2026-v1  
**Research dependency:** NP-RS-009

## Supported contract

The module consumes the recurring `BK` and other-remuneration `BKS` assessment
bases produced by the final BMF 2026 payroll plan. It keeps both components
separate, applies the rate of the employer's payroll tax establishment, and
uses exact integer arithmetic with the approved state-specific final-cent rule.

A `not_liable` payroll marker produces a neutral zero-deduction result. Unknown
status, payroll-establishment state, payroll-marker evidence, or child-allowance
factor produces an incomplete result. Special church-tax cases remain
unsupported.

## Source-gated state registry

NP-RS-009 explicitly records that no state may be activated until both its 2026
governing rate and final-cent evidence are approved. The production registry
therefore contains all sixteen states and their research candidate rates, but
currently returns `state_evidence_not_approved` for every liable calculation.
It never turns a commonly quoted 8% or 9% rate into an uncited production rule.

The approved-rule calculation path requires a versioned record containing the
state, rate, final-cent rule, effective dates, and non-empty source identifiers.
This provides the arithmetic needed for future activation without weakening the
current fail-closed production behavior.

## Baden-Württemberg exception

For a Baden-Württemberg payroll establishment, the postcode is required. A
postcode of 74206 triggers an explicit `applies / does_not_apply / unknown`
control for the Bad Wimpfen Roman Catholic payroll exception. `unknown` blocks
the result; `applies` retains the 9% candidate but still cannot bypass the
state-source gate.

## Boundaries

The result is a payroll-withholding estimate, not a final church-tax assessment.
Church-tax capping, minimum church tax, church money, flat-rate payroll tax,
cross-border cases, residence-state reconciliation, and mixed-faith allocation
are outside the v1 module.
