# NP-CALC-009 — 2026 statutory health contribution module

**Status:** Implemented  
**Calculation year:** 2026  
**Assumption set:** de-statutory-health-insurance-2026-v1  
**Research dependency:** NP-RS-006

## Supported calculation

The module implements ordinary statutory health-insurance contributions for
mandatory and voluntary GKV employees. It uses the 14.6% general rate, an
explicit insurer-specific additional rate or the official 2.9% published
average, and the nationwide EUR 5,812.50 monthly ceiling.

Mandatory GKV calculates equal employee and employer half contributions.
Voluntary GKV separately rounds the member total and employer subsidy, so the
employee effective cost can differ by one cent.

## Exact arithmetic and periods

Additional rates are accepted as decimal percentage strings and never pass
through floating-point arithmetic. Partial-month ceilings retain the exact
581250 × days / 30 fraction through the rate calculation. Annual calculations
aggregate twelve month-aware results and support rate changes between months.

## Result quality and boundaries

Insurer-specific mode is marked insurer-exact. Published-average mode is marked
as an estimate and carries a visible warning. The module fails closed for
unknown coverage, reduced-rate membership, private insurance, family insurance,
transition-range employment, mini-jobs, students, pensioners and cross-border
cases. Voluntary members below the ceiling require confirmation that no other
contribution-liable income makes the payroll-only result incomplete. One-off
payments remain routed to NP-RS-011.

## Evidence

Results expose the 2026 assumption set and source identifiers for SGB V
sections 226, 241, 242 and 249, the official 2026 ceiling, and BVV rounding.
Regression fixtures cover rate modes, ceiling boundaries, partial periods,
mandatory and voluntary rounding, annual rate changes, normalized compensation,
unsupported states and one-off rejection.
