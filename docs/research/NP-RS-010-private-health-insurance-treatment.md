# NP-RS-010 — Private health-insurance treatment for 2026

**Status:** Proposed for review  
**Task:** NP-RS-010  
**Milestone:** M1 Research  
**Depends on:** [NP-RS-006](NP-RS-006-statutory-health-insurance-rules.md)  
**Calculation year:** 2026  
**Effective period:** 2026-01-01 through 2026-12-31  
**Verified on:** 2026-09-26

## Decision

NettoPilot DE shall support an ordinary salaried employee who is exclusively covered by German private health insurance (PKV) and private mandatory long-term-care insurance (PPV) when the employee can provide the monthly contribution values used by payroll.

The calculator must separate three concepts that are often confused:

1. the **total premium actually payable** to the insurer;
2. the **contribution eligible for the statutory employer subsidy**; and
3. the **basic health and mandatory-care contribution used for the payroll tax allowance**.

These values may differ. The application must not derive the tax-eligible or subsidy-eligible portions by subtracting optional benefits from a tariff price. The user's insurer, ELStAM or official payroll record is authoritative for those portions.

For 2026:

- the health-insurance employer subsidy is generally half of the qualifying actual contribution and is also capped by the employer comparison amount calculated from the month's assessable employment remuneration; **EUR 508.59** is the maximum only when remuneration reaches the 2026 monthly ceiling;
- the private mandatory-care subsidy is generally half of the qualifying actual contribution and is also capped by the employer comparison amount calculated from the month's assessable employment remuneration; **EUR 104.63** is the maximum outside Saxony when remuneration reaches the ceiling;
- in Saxony the maximum PPV cap is **EUR 75.56 per month** when remuneration reaches the ceiling;
- the health cap is based on the 2026 monthly health/care assessment ceiling of **EUR 5,812.50**, the 14.6% general GKV rate and the 2.9% official average additional rate;
- the PPV cap uses the employer share of 1.8% outside Saxony and 1.3% in Saxony;
- childless surcharges and child discounts do not change the employer share or the PPV subsidy cap;
- the payroll tax calculation must use the final 2026 BMF program with the private-insurance inputs supplied for the month.

Suggested assumption-set identifier: **de-private-health-insurance-2026-v1**.

## 1. Authoritative sources

