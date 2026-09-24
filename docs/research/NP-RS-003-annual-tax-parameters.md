# NP-RS-003 — Annual tax parameters for 2026

**Status:** Accepted  
**Task:** NP-RS-003  
**Milestone:** M1 Research  
**Depends on:** [NP-RS-002](NP-RS-002-bmf-payroll-tax-algorithm.md)  
**Calculation year:** 2026  
**Effective period:** 2026-01-01 through 2026-12-31  
**Verified on:** 2026-09-24

## Decision

NettoPilot DE shall use the parameter values and formulas in the final BMF 2026 machine payroll-tax plan, Anlage 1, status 12 November 2025. The applicable statutory tariff is section 32a EStG for the 2026 assessment period.

This note records the annual tax constants required by the selected algorithm. It is a research catalogue, not yet a production assumption manifest. Every production value must later be represented as a typed, versioned parameter linked to the source records defined by NP-RS-001.

## 1. Scope

Included:

- 2026 income-tax tariff boundaries and coefficients;
- fixed payroll allowances used by the BMF plan;
- child-allowance values used for solidarity-surcharge and church-tax assessment bases;
- tax-class V/VI thresholds and special-path rates;
- class-dependent splitting and allowance behaviour;
- 2026 pension-start and age-relief cohort rows;
- statutory period-conversion constants;
- effective dates, units, source locators and implementation notes.

Deferred to dedicated tasks:

- pension-insurance contribution rules: NP-RS-004;
- unemployment-insurance contribution rules: NP-RS-005;
- statutory health-insurance rules: NP-RS-006;
- long-term-care-insurance rules: NP-RS-007;
- full solidarity-surcharge logic: NP-RS-008;
- church-tax rates and state handling: NP-RS-009;
- private health-insurance treatment: NP-RS-010;
- bonus and one-time-payment policy: NP-RS-011.

The BMF plan contains social-insurance constants because they affect the Vorsorgepauschale. They are not approved as actual contribution rules by this task.

## 2. Authoritative sources

