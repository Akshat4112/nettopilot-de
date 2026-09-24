# NP-PD-004 — Salary calculator input specification

**Status:** Proposed for review  
**Task:** NP-PD-004  
**Milestone:** M0 Plan  
**Depends on:** [NP-PD-003](NP-PD-003-v1-employment-scope.md)  
**Last updated:** 2026-09-24

## Purpose

This document turns the accepted v1 employment scope into a concrete input contract for NettoPilot DE.

It defines:

- which inputs are required, optional or conditional;
- types, units, periods, valid values and product guardrails;
- visible defaults and unknown states;
- conditional visibility and cross-field dependencies;
- whether an input can affect wage tax, social insurance, scope admission or offer comparison;
- errors, warnings and unsupported-case triggers;
- the versioning and source requirements that calculation work must satisfy.

This is a product input specification, not the calculation formula or a table of current legal rates. Exact year-specific options, thresholds, rates and formulas must come from a validated, cited assumption set for the selected calculation year.

## Input principles

1. **No hidden material defaults.** Tax class, church-tax liability, private-insurance amounts and other inputs that can materially change the result require an explicit answer.
2. **One source of numeric truth.** The UI collects inputs; the deterministic calculation engine interprets them.
3. **Year first.** Every legal option list, threshold and rate is resolved for the selected calculation year.
4. **Unknown is a state, not zero.** An unanswered material field cannot be silently converted to zero, false or a common case.
5. **Scope before calculation.** Unsupported employment situations are stopped before a normal result is shown.
6. **Comparison values stay separate.** Hours, vacation, commute and user-valued benefits cannot change payroll results unless a later validated calculation specification says otherwise.
7. **Derived values are not duplicate inputs.** Age, annual equivalent, monthly equivalent and household totals are derived from canonical inputs.
8. **German and English labels share one field identity.** Translation must never create different calculation semantics.

## Requirement and impact legend

### Requirement states

| State | Meaning |
| --- | --- |
| Required | A supported result cannot be calculated without a valid value |
| Conditional | Required only when its documented path or dependency applies |
| Optional with default | May be omitted only because a visible, versioned default is defined |
| Optional, no payroll effect | May be omitted and does not affect wage tax or social insurance |
| Derived | Calculated from canonical inputs and never independently editable |

### Impact flags

| Flag | Meaning |
| --- | --- |
| Scope | Determines whether the scenario is supported |
| Tax | May change wage-tax or solidarity-surcharge treatment |
| SI | May change social-insurance contributions |
| Comparison | Changes presentation or comparison metrics only |
| Metadata | Controls display, reproducibility or localisation only |

An impact flag means the field may affect that area. The later calculation specification determines the exact formula.

## Canonical scenario shape

A single individual scenario contains these logical groups:

- calculation context;
- scope admission;
- compensation;
- wage-tax inputs;
- social-insurance inputs;
- comparison-only inputs.

An offer comparison contains exactly two independently valid individual scenarios with a common calculation year. A couple view contains two independently valid individual scenarios and an arithmetic combined result; it is not a joint-tax model.

## Shared validation conventions

### Money

- Currency is fixed to EUR in v1.
- User entry may follow the selected German or English locale.
- Stored values use decimal euros, never binary floating-point approximations.
- Amounts must be finite and non-negative unless a field explicitly requires a positive value.
- The annual-equivalent total accepted by the public form is greater than EUR 0 and at most EUR 10,000,000.
- Values above EUR 1,000,000 annual equivalent receive an unusual-value warning but are not rejected solely for being high.
- Legal contribution ceilings are calculation assumptions, not form maximums.

### Percentages and rates

- UI unit: percent.
- Stored unit: an explicitly documented decimal or basis-point representation chosen by the engineering specification.
- Generic hard range: 0% through 100%.
- A legal rate field may use a narrower year-specific range from the assumption set.
- The UI must show whether a rate is user-entered, insurer-specific or supplied by the assumption set.

### Dates and years

