# NP-CALC-007 — 2026 pension contribution module

**Status:** Implemented  
**Calculation year:** 2026  
**Assumption set:** `de-pension-insurance-2026-v1`  
**Research dependency:** [NP-RS-004](../research/NP-RS-004-pension-insurance-rules.md)

## Supported calculation

The module calculates ordinary employee and employer contributions to Germany's
general statutory pension insurance. Monetary inputs and outputs use integer
euro cents. The supported standard case applies:

- employee rate: 9.3%;
- employer rate: 9.3%;
- monthly assessment ceiling: EUR 8,450;
- full contribution month: 30 social-insurance days;
- equal employee/employer allocation; and
- final half-up cent rounding for the half contribution.

The partial-month ceiling is calculated exactly as `845000 × days / 30` and
rounded half up only at the legal cent boundary. The contribution base is the
lesser of liable pay and that applied ceiling.

## Annual and normalized compensation

Annual results always aggregate exactly twelve monthly calculations. They do
not apply one annual ceiling or calculate one annual contribution event. The
normalization adapter consumes the exact recurring-pay quotients from
NP-CALC-004 and preserves fractional monthly cents through the rate
calculation. Only the final contribution share and reported monetary fields are
rounded to cents.

One-off compensation returns an incomplete state until its allocation rules,
including the March clause and proportional annual ceiling, are implemented.

## Fail-closed states

| Case | Result |
| --- | --- |
| Unknown coverage | Incomplete |
| Unvalidated statutory exemption | Incomplete |
| Validated statutory exemption | Calculated zero contribution |
| Professional pension scheme | Incomplete; scheme amount required |
| Miners' pension insurance | Unsupported |
| Mini-job | Unsupported |
| Transition range/midijob | Unsupported |
| One-off pay included | Incomplete; allocation required |

The ordinary 9.3% share is never applied to these unresolved or unsupported
cases.

## Evidence and traceability

Calculated results expose the assumption-set identifier and source identifiers:

- `DE-SVBEZGRV-2026-4` — 2026 assessment ceiling;
- `DE-DRV-SV-VALUES-2026` — rates, ceiling and equal shares; and
- `DE-BVV-1-2` — contribution periods and rounding.

Regression fixtures cover zero pay, ordinary salaries, ceiling boundaries,
half-cent rounding, partial contribution months, annual aggregation, normalized
pay, validated exemption, unsupported coverage statuses and one-off rejection.
