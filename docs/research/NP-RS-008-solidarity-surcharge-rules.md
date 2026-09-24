# NP-RS-008 — Solidarity-surcharge calculation for 2026

**Status:** Accepted  
**Task:** NP-RS-008  
**Milestone:** M1 Research  
**Depends on:** [NP-RS-002](NP-RS-002-bmf-payroll-tax-algorithm.md)  
**Calculation year:** 2026  
**Effective period:** 2026-01-01 through 2026-12-31  
**Verified on:** 2026-09-24

## Decision

NettoPilot DE shall calculate the 2026 solidarity surcharge (Solidaritätszuschlag, SolZ) through the final BMF 2026 machine payroll plan already selected by NP-RS-002.

For recurring employment income, the governing calculation is:

- derive the annual solidarity-surcharge assessment base using the BMF payroll-tax algorithm;
- include the payroll child-allowance adjustment required by SolzG section 3(2a);
- apply an annual exemption threshold of **EUR 20,350** for the basic-tariff path;
- apply an annual exemption threshold of **EUR 40,700** for the splitting path used by tax class III;
- charge zero when the assessment base does not exceed the applicable threshold;
- above the threshold, calculate both:
  - **5.5%** of the assessment base; and
  - **11.9%** of the amount above the threshold;
- use the lower amount;
- discard fractions of a cent and allocate the annual amount to the wage-payment period exactly as the BMF plan specifies.

For other remuneration, including a supported one-off bonus, the annual threshold is tested using the BMF other-remuneration path. Once that gate is passed, the surcharge attributable to the other remuneration is **5.5% of its wage tax**; the 11.9% taper does not apply to that incremental wage-tax amount.

The surcharge is an employee tax deduction. It has no employer contribution.

## 1. Supported cases

This research approves the solidarity-surcharge path for:

- an ordinary salaried employee admitted by NP-PD-003;
- the supported 2026 BMF payroll-withholding path from NP-RS-002;
- tax classes I through VI where the underlying BMF input combination is supported;
- recurring monthly salary;
- annual salary entered by the user but paid as twelve recurring monthly payroll periods;
- validated child-allowance factors;
- validated payroll allowances and additional amounts;
- statutory or private health-insurance paths once their BMF payroll inputs are complete;
- zero, taper-zone and full-rate results;
- supported other remuneration using the BMF SONSTB path;
- individual results and simple arithmetic couple totals.

The following are not approved by this task:

- final assessed income tax or final annual solidarity-surcharge liability;
- complete joint tax-return modelling;
- arbitrary manual calculation from gross salary alone;
- tax class IV with factor unless the product contract supplies and validates the PAP factor inputs;
- employer annual wage-tax adjustment unless separately exposed and validated;
- capital-income and section 32d income-tax paths;
- flat-rate wage-tax paths;
- cross-border, treaty or limited-tax-liability cases;
- severance and other special remuneration outside the admitted BMF path;
- unsupported pension-benefit or section 19a cases;
- historical years.

A normal result must stop when the underlying BMF payroll calculation is incomplete or unsupported.

## 2. Authoritative sources

