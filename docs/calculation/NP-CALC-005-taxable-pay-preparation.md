# NP-CALC-005 — Taxable-pay preparation

## Decision

NettoPilot DE prepares the exact interface required by the final 2026 BMF machine
payroll-tax plan ([NP-RS-002](../research/NP-RS-002-bmf-payroll-tax-algorithm.md))
before any wage-tax calculation runs. The module `src/domain/salary/taxable-pay.ts`
consumes the normalized compensation from
[NP-CALC-004](NP-CALC-004-pay-frequency-normalization.md) plus the validated tax
and social profiles from [NP-CALC-002](NP-CALC-002-validated-input-schema.md) and
produces a complete, typed `PapInput` record. It performs no legal tariff
calculation itself.

## Interface contract

`prepareTaxablePay` returns:

- `input`: every external PAP field the v1 path supports — `RE4`, `SONSTB`,
  `STKL`, `LZZ`, `KVZ`, `PKV`, `PKPV`, `PKPVAGZ`, `ALV`, `KRV`, `PVZ`, `PVA`,
  `PVS`, `R`, `ZKF`, `VBEZ`, `VBS` and the zero-filled unsupported fields;
- `prepared`: traceable intermediates (annual recurring/one-off gross, applied
  lump sums, single-parent relief, Soli child allowance, final `RE4`/`SONSTB`).

Fields outside v1 scope (factor method `F`, pension cohort `VJAHR`/`ZMVB`, age
relief `AJAHR`, section 19a `MBV`/`STERBE`/`SONSTENT`) are either absent or zero
according to the plan's applicability rules, never silently invented.

## Mapping rules

| Canonical input | PAP field | Rule |
| --- | --- | --- |
| Recurring gross (annual) | `RE4` | annual gross − employee/pension/special expense lump sums − class-II relief, split to the monthly period (LZZ = 2) |
| One-off payments | `SONSTB` | sum of all guaranteed and variable one-offs; never blended into `RE4` |
| Tax class registry id | `STKL` | `tax_class_1`…`tax_class_6` → digits 1–6; unknown ids are rejected |
| Statutory, published-average additional rate | `KVZ` | fixed 2026 published average 2.9% → 290 basis points |
| Statutory, insurer-specific rate | `KVZ` | entered percentage × 100 |
| Private health/care premiums | `PKV` = 1, `PKPV` | monthly health + care premium in cents; always monthly regardless of LZZ |
| Childless care status | `PVZ` | childless → 1, parent → 0 |
| Qualifying children | `PVA` | `min(childrenUnderRelevantAge, 4)` |
| Care-insurance employment state | `PVS` | Saxony (`DE-SN`) → 1 |
| Church-tax status | `R` | liable → 1, not liable → 0 (placeholder mapping until NP-CALC-012 supplies the ELStAM code set) |

## Allowance application (2026, from NP-RS-003)

| Allowance | Value | Classes |
| --- | ---: | --- |
| Employee expense lump sum (ANP) | 1,230.00 EUR | I–V; zero for VI |
| Pension expense lump sum | 102.00 EUR | I–V; zero for VI |
| Special expense lump sum (SAP) | 36.00 EUR | all classes via the PAP flow |
| Single-parent relief base (EFA) | 4,260.00 EUR | II only |
| Child allowance, single share | 4,878.00 EUR per ZKF unit | I, II, IV |
| Child allowance, doubled share | 9,756.00 EUR per ZKF unit | III |

The child allowance is not deducted from wage tax; it is prepared for the
solidarity-surcharge and church-tax assessment bases of later modules.

## Rounding boundary

Money values cross the PAP boundary as plain integer `number` cents. Where the
normalized values are exact quotients (annual→monthly splits), the module
materializes cents with half-up rounding at one checkpoint and documents it in
the prepared record. All later PAP-internal rounding remains the responsibility
of the NP-CALC-006 core.

## Regression coverage

The suite covers the base mapping, class-specific allowance behaviour
(I, II, III, V, VI), one-off segregation, insurer-specific and published-average
`KVZ`, the private-insurance path, care flags including the Saxony rule and the
`PVA` cap, the religion code, the class-III doubled child share, rejection of a
non-2026 calculation year, and equivalence of the `buildPapInput` convenience
wrapper with the direct path.

## Follow-on work

- [NP-CALC-006 — Payroll-tax calculation](NP-CALC-006-payroll-tax-calculation.md)
  will consume `PapInput` and implement the plan's tariff and V/VI procedures.
- `PKPVAGZ` and the church-tax code set `R` remain placeholder mappings until the
  private-insurance (NP-CALC-013) and church-tax (NP-CALC-012) modules land.