| Source ID | Authority and document | Evidence role | Applicability | Status |
| --- | --- | --- | --- | --- |
| DE-SGB5-257 | [SGB V section 257](https://www.gesetze-im-internet.de/sgb_5/__257.html) | PKV employer-subsidy entitlement, statutory comparison and half-actual-contribution cap | Current 2026 law | Verified |
| DE-SGB11-61 | [SGB XI section 61](https://www.gesetze-im-internet.de/sgb_11/__61.html) | PPV employer subsidy and statutory employer-share cap | Current 2026 law | Verified |
| DE-SGB11-58 | [SGB XI section 58](https://www.gesetze-im-internet.de/sgb_11/__58.html) | Employer share and Saxony difference | Current 2026 law | Verified |
| DE-ESTG-3-62 | [EStG section 3 number 62](https://www.gesetze-im-internet.de/estg/__3.html) | Tax-free statutory employer subsidy | Current 2026 law | Verified |
| DE-ESTG-10 | [EStG section 10](https://www.gesetze-im-internet.de/estg/__10.html) | Basic health and mandatory-care contribution definition for tax treatment | Current 2026 law | Verified |
| DE-ESTG-39 | [EStG section 39](https://www.gesetze-im-internet.de/estg/__39.html) | Monthly private-insurance ELStAM values | From 2026 | Verified |
| DE-BMF-PKV-ELSTAM-2026 | [BMF — private health and care-insurance data exchange from 2026](https://www.bundesfinanzministerium.de/Content/DE/Standardartikel/Themen/Steuern/Steuerarten/Lohnsteuer/BMF_Schreiben_Allgemeines/2025-12-08-datenaustausch-lstabzug-ab-2026.html) | Electronic insurer–BZSt–employer process and end of normal paper-certificate path | From 2026 | Verified |
| DE-BMF-LSTH-2026-13B | [BMF 2026 payroll-tax handbook, Annex 13b](https://ao.bundesfinanzministerium.de/lsth/2026/B-Anhaenge/Anhang-13b/inhalt.html) | Two contribution values, employer use of ELStAM, subsidy and tax-allowance treatment, corrections | From 2026 | Verified |
| DE-BMF-PAP-2026-A1 | [BMF — final 2026 machine payroll plan, Annex 1](https://www.bundesfinanzministerium.de/Content/DE/Downloads/Steuern/Steuerarten/Lohnsteuer/Programmablaufplan/2025-11-12-PAP-2026-anlage-1.pdf?__blob=publicationFile&v=2) | PKV, PKPV and PKPVAGZ program inputs and payroll-tax computation | 2026 | Verified |
| DE-BMG-GKV-2026 | [BMG — 2026 GKV contribution rates and ceilings](https://www.bundesgesundheitsministerium.de/beitraege) | 14.6% general rate, 2.9% published average and EUR 5,812.50 monthly ceiling | 2026 | Verified |
| DE-BMAS-SV-2026 | [BMAS — 2026 social-insurance calculation values](https://www.bmas.de/DE/Service/Gesetze-und-Gesetzesvorhaben/sozialversicherungs-rechengroessenverordnung-2026.html) | EUR 69,750 annual ceiling and EUR 77,400 ordinary insurance threshold | 2026 | Verified |
| DE-BMG-PV-FINANCE | [BMG — financing of long-term-care insurance](https://www.bundesgesundheitsministerium.de/themen/pflege/online-ratgeber-pflege/die-pflegeversicherung/finanzierung) | 3.6% base PPV comparison rate and child-related employee-only adjustments | Current 2026 | Verified |
| DE-DRV-AG-SUBSIDY | [German Pension Insurance — employer health/care subsidy](https://www.deutsche-rentenversicherung.de/DRV/DE/Experten/Arbeitgeber-und-Steuerberater/summa-summarum/Lexikon/B/beitragszuschuss_zur_kranken-_und_pflegeversicherung) | Eligibility explanation, half-actual-contribution limit and qualifying relatives | Current | Corroborating official guidance |

The fixed 2.9% published average, not the changing observed average charged by funds, is used for the PKV health-subsidy maximum.

## 2. Supported result contract

An exact v1 estimate is supported when all of the following are true:

- the calculation year is 2026;
- one ordinary German salaried employment relationship is modelled;
- the employee selects exclusively private health and private mandatory-care insurance;
- employer-subsidy eligibility is explicitly confirmed;
- German domestic insurance and ordinary employee treatment apply;
- the monthly total premium is known;
- the monthly employer-subsidy-eligible contribution is known or the actual subsidy is copied from payroll;
- the monthly basic health and mandatory-care amount for the tax allowance is known from ELStAM, insurer information or payroll;
- the actual tax-free employer subsidy is known or can be calculated without an exception;
- the payroll-relevant place-of-employment state is known for the Saxony PPV rule;
- contribution changes are represented as separate monthly segments.

The calculator must not infer subsidy eligibility solely because gross salary exceeds the ordinary annual earnings threshold. A private-insured employee can be exempt, grandfathered or in another legal position. The v1 UI requires a confirmation from payroll, the employer or the insurance record.

## 3. Canonical inputs

### 3.1 Required fields

| Field | Type and unit | Validation | Purpose |
| --- | --- | --- | --- |
| `social.healthInsuranceType` | enum | `private` | Select private path |
| `social.privateHealth.coverageConfirmed` | boolean | Must be true | Confirms exclusive PKV plus PPV |
| `social.privateHealth.employerSubsidyEligibility` | enum | `eligible / not_eligible / unknown` | Controls subsidy result |
| `social.privateHealth.totalHealthPremiumMonthly` | money, EUR/month | >= 0; cent precision | Existing canonical total PKV health premium |
| `social.privateHealth.totalCarePremiumMonthly` | money, EUR/month | >= 0; cent precision | Existing canonical total PPV premium |
| `social.privateHealth.payrollBasicCoverageAmountMonthly` | money, EUR/month | >= 0; cent precision | Existing canonical ELStAM/basic health plus mandatory-care amount for PAP PKPV |
| `social.privateHealth.subsidyEligibleHealthPremiumMonthly` | money, EUR/month | >= 0; cent precision | New split under the accepted private-health namespace; qualifying health contribution used for the subsidy limit |
| `social.privateHealth.subsidyEligibleCarePremiumMonthly` | money, EUR/month | >= 0; cent precision | New split under the accepted private-health namespace; qualifying PPV contribution used for the subsidy limit |
| `social.careInsuranceEmploymentState` | state code | One of 16 codes | Payroll-relevant place of employment under SGB XI section 58; selects Saxony PPV treatment and is not the church-tax payroll-establishment state |
| `social.privateHealth.valueSource` | enum | `elstam / payslip / insurer_notice / user_estimate` | Provenance and result quality |
| `social.privateHealth.assessableEmploymentIncomeMonthly` | money, EUR/month | >= 0; cent precision | Employment remuneration relevant to the statutory comparison cap for the month |

### 3.2 Optional fields

| Field | Type | Behavior |
| --- | --- | --- |
| `social.privateHealth.actualEmployerHealthSubsidyMonthly` | EUR/month | If provided from a payslip, use after validation and do not overwrite with a guided estimate |
| `social.privateHealth.actualEmployerCareSubsidyMonthly` | EUR/month | Same for PPV |
| `social.privateHealth.optionalExtrasMonthly` | EUR/month | Display/cash-cost breakdown only; excluded from tax and subsidy logic unless the official supplied values already include an eligible part |
| `social.privateHealth.eligibleDependentsHealthPremiumMonthly` | EUR/month | Included only after the user confirms the relatives would qualify for statutory family insurance |
| `social.privateHealth.eligibleDependentsCarePremiumMonthly` | EUR/month | Same confirmation requirement |
| `social.privateHealth.effectiveFromMonth` | YYYY-MM | Starts a contribution segment |
| `social.privateHealth.effectiveToMonth` | YYYY-MM or null | Ends a contribution segment |
| `social.privateHealth.unknownOrDisputedElstam` | boolean | Makes the tax result incomplete and shows correction guidance |

### 3.3 Two input modes

**Payroll/ELStAM mode — preferred**

The user copies the monthly values shown by the insurer, ELStAM information or payslip:

- total premiums;
- basic health and mandatory-care amount;
- actual health and care employer subsidies.

This mode is the closest to a real payroll and wins over guided calculations.

**Guided estimate mode**

The user supplies total, subsidy-eligible and tax-eligible amounts. The engine estimates the statutory maximum subsidy. The UI must label this as an estimate until compared with payroll.

The application must never ask for diagnosis, health status, medical history, claims or tariff underwriting data.

## 4. 2026 employer-subsidy calculation

### 4.1 Private health insurance

Use exact decimal arithmetic:

```
health_comparison_base =
  min(assessable_employment_income_monthly, EUR 5,812.50)

health_cap_unrounded =
  health_comparison_base × ((14.6% + 2.9%) / 2)

health_cap_monthly = round_contribution_to_cent(health_cap_unrounded)
// Maximum at the ceiling: EUR 508.59

estimated_employer_health_subsidy =
  min(
    50% × subsidy_eligible_health_contribution,
    health_cap_monthly
  )
```

The employee's actual subsidy cannot exceed the qualifying contribution actually payable and cannot exceed the statutory comparison amount.

### 4.2 Private mandatory-care insurance

Outside Saxony:

```
care_comparison_base =
  min(assessable_employment_income_monthly, EUR 5,812.50)
care_cap_unrounded = care_comparison_base × 1.8%
care_cap_monthly = round_contribution_to_cent(care_cap_unrounded)
// Maximum at the ceiling: EUR 104.63
```

In Saxony:

```
care_comparison_base =
  min(assessable_employment_income_monthly, EUR 5,812.50)
care_cap_unrounded = care_comparison_base × 1.3%
care_cap_monthly = round_contribution_to_cent(care_cap_unrounded)
// Maximum at the ceiling: EUR 75.56
```

Then:

```
estimated_employer_care_subsidy =
  min(
    50% × subsidy_eligible_care_contribution,
    applicable_care_cap
  )
```

The cap does not increase for a childless employee and does not decrease with the employee-side child discounts. Those variations do not change the employer share.

### 4.3 Family contributions

Qualifying private contributions for a spouse, civil partner or child may be considered only when the user confirms that the relative would be eligible for statutory family insurance if the employee were statutorily insured.

The single employee cap remains. Dependent premiums do not create a second cap.

Contributions for relatives who would not qualify for family insurance must not be included automatically. Contributions paid for a relative who is voluntarily insured in the GKV require separate treatment and are outside the v1 guided calculation.

### 4.4 Salary below the ceiling

For every supported month, calculate the statutory comparison amount from the lesser of the month's assessable employment remuneration and EUR 5,812.50. The full EUR 508.59/EUR 104.63/EUR 75.56 values are maximum caps, not unconditional flat caps.

If salary is below the ordinary 2026 insurance threshold, exact subsidy entitlement still requires a confirmed exemption or other supported legal status. When eligibility is confirmed and the month’s assessable employment remuneration is known, apply the remuneration-based formulas above. Return incomplete when either fact is unknown.

## 5. Payroll-tax treatment

Starting in 2026, German private insurers normally transmit two forward-looking monthly contribution values through the BZSt into ELStAM:

- the amount relevant to a tax-free employer subsidy under EStG section 3 number 62; and
- the basic health and mandatory-care amount under EStG section 10(1)(3), used in the payroll tax allowance.

The employer generally must use the ELStAM amounts. A different insurer paper statement cannot normally override them; corrections are initiated through the insurer. A tax-office paper payroll certificate remains authoritative when issued.

Map the private path to the final 2026 BMF program as follows:

| PAP input | Product mapping | Rule |
| --- | --- | --- |
| `PKV` | private insurance selected | Use the PAP value for exclusively private insurance |
| `PKPV` | `privateTaxEligibleMonthly` | Monthly basic health plus mandatory-care contribution, in cents, independent of wage-payment period |
| `PKPVAGZ` | actual tax-free employer subsidy | Monthly health plus care subsidy, in cents, independent of wage-payment period |

The tax allowance for a subsidy-eligible employee is based on the tax-eligible contribution less the actual tax-free employer subsidy. The calculator must run the official PAP; it must not estimate the wage-tax effect with a separate marginal-rate shortcut.

If no ELStAM/private contribution value is available in 2026:

- do not apply the pre-2026 minimum payroll insurance allowance;
- do not invent a tax-eligible contribution from the total tariff price;
- return an incomplete tax result with correction guidance;
- allow an explicitly labelled exploratory scenario, but never call it payroll-exact.

## 6. Cash-flow and output treatment

Private premiums are normally not statutory employee KV/PV deductions remitted through payroll. They are insurer payments, often collected separately. To avoid a misleading net figure, show both payroll and after-insurance cash views.

Required outputs:

| Output | Definition |
| --- | --- |
| Payroll net before private premium | Gross less wage taxes, pension and unemployment contributions, plus any tax-free subsidy paid through payroll |
| Total PKV premium | Actual monthly health premium |
| Total PPV premium | Actual monthly mandatory-care premium |
| Employer health subsidy | Actual or guided-estimate value |
| Employer care subsidy | Actual or guided-estimate value |
| Employee health cost after subsidy | Total health premium minus employer health subsidy |
| Employee care cost after subsidy | Total care premium minus employer care subsidy |
| Disposable pay after private insurance | Payroll cash result minus total PKV/PPV premium, with subsidy counted exactly once |
| Employer total cost | Gross plus employer pension/unemployment contributions plus private health/care subsidy and other included employer costs |
| Tax-eligible contribution | Value passed as PKPV |
| Tax-free subsidy used by PAP | Value passed as PKPVAGZ |
| Result quality | Payroll/ELStAM exact, payslip exact, guided estimate, incomplete or unsupported |

The implementation must include invariants preventing the employer subsidy from being added twice or the private premium from being deducted twice.

Optional extras can reduce the after-insurance cash result, but must be shown separately from the basic tax-eligible amount.

## 7. Period conversion and changes

All private contribution values and subsidies are monthly.

For an annual scenario:

- calculate each month separately;
- apply the relevant contribution segment for that month;
- apply the monthly health and care caps separately;
- sum the twelve cent-denominated results;
- never multiply a changed current-month premium by twelve and call it exact;
- preserve mid-year changes to premiums, subsidy eligibility, employer, state or ELStAM.

A one-off bonus does not increase a subsidy above the monthly statutory cap.

## 8. Result states and warnings

### Exact payroll-aligned

Use when current ELStAM or payslip values and actual subsidies are provided.

### Guided estimate

Use when eligible contribution amounts are known but the engine calculates the subsidy. Show the cap, formula and source.

### Incomplete

Use when a required value is unknown, including:

- subsidy eligibility;
- tax-eligible ELStAM amount;
- subsidy-eligible amount;
- actual subsidy when the legal estimate is not admitted;
- payroll-relevant place-of-employment state;
- assessable employment remuneration for the month;
- an unresolved insurer/ELStAM discrepancy.

### Unsupported

Use for:

- self-employment;
- civil servants, judges, pensioners, free medical care or Beihilfe;
- foreign insurers or foreign social-insurance systems;
- short-time work;
- more than one simultaneous employer;
- mixed statutory/private coverage;
- voluntary GKV relatives included in a subsidy;
- contribution arrears or employer recovery cases;
- tariff-specific premium refunds, deductible optimization or claims modelling;
- employer subsidies beyond the statutory tax-free amount;
- cross-border employment;
- midijobs, mini-jobs and working-student cases.

Required warnings:

- “Estimate only; use your insurer, ELStAM and payslip values for an exact payroll comparison.”
- “The total premium, tax-eligible contribution and subsidy-eligible contribution can differ.”
- “Private premiums may be debited separately from payroll.”
- “The employer subsidy is counted once.”
- “Optional tariff benefits are not assumed tax- or subsidy-eligible.”
- “Contribution refunds and final income-tax treatment are not included.”
- “A 2026 payroll cannot fall back to the old minimum insurance allowance when private ELStAM values are missing.”

## 9. Bilingual labels

| Concept | German | English |
| --- | --- | --- |
| Private health insurance | Private Krankenversicherung | Private health insurance |
| Private mandatory care insurance | Private Pflege-Pflichtversicherung | Private mandatory care insurance |
| Total monthly premium | Monatlicher Gesamtbeitrag | Total monthly premium |
| Tax-eligible basic contribution | Steuerlich berücksichtigungsfähiger Basisbeitrag | Tax-eligible basic contribution |
| Subsidy-eligible contribution | Zuschussfähiger Beitrag | Subsidy-eligible contribution |
| Employer health subsidy | Arbeitgeberzuschuss zur Krankenversicherung | Employer health-insurance subsidy |
| Employer care subsidy | Arbeitgeberzuschuss zur Pflegeversicherung | Employer care-insurance subsidy |
| Employee cost after subsidy | Eigenanteil nach Arbeitgeberzuschuss | Employee cost after employer subsidy |
| Payroll net before private premium | Auszahlungsbetrag vor privatem Versicherungsbeitrag | Payroll net before private premium |
| Disposable pay after private insurance | Verfügbarer Betrag nach privater Versicherung | Disposable pay after private insurance |
| Value from ELStAM | Wert aus den ELStAM | Value from ELStAM |
| Guided estimate | Geführte Schätzung | Guided estimate |
| Payroll-aligned result | An Lohnabrechnung angelehntes Ergebnis | Payroll-aligned result |

German explanation:

> Bei einer privaten Kranken- und Pflegeversicherung können Gesamtbeitrag, zuschussfähiger Beitrag und steuerlich berücksichtigungsfähiger Basisbeitrag unterschiedlich sein. Für eine lohnabrechnungsnahe Berechnung verwenden Sie bitte die Werte aus den ELStAM, der Mitteilung Ihres Versicherers oder Ihrer aktuellen Lohnabrechnung.

English explanation:

> With private health and mandatory care insurance, the total premium, employer-subsidy-eligible contribution and tax-eligible basic contribution can differ. For a payroll-aligned estimate, use the values from ELStAM, your insurer notice or a current payslip.

## 10. Privacy and accessibility

Health-insurance choice and premium amounts are sensitive financial and potentially health-related data.

In accordance with NP-PD-007:

- process all values in the browser;
- never send premiums, insurer name, tariff, subsidy, coverage status or result amounts to analytics;
- do not request medical details;
- prohibit all v1 scenario-bearing share links and never place private-insurance values in URLs, fragments or public links; adding any scenario link requires the separate privacy and threat review mandated by NP-PD-007;
- explain local saved-scenario behavior;
- provide clear and delete controls;
- use accessible currency inputs and error associations;
- do not use color alone to distinguish total, tax-eligible and subsidy-eligible amounts.

Analytics must not emit a private-insurance event, insurance-path property or private-section terminal state. Only the generic allowlisted calculator terminal event from NP-PD-008 may be emitted, without insurance type, premiums, subsidies, state, result values or path-specific status.

## 11. Versioned parameters

| Parameter ID | 2026 value | Unit |
| --- | ---: | --- |
| `private_health.2026.bbg_monthly` | 5812.50 | EUR/month |
| `private_health.2026.general_rate` | 0.146 | ratio |
| `private_health.2026.average_additional_rate` | 0.029 | ratio |
| `private_health.2026.employer_cap_rate` | 0.0875 | ratio |
| `private_health.2026.employer_cap_monthly` | 508.59 | EUR/month |
| `private_care.2026.employer_rate_non_saxony` | 0.018 | ratio |
| `private_care.2026.employer_cap_non_saxony` | 104.63 | EUR/month |
| `private_care.2026.employer_rate_saxony` | 0.013 | ratio |
| `private_care.2026.employer_cap_saxony` | 75.56 | EUR/month |
| `private_health.2026.ordinary_jaeg_annual` | 77400.00 | EUR/year |

Each parameter record requires source IDs, effective dates, verification status and a reviewer. No uncited cap or carry-forward value may enter the engine.

## 12. Validation matrix

Required fixtures include:

- subsidy-eligible health premium below and above twice the cap;
- PPV below and above twice the applicable cap;
- non-Saxony and Saxony payroll-relevant employment states;
- remuneration below and at the monthly assessment ceiling;
- employee with and without qualifying dependents;
- optional extras that affect cash cost but not PKPV;
- total premium different from tax-eligible and subsidy-eligible values;
- actual payslip subsidy overriding a guided estimate;
- employer subsidy of zero for confirmed not-eligible case;
- unknown eligibility producing incomplete;
- missing PKPV producing incomplete rather than the old minimum allowance;
- private PAP path with PKV, PKPV and PKPVAGZ;
- twelve unchanged monthly periods;
- a mid-year contribution change;
- a bonus month that does not raise the subsidy cap;
- no double addition of subsidy;
- no double deduction of premium;
- couple arithmetic totals with each partner calculated independently;
- two offers with different employer subsidies or payroll states;
- all unsupported-case gates;
- privacy-safe analytics assertions.

Boundary examples:

| Case | Health eligible | Care eligible | State | Expected estimated subsidy |
| --- | ---: | ---: | --- | --- |
| Low contribution at ceiling income | EUR 600.00 | EUR 120.00 | BW | EUR 300.00 health + EUR 60.00 care |
| Health capped at ceiling income | EUR 1,200.00 | EUR 120.00 | BW | EUR 508.59 health + EUR 60.00 care |
| Both capped at ceiling income | EUR 1,200.00 | EUR 240.00 | BW | EUR 508.59 health + EUR 104.63 care |
| Saxony care cap at ceiling income | EUR 1,200.00 | EUR 200.00 | SN employment | EUR 508.59 health + EUR 75.56 care |
| Below-ceiling remuneration | EUR 1,200.00 | EUR 240.00 | BW employment, EUR 4,000 assessable pay | EUR 350.00 health + EUR 72.00 care |

Fixtures must be compared with the final 2026 BMF PAP and at least one approved payroll reference.

## 13. Engineering handoff

Implementation should provide:

1. a private-insurance input model that keeps total, subsidy-eligible and tax-eligible values separate;
2. payroll/ELStAM and guided-estimate modes;
3. versioned 2026 health and care caps;
4. a Saxony PPV branch;
5. actual-subsidy override with validation;
6. PAP mapping for PKV, PKPV and PKPVAGZ;
7. monthly segmentation;
8. two cash-flow views and explicit employer cost;
9. no-double-count invariants;
10. result quality and provenance metadata;
11. fail-closed missing-value behavior;
12. bilingual explanations;
13. privacy-safe storage and analytics;
14. fixtures for caps, family contributions, periods and unsupported paths.

## Acceptance check for NP-RS-010

- [x] Editable private contribution inputs are defined.
- [x] Total, subsidy-eligible and tax-eligible amounts are separated.
- [x] 2026 health and PPV employer-subsidy formulas and caps are recorded.
- [x] The Saxony PPV difference uses payroll-relevant place of employment.
- [x] Subsidy comparison caps use monthly assessable employment remuneration.
- [x] Family-contribution boundaries are documented.
- [x] The 2026 ELStAM process and PAP mappings are specified.
- [x] Cash-flow and employer-cost outputs avoid double counting.
- [x] Annual and mid-year behavior is defined.
- [x] Exact, estimated, incomplete and unsupported states are defined.
- [x] Limitations, warnings, privacy and accessibility requirements are included.
- [x] Validation fixtures and engineering handoff are provided.
