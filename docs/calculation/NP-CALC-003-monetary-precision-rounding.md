# NP-CALC-003 — Monetary precision and rounding

## Decision

NettoPilot DE uses `ExactDecimal` for calculation intermediates and branded
`EuroCents` for external monetary boundaries. Both are backed by `bigint`; no
tax or social-insurance calculation may convert through JavaScript `number`.

The shared module is `src/domain/salary/precision.ts`.

## Numeric contract

| Concern | Rule |
| --- | --- |
| Decimal parsing | Canonical signed base-10 strings only; exponent notation, `NaN`, `Infinity`, leading plus signs, and ambiguous leading zeroes are rejected. |
| Scale | Each decimal retains an explicit non-negative scale. Increasing scale appends zeroes without changing value. |
| Money boundary | Engine inputs and outputs cross the official interface as branded integer cents. Exact conversion is the default and fails if a value has a non-zero sub-cent remainder. |
| Intermediates | Addition, subtraction, multiplication and scale alignment are exact. Division always requires a result scale and rounding mode. |
| Stage control | Rounding occurs only through an explicit call at the source-defined calculation stage. There is no global “round every step to cents” setting. |
| Output | `EuroCents` converts to a two-decimal `EuroAmount` or canonical string without locale parsing or floating-point formatting. |

## Supported rounding modes

| Mode | Meaning |
| --- | --- |
| `truncate` | Discard removed digits toward zero. Used for BMF assignments that explicitly discard excess decimals. |
| `floor` | Round toward negative infinity. Use only when the approved source requires downward rounding at that checkpoint. |
| `ceiling` | Round toward positive infinity. Use for an explicit BMF up-arrow checkpoint. |
| `half_up` | Increase magnitude when the first discarded digit is 5–9. Used for the final social-insurance share under the approved BVV rule. |

Signed-value tests define the difference between truncation, floor and ceiling.
This matters even though current salary inputs are non-negative because later
formula intermediates and comparisons can be signed.

## Source-aligned stage examples

### Social-insurance contribution

For a contribution base of EUR 5,812.50 and an employee rate of 1.8%:

1. keep the exact intermediate `104.62500`;
2. apply `half_up` once at the employee-share stage;
3. return `10463` integer cents (EUR 104.63).

Equal-share contributions must round the half-rate result first and then double
that rounded result. The engine must not calculate and round the total before
splitting it.

### BMF payroll-tax plan

Named plan assignments use `truncate`, `floor`, or `ceiling` at the exact scale
and procedure specified by the applicable PAP. A receiving field with fewer
decimal places discards excess decimals unless the plan explicitly instructs a
different operation. Final public outputs are integer cents.

### Church wage tax

`floor` is available for a state whose approved rule requires fractional cents
to be discarded. The utility does not choose a nationwide default; callers must
obtain the state-specific rounding rule from the verified assumption registry.

## API boundary

- `decimal` and `ExactDecimal.fromParts` create exact values.
- `addDecimals`, `subtractDecimals`, `multiplyDecimals`, and `divideDecimals`
  provide exact arithmetic with explicit division policy.
- `quantizeDecimal` is the only general scale-reduction operation.
- `toEuroCents` defaults to fail-closed exact conversion; a rounding mode must
  be supplied deliberately when a source-defined checkpoint permits rounding.
- `euroAmountToCents`, `euroCentsToAmount`, and `formatEuroCents` bridge domain
  money types and the integer-cent engine boundary.
- Percentage helpers treat `2.5` as 2.5 percentage points, convert it exactly to
  `0.025`, and require the caller to choose the final rounding stage.

## Verification and handoff

Tests cover sub-cent ties, positive and negative values, very large exact
products, all four rounding modes, exact-cent rejection, BMF-style assignment
truncation, BVV half-up contribution examples, equal-share ordering, and an
explicit church-tax floor example.

NP-CALC-004 must use these primitives when normalizing monthly and annual pay.
Later tax and social-insurance modules must preserve their unrounded
intermediates and assert named rounding checkpoints against the approved
reference scenarios from NP-RS-012.