- Dates are stored as ISO calendar dates.
- Calculation year must exist in the supported assumption registry.
- Date-derived age is calculated for the legally relevant reference date; the user never edits both date of birth and age.
- Future birth dates are invalid.

### Text

- Scenario and offer labels: 1–80 visible characters after trimming.
- Benefit labels: 1–120 visible characters after trimming.
- Free text never enters a payroll formula.

### Unknown values

- Every required material field supports an explicit unanswered state while the form is being completed.
- “I do not know” may open guidance, but cannot produce a normal supported result unless a later calculation specification defines a validated provisional range.
- Zero is a valid numeric value only when the user or a visible default explicitly supplies zero.

## 1. Calculation context

| Field ID | UI meaning | Requirement and default | Type and valid values | Impact |
| --- | --- | --- | --- | --- |
| `calculationYear` | Calculation year / Berechnungsjahr | Required. Default: latest fully supported stable year, visibly selected | Integer member of the versioned supported-year registry | Tax, SI, Metadata |
| `locale` | Language and formatting | Required for display. Default: supported browser preference, otherwise `de-DE` | `de-DE` or `en-DE` in v1 | Metadata |
| `currency` | Currency | Derived/fixed | `EUR` | Metadata |
| `scenarioLabel` | User-facing scenario name | Optional, no payroll effect. Default: translated generic label | Trimmed text, 1–80 characters when supplied | Comparison, Metadata |

Changing the calculation year must revalidate every year-dependent selection. A selection that is unavailable in the new year becomes unresolved; it must not be silently mapped to a different option.

## 2. Scope-admission inputs

These answers are required before a normal result is shown.

| Field ID | UI meaning | Requirement and default | Type and valid values | Impact |
| --- | --- | --- | --- | --- |
| `employmentCategory` | Employment type | Required; no preselected answer | `regular_employee_full_time`, `regular_employee_part_time`, `unsupported_other` | Scope |
| `payrollCountry` | Payroll country | Required; no hidden default | `DE` or `unsupported_other` | Scope |
| `crossBorderTreatmentRequired` | Foreign or cross-border tax treatment needed | Required; no preselected answer | Boolean or `unknown` | Scope |
| `simultaneousEmploymentCount` | Number of employment relationships in this scenario | Required; no preselected answer | Integer 1–20 or `unknown`; only 1 is supported in v1 | Scope |
| `specialEmploymentCase` | Deferred special case | Required; default only after explicit “none of these” confirmation | `none`, `mini_job`, `midijob`, `working_student`, `short_time_work`, `severance`, `company_car`, `complex_equity`, `other`, `unknown` | Scope |

### Admission outcome

A normal result requires:

- regular full-time or standard part-time employment;
- German payroll;
- no required cross-border treatment;
- exactly one employment relationship;
- no deferred special-employment case.

A failed admission answer remains visible and produces a specific unsupported-case message. It is not converted into the nearest supported employment type.

## 3. Compensation inputs

### 3.1 Recurring base salary

| Field ID | UI meaning | Requirement and default | Type and valid values | Impact |
| --- | --- | --- | --- | --- |
| `baseSalary.period` | Salary entry period | Required. Visible default: `annual` | `monthly` or `annual` | Tax, SI, Metadata |
| `baseSalary.grossAmount` | Recurring gross salary | Required; no numeric default | Positive decimal EUR; annual-equivalent total at most EUR 10,000,000 | Tax, SI |
| `baseSalary.paymentsPerYear` | Regular salary payments represented by the base amount | Derived for v1 | 12; extra contractual payments are entered separately | Metadata |

Period rules:

- monthly gross is annualised as 12 regular payments;
- annual gross is divided through the documented payroll-period rule;
- a thirteenth salary, holiday pay or Christmas pay is not hidden inside `paymentsPerYear`; it is represented as a separate supported taxable payment;
- changing the period preserves the represented annual amount and shows the conversion before confirmation.

### 3.2 Regular bonus or additional taxable cash