| Source ID | Authority and document | Evidence role | Applicability | Status |
| --- | --- | --- | --- | --- |
| DE-SOLZG-3 | [Solidarity Surcharge Act 1995, section 3](https://www.gesetze-im-internet.de/solzg_1995/__3.html) | Assessment base, child allowances, thresholds, payment periods and other remuneration | 2026 law | Verified |
| DE-SOLZG-4 | [Solidarity Surcharge Act 1995, section 4](https://www.gesetze-im-internet.de/solzg_1995/__4.html) | 5.5% rate, 11.9% taper ceiling and cent truncation | 2026 law | Verified |
| DE-SOLZG-6 | [Solidarity Surcharge Act 1995, section 6](https://www.gesetze-im-internet.de/solzg_1995/__6.html) | Confirms 2026 applicability of the amended threshold | From assessment year 2026 | Verified |
| DE-BMF-PAP-2026-PUBLICATION | [BMF — 2026 payroll-program publication](https://www.bundesfinanzministerium.de/Content/DE/Downloads/Steuern/Steuerarten/Lohnsteuer/Programmablaufplan/2025-11-12-PAP-2026.html) | Governing publication record | 2026 | Verified |
| DE-BMF-PAP-2026-A1 | [BMF — 2026 machine payroll plan, final 12 November 2025](https://www.bundesfinanzministerium.de/Content/DE/Downloads/Steuern/Steuerarten/Lohnsteuer/Programmablaufplan/2025-11-12-PAP-2026-anlage-1.pdf?__blob=publicationFile&v=2) | Governing payroll algorithm, fields, period allocation and rounding | 2026 | Verified |
| DE-BMF-LSTH-2026-SOLZ | [BMF 2026 Payroll Tax Manual, Solidarity Surcharge appendix](https://lsth.bundesfinanzministerium.de/lsth/2026/B-Anhaenge/Anhang-27/I/inhalt.html) | Official consolidated presentation of sections 3–4 | 2026 | Corroborating |
| DE-ESTG-39B | [Income Tax Act, section 39b](https://www.gesetze-im-internet.de/estg/__39b.html) | Recurring wage and other-remuneration withholding framework | Current 2026 law | Verified |
| DE-ESTG-51A | [Income Tax Act, section 51a](https://www.gesetze-im-internet.de/estg/__51a.html) | Child-adjusted assessment-base context for surcharge taxes | Current 2026 law | Verified |

The final BMF plan, not a draft, third-party salary calculator or gross-salary table, is the implementation authority for payroll withholding.

## 3. 2026 parameter table

| Parameter ID | Value | Unit | Effective period | Source |
| --- | ---: | --- | --- | --- |
| soli.2026.standard_threshold | 20,350 | EUR annual tax base | 2026-01-01 to 2026-12-31 | DE-SOLZG-3 |
| soli.2026.splitting_threshold | 40,700 | EUR annual tax base | Same | DE-SOLZG-3 |
| soli.2026.full_rate | 0.055 | ratio | Same | DE-SOLZG-4 |
| soli.2026.taper_rate | 0.119 | ratio | Same | DE-SOLZG-4 |
| soli.2026.basic_tariff_multiplier | 1 | factor | Same | DE-BMF-PAP-2026-A1 |
| soli.2026.splitting_multiplier | 2 | factor | Same | DE-BMF-PAP-2026-A1 |
| soli.2026.output_unit | integer cent | unit | Same | DE-BMF-PAP-2026-A1 |
| soli.2026.final_fraction_rule | truncate | rule | Same | DE-SOLZG-4; DE-BMF-PAP-2026-A1 |
| soli.2026.month_fraction | 1/12 | annual allocation | Same | DE-SOLZG-3; DE-BMF-PAP-2026-A1 |
| soli.2026.week_fraction | 7/360 | annual allocation | Same | Same |
| soli.2026.day_fraction | 1/360 | annual allocation | Same | Same |

Suggested assumption-set identifier: **de-solidarity-surcharge-2026-v1**.

The thresholds are tax amounts, not gross-salary thresholds and not taxable-income thresholds. NettoPilot DE must never label EUR 20,350 or EUR 40,700 as a salary allowance.

## 4. Relationship to wage tax

The solidarity surcharge is a surcharge tax whose payroll assessment base is derived from wage tax. However, its base is not always the same as the wage-tax amount displayed to the user.

For recurring pay:

- the BMF plan first calculates ordinary wage tax;
- when a child-allowance factor exists, it recalculates the relevant annual tax amount with the statutory child allowances;
- that child-adjusted annual tax amount becomes JBMG, the annual base used for SolZ;
- the threshold and taper are tested against JBMG;
- the resulting annual SolZ is allocated to the payroll period.

Consequences:

- do not calculate SolZ as 5.5% of LSTLZZ;
- do not compare displayed monthly wage tax directly with a rounded monthly threshold;
- a child allowance can reduce SolZ and church-tax base even though it does not reduce ordinary recurring wage tax in the same way;
- zero SolZ does not mean zero wage tax;
- gross salary alone is insufficient to identify the exact SolZ boundary.

The result is payroll withholding, not a final income-tax assessment. A later tax return can produce a different annual outcome.

## 5. Canonical input mapping

| Product or PAP field | Solidarity-surcharge use |
| --- | --- |
| calculationYear | Selects the 2026 PAP and SolZ assumption set |
| tax.taxClass / STKL | Selects payroll class and basic-versus-splitting threshold path |
| tax.childAllowanceFactor / ZKF | Produces the statutory child-adjusted assessment base |
| tax.annualAllowanceAmount | Maps to the validated PAP allowance inputs |
| tax.annualAdditionalAmount | Maps to the validated PAP addition inputs |
| recurring taxable pay / RE4 | Drives recurring wage-tax and SolZ calculation |
| wage-payment period / LZZ | Selects annual, monthly, weekly or daily allocation |
| insurance and care-status inputs | Drive the PAP Vorsorgepauschale and therefore the tax base |
| other remuneration / SONSTB | Drives supported one-off wage tax and SOLZS |
| expected annual wage / JRE4 | Required for the other-remuneration path |
| other-remuneration month | Selects the event-period assumptions and rates |

Input requirements:

- tax class must be explicit;
- the child-allowance factor must be passed unchanged after validation;
- zero child allowance is not inferred from parenthood or care-insurance data;
- insurance inputs used by the PAP must be complete;
- annual salary entered by the user must map to its real payroll frequency;
- a regular monthly salary is not converted into LZZ = annual merely because the UI input period is annual;
- other remuneration requires the complete BMF annual comparison inputs;
- tax class IV with factor is unsupported until AF and F are represented by the product input contract.

## 6. Threshold selection

Define KZTAB as the BMF tariff multiplier:

| Payroll path | KZTAB | 2026 threshold |
| --- | ---: | ---: |
| Tax class III / splitting procedure | 2 | EUR 40,700 |
| Tax classes I, II, IV, V and VI / basic threshold | 1 | EUR 20,350 |

The law expresses the recurring-pay thresholds for the actual wage-payment period:

| Payment period | Basic-threshold fraction | Splitting-threshold fraction |
| --- | --- | --- |
| Annual | EUR 20,350 | EUR 40,700 |
| Monthly | 1/12 of annual | 1/12 of annual |
| Weekly | 7/360 of annual | 7/360 of annual |
| Daily | 1/360 of annual | 1/360 of annual |

For display only, the monthly fractions are approximately EUR 1,695.83 and EUR 3,391.67. The engine must not store those rounded displays as authoritative thresholds. The BMF plan annualises the payroll calculation, compares the annual JBMG with the exact annual threshold and then allocates the result.

## 7. Recurring-pay calculation

### 7.1 Governing algorithm

The implementation shall call the BMF 2026 plan and preserve its named MSOLZ and UPANTEIL behavior.

Conceptually:

    threshold = 20,350 × KZTAB

    if JBMG <= threshold:
        annual_soli = 0
    else:
        full_amount = JBMG × 0.055
        taper_amount = (JBMG - threshold) × 0.119
        annual_soli = min(full_amount, taper_amount)

    period_soli_cents = floor(
        annual_soli × 100 × period_fraction
    )

where period_fraction is:

- 1 for annual payroll;
- 1/12 for monthly payroll;
- 7/360 for weekly payroll;
- 1/360 for daily payroll.

This is explanatory pseudocode only. The production engine must use the exact PAP field precision, branch order and assignment semantics.

### 7.2 Zero zone

When JBMG is equal to or below the threshold:

- SOLZLZZ is zero;
- the UI should say the 2026 exemption threshold removed the payroll surcharge;
- the product must not imply that the employee is generally exempt from all forms of SolZ.

The comparison is strictly “greater than.” Equality remains zero.

### 7.3 Taper zone

Immediately above the threshold, the 11.9% calculation is lower than 5.5% of the full base. It prevents a cliff.

The algebraic crossover is:

    threshold × 0.119 / (0.119 - 0.055)
    = threshold × 119 / 64

Reference crossover bases:

- basic path: EUR 37,838.28125;
- splitting path: EUR 75,676.5625.

These are explanatory reference values, not separately rounded legal constants. Exact payroll results follow the PAP's tax-base precision and cent truncation.

### 7.4 Full-rate zone

Above the crossover, 5.5% of the assessment base is the lower value and therefore controls.

“Full rate” means 5.5% of the SolZ assessment base, not 5.5% of gross salary.

## 8. Child-allowance treatment

SolzG section 3(2a) requires a child-adjusted payroll tax base.

The 2026 PAP:

- receives ZKF, the payroll child-allowance factor;
- uses the 2026 child-allowance values from its tariff path;
- recalculates the annual tax amount for SolZ and church-tax purposes;
- stores that amount as JBMG;
- leaves ordinary recurring wage-tax output conceptually separate.

Implementation rules:

- use the PAP's ZKF semantics and precision;
- do not use number of children directly;
- do not reuse social.careInsuranceChildStatus;
- do not reuse social.childrenUnderRelevantAge;
- do not reconstruct the child allowance with a UI formula;
- expose the child-allowance factor used in result assumptions;
- test zero, fractional and positive factors supported by the year registry.

The parent/care-insurance concepts in NP-RS-007 are legally and computationally separate from this payroll child allowance.

## 9. Other remuneration and one-off payments

For a supported payment classified as other remuneration:

1. run the BMF other-remuneration path using SONSTB, JRE4 and the required annual fields;
2. calculate wage tax on the other remuneration as STS;
3. calculate the child-adjusted annual threshold-testing base SOLZSBMG;
4. select EUR 20,350 or EUR 40,700 through KZTAB;
5. when SOLZSBMG does not exceed the threshold, SOLZS is zero;
6. when SOLZSBMG exceeds the threshold:

       SOLZS = truncateToCent(STS × 0.055)

The 11.9% taper does not apply to SOLZS. SolzG section 4 expressly applies 5.5% to wage tax under EStG section 39b(3), subject to the annual gate in section 3(4a).

Consequences:

- do not add a bonus to recurring monthly pay and re-run only the monthly formula;
- do not apply the recurring-pay taper to STS;
- do not determine the gate from the bonus amount alone;
- retain SOLZS separately from SOLZLZZ in engine output;
- total period SolZ may display their sum only with both components visible;
- an incomplete JRE4/SONSTB path must produce unknown or unsupported, not zero.

NP-RS-011 still controls the social-insurance allocation of one-time payments; it does not replace this tax-withholding rule.

## 10. Rounding and truncation

The surcharge does not use ordinary half-up currency rounding.

Rules:

- preserve the exact decimal operations required by the PAP;
- discard fractions of a cent for the SolZ result;
- use integer cents for SOLZLZZ and SOLZS outputs;
- floor the allocated annual amount for monthly, weekly and daily periods;
- do not round an approximate monthly threshold;
- do not round the 5.5% and 11.9% candidates before selecting the lower amount;
- do not derive monthly SolZ by dividing a previously rounded annual display amount;
- do not apply a global half-up money helper.

For non-negative supported payroll values, “fractions of a cent remain unconsidered” is implemented as truncation toward zero at the specified final output/period-allocation point.

## 11. Derived assessment-base fixtures

These fixtures begin with a verified JBMG or threshold-testing base. They do not assert that a particular gross salary always produces that base.

### 11.1 Recurring annual base, basic path

| JBMG | Zone | 5.5% candidate | 11.9% candidate | Annual SolZ before period allocation |
| ---: | --- | ---: | ---: | ---: |
| EUR 0 | Zero | EUR 0.00 | Not applicable | EUR 0.00 |
| EUR 20,350 | Zero | EUR 1,119.25 | EUR 0.00 | EUR 0.00 |
| EUR 25,000 | Taper | EUR 1,375.00 | EUR 553.35 | EUR 553.35 |
| EUR 37,838 | Taper | EUR 2,081.09 | EUR 2,081.072 | EUR 2,081.07 after cent truncation |
| EUR 37,839 | Full-rate | EUR 2,081.145 | EUR 2,081.191 | EUR 2,081.14 after cent truncation |
| EUR 40,000 | Full-rate | EUR 2,200.00 | EUR 2,338.35 | EUR 2,200.00 |

For a monthly wage-payment period, the EUR 25,000 annual-base fixture allocates EUR 46.11 per month because EUR 553.35 × 100 / 12 is floored to 4,611 cents.

### 11.2 Recurring annual base, splitting path

| JBMG | Zone | 5.5% candidate | 11.9% candidate | Annual SolZ |
| ---: | --- | ---: | ---: | ---: |
| EUR 40,700 | Zero | EUR 2,238.50 | EUR 0.00 | EUR 0.00 |
| EUR 50,000 | Taper | EUR 2,750.00 | EUR 1,106.70 | EUR 1,106.70 |
| EUR 75,676 | Taper | EUR 4,162.18 | EUR 4,162.144 | EUR 4,162.14 after cent truncation |
| EUR 75,677 | Full-rate | EUR 4,162.235 | EUR 4,162.263 | EUR 4,162.23 after cent truncation |

### 11.3 Other-remuneration gate

| Annual gate result | STS | SOLZS |
| --- | ---: | ---: |
| SOLZSBMG at threshold | EUR 1,000.00 | EUR 0.00 |
| SOLZSBMG above threshold | EUR 1,000.00 | EUR 55.00 |
| SOLZSBMG above threshold | EUR 123.45 | EUR 6.78 after cent truncation |

Fixtures based on gross salary must be generated through the complete BMF PAP and approved reference implementation, not reverse-engineered from these tables.

## 12. Monthly and annual product behavior

NettoPilot DE accepts monthly or annual salary entry, but an annual entry normally represents twelve recurring monthly payrolls.

Therefore:

- monthly salary entry: run LZZ = 2 for the payroll month;
- annual salary entry with twelve equal payments: derive the recurring monthly amount, run twelve monthly periods and sum outputs;
- do not use LZZ = 1 merely because the UI amount was entered annually;
- LZZ = 1 is reserved for a genuine annual wage-payment period;
- if tax, insurance, allowance or child inputs change during the year, segment the months;
- annual displayed SolZ is the sum of period outputs and may differ by cents from a single annual-period calculation;
- offer comparisons must use the same period model and assumption version.

A recurring monthly result excludes SOLZS from future bonuses. A total-compensation result includes SOLZS only for supported, month-specific other remuneration.

## 13. Tax classes and factor method

| Tax class | Threshold path | Notes |
| --- | --- | --- |
| I | Basic | Child allowance may alter JBMG |
| II | Basic | Includes class-II wage-tax treatment before SolZ |
| III | Splitting | KZTAB = 2; EUR 40,700 threshold |
| IV | Basic | Standard IV supported; factor method needs AF and F |
| V | Basic | PAP class V/VI tax path; no splitting threshold |
| VI | Basic | PAP class V/VI tax path; input restrictions apply |

A married or partnered user does not receive the splitting threshold merely because of relationship status. The payroll tax class/PAP path controls.

Tax class IV with factor must remain unsupported until the canonical input schema includes:

- factor-method flag;
- validated factor value at PAP precision;
- cross-field restrictions;
- bilingual explanation and test fixtures.

## 14. Couple and offer-comparison boundaries

For a couple view:

- calculate each person's payroll SolZ independently;
- show each tax class and threshold path;
- sum the two supported SolZ outputs arithmetically;
- do not recompute a joint-assessment surcharge;
- state that the household total is not a joint tax-return forecast.

For two offers:

- use identical personal tax inputs unless the user changes them explicitly;
- calculate each offer independently through the PAP;
- compare absolute monthly and annual SolZ;
- explain zero-to-taper or taper-to-full transitions when material;
- never claim that lower SolZ alone makes an offer objectively better.

## 15. Result states and warnings

### Exact supported result

Allowed when:

- calculation year is 2026;
- the scenario passes scope admission;
- all required PAP inputs are known;
- recurring or other-remuneration classification is supported;
- period mapping is explicit;
- the final 2026 PAP and assumption set are used.

### Incomplete result

Use when:

- child-allowance factor is unknown;
- insurance inputs needed by the PAP are incomplete;
- annual salary payment frequency is unclear;
- other remuneration lacks JRE4 or another required annual input;
- a changing-year scenario lacks effective months.

### Unsupported result

Use for:

- factor method without AF/F inputs;
- cross-border or treaty treatment;
- capital-income SolZ;
- flat-rate wage-tax cases;
- severance or special payments outside the supported classification registry;
- final tax-return or joint-assessment requests.

### Required warnings

- “Payroll estimate, not final tax assessment.”
- “Annual amount is the sum of monthly payroll periods.”
- “Child allowance affects the surcharge assessment base.”
- “Other remuneration uses a separate annual gate and 5.5% rule.”
- “Exact result unavailable because required payroll inputs are missing.”

## 16. Bilingual labels and explanations

| Concept | German | English |
| --- | --- | --- |
| Solidarity surcharge | Solidaritätszuschlag | Solidarity surcharge |
| Surcharge assessment base | Bemessungsgrundlage des Solidaritätszuschlags | Solidarity-surcharge assessment base |
| Exemption threshold | Freigrenze | Exemption threshold |
| Taper zone | Milderungszone | Taper zone |
| Full-rate zone | Vollbelastungszone | Full-rate zone |
| Surcharge on recurring pay | Solidaritätszuschlag auf laufenden Arbeitslohn | Solidarity surcharge on recurring pay |
| Surcharge on other remuneration | Solidaritätszuschlag auf sonstige Bezüge | Solidarity surcharge on other remuneration |
| Child-allowance-adjusted base | Bemessungsgrundlage unter Berücksichtigung der Kinderfreibeträge | Child-allowance-adjusted assessment base |
| Payroll estimate | Lohnabrechnungs-Schätzung | Payroll estimate |
| Final tax assessment | Einkommensteuerveranlagung | Final tax assessment |

German explanation:

> Der Solidaritätszuschlag wird nicht direkt aus dem Bruttogehalt berechnet. Maßgeblich ist eine nach dem BMF-Programm ermittelte, gegebenenfalls um Kinderfreibeträge angepasste Lohnsteuer-Bemessungsgrundlage. Oberhalb der Freigrenze begrenzt die Milderungszone den Zuschlag, bevor der volle Satz von 5,5 Prozent greift.

English explanation:

> The solidarity surcharge is not calculated directly from gross salary. It uses a wage-tax assessment base produced by the BMF payroll program and adjusted for child allowances where applicable. Above the exemption threshold, the taper limits the surcharge before the full 5.5% rate applies.

## 17. Output and metadata requirements

Each individual result must expose:

- SOLZLZZ for recurring pay;
- SOLZS for other remuneration;
- combined period SolZ when both exist;
- annual sum of payroll-period outputs;
- assessment-base category;
- threshold path: basic or splitting;
- zone: zero, taper or full rate;
- child-allowance factor used;
- tax class;
- wage-payment period;
- one-off-payment month when relevant;
- PAP version and publication date;
- assumption-set ID and version;
- source IDs;
- result quality and warnings.

The public UI need not expose every internal PAP variable by default. A details panel should show enough information to explain why the result is zero, tapered or full-rate without mislabelling JBMG as ordinary wage tax.

## 18. Versioned data requirements

| Field | Requirement |
| --- | --- |
| parameter_id | Stable semantic identifier |
| value and unit | Decimal ratio, EUR or period fraction |
| effective_from / effective_to | Exact 2026 period |
| source_ids | Official statute and BMF plan |
| source_locator | Section, paragraph, PAP procedure/page |
| verified_on | Verification date |
| pap_version | Final 12 November 2025 |
| reviewed_by / reviewed_at | Required before production |
| supersedes | Prior-year parameter record |
| supported | Admission flag |

No threshold, rate or crossover value may live only in a form component. Derived crossover values must be marked derived and must not replace the statutory threshold/rate inputs.

## 19. Validation and fixture requirements

Required fixtures include:

- JBMG zero;
- one cent or smallest PAP unit below, at and above the applicable threshold;
- basic and splitting threshold paths;
- zero, taper and full-rate zones;
- crossover values on both sides;
- ZKF zero, fractional and positive values;
- tax classes I through VI;
- ordinary class IV and rejected class-IV factor case;
- monthly, weekly, daily and genuine annual payroll periods;
- annual UI input mapped to twelve monthly periods;
- cent-truncation cases;
- period-allocation floor cases;
- recurring pay with zero SolZ but positive wage tax;
- supported other remuneration below, at and above the annual gate;
- STS values producing fractional cents;
- incomplete JRE4/SONSTB inputs;
- statutory and private insurance PAP paths;
- couple arithmetic total;
- two-offer comparison with a zone transition.

Assertions must verify:

- JBMG or SOLZSBMG threshold-testing base;
- KZTAB and threshold;
- selected zone;
- 5.5% candidate;
- 11.9% candidate where applicable;
- selected annual amount;
- final integer-cent period output;
- separate SOLZLZZ and SOLZS values;
- result quality, warnings and source metadata.

At least one full gross-to-net fixture per supported tax class must be compared with an approved reference implementation of the final 2026 PAP.

## 20. Engineering handoff

Implementation should provide:

1. the final BMF 2026 PAP adapter from NP-RS-002;
2. versioned SolZ parameters and sources;
3. exact decimal arithmetic;
4. explicit truncate/floor operations separate from half-up rounding;
5. traceable MSOLZ and UPANTEIL functions;
6. separate recurring and other-remuneration outputs;
7. zone and threshold-path metadata;
8. child-allowance-adjusted assessment-base handling;
9. twelve-period annual-salary aggregation;
10. fail-closed input validation;
11. factor-method admission control;
12. bilingual explanations and warnings;
13. fixtures at thresholds, taper crossovers and cent boundaries;
14. source/version metadata on every result.

## Acceptance check for NP-RS-008

- [x] The official 2026 calculation path is identified.
- [x] Basic and splitting thresholds are documented.
- [x] The 5.5% full rate and 11.9% taper are defined.
- [x] Equality at the threshold and zero-zone behavior are defined.
- [x] Child-allowance adjustment is separated from ordinary wage tax.
- [x] Recurring-pay period allocation and truncation are defined.
- [x] Other-remuneration gate and non-tapered 5.5% rule are defined.
- [x] Monthly and annual salary-entry behavior is bounded.
- [x] Tax classes and factor-method limitation are documented.
- [x] Couple and comparison boundaries are documented.
- [x] Bilingual labels, result states, fixtures and engineering handoff are included.
