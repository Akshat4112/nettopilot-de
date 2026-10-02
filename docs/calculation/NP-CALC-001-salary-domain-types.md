# NP-CALC-001 — Salary-domain types

## Status

Implemented for the calculation-core milestone in
`src/domain/salary/types.ts` and exported through `src/domain/salary/index.ts`.

## Purpose

The salary domain provides one calculation-neutral vocabulary for the form,
scope validator, assumption resolver, calculation engine, saved scenarios, and
offer/couple comparison features. It implements the field meanings accepted in
NP-PD-004 without embedding a current-year tax constant or calculation formula.

Runtime parsing, range checks, cross-field validation, and user-facing errors are
owned by NP-CALC-002. These types do not make untrusted form values valid.

## Representation decisions

| Concern | Type decision |
| --- | --- |
| Money | `EuroAmount` stores an exact branded decimal string and fixed `EUR` currency. |
| Rates | `PercentageRate` stores an exact branded decimal string with an explicit percent unit. |
| Dates | `IsoDate` identifies ISO calendar-date strings; validation is deferred to NP-CALC-002. |
| Year-dependent options | `RegistryOptionId` prevents UI labels from becoming engine identifiers. |
| Unknown values | Material unanswered states use the literal `unknown`, distinct from `false` and numeric zero. |
| Conditional health inputs | A discriminated union makes statutory, private, and unknown paths mutually exclusive. |
| Employer contribution | A discriminated union requires an amount exactly when the private employer contribution is known. |
| Additional cash | `none` and `included` variants prevent an omitted period or guarantee on a non-zero entry. |
| Collections | One-off payments and benefits are read-only arrays; list limits remain runtime validation rules. |
| Comparison containers | Alternatives, offers, and couples contain full independent individual scenarios. |

## Canonical individual scenario

`IndividualSalaryScenarioInput` contains six groups:

1. calculation context;
2. scope-admission answers;
3. base, recurring additional, and one-off compensation;
4. wage-tax inputs;
5. social-insurance inputs;
6. comparison-only inputs.

The comparison group is structurally separate from payroll inputs so benefits,
hours, vacation, remote work, and commuting cannot accidentally become taxable
salary.

## Exact values and brands

`DecimalString`, `IsoDate`, `CalculationYear`, labels, semantic versions, and
registry identifiers are branded primitives. Branding documents the value's
meaning and prevents unrelated strings or numbers from being assigned by
accident. NP-CALC-002 will be the construction boundary that parses and validates
raw values before applying these brands.

Binary JavaScript numbers are not used for money or rates. Integer counts remain
numbers because they have no fractional precision contract.

## Year-specific boundaries

Tax classes, pension status, unemployment status, and one-off classifications
remain registry identifiers. Their allowed values must be resolved for the
selected calculation year from an approved assumption set. The domain module
does not duplicate or guess that registry.

Federal states use stable ISO 3166-2 codes. User-facing German and English names
remain presentation data.

## Scenario containers

- `SalaryAlternativeInput` keeps current and alternative calculations explicit.
- `OfferComparisonInput` requires exactly two scenarios through a tuple.
- `CoupleScenarioInput` keeps `personA` and `personB` independent.

Same-year and compatible-version requirements are cross-scenario validation
rules for NP-CALC-002; the type model preserves both scenarios so no person's
answers can overwrite another's.

## Acceptance evidence

- Every NP-PD-004 field group has a named domain type.
- Monthly/annual pay periods and 12 regular base payments are explicit.
- All 16 federal states are represented by stable codes.
- Statutory and private health paths cannot coexist in one submitted object.
- Unknown, false, and zero remain distinct states.
- Money and rate values avoid binary floating-point representation.
- Individual, alternative, two-offer, and couple scenario containers exist.
- Unit tests compile representative statutory, private, and incomplete scenarios.
- No legal rate, ceiling, tax class, or current-year formula is hard-coded.