| Field ID | UI meaning | Requirement and default | Type and valid values | Impact |
| --- | --- | --- | --- | --- |
| `regularAdditionalCash.amount` | Recurring taxable cash beyond base salary | Optional with visible default EUR 0 | Decimal EUR, 0 through the remaining annual product maximum | Tax, SI |
| `regularAdditionalCash.period` | Period for recurring additional cash | Conditional when amount is greater than zero | `monthly` or `annual` | Tax, SI |
| `regularAdditionalCash.guarantee` | Compensation certainty | Conditional when amount is greater than zero; no hidden default | `guaranteed` or `variable` | Comparison |

The guarantee classification does not change payroll treatment. It changes conservative and total-compensation views.

### 3.3 One-off taxable payments

| Field ID | UI meaning | Requirement and default | Type and valid values | Impact |
| --- | --- | --- | --- | --- |
| `oneOffPayments[]` | Supported one-off taxable cash payments | Optional; default empty list | 0–12 rows in v1 | Tax, SI, Comparison |
| `oneOffPayments[].amount` | Gross payment amount | Required for each row | Positive decimal EUR within remaining annual product maximum | Tax, SI |
| `oneOffPayments[].paymentMonth` | Payroll month | Required for each row | Integer 1–12 | Tax, SI |
| `oneOffPayments[].classification` | Payroll classification | Required for each row | Value from the selected year's supported payment-classification registry | Tax, SI |
| `oneOffPayments[].guarantee` | Compensation certainty | Required for comparison | `guaranteed` or `variable` | Comparison |
| `oneOffPayments[].label` | User label | Optional | Trimmed text, 1–80 characters | Comparison |

A one-off payment is calculated only when the selected year, classification and available inputs are sufficient for the validated calculation path. Otherwise the row is retained but the product explains that the payment cannot be included in a supported result.

### 3.4 Compensation consistency rules

- Base salary must be greater than zero.
- The annual equivalent of all salary and payment rows must not exceed the public-form maximum.
- Recurring and one-off amounts remain separate in storage and output.
- Variable compensation cannot be included in the conservative recurring-monthly result.
- A comparison must not treat a user-entered benefit value as taxable salary.

## 4. Wage-tax inputs

| Field ID | UI meaning | Requirement and default | Type and valid values | Impact |
| --- | --- | --- | --- | --- |
| `tax.taxClass` | Tax class / Steuerklasse | Required; no preselected answer | Member of the selected year's validated tax-class registry | Tax |
| `tax.federalState` | Federal state / Bundesland | Required; no hidden default | One of the 16 German federal states | Tax, SI |
| `tax.churchTaxStatus` | Church-tax liability | Required; no preselected answer | `liable`, `not_liable`, `unknown` | Tax |
| `tax.dateOfBirth` | Date of birth | Required because age-dependent rules may apply; no default | Valid past ISO date | Tax, SI |
| `tax.childAllowanceFactor` | Child allowance factor shown in payroll data / Kinderfreibetrag | Optional with visible default 0 only after user confirmation | Non-negative decimal allowed by the selected year's assumption set | Tax |
| `tax.annualAllowanceAmount` | Annual payroll allowance / Freibetrag | Optional with visible default EUR 0 | Decimal EUR, 0–10,000,000 | Tax |
| `tax.annualAdditionalAmount` | Annual additional payroll amount / Hinzurechnungsbetrag | Optional with visible default EUR 0 | Decimal EUR, 0–10,000,000 | Tax |

Rules:

- The UI must not infer tax class from relationship status, salary or household composition.
- Church-tax status is independent of federal state; state selects the applicable supported treatment after liability is declared.
- Number of children, care-insurance child status and child allowance factor are separate concepts. The product must not derive one from another without a validated rule and sufficient data.
- Allowances already embedded in the official year-specific payroll algorithm are not exposed as user inputs.
- If the selected tax class or allowance form is not supported by the selected year's assumption set, calculation stops with a specific message.

## 5. Social-insurance inputs

### 5.1 Common fields

