# NP-CALC-014 — Bonuses and one-time remuneration (2026)

**Implementation:** Ordinary German employee payroll; fail closed outside the verified v1 scope.  
**Research:** [NP-RS-011](../research/NP-RS-011-bonuses-one-time-payments.md).  
**Quality gates:** Formatting, lint, strict TypeScript, coverage, browser smoke, dependency audit and build.

## 2026 computation pipeline

1. The year-specific `BONUS_CLASS_REGISTRY_2026` distinguishes running pay from other remuneration for wage tax and recurring from one-time remuneration for social insurance. A recurring bonus stays in the existing regular-compensation normalization; one-time bonuses require their receipt month.
2. `prepareBonus2026` admits a cash bonus with an explicit classification, payment month, expected current-year running taxable salary, previously paid other remuneration, verified contribution days and prior contributory income. It invokes the accepted final 2026 BMF PAP with `JRE4` excluding the current and future bonuses and `SONSTB` for the current bonus.
3. The proportional 360-day ceiling is applied independently: KV/PV EUR 69,750 annual and RV/AV EUR 101,400 annual. Existing employee contributions and earlier one-time payments consume the available headroom. A private-insurance path never adds statutory KV/PV deductions to the bonus.
4. `calculateBonusSettlement2026` reuses the accepted pension, unemployment, statutory health and care contribution rounding implementations on the **already-allocated** one-time bases, without incorrectly applying the ordinary monthly ceiling again. Its result reconciles gross, wage tax, solidarity surcharge, employee deductions and employer incremental cost.
5. `prepareBonusSequence2026` and `calculateBonusSettlementSequence2026` process payments chronologically. Same-month rows preserve supplied order. Earlier other-remuneration amounts affect subsequent `JRE4` and earlier contribution-liable sums reduce remaining headroom. Outputs include individual payments and annual extra-pay totals.

## What an admitted result means

A `calculated` result is an **estimated payroll withholding and net cash amount**, not a final personal income-tax assessment. It includes gross, 2026 PAP tax and soli, per-branch employee/employer insurance and incremental employer cost. Employer cost covers only represented statutory contributions; it is not a complete employer-overhead model.

Unconfirmed contribution history, unknown legal classifications, missing January–March previous-employer evidence and special cases return `incomplete` or `unsupported`. January–March payments potentially requiring prior-year March-clause allocation are rejected rather than computed against the wrong year.

**Church tax:** The currently approved state-rule registry does not admit an ordinary liable employee's church-tax amount. For that reason settlement admits only confirmed **not liable** status and fails closed for `liable` or `unknown`. It does not invent a state-rate deduction or accept a manually supplied church-tax amount as verified evidence.

## Exclusions and downstream work

The module does not calculate severance, stock/equity benefits, non-cash payments, cross-border payroll, multiple simultaneous employers, retrospective corrections, the previous-year March clause, or extraordinary tax treatment. A running monthly bonus is passed through normal recurring wage calculation, not the `SONSTB` adapter.

Guaranteed and variable components retain their scenario classification in the compensation model; offer-comparison presentation is a downstream UI task. The aggregate gross-to-net salary calculation and explainable final line items belong to NP-CALC-015/016. Official reference-payroll crosschecks and tolerances are tracked in NP-CALC-017.

The module is pure browser-side arithmetic: no networking, telemetry, cookies, persistence, scenario URLs, or user-sensitive logs.

## Verification cases

Regression tests cover one-time performance bonuses, tax basis, proportional ceilings, exhausted headroom, statutory versus private paths, larger payments that exceed an ordinary monthly cap, multiple payments, chronological ordering, unknown church-tax evidence, unsupported contribution statuses, invalid inputs, March-clause screens, and exact net/employer-cost reconciliation.

See also: `src/domain/salary/bonus.test.ts`, `bonus-sequence.test.ts` and the official PAP tests for separate tax-calculation verification. Passing tests here is not a substitute for the independent reference-case audit in NP-CALC-017.
