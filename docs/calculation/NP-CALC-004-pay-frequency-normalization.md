# NP-CALC-004 — Pay-frequency normalization

## Decision

NettoPilot DE normalizes every supported compensation input into twelve monthly
payroll periods plus one annual summary. An amount entered as annual salary is
not an annual payroll event: it is recurring pay whose exact monthly value is
the annual amount divided by 12.

The implementation lives in `src/domain/salary/frequency.ts` and consumes the
validated `CompensationInput` contract from NP-CALC-001/002.

## Exact amount representation

An annual amount such as EUR 100,000 cannot be divided by 12 as a finite base-10
decimal. Normalization therefore stores monetary values as an
`ExactEuroQuotient`:

- `dividend`: an `ExactDecimal` from NP-CALC-003;
- `divisor`: a positive integer;
- `currency`: `EUR`.

For EUR 100,000 annual salary, the normalized monthly amount remains exactly
`100000.00 / 12`. It is not stored as EUR 8,333.33. A downstream legal
calculation calls `exactEuroQuotientToDecimal` or
`exactEuroQuotientToCents` with an explicit scale and rounding mode at its own
documented rounding checkpoint.

## Recurring compensation rules

| Input | Normalized monthly value | Normalized annual value |
| --- | --- | --- |
| Monthly base salary | input amount | input amount × 12 |
| Annual base salary | input amount / 12 | input amount |
| Monthly recurring additional cash | input amount | input amount × 12 |
| Annual recurring additional cash | input amount / 12 | input amount |

Base salary is part of guaranteed recurring gross. Recurring additional cash is
kept in either the guaranteed or variable lane supplied by the input. The
guarantee classification changes result views, not payroll frequency.

## One-off rules

One-off payments are never divided by 12 or blended into recurring gross. Each
row preserves its:

- exact amount;
- payment month;
- classification;
- guaranteed/variable status;
- optional label.

Each normalized month contains the one-off rows paid in that month and separate
guaranteed and variable totals. The annual structure retains the rows and sums
them without changing their classification.

## Public structures

`normalizeCompensation` returns:

- reusable recurring component pairs with exact monthly and annual values;
- twelve ordered `NormalizedMonthlyCompensation` records;
- one `NormalizedAnnualCompensation` summary;
- conservative guaranteed totals and inclusive total-compensation values;
- original one-off rows grouped by payment month and guarantee class.

## Rounding boundary

Frequency normalization performs no implicit cent rounding. Consumers must
select an NP-CALC-003 rounding mode when materializing an exact quotient. This
keeps input-period conversion independent from BMF, social-insurance and output
rounding rules.

## Regression coverage

The test suite covers:

- monthly base salary annualization;
- annual base salary split across twelve monthly payrolls;
- non-terminating annual-to-monthly division without early cent rounding;
- guaranteed recurring additional cash;
- variable recurring additional cash;
- guaranteed and variable one-offs in different months;
- multiple one-off rows in the same month.
