# NP-RS-007 — Long-term-care insurance rules for 2026

**Status:** Proposed for review  
**Task:** NP-RS-007  
**Milestone:** M1 Research  
**Depends on:** [NP-RS-001](NP-RS-001-authoritative-source-standard.md)  
**Calculation year:** 2026  
**Effective period:** 2026-01-01 through 2026-12-31  
**Verified on:** 2026-09-24

## Decision

For an ordinary salaried employee covered by German social long-term-care insurance, NettoPilot DE shall calculate 2026 contributions using:

- nationwide base rate: **3.6%** of care-insurance-liable remuneration;
- employee base share outside Saxony: **1.8%**;
- employer base share outside Saxony: **1.8%**;
- employee base share in Saxony: **2.3%**;
- employer base share in Saxony: **1.3%**;
- employee-only childless surcharge: **0.6 percentage points** after the end of the month in which the member turns 23;
- employee-only reduction: **0.25 percentage points for each qualifying child from the second through the fifth**;
- qualifying-child reduction through the end of the month in which that child turns 25;
- nationwide assessment ceiling: **EUR 5,812.50 per month** and **EUR 69,750 per year**;
- exact decimal arithmetic and the contribution-rounding order in the Beitragsverfahrensverordnung.

Parent status removes the childless surcharge permanently once validly established. The additional reductions are temporary and depend on the number of qualifying children below the statutory age boundary.

## 1. Supported cases

This research approves the calculation path for:

- one ordinary salaried employment relationship in Germany;
- statutory health insurance and social long-term-care insurance;
- recurring care-insurance-liable employment remuneration;
- full and standard part-time employees above the transition range;
- all 16 German federal states, including Saxony;
- employees below, at or above age 23;
- verified childless status;
- verified parent status with zero through five-or-more currently qualifying children;
- full and partial contribution months;
- salaries above the contribution ceiling;
- monthly or annual recurring salary input.

The following require separate rules or remain outside this task:

- private compulsory long-term-care insurance: NP-RS-010;
- mini-jobs, midijobs and transition-range calculations;
- working students and low-paid trainees;
- short-time work and qualification allowance;
- multiple simultaneous jobs;
- pensioners and non-employment income;
- self-employment;
- cross-border social-security coordination;
- agricultural special cases;
- complete one-off-payment allocation: NP-RS-011;
- historical years.

Unknown insurance path, parent status, date of birth or required child count must block a normal care-insurance result. The engine must not infer parenthood from tax allowances or family status.

## 2. Authoritative sources

