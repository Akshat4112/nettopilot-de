# NP-RS-006 — Statutory health-insurance rules for 2026

**Status:** Proposed for review  
**Task:** NP-RS-006  
**Milestone:** M1 Research  
**Depends on:** [NP-RS-001](NP-RS-001-authoritative-source-standard.md)  
**Calculation year:** 2026  
**Effective period:** 2026-01-01 through 2026-12-31  
**Verified on:** 2026-09-24

## Decision

For an ordinary employee covered by German statutory health insurance (GKV) and entitled to statutory sick pay, NettoPilot DE shall calculate 2026 contributions using:

- general contribution rate: **14.6%**;
- employee share of the general rate: **7.3%**;
- employer share of the general rate: **7.3%**;
- an insurer-specific additional contribution rate (kassenindividueller Zusatzbeitrag);
- equal employee/employer allocation of that additional rate;
- nationwide assessment ceiling: **EUR 5,812.50 per month** and **EUR 69,750 per year**;
- exact decimal arithmetic and the contribution-rounding order in the Beitragsverfahrensverordnung.

The exact result requires the employee's insurer-specific additional rate. When it is unknown, the UI may use the official published-average mode defined in NP-PD-004:

- official 2026 published average: **2.9%**;
- employee fallback additional share: **1.45%**;
- employer fallback additional share: **1.45%**;
- combined fallback rate: **17.5%**;
- result state: **estimate using published average**, never insurer-exact.

The published average is a statutory benchmark. It is not the same as the observed average actually charged by health funds. The BMG reported an observed average of 3.13% at the end of June 2026. That changing observation must not silently replace the fixed 2.9% published-average parameter.

## 1. Supported cases

This research approves the calculation path for:

- one ordinary salaried employment relationship in Germany;
- statutory health insurance selected explicitly;
- normal mandatory GKV employment with entitlement to sick pay;
- normal voluntary GKV membership caused only by exceeding the annual earnings threshold;
- recurring health-insurance-liable employment remuneration;
- insurer-specific additional-rate mode;
- published-average fallback mode with a visible warning;
- full and partial contribution months;
- gross salary above the transition range.

The following require separate rules or remain outside this task:

- private health insurance and its employer subsidy: NP-RS-010;
- social long-term-care insurance: NP-RS-007;
- mini-jobs and transition-range employment;
- reduced-rate membership without statutory sick-pay entitlement;
- students, apprentices and low-paid trainees;
- pensioners and recipients of other replacement income;
- short-time work and qualification allowance;
- multiple simultaneous employment relationships;
- voluntary members whose other income changes the payroll-only result;
- family insurance;
- self-employment;
- cross-border social-security coordination;
- complete one-off-payment allocation: NP-RS-011;
- historical years.

Unknown health-insurance status must block a normal net result. The engine must not choose GKV merely because a salary falls below a threshold or choose private insurance merely because it exceeds one.

## 2. Authoritative sources