| Field ID | UI meaning | Requirement and default | Type and valid values | Impact |
| --- | --- | --- | --- | --- |
| `social.pensionStatus` | Pension-insurance status | Required; no hidden default | Member of the selected year's supported pension-status registry, plus `unknown` | SI, Scope |
| `social.unemploymentStatus` | Unemployment-insurance status | Required; no hidden default | Member of the selected year's supported unemployment-status registry, plus `unknown` | SI, Scope |
| `social.healthInsuranceType` | Health-insurance path | Required; no preselected answer | `statutory`, `private`, `unknown` | Tax, SI, Scope |
| `social.careInsuranceChildStatus` | Parent/childless status for care insurance | Required; no hidden default | `has_child`, `childless`, `unknown` | SI |
| `social.childrenUnderRelevantAge` | Children within the year-specific care-insurance age rule | Conditional when required by the assumption set | Integer 0–20 or `unknown`; engine applies any legal cap | SI |

A professional pension scheme, exemption or other uncommon insurance status is calculated only when the selected year's assumption set explicitly supports it. Otherwise the status triggers a bounded unsupported result rather than an approximation.

### 5.2 Statutory health-insurance path

Shown only when `social.healthInsuranceType = statutory`.

| Field ID | UI meaning | Requirement and default | Type and valid values | Impact |
| --- | --- | --- | --- | --- |
| `social.statutoryHealth.additionalRateMode` | How the additional contribution rate is supplied | Required. Visible default may be `published_average` | `insurer_specific` or `published_average` | SI, Metadata |
| `social.statutoryHealth.additionalContributionRate` | Additional contribution rate / Zusatzbeitrag | Required for insurer-specific mode; derived for published-average mode | Percentage within the selected year's validated legal/product range | SI |

When the published-average mode is used, the result must name the rate, year and source and must state that the user's insurer may differ.

### 5.3 Private health-insurance path

Shown only when `social.healthInsuranceType = private`.

| Field ID | UI meaning | Requirement and default | Type and valid values | Impact |
| --- | --- | --- | --- | --- |
| `social.privateHealth.totalHealthPremiumMonthly` | User-paid private health premium | Required; no default | Decimal EUR per month, 0–100,000 | SI |
| `social.privateHealth.totalCarePremiumMonthly` | User-paid private care premium | Required; no default | Decimal EUR per month, 0–100,000 | SI |
| `social.privateHealth.payrollBasicCoverageAmountMonthly` | Payroll-relevant basic-coverage amount from insurer documentation | Conditional when required by the selected calculation method; no default | Decimal EUR per month, 0–sum of entered private health and care premiums | Tax |
| `social.privateHealth.employerContributionKnown` | Whether an employer contribution is explicitly known | Required for input routing | Boolean |
| `social.privateHealth.employerContributionMonthly` | Contractual employer contribution, if explicitly known and supported | Conditional; otherwise derived under validated caps | Decimal EUR per month, 0–sum of entered private premiums | SI |

The product must not guess an unknown private premium. Exact required splits, employer-subsidy caps and tax treatment are defined by the year-specific research and calculation specifications.

### 5.4 Social-insurance consistency rules

- An insurance path must be selected before path-specific fields appear.
- Statutory and private path-specific inputs are mutually exclusive.
- Unknown pension, unemployment, health or material care-insurance status blocks a normal result.
- The engine applies contribution ceilings from the assumption set; the form does not truncate gross salary.
- Federal state may affect a supported social-insurance rule and therefore must be passed unchanged to the engine.
- Child allowance factor cannot substitute for care-insurance child information.

## 6. Comparison-only inputs

These inputs never alter wage tax, social insurance or displayed net pay in v1.

