# NP-RS-005 — Unemployment-insurance rules for 2026

**Status:** Accepted  
**Task:** NP-RS-005  
**Milestone:** M1 Research  
**Depends on:** [NP-RS-001](NP-RS-001-authoritative-source-standard.md)  
**Calculation year:** 2026  
**Effective period:** 2026-01-01 through 2026-12-31  
**Verified on:** 2026-09-24

## Decision

For an ordinary employee subject to German statutory unemployment insurance in 2026, NettoPilot DE shall calculate contributions using:

- total contribution rate: **2.6%**;
- employee rate: **1.3%**;
- employer rate: **1.3%**;
- nationwide monthly assessment ceiling: **EUR 8,450**;
- nationwide annual assessment ceiling: **EUR 101,400**;
- the same 2026 assessment ceiling as the general statutory pension insurance;
- contribution-period and rounding rules from SGB III and the Beitragsverfahrensverordnung.

For a supported full contribution month:

- contribution base = minimum of unemployment-insurance-liable pay and EUR 8,450;
- employee contribution = round-half-up-to-cents(contribution base × 1.3%);
- employer contribution = the same amount in the ordinary equal-share case;
- total contribution = twice the rounded half contribution.

The normal formula is valid only after the coverage status has been established. NettoPilot DE must not silently apply the ordinary 1.3% employee share to transition-range employment, mini-jobs, employees beyond the applicable standard retirement-age boundary, or other special cases.

## 1. Supported case

This research approves the rule set for:

- one ordinary employment relationship in Germany;
- an employee who is mandatorily insured under the normal unemployment-insurance rules;
- full-time or standard part-time salaried employment;
- full or partial contribution months;
- recurring unemployment-insurance-liable remuneration;
- the ordinary equal employee/employer allocation;
- gross pay above the 2026 transition range when the normal formula is used.

The following remain unsupported or require separate rule sets:

- mini-jobs;
- transition-range employment/midijobs;
- multiple simultaneous jobs;
- self-employment and voluntary insurance;
- short-time work and transfer short-time allowance;
- seasonal employment rules;
- trainees and special low-pay allocation cases;
- employees who are exempt because of age or another statutory status;
- employer-only contributions for employees beyond the standard retirement-age boundary;
- cross-border social-security coordination;
- complete one-off-payment allocation, including year-to-date context;
- back pay and corrections spanning contribution periods.

For these cases, the UI must return an unsupported, unknown or incomplete-result state instead of using the ordinary equal-share formula.

## 2. Authoritative sources