| Source ID | Authority and document | Role | Effective/applicable period | Verification |
| --- | --- | --- | --- | --- |
| DE-BMF-PAP-2026-A1 | [BMF — Machine payroll-tax plan 2026, Anlage 1, final 12 November 2025](https://www.bundesfinanzministerium.de/Content/DE/Downloads/Steuern/Steuerarten/Lohnsteuer/Programmablaufplan/2025-11-12-PAP-2026-anlage-1.pdf?__blob=publicationFile&v=2) | Governing algorithm constants, class logic and rounding | Wage periods and other remuneration in 2026 | Verified 2026-09-24 |
| DE-BMF-PAP-2026-PUBLICATION | [BMF — Programmablaufpläne zur Lohnsteuer für/ab 2026](https://www.bundesfinanzministerium.de/Content/DE/Downloads/Steuern/Steuerarten/Lohnsteuer/Programmablaufplan/2025-11-12-PAP-2026.html) | Publication status and provenance | 2026 | Verified 2026-09-24 |
| DE-ESTG-32A-2026 | [EStG section 32a — income-tax tariff](https://www.gesetze-im-internet.de/estg/__32a.html) | Statutory 2026 tariff | Assessment periods from 2026 | Verified 2026-09-24 |
| DE-ESTG-9A | [EStG section 9a — standard work-expense deductions](https://www.gesetze-im-internet.de/estg/__9a.html) | Employee and pension expense lump sums | Current law applied by 2026 PAP | Verified 2026-09-24 |
| DE-ESTG-10C | [EStG section 10c — special-expense lump sum](https://www.gesetze-im-internet.de/estg/__10c.html) | Special-expense amount | Current law applied by 2026 PAP | Verified 2026-09-24 |
| DE-ESTG-24B | [EStG section 24b — single-parent relief](https://www.gesetze-im-internet.de/estg/__24b.html) | Tax class II relief | Current law applied by 2026 PAP | Verified 2026-09-24 |
| DE-ESTG-32 | [EStG section 32 — child allowances](https://www.gesetze-im-internet.de/estg/__32.html) | Child allowance components | 2026 | Verified 2026-09-24 |
| DE-ESTG-19-2 | [EStG section 19 — pension allowance](https://www.gesetze-im-internet.de/estg/__19.html) | Pension-start cohort values | Cohort-specific | Verified 2026-09-24 |
| DE-ESTG-24A | [EStG section 24a — age-relief amount](https://www.gesetze-im-internet.de/estg/__24a.html) | Age cohort values | Cohort-specific | Verified 2026-09-24 |

If a statute and PAP express the same parameter differently, the statutory rule governs legal meaning and the final PAP governs its machine-payroll implementation within the PAP’s delegated scope.

## 3. Parameter naming and storage rules

Recommended production identifiers use stable semantic names rather than raw source field names:

- prefix tax.2026 for tax-year constants;
- preserve the BMF field name as source_field;
- store euros as exact decimal or integer cents, never binary floating point;
- store rates as exact decimal ratios;
- store inclusive/exclusive boundaries explicitly;
- attach source_id, locator, effective_from, effective_to and verification_status;
- distinguish annual values from cohort-locked values;
- distinguish engine constants from user inputs.

The BMF names remain necessary for traceability, but they should not be the only public meaning of a parameter.

## 4. 2026 income-tax tariff

Before applying the tariff:

1. derive the relevant taxable-income value according to the payroll algorithm;
2. apply the class-dependent division represented by KZTAB where required;
3. round the tariff input x down to full euros;
4. select exactly one tariff zone;
5. round the resulting tax down to full euros;
6. multiply by KZTAB where the plan requires it.

### 4.1 Tariff parameter table

| Parameter ID | BMF/statutory value | Unit | Meaning | Boundary | Source locator |
| --- | ---: | --- | --- | --- | --- |
| tax.2026.basic_allowance | 12,348 | EUR/year | Basic personal allowance; BMF GFB | Tax is zero through x = 12,348 | PAP MPARA p.14; EStG §32a(1) no.1 |
| tax.2026.zone_1.upper | 17,799 | EUR | End of first progression zone | Zone applies from 12,349 through 17,799 | EStG §32a(1) no.2; PAP UPTAB26 p.38 |
| tax.2026.zone_1.a | 914.51 | coefficient | Quadratic coefficient | Formula below | Same |
| tax.2026.zone_1.b | 1,400 | coefficient | Linear coefficient | Formula below | Same |
| tax.2026.zone_2.lower_reference | 17,799 | EUR | Reference subtracted before scaling z | Not the first value in zone; first x is 17,800 | EStG §32a(1) no.3 |
| tax.2026.zone_2.upper | 69,878 | EUR | End of second progression zone | Zone applies from 17,800 through 69,878 | EStG §32a(1) no.3; PAP UPTAB26 p.38 |
| tax.2026.zone_2.a | 173.10 | coefficient | Quadratic coefficient | Formula below | Same |
| tax.2026.zone_2.b | 2,397 | coefficient | Linear coefficient | Formula below | Same |
| tax.2026.zone_2.c | 1,034.87 | EUR | Additive constant | Formula below | Same |
| tax.2026.zone_3.upper | 277,825 | EUR | End of 42% proportional zone | Zone applies from 69,879 through 277,825 | EStG §32a(1) no.4 |
| tax.2026.zone_3.rate | 0.42 | ratio | Marginal proportional rate | Formula below | Same |
| tax.2026.zone_3.offset | 11,135.63 | EUR | Subtracted constant | Formula below | Same |
| tax.2026.zone_4.lower | 277,826 | EUR | Start of 45% proportional zone | Applies from this value upward | EStG §32a(1) no.5 |
| tax.2026.zone_4.rate | 0.45 | ratio | Marginal proportional rate | Formula below | Same |
| tax.2026.zone_4.offset | 19,470.38 | EUR | Subtracted constant | Formula below | Same |
| tax.2026.tariff_scale | 10,000 | divisor | Scaling divisor for y and z | Exact decimal division | EStG §32a(1) sentences 3–4 |
| tax.2026.tariff_input_precision | 1 | full EUR | x is rounded down to whole euros | Before zone selection | EStG §32a(1) sentence 1 |
| tax.2026.tariff_output_precision | 1 | full EUR | Tariff result is rounded down to whole euros | After formula | EStG §32a(1) sentence 6; PAP p.38 |

### 4.2 Tariff formulas

Let x be the taxable-income tariff input rounded down to full euros.

| x range | Auxiliary value | Annual tariff before class multiplier |
| --- | --- | --- |
| x ≤ 12,348 | — | 0 |
| 12,349 ≤ x ≤ 17,799 | y = (x − 12,348) / 10,000 | floor((914.51 × y + 1,400) × y) EUR |
| 17,800 ≤ x ≤ 69,878 | z = (x − 17,799) / 10,000 | floor((173.10 × z + 2,397) × z + 1,034.87) EUR |
| 69,879 ≤ x ≤ 277,825 | — | floor(0.42 × x − 11,135.63) EUR |
| x ≥ 277,826 | — | floor(0.45 × x − 19,470.38) EUR |

The implementation must not transform the formulas algebraically if doing so changes decimal precision or rounding order.

## 5. Fixed payroll allowances

| Parameter ID | BMF field/value | Unit | Applies in PAP | Implementation note | Source |
| --- | ---: | --- | --- | --- | --- |
| tax.2026.employee_expense_lump_sum | ANP = 1,230 | EUR/year | Active employment income, tax classes I–V, limited to available active wage | Tax class VI does not receive this fixed deduction through this branch | PAP MZTABFB p.22; EStG §9a sentence 1 no.1(a) |
| tax.2026.pension_expense_lump_sum | ANP = 102 | EUR/year | Pension benefits, tax classes I–V | Limited to pension income remaining after pension allowances | PAP MZTABFB p.22; EStG §9a sentence 1 no.1(b) |
| tax.2026.special_expense_lump_sum | SAP = 36 | EUR/year | Fixed table allowance in the PAP | Preserve the PAP’s KZTAB interaction; do not pre-double it outside the algorithm | PAP MZTABFB p.22; EStG §10c |
| tax.2026.single_parent_relief_base | EFA = 4,260 | EUR/year | Tax class II | PAP fixed amount covers the base relief; additional-child amounts arrive through approved allowance/ELStAM handling | PAP MZTABFB p.22; EStG §24b(2) |
| tax.2026.single_parent_additional_child | 240 | EUR/year/additional child | Legal amount after first eligible child | Not a separate hard-coded PAP EFA constant; map only through a sourced supported input route | EStG §24b(2) |

### Class behaviour

| Tax class | Employee/pension lump sums | SAP | EFA | General tariff handling |
| --- | --- | --- | --- | --- |
| I | PAP rules above | 36 | 0 | KZTAB 1 |
| II | PAP rules above | 36 | 4,260 | KZTAB 1 |
| III | PAP rules above | 36 within PAP flow | 0 | KZTAB 2 / splitting-style tariff path |
| IV | PAP rules above | 36 | 0 | KZTAB 1; factor method may apply |
| V | PAP rules above | 36 | 0 | Special V/VI algorithm |
| VI | No fixed ANP through the normal branch | 36 | 0 | Special V/VI algorithm |

This table describes the PAP branches. It is not a general explanation of income-tax assessment or tax-return entitlements.

## 6. Child allowances in the PAP

The child allowance does not reduce the regular payroll wage-tax output in the standard path. The PAP uses it when deriving the assessment bases for the solidarity surcharge and church wage tax.

The 2026 per-parent statutory components are:

- child subsistence allowance: EUR 3,414;
- care, education or training allowance: EUR 1,464;
- combined per-parent amount: EUR 4,878;
- combined doubled amount: EUR 9,756.

| Parameter ID | BMF value | Unit | Classes | Calculation |
| --- | ---: | --- | --- | --- |
| tax.2026.child_allowance.single_share | KFB unit = 4,878 | EUR per ZKF unit | IV | ZKF × 4,878 |
| tax.2026.child_allowance.double_share | KFB unit = 9,756 | EUR per ZKF unit | I, II, III | ZKF × 9,756 |
| tax.2026.child_allowance.none | KFB = 0 | EUR | V, VI | Zero |

ZKF is supplied with one decimal place under the PAP interface. The input’s legal eligibility and ELStAM origin must be validated outside the tariff constant table.

## 7. Tax classes V and VI

The PAP uses a special minimum-tax/difference procedure for classes V and VI. It must be implemented from the named procedures MST5-6 and UP5-6 rather than approximated with a standalone marginal rate.

| Parameter ID | BMF field | Value | Unit | Source locator |
| --- | --- | ---: | --- | --- |
| tax.2026.class_5_6.threshold_1 | W1STKL5 | 14,071 | EUR | PAP MPARA p.14 |
| tax.2026.class_5_6.threshold_2 | W2STKL5 | 34,939 | EUR | PAP MPARA p.14 |
| tax.2026.class_5_6.threshold_3 | W3STKL5 | 222,260 | EUR | PAP MPARA p.14 |
| tax.2026.class_5_6.minimum_rate | — | 0.14 | ratio | PAP MST5-6 / UP5-6 pp.29–30 |
| tax.2026.class_5_6.middle_rate | — | 0.42 | ratio | PAP MST5-6 p.29 |
| tax.2026.class_5_6.top_rate | — | 0.45 | ratio | PAP MST5-6 p.29 |
| tax.2026.class_5_6.upper_probe_factor | — | 1.25 | ratio | PAP UP5-6 p.30 |
| tax.2026.class_5_6.lower_probe_factor | — | 0.75 | ratio | PAP UP5-6 p.30 |
| tax.2026.class_5_6.difference_multiplier | — | 2 | multiplier | PAP UP5-6 p.30 |

These parameters are inseparable from their control flow and rounding. A generic progressive-tax implementation cannot substitute for the PAP’s V/VI procedures.

## 8. Cohort-locked pension and age parameters

These values depend on the person’s entry cohort, not merely the calculation year. The 2026 row applies only when the pension begins in 2026 or when 2026 is the calendar year following completion of age 64, respectively.

| Parameter ID | 2026 cohort value | Unit | Condition | Source |
| --- | ---: | --- | --- | --- |
| tax.cohort_2026.pension_allowance.rate | 0.128 | ratio | Pension begins in 2026 | PAP TAB1 row 2026 p.18; EStG §19(2) |
| tax.cohort_2026.pension_allowance.maximum | 960 | EUR/year | Same | PAP TAB2 row 2026 p.18; EStG §19(2) |
| tax.cohort_2026.pension_allowance.supplement | 288 | EUR/year | Same | PAP TAB3 row 2026 p.18; EStG §19(2) |
| tax.cohort_2026.age_relief.rate | 0.128 | ratio | 2026 follows the year age 64 was completed | PAP TAB4 row 2026 p.19; EStG §24a |
| tax.cohort_2026.age_relief.maximum | 608 | EUR/year | Same | PAP TAB5 row 2026 p.19; EStG §24a |

Implementation rules:

- preserve the full statutory/PAP cohort table when these paths become supported;
- never apply the 2026 cohort row to a person whose relevant cohort year is earlier;
- never update an existing person’s locked cohort rate merely because the calculation year changes;
- keep these paths unsupported until all required pension/age inputs and fixtures are admitted.

## 9. Period conversion constants

| Parameter ID | LZZ | Annualisation | Allocation of annual cents | Source |
| --- | ---: | --- | --- | --- |
| tax.period.year | 1 | amount / 100 | JW | PAP MRE4JL p.15 and UPANTEIL p.32 |
| tax.period.month | 2 | amount × 12 / 100 | floor(JW / 12) | Same |
| tax.period.week | 3 | amount × 360 / 7 / 100 | floor(JW × 7 / 360) | Same |
| tax.period.day | 4 | amount × 360 / 100 | floor(JW / 360) | Same |

Arbitrary multi-day or multi-week periods are not represented by new constants. The PAP instructs payroll systems to calculate using the supported smaller period as applicable.

## 10. Related constants recorded but not approved here

The PAP MPARA block also contains:

- pension/unemployment assessment ceiling and employee rates;
- health/care assessment ceiling and employee-side allowance rates;
- childless surcharge, multi-child discounts and Saxony branch;
- SOLZFREI = EUR 20,350.

They are dependencies of the payroll algorithm, but their legal meaning and complete user-facing calculations belong to NP-RS-004 through NP-RS-008. NP-RS-003 must not be cited as the sole source for actual social-insurance deductions or solidarity surcharge.

## 11. Effective-date and version rules

- parameter-set ID: de-payroll-tax-2026;
- effective_from: 2026-01-01;
- effective_to: 2026-12-31;
- source PAP status: final, 2025-11-12;
- target calculation year: 2026;
- no fallback to 2025 or 2027 constants;
- no automatic activation of a changed BMF artifact;
- any corrected PAP creates a new reviewed parameter-set version;
- historical results retain the parameter-set version used at calculation time;
- calculation-year selection must fail closed when no approved set exists.

## 12. Proposed machine-readable record shape

Each parameter should eventually provide:

| Field | Requirement |
| --- | --- |
| id | Stable semantic identifier |
| source_field | BMF/statutory field or formula symbol |
| value | Exact decimal, integer or structured formula |
| unit | EUR/year, EUR, ratio, multiplier or precision |
| value_type | money, decimal, integer, boundary, formula |
| effective_from / effective_to | Required |
| inclusive_lower / inclusive_upper | Required for zones |
| source_ids | At least one verified source |
| source_locator | Page/procedure/statutory paragraph |
| rounding | Explicit stage and direction |
| applies_when | Tax class, cohort or other condition |
| verification_status | candidate, verified, superseded, conflict |
| reviewed_by / reviewed_at | Required before production |

Formula coefficients must not be flattened into undocumented numeric literals in engine code.

## 13. Validation and fixture requirements

The implementation must test:

- x = 0 and x = 12,348;
- every value immediately below, at and above each tariff boundary;
- exact formula results with full-euro input and output flooring;
- tax classes I–IV against BMF check-table values;
- class III KZTAB behaviour;
- classes V and VI around W1STKL5, W2STKL5 and W3STKL5;
- employee allowance capped by active wage;
- pension lump sum capped by eligible remaining pension income;
- class VI omission of the normal ANP branch;
- tax class II base EFA;
- ZKF values including 0, 0.5 and 1.0;
- KFB absent from ordinary wage-tax output but present in Soli/church bases;
- factor method with class IV only;
- monthly, weekly, daily and annual conversions;
- 2026 pension-start and age-relief cohort rows;
- rejection of a calculation year without an approved parameter set.

BMF check-table comparisons are cross-check fixtures. Expected values must also remain traceable to the PAP procedures and rounding sequence.

## 14. Engineering handoff

A later assumptions implementation should create:

1. a typed de-payroll-tax-2026 manifest;
2. exact decimal tariff coefficients;
3. explicit boundary objects rather than chained magic numbers;
4. class-specific allowance configuration;
5. cohort tables separated from annual tables;
6. source and locator metadata beside every value;
7. schema validation for units, dates and ranges;
8. CI rejection of uncited regulated literals;
9. boundary fixtures generated from the manifest;
10. result metadata exposing the selected parameter-set version.

## Acceptance check for NP-RS-003

- [x] Target year and effective period are explicit.
- [x] Final BMF PAP and governing statutory sources are recorded.
- [x] All 2026 tariff zones, boundaries and coefficients are documented.
- [x] Input and output flooring rules are recorded.
- [x] Fixed payroll allowances and class behaviour are documented.
- [x] Child-allowance amounts and payroll use are distinguished.
- [x] Class V/VI thresholds and supporting constants are documented.
- [x] 2026 pension and age cohort rows are recorded without misapplying them.
- [x] Period conversion constants are documented.
- [x] Social-insurance, solidarity-surcharge and church-tax boundaries are explicit.
- [x] Effective-date, versioning and fail-closed requirements are defined.
- [x] Proposed manifest fields and fixture requirements are included.


## Follow-on research

- [NP-RS-004 — Pension-insurance rules for 2026](NP-RS-004-pension-insurance-rules.md)
