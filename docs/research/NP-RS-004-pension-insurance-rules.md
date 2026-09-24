# NP-RS-004 — Pension-insurance rules for 2026

**Status:** Proposed for review  
**Task:** NP-RS-004  
**Milestone:** M1 Research  
**Depends on:** [NP-RS-001](NP-RS-001-authoritative-source-standard.md)  
**Calculation year:** 2026  
**Effective period:** 2026-01-01 through 2026-12-31  
**Verified on:** 2026-09-24

## Decision

For an ordinary employee subject to Germany’s general statutory pension insurance in 2026, NettoPilot DE shall calculate pension contributions using:

- total contribution rate: **18.6%**;
- employee rate: **9.3%**;
- employer rate: **9.3%**;
- nationwide monthly assessment ceiling: **EUR 8,450**;
- nationwide annual assessment ceiling: **EUR 101,400**;
- monthly, social-insurance-day and rounding rules from the Beitragsverfahrensverordnung.

For a full contribution month:

- contribution base = minimum of pension-insurance-liable pay and EUR 8,450;
- employee contribution = round-half-up-to-cents(contribution base × 9.3%);
- employer contribution = the same amount in the normal equal-share case;
- total contribution = twice the rounded half contribution.

The module must not reuse the BMF wage-tax Vorsorgepauschale as the actual pension contribution. The tax allowance and actual contribution are separate calculations.

## 1. Supported case

This research approves the rule set for:

- one ordinary employment relationship;
- regular salaried employment in Germany;
- general statutory pension insurance;
- a full or partial contribution month;
- recurring pension-insurance-liable pay;
- standard equal employee/employer allocation;
- gross pay above the 2026 transition range when the normal formula is used.

The following remain unsupported or require separate rules:

- mini-jobs;
- the transition range/midijobs;
- multiple simultaneous employment relationships;
- self-employment or voluntary contributions;
- short-time work;
- partial retirement;
- apprentices and special low-pay allocation cases;
- contribution-free or exempt employment categories;
- professional pension schemes;
- miners’ pension insurance;
- cross-border/social-security coordination;
- complete one-off-payment allocation, including the March clause;
- back pay and corrections spanning periods.

The UI must return an unsupported or incomplete-result state for these cases instead of applying the normal 9.3% share blindly.

## 2. Authoritative sources