| Field ID | UI meaning | Requirement and default | Type and valid values | Impact |
| --- | --- | --- | --- | --- |
| `comparison.weeklyHours` | Contractual weekly hours | Optional for a single calculation; required for hourly offer comparison | Decimal hours, greater than 0 and at most 80 | Comparison |
| `comparison.vacationDaysAnnual` | Paid vacation days per year | Optional; no default | Decimal days, 0–366 | Comparison |
| `comparison.remoteDaysPerWeek` | Typical remote-work days | Optional; no default | Decimal days, 0–7 | Comparison |
| `comparison.commuteOneWayKm` | Typical one-way commute distance | Optional; no default | Decimal kilometres, 0–2,000 | Comparison |
| `comparison.benefits[]` | Non-cash or employer benefits | Optional; default empty list | 0–20 rows | Comparison |
| `comparison.benefits[].label` | Benefit name | Required for each row | Trimmed text, 1–120 characters | Comparison |
| `comparison.benefits[].employerValueAnnual` | Employer-stated annual value | Optional; no default | Decimal EUR, 0–1,000,000 | Comparison |
| `comparison.benefits[].userValueAnnual` | User-assigned annual value | Optional; no default | Decimal EUR, 0–1,000,000 | Comparison |
| `comparison.benefits[].certainty` | Whether the benefit is guaranteed | Required for each row | `guaranteed`, `conditional`, `unknown` | Comparison |

The interface must visually and semantically separate employer-stated value, user value and cash compensation. Commute and remote-work fields provide context only; v1 does not invent tax savings or cost-of-living adjustments.

## 7. Alternative salary, offer and couple scenarios

### Salary alternative

A salary-increase scenario reuses the individual's tax and social-insurance inputs and changes only explicitly selected compensation or comparison fields. The UI must show which values are shared and which differ.

### Two-offer comparison

A valid comparison requires:

- exactly two individually valid supported scenarios;
- the same calculation year;
- compatible assumption-set and engine versions;
- explicit handling of missing comparison-only fields;
- guaranteed, variable and user-valued amounts kept separate.

Missing comparison data is “unknown” or “not comparable”, never automatically zero.

### Couple view

A couple view contains `personA` and `personB`, each conforming to this full individual input contract.

Rules:

- both calculations use the same calculation year for a side-by-side household scenario;
- each individual result remains visible;
- the household total is an arithmetic sum of supported results;
- one person's fields never overwrite or infer the other person's inputs;
- names are optional labels, not required personal data;
- tax-class optimisation, joint-return effects and government benefits are outside v1.

## 8. Conditional visibility and dependency summary

| Trigger | Fields shown or required | Behaviour |
| --- | --- | --- |
| Monthly salary period | Monthly gross input and annual-equivalent preview | Store canonical period and amount |
| Annual salary period | Annual gross input and monthly-equivalent preview | Do not imply a final annual tax return |
| Additional cash > 0 | Period and guarantee | Keep separate from base salary |
| One-off payment added | Amount, month, supported classification and guarantee | Validate the payment path independently |
| Church-tax status liable | State-specific treatment explanation | State is already required |
| Statutory health selected | Additional-rate mode and applicable rate | Hide and clear private-path draft only after confirmation |
| Private health selected | Private premium fields and any required payroll certificate amount | Hide and clear statutory-path draft only after confirmation |
| Has child selected | Relevant child-count question if required for selected year | Do not infer tax child allowance |
| Offer comparison enabled | Hours and other comparison fields for both offers | Missing values remain incomparable |
| Couple view enabled | Second complete individual scenario | Keep both result bases visible |

Switching a conditional path must not silently destroy entered data. The UI may retain inactive values locally, but only active-path values are submitted to the calculation engine.

## 9. Error, warning and unsupported states

### Blocking validation errors

- missing or malformed required value;
- invalid locale number;
- non-finite or negative amount where not permitted;
- value outside a hard product range;
- unsupported calculation year;
- option not present in the selected year's assumption registry;
- inconsistent private-insurance amounts;
- incomplete one-off payment row;
- incompatible years in a comparison;
- impossible date.

### Unsupported-case stops

- non-salaried employment;
- non-German or cross-border payroll treatment;
- more than one simultaneous employment relationship;
- mini-job, midijob, working-student or another deferred employment type;
- short-time work or severance;
- company-car or complex-equity treatment needed;
- insurance or compensation path not supported by the selected assumption set;
- any other deferred case defined in NP-PD-003.

### Non-blocking warnings