| Source ID | Authority and document | Evidence role | Applicability | Status |
| --- | --- | --- | --- | --- |
| DE-PBAV-2025-1 | [PBAV 2025 section 1](https://www.gesetze-im-internet.de/pbav_2025/__1.html) | Sets the social-care rate to 3.6% from 2025-01-01 | Current in 2026 | Verified |
| DE-SGBXI-55 | [SGB XI section 55](https://www.gesetze-im-internet.de/sgb_11/__55.html) | Ceiling, childless surcharge, parent exception, child reductions, timing and evidence | Current law | Verified |
| DE-SGBXI-58 | [SGB XI section 58](https://www.gesetze-im-internet.de/sgb_11/__58.html) | Employee/employer allocation and state-specific one-point shift | Current law | Verified |
| DE-BMG-PV-FINANCE-2026 | [BMG — Financing social long-term-care insurance](https://www.bundesgesundheitsministerium.de/themen/pflege/online-ratgeber-pflege/die-pflegeversicherung/finanzierung) | Official 2026 explanatory rates, Saxony table, child rules and ceiling | Current 2026 page | Verified |
| DE-BMAS-SV-VALUES-2026 | [BMAS — Social Insurance Calculation Parameters Ordinance 2026](https://www.bmas.de/DE/Service/Gesetze-und-Gesetzesvorhaben/sozialversicherungs-rechengroessenverordnung-2026.html) | 2026 monthly and annual assessment ceiling | 2026 | Verified |
| DE-BVV-1 | [BVV section 1](https://www.gesetze-im-internet.de/beitrvv/__1.html) | Contribution month, 30-day convention, exact intermediates and half-up rounding | Current law | Verified |
| DE-BVV-2 | [BVV section 2](https://www.gesetze-im-internet.de/beitrvv/__2.html) | Equal-share and unequal-share calculation order | Current law | Verified |
| DE-SGBIV-14 | [SGB IV section 14](https://www.gesetze-im-internet.de/sgb_4/__14.html) | Employment-remuneration concept | Current law | Verified |
| DE-SGBIV-23A | [SGB IV section 23a](https://www.gesetze-im-internet.de/sgb_4/__23a.html) | One-off-remuneration boundary | Current law | Verified |

SGB XI section 55 still displays the statutory base of 3.4%. PBAV 2025 validly adjusted that rate to 3.6% from 1 January 2025. The implementation must therefore store the legal rate source as PBAV 2025 rather than copying the unadjusted figure from section 55 in isolation.

## 3. 2026 parameter table

| Parameter ID | Value | Unit | Effective period | Source |
| --- | ---: | --- | --- | --- |
| care.2026.base_rate | 0.036 | ratio | 2026-01-01 to 2026-12-31 | DE-PBAV-2025-1 |
| care.2026.childless_surcharge | 0.006 | ratio | Same | DE-SGBXI-55 |
| care.2026.child_reduction_each | 0.0025 | ratio | Same | DE-SGBXI-55 |
| care.2026.first_reduced_child_ordinal | 2 | child ordinal | Same | DE-SGBXI-55 |
| care.2026.last_reduced_child_ordinal | 5 | child ordinal | Same | DE-SGBXI-55 |
| care.2026.childless_age_threshold | 23 | completed years | Same | DE-SGBXI-55 |
| care.2026.child_reduction_age_limit | 25 | completed years | Same | DE-SGBXI-55 |
| care.2026.employee_rate_non_saxony | 0.018 | ratio | Same | DE-SGBXI-58; DE-BMG-PV-FINANCE-2026 |
| care.2026.employer_rate_non_saxony | 0.018 | ratio | Same | Same |
| care.2026.employee_rate_saxony | 0.023 | ratio | Same | Same |
| care.2026.employer_rate_saxony | 0.013 | ratio | Same | Same |
| care.2026.ceiling_month | 5,812.50 | EUR/month | Same | DE-BMAS-SV-VALUES-2026 |
| care.2026.ceiling_year | 69,750.00 | EUR/year | Same | Same |
| care.2026.contribution_month_days | 30 | social-insurance days | Same | DE-BVV-1 |
| care.2026.money_scale | 2 | decimal places | Same | DE-BVV-1 |
| care.2026.rounding | half_up | rule | Same | DE-BVV-1 |

Suggested assumption-set identifier: **de-social-care-insurance-2026-v1**.

## 4. Rate matrix

### 4.1 States other than Saxony

| Member state | Employee rate | Employer rate | Total rate |
| --- | ---: | ---: | ---: |
| Childless, surcharge applies | 2.40% | 1.80% | 4.20% |
| Parent, 0 or 1 qualifying child under 25 | 1.80% | 1.80% | 3.60% |
| Parent, 2 qualifying children under 25 | 1.55% | 1.80% | 3.35% |
| Parent, 3 qualifying children under 25 | 1.30% | 1.80% | 3.10% |
| Parent, 4 qualifying children under 25 | 1.05% | 1.80% | 2.85% |
| Parent, 5 or more qualifying children under 25 | 0.80% | 1.80% | 2.60% |

### 4.2 Saxony

| Member state | Employee rate | Employer rate | Total rate |
| --- | ---: | ---: | ---: |
| Childless, surcharge applies | 2.90% | 1.30% | 4.20% |
| Parent, 0 or 1 qualifying child under 25 | 2.30% | 1.30% | 3.60% |
| Parent, 2 qualifying children under 25 | 2.05% | 1.30% | 3.35% |
| Parent, 3 qualifying children under 25 | 1.80% | 1.30% | 3.10% |
| Parent, 4 qualifying children under 25 | 1.55% | 1.30% | 2.85% |
| Parent, 5 or more qualifying children under 25 | 1.30% | 1.30% | 2.60% |

The Saxony rule changes only who bears one percentage point of the 3.6% base contribution. It does not change the combined rate, the childless surcharge or the child reductions.

## 5. Canonical input mapping

NP-PD-004 supplies the relevant fields:

| Product field | Care-insurance use |
| --- | --- |
| calculationYear | Selects this 2026 assumption set |
| tax.federalState | Selects Saxony or the non-Saxony allocation |
| tax.dateOfBirth | Determines whether the childless surcharge applies in the payroll month |
| social.healthInsuranceType | Routes statutory versus private care path |
| social.careInsuranceChildStatus | Establishes parent or childless status |
| social.childrenUnderRelevantAge | Counts qualifying children for the temporary reduction |
| base and compensation fields | Supply mapped care-insurance-liable remuneration |
| oneOffPayments[].paymentMonth | Required later for NP-RS-011 allocation |

Input rules:

- social.healthInsuranceType = statutory is required for this calculation path.
- social.careInsuranceChildStatus = has_child means legally recognised parent status is asserted.
- social.careInsuranceChildStatus = childless means no legally recognised parent status is asserted.
- unknown blocks the normal result.
- social.childrenUnderRelevantAge is required when has_child is selected.
- zero is valid for a parent whose children no longer qualify for a temporary reduction.
- values above five remain valid, but the engine caps the reduction at four increments.
- tax.federalState selects Saxony only when the employment location used by the payroll rule is Saxony. V1 currently collects federal state as a combined tax/social-insurance field; the UI must describe this assumption and request confirmation when residence and regular employment location differ.
- tax.childAllowanceFactor must never substitute for parent or child-count fields.

The final point identifies an input-contract limitation. A future schema should replace or supplement tax.federalState with a dedicated employment-location state before supporting cases in which residence and employment location differ.

## 6. Parent, childless and qualifying-child semantics

### 6.1 Parent status

Valid parent status prevents the childless surcharge. It is not limited to the period before the child turns 25. Therefore:

- a parent with no child under 25 pays the base employee share;
- the engine must not turn that person into childless when the last child ages out;
- parent status is separate from the temporary multi-child reduction;
- the user must confirm the status; the calculator does not independently determine legal parenthood.

Adoptive and step-parent cases have statutory qualification rules. When the user cannot confirm recognised parent status, show guidance and keep the result unresolved rather than guessing.

### 6.2 Childless surcharge

The 0.6-point surcharge applies:

- only to the employee share;
- only after the end of the month in which the member turns 23;
- only when recognised parent status is absent;
- on the same capped contribution base as the base contribution.

For a birthday on any day in March, the surcharge begins with April payroll. A childless member pays the ordinary base employee share through the end of the month in which the 23rd birthday occurs; the surcharge starts in the following month.

Statutory exceptions include members born before 1 January 1940, qualifying military/civil-service cases and recipients specified in SGB XI section 55(3). Those paths are outside the ordinary v1 employee scope. If encountered, mark the case unsupported rather than charging the surcharge.

### 6.3 Multi-child reduction

For recognised parents:

- one qualifying child produces no 0.25-point reduction;
- the second through fifth qualifying children each reduce the employee rate by 0.25 points;
- a sixth or later child produces no additional reduction;
- each child is counted through the end of the month in which the child turns 25;
- from the following month that child no longer counts;
- the reduction applies even when the parent is under age 23.

Define q as the number of qualifying children for the payroll month:

    reduction_count = min(max(q - 1, 0), 4)
    reduction_rate = reduction_count × 0.0025

A count of zero for a recognised parent is valid and retains the parent base rate.

### 6.4 Evidence timing

The salary calculator asks for the payroll-relevant outcome, not personal evidence documents.

For user guidance:

- parent status and qualifying-child count must be known to the employer or contribution-collecting body;
- automated evidence is normally effective from the beginning of the birth month or comparable event month;
- non-automated evidence supplied within six months receives the corresponding statutory timing;
- later manual evidence generally takes effect from the beginning of the month after proof is supplied.

V1 must not ask the user to upload birth certificates, tax IDs or other evidence. If the user is unsure whether payroll has recognised the status, label the result as a scenario estimate and recommend checking the payslip or employer record.

## 7. Contribution base

Let:

- E = mapped care-insurance-liable remuneration for the contribution month;
- C = EUR 5,812.50 for a full 2026 contribution month;
- B = min(max(E, 0), C).

The care-insurance base normally follows the same employee remuneration and health/care assessment ceiling used by the statutory health-insurance path. Taxable income and care-insurance-liable remuneration are not interchangeable.

Contributions stop increasing once B reaches EUR 5,812.50. The EUR 77,400 annual compulsory-health-insurance threshold is not the care contribution ceiling and must not be used here.

### Partial contribution month

For d social-insurance contribution days:

    C_d = 5,812.50 × d / 30
    B_d = min(max(E_d, 0), C_d)

Preserve unrounded intermediate values. If the product lacks validated dates or contribution-day input, reject a partial-month result instead of assuming 30 days.

### Annual salary input

For equal recurring salary over twelve full months:

1. derive monthly recurring remuneration;
2. determine the applicable state, age and child status for each payroll month;
3. apply the monthly ceiling;
4. calculate and round employee and employer amounts for each month;
5. sum monthly results.

Do not calculate a single annual amount and round once. Birthdays and children turning 25 can change the employee rate during the year.

## 8. Calculation algorithm

Let:

- B = capped care-insurance contribution base for the payroll month;
- s = 1 when the employment-location state is Saxony, otherwise 0;
- p = true when recognised parent status is asserted;
- a = age/timing state for the payroll month;
- q = qualifying-child count for the payroll month.

Base shares:

    employer_rate = s ? 0.013 : 0.018
    employee_base_rate = s ? 0.023 : 0.018

Status adjustment:

    childless_surcharge_rate = (!p && surchargeAppliesAfterMonthOf23rdBirthday(a)) ? 0.006 : 0
    reduction_count = p ? min(max(q - 1, 0), 4) : 0
    child_reduction_rate = reduction_count × 0.0025
    employee_rate = employee_base_rate + childless_surcharge_rate - child_reduction_rate

Monetary calculation:

    employer = roundHalfUp(B × employer_rate, 2)
    employee = roundHalfUp(B × employee_rate, 2)
    total = employer + employee

For the equal 1.8%/1.8% case outside Saxony, BVV section 2 also describes applying the half rate, rounding and doubling for the total. The employee and employer amounts are the rounded half-rate result.

For childless, reduced-parent and Saxony cases, the shares are unequal. Calculate and round the employee and employer shares separately, then sum them. Do not calculate a rounded total and allocate it afterward.

## 9. Derived fixtures at the 2026 monthly ceiling

Contribution base: EUR 5,812.50.

### 9.1 States other than Saxony

| State | Employee | Employer | Total |
| --- | ---: | ---: | ---: |
| Childless, surcharge applies | EUR 139.50 | EUR 104.63 | EUR 244.13 |
| Parent, 0 or 1 qualifying child | EUR 104.63 | EUR 104.63 | EUR 209.26 |
| Parent, 2 qualifying children | EUR 90.09 | EUR 104.63 | EUR 194.72 |
| Parent, 3 qualifying children | EUR 75.56 | EUR 104.63 | EUR 180.19 |
| Parent, 4 qualifying children | EUR 61.03 | EUR 104.63 | EUR 165.66 |
| Parent, 5 or more qualifying children | EUR 46.50 | EUR 104.63 | EUR 151.13 |

### 9.2 Saxony

| State | Employee | Employer | Total |
| --- | ---: | ---: | ---: |
| Childless, surcharge applies | EUR 168.56 | EUR 75.56 | EUR 244.12 |
| Parent, 0 or 1 qualifying child | EUR 133.69 | EUR 75.56 | EUR 209.25 |
| Parent, 2 qualifying children | EUR 119.16 | EUR 75.56 | EUR 194.72 |
| Parent, 3 qualifying children | EUR 104.63 | EUR 75.56 | EUR 180.19 |
| Parent, 4 qualifying children | EUR 90.09 | EUR 75.56 | EUR 165.65 |
| Parent, 5 or more qualifying children | EUR 75.56 | EUR 75.56 | EUR 151.12 |

The one-cent total differences between Saxony and other states in some ceiling fixtures arise from separately rounding unequal shares. They are expected and must not be force-balanced.

## 10. State treatment

The state-sensitive rule depends on the place of employment described by SGB XI section 58, not merely residence.

V1 behavior:

- if the confirmed payroll-relevant employment state is Saxony, use the Saxony allocation;
- otherwise use the ordinary allocation;
- never infer Saxony treatment from language, postcode fragments or employer name;
- if residence and employment state differ and the current single-state field is ambiguous, require confirmation and show an assumption;
- no other state receives a special care-insurance rate;
- do not create East/West variants.

## 11. One-time remuneration

One-time payments can require payment-month, year-to-date remuneration, remaining proportional annual ceiling and special allocation rules.

Until NP-RS-011 is complete:

- do not treat a bonus merely as extra recurring monthly salary;
- do not cap it only against the payment month's unused ceiling;
- keep the recurring contribution result separate;
- mark the one-off care contribution as unknown or excluded with explanation;
- never present an understated total as exact.

## 12. Private-insurance boundary

This document covers social long-term-care insurance attached to the statutory path.

When social.healthInsuranceType = private:

- do not apply these employee rates to the private care premium;
- use the user-entered private care premium only through the NP-RS-010 specification;
- calculate any employer subsidy only after NP-RS-010 defines its cap and interaction with health insurance;
- label the result unsupported or incomplete until that path is implemented.

## 13. Result states and warnings

### Exact supported result

Allowed when all of these are known and supported:

- 2026 calculation year;
- statutory insurance path;
- ordinary employee case;
- care-insurance-liable remuneration;
- payroll-relevant employment state;
- date of birth;
- parent or childless status;
- qualifying-child count when parent status is selected;
- full-month or validated contribution-day information.

### Scenario estimate

Use when the user supplies the legal outcome but has not confirmed that payroll records already reflect proof. Explain that actual payroll can differ until evidence is recognised.

### Incomplete or blocked

Block a normal result for:

- unknown parent/childless status;
- missing date of birth;
- missing qualifying-child count for a parent;
- ambiguous Saxony employment-location treatment;
- unknown insurance path;
- private path before NP-RS-010;
- partial month without contribution days;
- one-time payment before NP-RS-011;
- any deferred employment status.

## 14. Bilingual labels and explanations

| Concept | German | English |
| --- | --- | --- |
| Employee care-insurance contribution | Arbeitnehmeranteil Pflegeversicherung | Employee care-insurance contribution |
| Employer care-insurance contribution | Arbeitgeberanteil Pflegeversicherung | Employer care-insurance contribution |
| Childless surcharge | Beitragszuschlag für Kinderlose | Childless surcharge |
| Reduction for multiple children | Beitragsabschlag für mehrere Kinder | Reduction for multiple children |
| Recognised parent status | Nachgewiesene Elterneigenschaft | Recognised parent status |
| Qualifying children under 25 | Berücksichtigungsfähige Kinder unter 25 | Qualifying children under 25 |
| Saxony contribution allocation | Beitragsaufteilung in Sachsen | Saxony contribution allocation |
| Contribution assessment ceiling | Beitragsbemessungsgrenze | Contribution assessment ceiling |
| Scenario estimate | Szenario-Schätzung | Scenario estimate |
| Unsupported case | Nicht unterstützter Fall | Unsupported case |

Minimum explanation beside results:

German:

> Die Pflegeversicherung wird bis zur Beitragsbemessungsgrenze berechnet. Der Kinderlosenzuschlag trägt die beschäftigte Person allein. Abschläge für mehrere Kinder mindern nur den Arbeitnehmeranteil. In Sachsen ist der Grundbeitrag anders zwischen Arbeitnehmer und Arbeitgeber aufgeteilt.

English:

> Care-insurance contributions are calculated up to the contribution assessment ceiling. The employee alone pays the childless surcharge. Reductions for multiple children lower only the employee share. Saxony allocates the base contribution differently between employee and employer.

## 15. Output and metadata requirements

Each result must expose:

- contribution base;
- employee base rate;
- employer rate;
- childless surcharge rate;
- multi-child reduction rate;
- effective employee rate;
- employee amount;
- employer amount;
- combined amount;
- Saxony allocation applied: yes/no;
- recognised parent status used;
- qualifying-child count used and capped reduction count;
- month-specific age boundary state;
- calculation year;
- source IDs;
- assumption-set ID and version;
- result quality;
- warnings and unsupported exclusions.

The UI may show the adjustment components separately, but displayed components must reconcile exactly to the authoritative employee amount using an explicit remainder rule.

## 16. Versioned data requirements

The assumption registry must store:

| Field | Requirement |
| --- | --- |
| parameter_id | Stable semantic identifier |
| value and unit | Decimal ratio, EUR or integer |
| effective_from / effective_to | Exact period |
| jurisdiction | Germany; Saxony allocation where applicable |
| source_ids | One or more official sources |
| source_sections | Exact section, paragraph or table |
| verified_on | Verification date |
| reviewed_by / reviewed_at | Required before production |
| supersedes | Prior parameter record if changed |
| supported | Calculator admission flag |

No rate, ceiling, age threshold or child cap may be embedded only in UI code.

## 17. Validation and fixture requirements

Required fixtures include:

- zero liable remuneration;
- EUR 4,000 parent with one child outside Saxony;
- one cent below, at and above the monthly ceiling;
- remuneration substantially above the ceiling;
- childless person before age 23;
- month in which the childless person turns 23;
- month after the 23rd birthday;
- parent with zero children currently under 25;
- parent with one through six qualifying children;
- child turning 25 during a payroll month and the following month;
- Saxony versus every other state for the same inputs;
- maximum-ceiling rounding cases from section 9;
- 1, 15, 29 and 30 contribution days;
- annual result spanning a 23rd birthday;
- annual result spanning a child's 25th birthday;
- unknown parent status;
- unknown qualifying-child count;
- residence/employment-state ambiguity;
- private path routed to NP-RS-010;
- one-off payment routed to NP-RS-011;
- transition-range employment rejected.

Assertions must verify:

- selected contribution base and ceiling;
- state allocation;
- surcharge timing;
- qualifying-child cap;
- employee and employer rates;
- separately rounded shares;
- combined amount;
- warnings and result quality;
- source and assumption-set metadata.

## 18. Engineering handoff

Implementation should provide:

1. a versioned 2026 care-insurance assumption record;
2. exact decimal arithmetic and half-up money rounding;
3. a month-aware age-boundary utility;
4. a month-aware qualifying-child-count input or derived adapter;
5. separate recognised-parent and qualifying-child concepts;
6. a Saxony employment-location branch;
7. a shared health/care contribution-base utility;
8. employee and employer share functions that follow BVV section 2;
9. explicit exact, scenario-estimate, incomplete and unsupported result states;
10. one-off integration only after NP-RS-011;
11. private integration only after NP-RS-010;
12. source/version metadata on every output;
13. a schema follow-up for residence versus employment-location state.

## Acceptance check for NP-RS-007

- [x] The 3.6% 2026 base rate and its controlling source are documented.
- [x] Employee and employer shares are defined.
- [x] The childless surcharge and age timing are defined.
- [x] Parent status is separated from qualifying-child reductions.
- [x] Reductions for the second through fifth child are defined.
- [x] The child age-out month is defined.
- [x] Saxony-specific allocation is defined.
- [x] The 2026 assessment ceiling and contribution base are defined.
- [x] Equal-share and unequal-share rounding are defined.
- [x] Annual and partial-month behavior are bounded.
- [x] Private insurance and one-off payments are routed to later tasks.
- [x] Bilingual labels, warnings, fixtures and engineering handoff are included.