| Source ID | Authority and document | Evidence role | Applicability | Status |
| --- | --- | --- | --- | --- |
| DE-SGBV-241 | [SGB V section 241 — general contribution rate](https://www.gesetze-im-internet.de/sgb_5/__241.html) | Statutory 14.6% general rate | Current law | Verified |
| DE-SGBV-242 | [SGB V section 242 — additional contribution](https://www.gesetze-im-internet.de/sgb_5/__242.html) | Insurer-specific additional rate and GKV list | Current law | Verified |
| DE-SGBV-243 | [SGB V section 243 — reduced contribution rate](https://www.gesetze-im-internet.de/sgb_5/__243.html) | 14.0% boundary for members without sick-pay entitlement | Current law | Verified |
| DE-SGBV-249 | [SGB V section 249 — contribution allocation](https://www.gesetze-im-internet.de/sgb_5/__249.html) | Equal employee/employer allocation and special cases | Current law | Verified |
| DE-SGBV-257 | [SGB V section 257 — employer subsidies](https://www.gesetze-im-internet.de/sgb_5/__257.html) | Voluntary-GKV and private-insurance employer-subsidy framework | Current law | Verified |
| DE-SGBV-226 | [SGB V section 226 — liable earnings](https://www.gesetze-im-internet.de/sgb_5/__226.html) | Employment remuneration contribution base | Current law | Verified |
| DE-SGBV-6 | [SGB V section 6 — exemption from compulsory insurance](https://www.gesetze-im-internet.de/sgb_5/__6.html) | Annual earnings threshold and timing | Current law | Verified |
| DE-BMAS-SV-VALUES-2026 | [BMAS — Social Insurance Calculation Parameters Ordinance 2026](https://www.bmas.de/DE/Service/Gesetze-und-Gesetzesvorhaben/sozialversicherungs-rechengroessenverordnung-2026.html) | 2026 assessment ceiling and annual earnings thresholds | 2026 | Verified |
| DE-GKV-SV-VALUES-2026 | [GKV-Spitzenverband — 2026 contribution values](https://www.gkv-spitzenverband.de/media/dokumente/presse/zahlen_und_grafiken/20260101_Faktenblatt_Rechengroessen_Beitragsrecht.pdf) | Consolidated rates, ceilings, thresholds and subsidy formula | From 1 January 2026 | Verified |
| DE-BMG-GKV-CONTRIBUTIONS-2026 | [BMG — GKV contributions](https://www.bundesgesundheitsministerium.de/beitraege) | Official explanation and 2026 published-average rate | 2026 | Verified |
| DE-BMG-GKV-FINANCE-2026 | [BMG — financing of statutory health insurance](https://www.bundesgesundheitsministerium.de/finanzierung-gkv) | Equal sharing and observed additional-rate context | Current 2026 page | Verified |
| DE-BVV-1-2 | [Beitragsverfahrensverordnung sections 1–2](https://www.gesetze-im-internet.de/beitrvv/BJNR113800006.html) | Contribution periods, decimals and equal-share rounding | Current 2026 version | Verified |
| DE-SGBIV-14 | [SGB IV section 14 — employment remuneration](https://www.gesetze-im-internet.de/sgb_4/__14.html) | Recurring and one-time remuneration definition | Current law | Verified |
| DE-SGBIV-23A | [SGB IV section 23a — one-time remuneration](https://www.gesetze-im-internet.de/sgb_4/__23a.html) | One-off-payment allocation | Current law | Verified |

## 3. 2026 parameter table

| Parameter ID | Value | Unit | Effective period | Source |
| --- | ---: | --- | --- | --- |
| health.2026.general_rate | 0.146 | ratio | 2026-01-01 to 2026-12-31 | DE-SGBV-241 |
| health.2026.general_employee_rate | 0.073 | ratio | Same | DE-SGBV-241; DE-SGBV-249 |
| health.2026.general_employer_rate | 0.073 | ratio | Same | Same |
| health.2026.reduced_rate_reference | 0.140 | ratio | Same | DE-SGBV-243 |
| health.2026.published_average_additional_rate | 0.029 | ratio | Same | DE-BMG-GKV-CONTRIBUTIONS-2026 |
| health.2026.ceiling_month | 5,812.50 | EUR/month | Same | DE-BMAS-SV-VALUES-2026 |
| health.2026.ceiling_year | 69,750.00 | EUR/year | Same | Same |
| health.2026.compulsory_threshold_month_reference | 6,450.00 | EUR/month | Same | DE-BMAS-SV-VALUES-2026 |
| health.2026.compulsory_threshold_year | 77,400.00 | EUR/year | Same | DE-BMAS-SV-VALUES-2026 |
| health.2026.special_legacy_threshold_year | 69,750.00 | EUR/year | Same | DE-GKV-SV-VALUES-2026 |
| health.2026.contribution_month_days | 30 | social-insurance days | Same | DE-BVV-1-2 |
| health.2026.money_scale | 2 | decimal places | Same | DE-BVV-1-2 |
| health.2026.rounding | half_up | rule | Same | DE-BVV-1-2 |
| health.2026.regional_model | nationwide | enum | Same | DE-BMAS-SV-VALUES-2026 |

The 14.0% reduced rate and special legacy threshold are reference values for admission control. They are not silently applied by the normal v1 employee path.

## 4. Additional-contribution input model

NP-PD-004 defines two modes.

### 4.1 Insurer-specific mode

Input:

- field: `social.statutoryHealth.additionalContributionRate`;
- meaning: the employee's Krankenkasse rate for the calculation period;
- source: user input, insurer publication, or a verified GKV-Spitzenverband record;
- precision: preserve the entered percentage exactly as a decimal;
- effective period: required for month-aware calculations.

Validation rules:

- reject negative rates;
- reject non-numeric values;
- the assumption set must define a verified product range using the current GKV-Spitzenverband insurer list;
- values outside that verified range require confirmation or an unsupported state;
- do not invent a permanent legal maximum;
- a rate change during the year requires month-specific segments.

This is the exact supported mode.

### 4.2 Published-average mode

When the user does not know the insurer-specific rate:

- use 2.9% for 2026;
- label it “Official published average additional contribution” / “Offizieller durchschnittlicher Zusatzbeitrag”;
- show the calculation year and BMG source;
- state that the user's Krankenkasse may charge a different rate;
- mark the result as estimated;
- allow immediate replacement with an insurer-specific value.

The 2.9% rate is fixed as the official published-average parameter for 2026. Do not substitute the observed 3.13% fund average reported during 2026.

### 4.3 Why the two averages differ

| Measure | 2026 value | Purpose |
| --- | ---: | --- |
| Official published average | 2.9% | Annual statutory/reference parameter and fallback |
| Observed average charged at end of June | 3.13% | Descriptive system-wide observation |
| Insurer-specific rate | Varies | Exact employee calculation |

Only the insurer-specific rate produces an insurer-exact salary estimate.

## 5. Contribution ceiling versus compulsory-insurance threshold

These are different concepts and must not share labels.

| Concept | 2026 value | Effect |
| --- | ---: | --- |
| Contribution assessment ceiling (BBG) | EUR 69,750/year; EUR 5,812.50/month | Caps income used to calculate GKV contributions |
| General annual earnings threshold (JAEG) | EUR 77,400/year | Helps determine whether an employee remains compulsorily insured |
| Special legacy JAEG | EUR 69,750/year | Applies only to a restricted pre-2003 private-insurance group |

Consequences:

- contributions stop increasing above EUR 5,812.50 monthly liable pay;
- exceeding EUR 5,812.50 does not itself end mandatory GKV coverage;
- exceeding EUR 77,400 does not automatically place a user in private insurance;
- under SGB V section 6, timing and expected next-year earnings matter;
- an employee above the threshold may remain voluntarily insured in GKV;
- the special legacy threshold must never be selected from salary alone.

The UI should ask the insurance path/status directly and use salary thresholds only for validation warnings.

## 6. Mandatory-GKV employee calculation

Let:

- E = health-insurance-liable remuneration for the contribution month;
- B = min(max(E, 0), 5,812.50);
- z = insurer-specific or published-average additional rate;
- r = 0.146 + z;
- h = r / 2.

For an ordinary mandatory-GKV employee:

    employee = roundHalfUp(B × h, 2)
    employer = employee
    total = employee × 2

Apply the combined half rate before rounding. Do not calculate the full rounded contribution and divide it afterward.

For explanatory display:

- employee general-rate share = B × 7.3%;
- employee additional-rate share = B × z / 2;
- employer has the same economic components.

If rounded components are shown separately, they must reconcile exactly to the authoritative combined-half result. The implementation must use an explicit remainder allocation rule rather than allowing displayed components to disagree with the deduction.

### Published-average examples

Using z = 2.9%:

| Scenario | Contribution base | Employee | Employer | Total |
| --- | ---: | ---: | ---: | ---: |
| EUR 0 liable pay | EUR 0.00 | EUR 0.00 | EUR 0.00 | EUR 0.00 |
| EUR 4,000 full-month pay | EUR 4,000.00 | EUR 350.00 | EUR 350.00 | EUR 700.00 |
| EUR 5,812.50 or more | EUR 5,812.50 | EUR 508.59 | EUR 508.59 | EUR 1,017.18 |

These are derived fixtures. The maximum is insurer-dependent when z is not 2.9%.

## 7. Voluntary-GKV employee calculation

An employee who is insurance-free only because regular annual remuneration exceeds the JAEG may remain voluntarily insured in GKV. Under SGB V section 257(1), the employer pays the subsidy it would have paid for compulsory insurance.

For the ordinary supported voluntary-employee case:

    member_total = roundHalfUp(B × r, 2)
    employer_subsidy = roundHalfUp(B × r / 2, 2)
    employee_effective_cost = member_total - employer_subsidy

At the 2026 ceiling using the 2.9% published average:

| Output | Value |
| --- | ---: |
| Member's total GKV contribution | EUR 1,017.19 |
| Employer subsidy | EUR 508.59 |
| Employee effective cost | EUR 508.60 |

The one-cent difference is possible because the member's full contribution and the employer subsidy are rounded as separate amounts. Do not force the voluntary-GKV result into the mandatory employee's doubled-half total.

Support this path only when:

- GKV membership is explicitly selected;
- voluntary status results only from exceeding the JAEG;
- the employment relationship is otherwise ordinary;
- other contribution-liable income does not make the salary-only output misleading.

BMG notes that voluntary members may owe contributions on additional income, including investment or rental income, up to the same ceiling. For an employee already above the assessment ceiling, those sources do not increase the total; otherwise, unknown additional income requires an incomplete-result warning.

## 8. General versus reduced contribution rate

The 14.6% general rate applies to the ordinary supported employee path with statutory sick-pay entitlement, normally from the 43rd day.

The 14.0% reduced rate applies to members without statutory sick-pay entitlement. It must not be inferred from:

- part-time status;
- salary amount;
- age alone;
- the user selecting statutory health insurance.

V1 should route an explicit no-sick-pay status to an unsupported or specialised result until input and scope rules support it. The engine must never switch silently from 14.6% to 14.0%.

## 9. Contribution base

### 9.1 Mandatory members

For ordinary compulsorily insured employees, SGB V section 226 uses remuneration from insured employment as the contribution base.

V1 must accept only compensation categories whose social-insurance treatment is mapped. Taxability and health-insurance liability are not interchangeable.

### 9.2 Voluntary members

Voluntary members can have additional contribution-liable income beyond salary. The calculation result must identify whether it is:

- a complete member contribution; or
- a payroll-only estimate with unknown other income.

### 9.3 Partial contribution month

The assessment ceiling is prorated using social-insurance contribution days, with a full contribution month treated as 30 days.

For d contribution days:

    C_d = 5,812.50 × d / 30
    B_d = min(max(E_d, 0), C_d)

Preserve unrounded intermediate values and apply final monetary rounding only at the contribution stage. If the product lacks validated dates or contribution-day input, reject the partial-month calculation rather than assuming 30 days.

### 9.4 Annual salary input

An annual gross salary is not a single annual health contribution event. For equal recurring salary over twelve full months:

1. derive monthly recurring pay;
2. apply the monthly ceiling and applicable additional rate;
3. calculate employee/employer amounts for each month;
4. sum the monthly results.

When an insurer changes its additional rate during the year, segment the months by effective rate. A single annual rate assumption must be disclosed.

## 10. One-time remuneration

One-time payments can require:

- payment month;
- year-to-date liable remuneration;
- remaining proportional annual assessment ceiling;
- months of insured membership;
- special early-year allocation rules.

Therefore:

- do not cap a bonus only against the payment month's unused ceiling;
- do not spread a one-time bonus over twelve months unless the governing rule requires it;
- route exact one-off calculations through NP-RS-011;
- until then, expose an assumption or unknown state.

## 11. Regional treatment

The GKV base rate, published-average rate, assessment ceiling and JAEG are nationwide for this 2026 path.

Consequences:

- federal state is not a health-contribution input;
- do not create East/West variants;
- federal state remains relevant to other modules such as church tax and Saxony care insurance;
- insurer choice affects the additional rate, but that is not a state rate.

## 12. Coverage-status model

| Status | V1 behaviour | Result |
| --- | --- | --- |
| statutory_mandatory_general | Calculate equal employee/employer shares | Supported |
| statutory_voluntary_employee | Calculate member total and employer subsidy with separate rounding | Supported with disclosures |
| statutory_reduced_rate | Do not substitute 14.0% silently | Unsupported/specialised |
| private | Route to NP-RS-010 | Separate path |
| family_insured | No ordinary employee contribution; status validation required | Unsupported |
| transition_range | Special base and allocation | Unsupported |
| minijob | Special contribution rules | Unsupported |
| student | Special rate/coverage rules | Unsupported |
| pensioner | Multiple income and allocation rules | Unsupported |
| cross_border | Applicable jurisdiction required | Unsupported |
| unknown | Do not calculate | Block result |

## 13. Private-insurance boundary

NP-RS-010 owns private premium inputs and employer-subsidy treatment.

This task records only the dependency:

- SGB V section 257(2) uses half the general rate plus half the official average additional rate when determining the private-health employer-subsidy ceiling;
- the 2026 health-only maximum based on the 2.9% published average is EUR 508.59 per month;
- the actual private-health subsidy is also limited by the employee's eligible premium;
- care-insurance subsidy is separate and depends on NP-RS-007 and NP-RS-010.

Do not reuse the voluntary-GKV insurer-specific calculation for private insurance.

## 14. Relationship to the BMF payroll-tax plan

Actual GKV contributions and the BMF PAP's Vorsorgepauschale serve different purposes.

| Calculation | Purpose | Output |
| --- | --- | --- |
| GKV contribution module | Estimate actual employee deduction and employer contribution/subsidy | Health contribution amounts |
| BMF PAP | Calculate wage-tax withholding allowance | Tax-calculation component |

The PAP's PKV and GKV fields must not replace actual contribution inputs. A calculator can have a valid tax-withholding result while the actual insurance contribution remains unknown.

## 15. Result outputs and explanations

For the supported statutory path, expose:

- health-insurance-liable remuneration;
- applied monthly/prorated ceiling;
- insurance status: mandatory or voluntary;
- rate basis: general or reduced;
- additional-rate mode;
- applied additional rate;
- combined rate;
- employee contribution or effective cost;
- employer contribution or employer subsidy;
- total member/combined contribution;
- whether the ceiling was reached;
- calculation month/year and rate effective period;
- assumption/source version;
- estimate warning when published-average mode is used;
- incomplete warning for unknown other income.

German labels:

- Krankenversicherungspflichtiges Entgelt
- Beitragsbemessungsgrenze Krankenversicherung
- Allgemeiner Beitragssatz
- Kassenindividueller Zusatzbeitrag
- Offizieller durchschnittlicher Zusatzbeitrag
- Arbeitnehmeranteil Krankenversicherung
- Arbeitgeberanteil Krankenversicherung
- Arbeitgeberzuschuss Krankenversicherung
- Gesamtbeitrag Krankenversicherung

English labels:

- Health-insurance-liable pay
- Health-insurance assessment ceiling
- General contribution rate
- Insurer-specific additional contribution
- Official published average additional contribution
- Employee health contribution
- Employer health contribution
- Employer health-insurance subsidy
- Total health contribution

## 16. Proposed machine-readable parameters

| Field | Requirement |
| --- | --- |
| id | Stable parameter identifier |
| value | Exact decimal or integer |
| unit | ratio, EUR/month, EUR/year, days or rounding mode |
| effective_from / effective_to | Required |
| jurisdiction | DE, nationwide |
| rate_kind | general, reduced_reference, published_average or insurer_specific |
| coverage_case | mandatory_general or voluntary_employee |
| source_ids | Verified official sources |
| source_locator | Section, paragraph, page or table |
| derivation | Required for maximums and half shares |
| supported | Boolean for calculator admission |
| verification_status | Verified before production |
| reviewed_by / reviewed_at | Required |

Suggested assumption-set identifier: **de-statutory-health-insurance-2026-v1**.

User-supplied insurer rates must be stored with origin `user_input`, selected calculation year, and any entered effective month. They must never overwrite the official parameter record.

## 17. Validation and fixture requirements

Required fixtures include:

- zero liable remuneration;
- EUR 4,000 with published-average mode;
- one cent below, at and above the monthly ceiling;
- remuneration substantially above the ceiling;
- insurer-specific rate lower than 2.9%;
- insurer-specific rate equal to 2.9%;
- insurer-specific rate higher than 2.9%;
- a rate producing a third decimal below 5;
- a rate producing a third decimal exactly 5;
- 1, 15, 29 and 30 contribution days;
- twelve equal full months and annual reconciliation;
- midyear additional-rate change;
- mandatory GKV versus voluntary GKV at the ceiling;
- voluntary-GKV one-cent reconciliation case;
- salary above JAEG while GKV remains selected;
- unknown health status;
- private path routed to NP-RS-010;
- reduced-rate status rejected;
- mini-job and transition-range statuses rejected;
- one-time payment routed to NP-RS-011.

Assertions must verify:

- contribution base and ceiling;
- selected rate mode and exact decimal rate;
- employee contribution/effective cost;
- employer contribution/subsidy;
- total;
- rounding stage;
- result quality: exact, fallback estimate, incomplete or unsupported;
- source and assumption-set metadata.

## 18. Engineering handoff

Implementation should provide:

1. a typed health-insurance path and GKV membership status;
2. a versioned 2026 GKV assumption record;
3. exact decimal arithmetic;
4. explicit insurer-specific and published-average rate modes;
5. month-aware rate effective periods;
6. separate mandatory and voluntary calculation functions;
7. a shared contribution-day ceiling utility;
8. separate contribution and employer-subsidy output types;
9. fail-closed handling for reduced-rate and special cases;
10. one-off integration only after NP-RS-011;
11. private-insurance integration only after NP-RS-010;
12. source/version metadata and result-quality flags on every output.

## Acceptance check for NP-RS-006

- [x] The 14.6% general rate and 14.0% reduced-rate boundary are documented.
- [x] Equal sharing of the general and additional rates is defined.
- [x] Insurer-specific additional-rate mode is defined.
- [x] The 2.9% published-average fallback is defined and labelled as an estimate.
- [x] The observed 3.13% average is distinguished from the statutory fallback.
- [x] Monthly and annual assessment ceilings are documented.
- [x] BBG and JAEG are clearly separated.
- [x] Mandatory and voluntary GKV calculations are distinguished.
- [x] Contribution bases, partial months and annual inputs are defined.
- [x] One-off-payment and private-insurance boundaries are explicit.
- [x] Unsupported coverage states cannot enter the normal path.
- [x] Bilingual outputs, fixtures and engineering handoff are included.