| Source ID | Authority and document | Evidence role | Applicability | Status |
| --- | --- | --- | --- | --- |
| DE-SVBEZGRV-2026-4 | [Social Insurance Calculation Parameters Ordinance 2026, section 4](https://www.gesetze-im-internet.de/svbezgrv_2026/__4.html) | Governing 2026 pension assessment ceilings | 2026 | Verified |
| DE-BMAS-SV-VALUES-2026 | [BMAS — Sozialversicherungsrechengrößen-Verordnung 2026](https://www.bmas.de/DE/Service/Gesetze-und-Gesetzesvorhaben/sozialversicherungs-rechengroessenverordnung-2026.html) | Official consolidated 2026 values | 2026 | Verified |
| DE-DRV-SV-VALUES-2026 | [Deutsche Rentenversicherung — 2026 social-insurance values](https://www.deutsche-rentenversicherung.de/KnappschaftBahnSee/DE/Aktuelles/Meldungen/2026/2026_01_02_Sozialversicherungsrechengroessen2026.html) | Competent-authority confirmation of rates, ceilings and shares | From 1 January 2026 | Verified |
| DE-SGBVI-158 | [SGB VI section 158 — contribution rates](https://www.gesetze-im-internet.de/sgb_6/__158.html) | Statutory rate-setting framework | Current law | Verified |
| DE-SGBVI-159 | [SGB VI section 159 — assessment ceilings](https://www.gesetze-im-internet.de/sgb_6/__159.html) | Statutory ceiling framework | Current law | Verified |
| DE-SGBVI-162 | [SGB VI section 162 — liable earnings of employees](https://www.gesetze-im-internet.de/sgb_6/__162.html) | Contribution base for employees | Current law | Verified |
| DE-SGBVI-168 | [SGB VI section 168 — allocation for employees](https://www.gesetze-im-internet.de/sgb_6/__168.html) | Employee/employer allocation | Current law | Verified |
| DE-SGBIV-14 | [SGB IV section 14 — employment remuneration](https://www.gesetze-im-internet.de/sgb_4/__14.html) | Defines recurring and one-time employment remuneration | Current law | Verified |
| DE-SGBIV-23A | [SGB IV section 23a — one-time remuneration](https://www.gesetze-im-internet.de/sgb_4/__23a.html) | One-off-payment allocation and proportional annual ceiling | Current law | Verified |
| DE-BVV-1-2 | [Beitragsverfahrensverordnung sections 1–2](https://www.gesetze-im-internet.de/beitrvv/BJNR113800006.html) | Contribution periods, ceiling proration and rounding | Current 2026 version | Verified |

The BMF payroll-tax PAP remains a source for the Vorsorgepauschale only. It is not the governing source for actual pension contribution amounts.

## 3. 2026 parameter table

| Parameter ID | Value | Unit | Effective period | Source |
| --- | ---: | --- | --- | --- |
| pension.2026.general.total_rate | 0.186 | ratio | 2026-01-01 to 2026-12-31 | DE-DRV-SV-VALUES-2026; SGB VI §158 framework |
| pension.2026.general.employee_rate | 0.093 | ratio | Same | DE-DRV-SV-VALUES-2026; SGB VI §168(1)(1) |
| pension.2026.general.employer_rate | 0.093 | ratio | Same | Same |
| pension.2026.general.ceiling_month | 8,450.00 | EUR/month | Same | DE-SVBEZGRV-2026-4 |
| pension.2026.general.ceiling_year | 101,400.00 | EUR/year | Same | DE-SVBEZGRV-2026-4 |
| pension.2026.contribution_month_days | 30 | social-insurance days | Same | BVV §1(1) |
| pension.2026.money_scale | 2 | decimal places | Same | BVV §1(2) |
| pension.2026.rounding | half_up | rule | Same | BVV §1(2) |
| pension.2026.regional_model | nationwide | enum | Same | BMAS/DRV 2026 values |

### Derived maximums for a full month/year

| Result | Calculation | Value |
| --- | --- | ---: |
| Employee maximum per full month | EUR 8,450 × 9.3% | EUR 785.85 |
| Employer maximum per full month | EUR 8,450 × 9.3% | EUR 785.85 |
| Total maximum per full month | 2 × EUR 785.85 | EUR 1,571.70 |
| Employee maximum for 12 full months | EUR 785.85 × 12 | EUR 9,430.20 |
| Employer maximum for 12 full months | EUR 785.85 × 12 | EUR 9,430.20 |
| Total maximum for 12 full months | EUR 1,571.70 × 12 | EUR 18,860.40 |

Derived values must either be calculated at runtime from sourced primitives or carry explicit derivation metadata. They must not become independently maintained constants.

## 4. Regional treatment

The 2026 ceiling for the general pension insurance is **bundeseinheitlich**—the same throughout Germany.

Consequences:

- do not ask for federal state to calculate the general pension contribution;
- do not maintain East/West ceiling variants for 2026;
- historical calculators may require historical regional versions, but they are outside the 2026 v1 set;
- federal state remains relevant to other modules, such as church tax and Saxony care insurance, but not this normal 2026 pension calculation.

## 5. Contribution base

### 5.1 Employment remuneration

SGB IV section 14 defines employment remuneration broadly as recurring or one-time income from employment, regardless of entitlement, description, form or whether it is paid directly from or in connection with employment.

The salary calculator must not assume that every tax-free or non-cash benefit is pension-insurance liable. The Social Insurance Remuneration Ordinance and case-specific rules can exclude or modify items. V1 should accept only the compensation categories whose pension-insurance treatment has been explicitly mapped.

### 5.2 Normal full-month base

For supported recurring pay in a full contribution month:

[
B = min(max(E, 0), 8{,}450.00)
]

where:

- (E) is pension-insurance-liable remuneration for the month;
- (B) is the contribution base.

Salary above EUR 8,450 does not increase the pension contribution for that month.

### 5.3 Partial contribution month

BVV section 1 calculates ceilings for the calendar days on which insured employment exists and treats a full calendar month as 30 social-insurance days.

For (d) contribution days:

[
C_d = 8{,}450.00 	imes rac{d}{30}
]

[
B_d = min(max(E_d, 0), C_d)
]

The implementation must preserve unrounded intermediate values and apply the BVV final rounding rule. A later architecture task must define how date inputs produce (d); v1 may instead reject partial months until those inputs exist.

### 5.4 Annual input

An annual salary input is not itself an annual contribution event. For a stable salary paid equally over twelve full months:

1. derive the monthly recurring pay using the approved salary-period rules;
2. calculate each month;
3. sum the twelve monthly contributions.

This preserves monthly ceilings and cent rounding. Do not calculate every scenario as annual gross × 9.3% capped once at EUR 101,400, because irregular months, partial months and one-off payments can differ.

## 6. Employee/employer calculation and rounding

BVV section 1 requires:

- no rounding of individual intermediate calculations;
- final results to two decimal places;
- increase the second decimal when the third decimal is 5–9.

BVV section 2 requires equal-share contributions to be calculated by applying the half rate to remuneration, rounding that half, then doubling it.

For the normal general-pension case:

[
A_{employee} = roundHalfUp(B 	imes 0.093, 2)
]

[
A_{employer} = A_{employee}
]

[
A_{total} = A_{employee} 	imes 2
]

Do not calculate the total first and split the rounded total afterward. Those operations can differ by one cent.

### Examples

| Scenario | Contribution base | Employee | Employer | Total |
| --- | ---: | ---: | ---: | ---: |
| EUR 4,000 full-month liable pay | EUR 4,000.00 | EUR 372.00 | EUR 372.00 | EUR 744.00 |
| EUR 10,000 full-month liable pay | EUR 8,450.00 | EUR 785.85 | EUR 785.85 | EUR 1,571.70 |
| 15 contribution days with pay at/above prorated ceiling | EUR 4,225.00 | EUR 392.93 | EUR 392.93 | EUR 785.86 |

These examples are derived fixtures, not a substitute for official source records.

## 7. Recurring and one-time remuneration

Recurring remuneration is assessed in its contribution month, subject to that month’s ceiling.

One-time remuneration such as a Christmas bonus or holiday bonus is generally assigned to the payment period in which it is paid. It is liable only to the extent that the current-year remuneration plus the one-time amount does not exceed the proportional annual assessment ceiling. Special rules apply to payments from January through March.

Therefore:

- the one-off-payment month matters;
- year-to-date liable remuneration matters;
- months without insured employment can affect the proportional annual ceiling;
- a standalone annual bonus input without timing and year-to-date context cannot produce an exact pension contribution;
- NP-RS-011 must define the complete supported one-off-payment path;
- until then, show an assumption/unknown state rather than cap a bonus only against the payment month.

## 8. Interaction with the BMF payroll-tax plan

The BMF PAP uses:

- BBGRVALV = EUR 101,400;
- RVSATZAN = 0.0930;
- KRV to select the pension component of the Vorsorgepauschale.

This agrees with the 2026 general employee share and annual ceiling, but the meanings differ:

| Calculation | Purpose | Output |
| --- | --- | --- |
| Actual pension module | Determine the employee and employer pension contributions | Employee deduction, employer contribution and total |
| BMF PAP Vorsorgepauschale | Determine a tax-withholding allowance | A component of taxable-income calculation |

A person can require KRV treatment in the tax algorithm without the calculator being able to estimate an actual statutory pension contribution—for example, a member of a professional pension scheme. Keep the two status models separate.

## 9. Coverage and status model

The contribution module needs an explicit pension coverage status.

| Status | Actual v1 contribution | PAP KRV mapping | Result behaviour |
| --- | --- | --- | --- |
| general_statutory_mandatory | Calculate with approved rules | 0 | Normal supported result |
| general_statutory_voluntary_after_exemption | Requires scope review | PAP may use 0 | Do not infer actual payment |
| professional_scheme | Not calculated by this module | PAP may use 0 | Request scheme contribution or show unknown |
| statutory_exempt | EUR 0 only with validated exemption | 1 | Explain exemption assumption |
| miners_scheme | Unsupported | Separate 24.7% scheme | No normal estimate |
| minijob | Deferred | Special | Unsupported |
| transition_range | Deferred | Special | Unsupported |
| unknown | Unknown | Unknown | Block final net result |

The UI must not default an unknown status to general statutory coverage without an explicit user-facing assumption approved by the product specification.

## 10. Miners’ pension scheme boundary

Official 2026 reference values are:

- total rate: 24.7%;
- employee rate: 9.3%;
- employer rate: 15.4%;
- monthly ceiling: EUR 10,400;
- annual ceiling: EUR 124,800.

These values are recorded only to detect and explain an unsupported case. V1 must not calculate the miners’ scheme using the general-pension module.

## 11. Mini-job and transition-range boundary

For 2026:

- the mini-job earnings limit is EUR 603 per month;
- the transition range is EUR 603.01 through EUR 2,000 per month;
- employee/employer shares are not the ordinary equal 9.3% calculation in those paths.

NP-PD-003 explicitly defers mini-jobs and midijobs. The salary calculator must route these cases to an unsupported message. Standard part-time employment is supported only when it does not enter a deferred employment category.

## 12. Result outputs and explanations

For the supported case, expose:

- pension-insurance-liable remuneration;
- applied monthly/prorated ceiling;
- uncapped and capped contribution base;
- employee rate and contribution;
- employer rate and contribution;
- total pension contribution;
- whether the ceiling was reached;
- calculation month/year;
- number of contribution days when applicable;
- assumption/source version;
- warnings for excluded compensation items or approximate annualisation.

German labels:

- Rentenversicherungspflichtiges Entgelt
- Beitragsbemessungsgrenze Rentenversicherung
- Arbeitnehmeranteil Rentenversicherung
- Arbeitgeberanteil Rentenversicherung
- Gesamtbeitrag Rentenversicherung

English labels:

- Pension-insurance-liable pay
- Pension-insurance assessment ceiling
- Employee pension contribution
- Employer pension contribution
- Total pension contribution

## 13. Proposed machine-readable parameters

| Field | Requirement |
| --- | --- |
| id | Stable parameter identifier |
| value | Exact decimal/integer |
| unit | ratio, EUR/month, EUR/year, days or rounding mode |
| scheme | general_statutory or miners_reference |
| effective_from / effective_to | Required |
| jurisdiction | DE, nationwide |
| source_ids | Verified official sources |
| source_locator | Section/page/paragraph |
| derivation | Required for maximum contributions |
| supported | Boolean for calculator admission |
| verification_status | Verified before production |
| reviewed_by / reviewed_at | Required |

Suggested assumption-set identifier: **de-pension-insurance-2026-v1**.

## 14. Validation and fixture requirements

Required fixtures include:

- zero liable remuneration;
- EUR 4,000 normal full-month pay;
- one cent below, at and above the monthly ceiling;
- pay substantially above the ceiling;
- a case producing a third decimal below 5;
- a case producing a third decimal of exactly 5;
- 1, 15, 29 and 30 contribution days;
- twelve equal full months and reconciliation to annual totals;
- annual salary above the annual ceiling;
- unknown pension status;
- validated statutory exemption;
- professional scheme;
- miners’ scheme;
- mini-job and transition-range rejection;
- one-time payment routed to the later specialised path.

Assertions must verify the base, ceiling, employee share, employer share, total and rounding stage separately.

## 15. Engineering handoff

Implementation should provide:

1. a typed pension-coverage status;
2. a versioned 2026 pension assumption record;
3. exact decimal arithmetic;
4. an explicit contribution-day ceiling function;
5. separate employee, employer and total outputs;
6. a normal recurring-pay calculation independent of the tax PAP;
7. an adapter supplying the PAP’s KRV status without conflating outputs;
8. fail-closed handling for unsupported schemes;
9. one-off-payment integration only after NP-RS-011;
10. source/version metadata attached to every result.

## Acceptance check for NP-RS-004

- [x] 2026 total, employee and employer rates are documented.
- [x] Monthly and annual ceilings are documented.
- [x] Nationwide treatment and absence of an East/West split are explicit.
- [x] Contribution base and capping are defined.
- [x] Partial-month ceiling treatment is documented.
- [x] BVV rounding and equal-share calculation order are explicit.
- [x] Monthly versus annual calculation behaviour is defined.
- [x] Recurring and one-time remuneration boundaries are distinguished.
- [x] Actual contributions are separated from the PAP Vorsorgepauschale.
- [x] Coverage statuses and unsupported cases are defined.
- [x] Miners’, mini-job and transition-range rules cannot enter the normal path.
- [x] Outputs, bilingual labels, fixtures and engineering handoff are included.
