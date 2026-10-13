# NP-CALC-008 — 2026 unemployment contribution module

**Status:** Implemented  
**Calculation year:** 2026  
**Assumption set:** `de-unemployment-insurance-2026-v1`  
**Research dependency:** [NP-RS-005](../research/NP-RS-005-unemployment-insurance-rules.md)

## Supported calculation

The module calculates ordinary employee and employer contributions to German
statutory unemployment insurance for an employee with `mandatory_standard`
coverage. Monetary inputs and outputs use integer euro cents. The supported
standard case applies:

- employee rate: 1.3%;
- employer rate: 1.3%;
- monthly assessment ceiling: EUR 8,450;
- annual assessment ceiling: EUR 101,400;
- full contribution month: 30 social-insurance days; and
- final half-up cent rounding for each equal contribution share.

The partial-period ceiling keeps the exact `845000 × days / 30` fraction through
the rate calculation. The reported ceiling and base are rounded to cents, while
the employee and employer shares are each calculated from the unrounded base.

## Annual and normalized compensation

Annual results aggregate exactly twelve monthly calculations. The engine does
not treat annual salary as one contribution event. The normalization adapter
uses exact recurring-pay quotients from NP-CALC-004 and preserves fractional
monthly cents through the contribution calculation.

One-off compensation returns an incomplete state until the specialised
year-to-date allocation rules from NP-RS-011 are implemented.

## Fail-closed states

| Case | Result |
| --- | --- |
| Unknown coverage | Incomplete |
| Exemption without validated evidence | Incomplete |
| Validated exemption | Calculated zero contribution |
| Standard-retirement-age employer-only case | Unsupported |
| Transition range/midijob | Unsupported |
| Mini-job | Unsupported |
| Special trainee rules | Unsupported |
| Voluntary self-insurance | Unsupported |
| Cross-border coverage | Unsupported |
| One-off pay included | Incomplete; allocation required |

The ordinary equal-share formula is never applied to these unresolved or
specialised cases.

## Evidence and traceability

Calculated results expose the assumption-set identifier and these source IDs:

- `DE-SGBIII-341` — rate, period basis and ceiling link;
- `DE-SGBIII-342` — liable earnings;
- `DE-SGBIII-346` — equal contribution allocation;
- `DE-SVBEZGRV-2026-4` — the 2026 assessment ceiling; and
- `DE-BVV-1-2` — cent rounding and equal-share procedure.

Regression fixtures cover zero and ordinary pay, ceiling boundaries, half-cent
rounding, exact partial periods, annual reconciliation, exact normalized pay,
validated exemption, unsupported coverage states and one-off rejection.