| Source ID | Authority and document | Evidence role | Applicability | Status |
| --- | --- | --- | --- | --- |
| DE-SGBIII-341 | [SGB III section 341 — contribution rate and assessment](https://www.gesetze-im-internet.de/sgb_3/__341.html) | 2.6% rate, contribution-period basis, ceiling link | Current law | Verified |
| DE-SGBIII-342 | [SGB III section 342 — liable earnings of employees](https://www.gesetze-im-internet.de/sgb_3/__342.html) | Employment remuneration is the ordinary employee contribution base | Current law | Verified |
| DE-SGBIII-346 | [SGB III section 346 — contribution allocation](https://www.gesetze-im-internet.de/sgb_3/__346.html) | Equal shares and statutory special allocation cases | Current law | Verified |
| DE-SVBEZGRV-2026-4 | [Social Insurance Calculation Parameters Ordinance 2026, section 4](https://www.gesetze-im-internet.de/svbezgrv_2026/__4.html) | 2026 general pension ceiling inherited by SGB III section 341(4) | 2026 | Verified |
| DE-BMAS-SV-VALUES-2026 | [BMAS — Social Insurance Calculation Parameters Ordinance 2026](https://www.bmas.de/DE/Service/Gesetze-und-Gesetzesvorhaben/sozialversicherungs-rechengroessenverordnung-2026.html) | Official consolidated unemployment/pension ceiling | 2026 | Verified |
| DE-BA-SGBIII | [Federal Employment Agency — SGB III consolidated text](https://www.arbeitsagentur.de/datei/dok_ba037300.pdf) | Competent-authority publication of the governing law | Current 2026 text | Verified |
| DE-SGBIV-14 | [SGB IV section 14 — employment remuneration](https://www.gesetze-im-internet.de/sgb_4/__14.html) | Recurring and one-time employment remuneration definition | Current law | Verified |
| DE-SGBIV-23A | [SGB IV section 23a — one-time remuneration](https://www.gesetze-im-internet.de/sgb_4/__23a.html) | One-off-payment allocation and proportional annual ceiling | Current law | Verified |
| DE-BVV-1-2 | [Beitragsverfahrensverordnung sections 1–2](https://www.gesetze-im-internet.de/beitrvv/BJNR113800006.html) | Contribution-period ceilings, decimals and equal-share rounding | Current 2026 version | Verified |
| DE-BA-MERKBLATT-10-2026 | [Federal Employment Agency — Merkblatt 10](https://www.arbeitsagentur.de/datei/merkblatt-10-insolvenzgeld_ba032060.pdf) | Competent-authority confirmation of the EUR 8,450 monthly ceiling | 2026 | Verified |

## 3. 2026 parameter table

| Parameter ID | Value | Unit | Effective period | Source |
| --- | ---: | --- | --- | --- |
| unemployment.2026.total_rate | 0.026 | ratio | 2026-01-01 to 2026-12-31 | DE-SGBIII-341 |
| unemployment.2026.employee_rate | 0.013 | ratio | Same | DE-SGBIII-341; DE-SGBIII-346 |
| unemployment.2026.employer_rate | 0.013 | ratio | Same | DE-SGBIII-341; DE-SGBIII-346 |
| unemployment.2026.ceiling_month | 8,450.00 | EUR/month | Same | DE-SGBIII-341; DE-SVBEZGRV-2026-4 |
| unemployment.2026.ceiling_year | 101,400.00 | EUR/year | Same | Same |
| unemployment.2026.contribution_month_days | 30 | social-insurance days | Same | DE-SGBIII-341 |
| unemployment.2026.contribution_year_days | 360 | social-insurance days | Same | DE-SGBIII-341 |
| unemployment.2026.money_scale | 2 | decimal places | Same | DE-BVV-1-2 |
| unemployment.2026.rounding | half_up | rule | Same | DE-BVV-1-2 |
| unemployment.2026.regional_model | nationwide | enum | Same | DE-BMAS-SV-VALUES-2026 |

### Derived maximums

| Result | Calculation | Value |
| --- | --- | ---: |
| Employee maximum per full month | EUR 8,450 × 1.3% | EUR 109.85 |
| Employer maximum per full month | EUR 8,450 × 1.3% | EUR 109.85 |
| Total maximum per full month | 2 × EUR 109.85 | EUR 219.70 |
| Employee maximum for 12 full months | EUR 109.85 × 12 | EUR 1,318.20 |
| Employer maximum for 12 full months | EUR 109.85 × 12 | EUR 1,318.20 |
| Total maximum for 12 full months | EUR 219.70 × 12 | EUR 2,636.40 |

Derived maximums must be calculated from the sourced primitives or carry explicit derivation metadata. They must not be maintained as independent statutory constants.

## 4. Regional treatment

The 2026 unemployment-insurance ceiling is nationwide because SGB III section 341(4) adopts the assessment ceiling of the general pension insurance, which is uniform throughout Germany for 2026.

Consequences:

- do not ask for a federal state to calculate the normal unemployment contribution;
- do not maintain East/West variants for the 2026 calculation;
- federal state may still affect church tax or care insurance, but not this module;
- historical years require versioned historical parameters and may not reuse the 2026 record.

## 5. Contribution base

### 5.1 Liable remuneration

Under SGB III section 342, the ordinary contribution base for an employed person is employment remuneration. SGB IV section 14 defines employment remuneration broadly and includes recurring and one-time income connected with employment.

Not every taxable or non-cash compensation item is necessarily liable for social insurance. V1 must accept only compensation categories whose unemployment-insurance treatment has been mapped. Unknown items must produce an assumption or incomplete-result warning.

### 5.2 Full contribution month

For supported liable remuneration E in a full month:

    B = min(max(E, 0), 8,450.00)

where B is the unemployment-insurance contribution base.

Remuneration above EUR 8,450 does not increase the unemployment contribution for that full month.

### 5.3 Partial contribution month

SGB III section 341 treats a week as seven days, a month as 30 days and a year as 360 days. The daily assessment ceiling is one three-hundred-and-sixtieth of the annual ceiling.

For d contribution days:

    C_d = 101,400.00 × d / 360
    B_d = min(max(E_d, 0), C_d)

For a complete 30-day contribution month, this reconciles to EUR 8,450. Preserve unrounded intermediate values and round only at the statutory contribution stage.

Until the product has dates or a validated contribution-day input, the calculator should reject partial-month calculations or label them incomplete instead of assuming 30 days.

### 5.4 Annual salary input

An annual salary is an input representation, not a single annual contribution event. For a stable salary paid equally over twelve full months:

1. derive recurring monthly liable pay using the approved period-conversion rule;
2. calculate the monthly employee and employer contributions;
3. sum the twelve monthly results.

This preserves monthly capping and cent rounding. Irregular payments, partial months and one-off payments require a month-aware path.

## 6. Employee, employer and rounding calculation

For the ordinary equal-share case:

    employee = roundHalfUp(B × 0.013, 2)
    employer = employee
    total = employee × 2

The Beitragsverfahrensverordnung requires equal-share contributions to be calculated from the half rate, rounded at that stage, and then doubled. Do not calculate the 2.6% total first and split the rounded total afterward.

### Examples

| Scenario | Contribution base | Employee | Employer | Total |
| --- | ---: | ---: | ---: | ---: |
| EUR 0 liable pay | EUR 0.00 | EUR 0.00 | EUR 0.00 | EUR 0.00 |
| EUR 4,000 full-month liable pay | EUR 4,000.00 | EUR 52.00 | EUR 52.00 | EUR 104.00 |
| EUR 10,000 full-month liable pay | EUR 8,450.00 | EUR 109.85 | EUR 109.85 | EUR 219.70 |
| 15 contribution days at/above prorated ceiling | EUR 4,225.00 | EUR 54.93 | EUR 54.93 | EUR 109.86 |

These are derived fixtures and do not replace source records.

## 7. Recurring and one-time remuneration

Recurring remuneration is assessed in its contribution period and capped at the applicable ceiling.

One-time remuneration can require:

- the payment month;
- year-to-date liable recurring remuneration;
- prior contribution periods in the calendar year;
- the proportional annual assessment ceiling;
- treatment of employment beginning or ending during the year;
- special allocation rules for payments early in a year.

Therefore:

- do not cap a bonus only against the payment month's unused ceiling;
- do not treat an annual bonus as twelve equal recurring payments;
- route exact one-off contribution calculations through the specialised NP-RS-011 rule set;
- until NP-RS-011 is approved, expose an unknown/assumption warning for one-off unemployment contributions.

Because pension and unemployment insurance share the 2026 ceiling, they may share validated ceiling-period utilities. They must retain separate rates, coverage statuses, outputs and source metadata.

## 8. Coverage and status model

The module requires an explicit unemployment-insurance status.

| Status | V1 contribution behaviour | Result |
| --- | --- | --- |
| mandatory_standard | Calculate 1.3% employee and 1.3% employer shares | Supported |
| exempt_validated | EUR 0 only when the exemption is explicitly supported | Supported only with evidence |
| standard_retirement_age_employer_only | Employee may be exempt while an employer share remains due | Unsupported specialised path |
| transition_range | Unequal/special contribution allocation applies | Unsupported |
| minijob | Special or exempt path | Unsupported |
| trainee_special | Special minimum base/allocation may apply | Unsupported |
| voluntary_self_insurance | Not an ordinary payroll contribution | Unsupported |
| cross_border | Depends on applicable social-security jurisdiction | Unsupported |
| unknown | Do not infer ordinary coverage | Block final net result |

The calculator must not infer unemployment-insurance status solely from pension or health-insurance status. These coverage decisions are related but legally separate.

## 9. Transition-range and other allocation boundaries

SGB III section 346(1a) provides a special allocation for employees in the transition range; the employer bears the balance after the employee's specially calculated share. That is not the normal equal 1.3%/1.3% path.

SGB III section 346 also contains employer-only cases, including specified low-pay employment of people with disabilities and an employer contribution for some employees who are exempt after reaching the standard retirement-age boundary.

These cases are outside v1. Admission control must route them away from the ordinary formula even if a simple gross salary is present.

## 10. Relationship to pension insurance and payroll tax

| Concern | Unemployment module | Pension module | BMF payroll-tax PAP |
| --- | --- | --- | --- |
| 2026 ceiling | EUR 101,400/year | EUR 101,400/year | Uses pension/unemployment values in tax allowances |
| Employee rate | 1.3% | 9.3% | Tax-withholding allowance inputs are not actual deductions |
| Coverage status | Unemployment-specific | Pension-specific | PAP input flags and allowance logic |
| Output | Actual estimated contribution | Actual estimated contribution | Wage tax, not social-insurance payment |

Sharing the ceiling does not justify combining the two contribution calculations. The engine must preserve distinct rates, coverage admission, output lines and source identifiers.

## 11. Result outputs and explanations

For a supported calculation, expose:

- unemployment-insurance-liable remuneration;
- applied full-month or prorated ceiling;
- uncapped and capped contribution base;
- employee rate and contribution;
- employer rate and contribution;
- total unemployment contribution;
- whether the ceiling was reached;
- calculation month and year;
- contribution days when applicable;
- assumption-set and source version;
- warnings for excluded compensation or annualisation.

German labels:

- Arbeitslosenversicherungspflichtiges Entgelt
- Beitragsbemessungsgrenze Arbeitslosenversicherung
- Arbeitnehmeranteil Arbeitslosenversicherung
- Arbeitgeberanteil Arbeitslosenversicherung
- Gesamtbeitrag Arbeitslosenversicherung

English labels:

- Unemployment-insurance-liable pay
- Unemployment-insurance assessment ceiling
- Employee unemployment contribution
- Employer unemployment contribution
- Total unemployment contribution

## 12. Proposed machine-readable parameters

| Field | Requirement |
| --- | --- |
| id | Stable parameter identifier |
| value | Exact decimal or integer |
| unit | ratio, EUR/month, EUR/year, days or rounding mode |
| effective_from / effective_to | Required |
| jurisdiction | DE, nationwide |
| coverage_case | mandatory_standard |
| source_ids | Verified official sources |
| source_locator | Section, paragraph, page or table |
| derivation | Required for maximum contributions |
| supported | Boolean for calculator admission |
| verification_status | Verified before production |
| reviewed_by / reviewed_at | Required |

Suggested assumption-set identifier: **de-unemployment-insurance-2026-v1**.

## 13. Validation and fixture requirements

Required fixtures include:

- zero liable remuneration;
- ordinary EUR 4,000 full-month pay;
- one cent below, at and above the monthly ceiling;
- remuneration substantially above the ceiling;
- a case whose unrounded half contribution has a third decimal below 5;
- a case whose unrounded half contribution has a third decimal exactly 5;
- 1, 15, 29 and 30 contribution days;
- twelve equal full months and annual reconciliation;
- annual salary above the annual ceiling;
- unknown coverage status;
- validated exemption;
- standard-retirement-age employer-only case rejected;
- mini-job and transition-range cases rejected;
- one-time remuneration routed to NP-RS-011.

Assertions must verify the contribution base, ceiling, employee share, employer share, total and rounding stage separately.

## 14. Engineering handoff

Implementation should provide:

1. a typed unemployment-insurance coverage status;
2. a versioned 2026 assumption record;
3. exact decimal arithmetic;
4. a contribution-day ceiling utility with 30/360 semantics;
5. separate employee, employer and total outputs;
6. a normal recurring-pay calculation independent of the BMF PAP;
7. fail-closed admission for special allocation and exemption cases;
8. one-off-payment integration only after NP-RS-011;
9. source/version metadata on every result;
10. reconciliation tests against the shared pension ceiling without coupling the rates.

## Acceptance check for NP-RS-005

- [x] The 2026 total rate is documented.
- [x] Ordinary employee and employer shares are documented.
- [x] Monthly and annual assessment ceilings are documented.
- [x] The statutory link to the general pension ceiling is explicit.
- [x] Nationwide treatment is explicit.
- [x] Full-month and partial-month contribution bases are defined.
- [x] Equal-share rounding order is defined.
- [x] Monthly versus annual input behaviour is defined.
- [x] Recurring and one-time remuneration boundaries are documented.
- [x] Coverage states and unsupported cases are defined.
- [x] Transition-range and employer-only cases cannot enter the normal path.
- [x] Bilingual outputs, fixtures and engineering handoff are included.