- unusual but valid high salary;
- published-average statutory health rate used instead of insurer-specific rate;
- optional comparison data missing;
- variable compensation included in total-compensation view;
- one-off payment excluded from recurring monthly view;
- user-valued benefit shown;
- inactive conditional-path data retained locally;
- result relies on an explicit zero allowance or zero additional amount.

Errors and warnings must be announced to assistive technology, associated with the relevant field and expressed in German and English. Colour alone is insufficient.

## 10. Defaults register

Only these v1 defaults are permitted without another approved specification:

| Field | Default | Required presentation |
| --- | --- | --- |
| Calculation year | Latest fully supported stable year | Visible selector and year label in results |
| Locale | Supported browser preference; fallback `de-DE` | Visible language control |
| Currency | EUR | Displayed with every money input/output context |
| Salary period | Annual | Visible segmented control/select |
| Regular additional cash | EUR 0 | Explicit zero state |
| One-off payments | Empty list | “Add payment” action |
| Child allowance factor | 0 only after user confirmation | Explanation that this is not inferred from number of children |
| Annual allowance/additional amount | EUR 0 | Expandable advanced section with explanation |
| Benefits | Empty list | “Add benefit” action |
| Published-average statutory health rate mode | May be the visible default | Rate, year, source and insurer-difference warning |

No other material payroll field receives a default without a reviewed update to this register.

## 11. Data minimisation and accessibility

- Core calculation requires no name, email, employer name, address, tax identifier, insurance number or bank data.
- Date of birth and salary data remain in the browser in the static v1 unless a later privacy-reviewed feature explicitly changes this.
- Analytics must never receive raw input values or scenario content.
- Every input has a persistent label, unit, reason-for-asking text and linked error.
- German payroll terms are shown beside English explanations where users may need to find them in official or employer documents.
- Input order and conditional sections must work by keyboard and preserve focus predictably.
- Numeric inputs must accept locale-appropriate entry without changing the stored numeric meaning.

## 12. Source and version requirements

Each supported calculation year must provide a machine-readable assumption manifest containing:

- supported tax-class identifiers;
- state identifiers and applicable state-sensitive rules;
- church-tax treatments;
- social-insurance status options;
- statutory health-rate source and valid range;
- contribution rates, ceilings and age/child rules;
- private-insurance calculation requirements and caps;
- supported one-off payment classifications;
- effective dates;
- official source citations;
- assumption-set version and publication date.

A result is reproducible only when stored or displayed with:

- scope version;
- input-contract version;
- calculation year;
- assumption-set version;
- calculation-engine version;
- canonical user inputs;
- warnings and unsupported exclusions applied.

The product must not embed uncited current-year legal constants in form components.

## 13. Engineering handoff

The implementation should create:

1. one typed canonical input schema;
2. locale-aware parsers that return explicit validation results;
3. a scope-admission validator;
4. year-dependent option providers backed by the assumption registry;
5. cross-field validation for insurance, children, payments and comparisons;
6. a transformation from valid form state to calculation-engine input;
7. tests for every default, hard range, unknown state, conditional dependency and unsupported trigger;
8. fixtures for monthly, annual, statutory, private, offer and couple scenarios.

The output contract is defined by NP-PD-005. The later calculation specification decides exact formulas; it must not silently reinterpret these field meanings.

## Acceptance check for NP-PD-004

- [x] Required, conditional and optional inputs are classified.
- [x] Units, periods, common hard ranges and visible defaults are defined.
- [x] Scope-admission inputs and unsupported triggers are explicit.
- [x] Wage-tax and social-insurance relevance is identified.
- [x] Statutory and private health-insurance paths are separated.
- [x] Tax child allowance and care-insurance child inputs are separated.
- [x] Recurring, variable and one-off compensation are separated.
- [x] Comparison-only fields cannot alter payroll results.
- [x] Alternative salary, two-offer and couple dependencies are defined.
- [x] Unknown, error and warning behaviour is defined.
- [x] Privacy, accessibility, source and version requirements are included.
- [x] The specification does not add an employment case outside NP-PD-003.
