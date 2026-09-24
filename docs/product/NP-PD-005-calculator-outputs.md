# NP-PD-005 — Calculator output specification

**Status:** Proposed for review  
**Task:** NP-PD-005  
**Milestone:** M0 Plan  
**Depends on:** [NP-PD-004](NP-PD-004-salary-calculator-inputs.md)  
**Last updated:** 2026-09-24

## Purpose

This document defines what NettoPilot DE v1 returns after a supported salary calculation.

It specifies:

- monthly and annual compensation outputs;
- wage-tax and social-insurance deductions;
- employee and employer contribution views;
- estimated net-pay measures;
- estimated employer payroll cost;
- effective-rate definitions and denominators;
- recurring, variable and one-off result views;
- rounding, currency and period semantics;
- German and English labels;
- warnings, incomplete states and unsupported-result behaviour;
- reproducibility metadata;
- individual and simple couple-total boundaries.

This is an output contract, not the calculation formula. Exact year-specific rates, thresholds, contribution ceilings, formula steps and statutory rounding rules belong to validated research, assumption and calculation specifications.

## Output principles

1. **Lead with the decision-useful result.** Show estimated recurring monthly net first for a supported individual scenario.
2. **Do not disguise annual averages as payslips.** Average monthly values that include one-off payments must be labelled as annual total divided by 12.
3. **Gross, deductions and net must reconcile.** The UI uses calculation-engine values and never recreates payroll arithmetic independently.
4. **Guaranteed, variable and one-off pay stay separate.** A total-compensation view cannot replace the conservative recurring view.
5. **Explain every deduction.** Each line item has a stable identifier, label, amount, period, basis and explanation link.
6. **Qualify employer cost.** Employer-specific costs that are not modelled must not be implied to be included.
7. **Unknown is not zero.** Missing or unsupported components remain explicit and may prevent a complete total.
8. **Estimates remain estimates.** Outputs are not a payslip, final income-tax assessment, tax return or legal entitlement.
9. **Versions travel with results.** A result is reproducible from its inputs and calculation metadata.
10. **German and English are presentation variants of one schema.** Locale never changes the numeric meaning.

## 1. Result states

Every calculation response has exactly one top-level state.

| State | Meaning | Numeric output behaviour |
| --- | --- | --- |
| `supported` | All required inputs and calculation paths are supported | Show complete normal output |
| `supported_with_warnings` | Calculation is complete but contains material assumptions or cautions | Show complete output with prominent warnings |
| `incomplete` | One or more required inputs are missing, invalid or unknown | Do not show a normal net result; show missing actions |
| `unsupported` | The scenario violates the accepted v1 scope or needs an unsupported calculation path | Do not show a normal net result; name the unsupported condition |
| `error` | The engine could not produce a trustworthy response | Do not reuse or display a stale result as current |

The UI must not infer a supported result from partial numeric fields. Only `supported` and `supported_with_warnings` may populate the normal result summary.

## 2. Canonical output envelope

A calculation response contains these logical groups:

- `status` — result state and whether the result is complete;
- `metadata` — year, locale, currency and version identifiers;
- `compensation` — recurring, variable and one-off gross cash;
- `employeeTaxes` — employee wage-tax deductions;
- `employeeSocialInsurance` — employee social-insurance deductions;
- `employeeNet` — reconciled net measures;
- `employerContributions` — supported employer-side contributions;
- `employerCost` — qualified estimated employer payroll cost;
- `effectiveRates` — named numerators and denominators;
- `periods` — monthly or event-period detail where available;
- `warnings` and `explanations`;
- `sources` and reproducibility versions.

All money values use decimal EUR. Stable field identifiers are not translated.

## 3. Output component model

Every monetary line item exposed in the detailed breakdown uses a common component shape.

| Property | Requirement | Meaning |
| --- | --- | --- |
| `id` | Required | Stable machine identifier |
| `category` | Required | Compensation, tax, employee SI, employer SI, employer-only cost or adjustment |
| `amount` | Required for complete component | Decimal EUR value for the declared period |
| `period` | Required | `month`, `year` or a specific payroll month |
| `direction` | Required | `earning`, `deduction`, `employer_contribution`, `external_outflow` or `informational` |
| `includedInNet` | Required | Whether the amount participates in the displayed net-pay reconciliation |
| `includedInEmployerCost` | Required | Whether the amount participates in the employer-cost reconciliation |
| `basisId` | Required when applicable | Identifier of the gross or contribution basis |
| `sourceRef` | Required for rule-derived values | Reference into the assumption/source manifest |
| `explanationKey` | Required | Translation key for plain-language explanation |
| `quality` | Required | `calculated`, `user_supplied`, `assumption`, `derived` or `unavailable` |

A component marked `unavailable` has no invented numeric value.

## 4. Compensation outputs

### 4.1 Required compensation fields

| Output ID | Meaning | Periods | Presentation requirement |
| --- | --- | --- | --- |
| `compensation.baseGross` | Supported base cash salary | Month and year | Show the canonical salary and its derived counterpart |
| `compensation.guaranteedRecurringGross` | Base plus guaranteed recurring additional cash | Month and year | Primary gross basis for conservative recurring view |
| `compensation.variableRecurringGross` | Variable recurring cash | Month and year | Separate from guaranteed pay |
| `compensation.oneOffGross` | Supported one-off taxable cash | Each payment month and annual total | Never merge into recurring monthly gross |
| `compensation.guaranteedAnnualGross` | Guaranteed recurring annual cash plus guaranteed one-off cash | Year | Identify included one-off amounts |
| `compensation.totalAnnualGross` | Guaranteed and variable supported cash compensation | Year | Label as total, not guaranteed |
| `compensation.averageMonthlyGrossFromAnnualTotal` | Total annual gross divided by 12 | Month-equivalent | Must include “average” wording |

### 4.2 Compensation invariants

- Recurring monthly gross excludes all one-off payments.
- Annual recurring gross follows the approved period rule from NP-PD-004.
- Annual one-off gross is the sum of supported one-off payment rows.
- Total annual gross is the sum of supported recurring and one-off gross components.
- A variable amount remains variable in every aggregate.
- User-valued benefits never enter gross salary, taxable gross or payroll net in v1.
- An unsupported payment is identified and excluded; it is not silently treated as recurring salary.

## 5. Employee wage-tax outputs

| Output ID | German label | English label | Required periods |
| --- | --- | --- | --- |
| `employeeTaxes.wageTax` | Lohnsteuer | Wage tax | Recurring month, event month where applicable, year |
| `employeeTaxes.solidaritySurcharge` | Solidaritätszuschlag | Solidarity surcharge | Recurring month, event month where applicable, year |
| `employeeTaxes.churchTax` | Kirchensteuer | Church tax | Recurring month, event month where applicable, year |
| `employeeTaxes.total` | Steuern gesamt | Total payroll taxes | Month and year |

Rules:

- A zero amount is displayed as EUR 0.00 when the component is applicable and calculated.
- A component that is not applicable is labelled “not applicable”, not “unknown”.
- A component that cannot be calculated is “unavailable” and prevents a misleading complete total.
- These are payroll-withholding estimates, not final annual income-tax liability.
- The detailed view links every rule-derived tax component to the calculation year and source manifest.

## 6. Employee social-insurance outputs

| Output ID | German label | English label | Required periods |
| --- | --- | --- | --- |
| `employeeSocialInsurance.pension` | Rentenversicherung | Pension insurance | Month and year |
| `employeeSocialInsurance.unemployment` | Arbeitslosenversicherung | Unemployment insurance | Month and year |
| `employeeSocialInsurance.health` | Krankenversicherung | Health insurance | Month and year |
| `employeeSocialInsurance.care` | Pflegeversicherung | Long-term care insurance | Month and year |
| `employeeSocialInsurance.total` | Sozialabgaben gesamt | Total employee social insurance | Month and year |

Rules:

- Each supported contribution shows its employee amount and contribution basis.
- Contribution ceilings are explained in the assumptions view; gross salary is not visually truncated.
- Statutory and private health-insurance paths produce different cash-flow presentations.
- A non-applicable contribution is distinguished from an unsupported insurance status.
- Care-insurance output may include an explanation of child or age treatment without exposing unnecessary personal data.

## 7. Net-pay outputs

### 7.1 Statutory health-insurance path

| Output ID | Meaning | Presentation |
| --- | --- | --- |
| `employeeNet.recurringMonthly` | Estimated net for a normal recurring month using guaranteed recurring cash | Primary result |
| `employeeNet.recurringAnnual` | Twelve recurring-month results under the documented period model | Secondary annual result |
| `employeeNet.guaranteedAnnual` | Estimated annual net from guaranteed supported cash, including guaranteed one-offs | Conservative annual view |
| `employeeNet.totalAnnual` | Estimated annual net including supported variable cash | Total-compensation view |
| `employeeNet.averageMonthlyFromAnnualTotal` | Total annual net divided by 12 | Explicitly labelled average; never called monthly payslip |
| `employeeNet.eventMonths[]` | Net estimate for months containing supported one-off payments | Shown when one-off payments exist |

For a statutory-insurance result:

`payroll net = supported gross cash − employee payroll taxes − employee social-insurance deductions`

The exact engine ledger is authoritative.

### 7.2 Private health-insurance path

Private premiums may be paid outside the ordinary payroll deduction flow. The product must not collapse payroll payout and the external premium into one unexplained number.

| Output ID | German label | English label | Meaning |
| --- | --- | --- | --- |
| `employeeNet.payrollPayoutBeforePrivatePremium` | Auszahlung vor privaten Versicherungsbeiträgen | Payroll payout before private insurance premiums | Payroll cash result including any supported employer subsidy treatment |
| `employeeNet.privateHealthCarePremiumOutflow` | Private Kranken- und Pflegeversicherungsbeiträge | Private health and care premium outflow | User-supplied external monthly premium total |
| `employeeNet.afterPrivatePremium` | Verfügbar nach privaten Versicherungsbeiträgen | Estimated amount after private insurance premiums | Payroll payout less modelled external private premiums |
| `employeeNet.privateEmployerSubsidy` | Arbeitgeberzuschuss zur privaten Versicherung | Employer subsidy for private insurance | Employer-side supported subsidy shown separately |

The exact payroll placement of the subsidy and tax-relevant private-insurance amount must follow the validated calculation specification. The UI must show the reconciliation used for the selected year.

### 7.3 Net-pay wording

Use “estimated” in the primary title or immediately adjacent description. Do not use:

- guaranteed net salary;
- exact payslip;
- final tax;
- disposable household income;
- tax refund estimate.

## 8. Employer contribution outputs

| Output ID | German label | English label |
| --- | --- | --- |
| `employerContributions.pension` | Arbeitgeberanteil Rentenversicherung | Employer pension contribution |
| `employerContributions.unemployment` | Arbeitgeberanteil Arbeitslosenversicherung | Employer unemployment contribution |
| `employerContributions.health` | Arbeitgeberanteil Krankenversicherung | Employer health-insurance contribution |
| `employerContributions.care` | Arbeitgeberanteil Pflegeversicherung | Employer long-term care contribution |
| `employerContributions.privateInsuranceSubsidy` | Arbeitgeberzuschuss private Versicherung | Employer private-insurance subsidy |
| `employerContributions.otherModelled` | Weitere berücksichtigte Arbeitgeberabgaben | Other modelled employer payroll charges |
| `employerContributions.totalModelled` | Berücksichtigte Arbeitgeberbeiträge gesamt | Total modelled employer contributions |

Only components supported by the year-specific engine are numeric. Employer-specific levies, accident insurance, occupational pension costs or other charges must not be invented.

## 9. Estimated employer payroll cost

| Output ID | Meaning |
| --- | --- |
| `employerCost.grossCashCompensation` | Supported employee gross cash compensation |
| `employerCost.modelledEmployerContributions` | Sum of supported employer contribution components |
| `employerCost.estimatedPayrollCost` | Gross cash compensation plus modelled employer contributions |
| `employerCost.coverage` | List of included and excluded cost categories |
| `employerCost.completeness` | `complete_for_modelled_scope`, `partial` or `unavailable` |

Required label:

- German: **Geschätzte Arbeitgeber-Lohnkosten (berücksichtigte Bestandteile)**
- English: **Estimated employer payroll cost (modelled components)**

The output must not be labelled “total cost to employer” unless the calculation specification proves that all material employer costs for the scenario are included. Benefits entered for offer comparison are not added to employer payroll cost.

## 10. Effective rates

Every displayed rate includes a stable definition and visible denominator. Percentages use unrounded engine amounts before display formatting.

| Output ID | Numerator | Denominator | Label |
| --- | --- | --- | --- |
| `effectiveRates.employeeTaxRate` | Wage tax + solidarity surcharge + church tax | Corresponding supported gross cash | Effective payroll-tax rate |
| `effectiveRates.employeeSocialInsuranceRate` | Employee pension + unemployment + health + care contributions | Corresponding supported gross cash | Effective employee social-insurance rate |
| `effectiveRates.employeeDeductionRate` | Employee payroll taxes + employee social-insurance deductions | Corresponding supported gross cash | Effective payroll-deduction rate |
| `effectiveRates.netRate` | Corresponding estimated net | Corresponding supported gross cash | Estimated net rate |
| `effectiveRates.employerContributionRate` | Modelled employer contributions | Corresponding supported gross cash | Modelled employer-contribution rate |

Rules:

- Recurring and annual rates are separate when one-off compensation changes the annual result.
- A private-insurance “after premium” rate uses the after-premium numerator and says so explicitly.
- A rate is unavailable if its numerator or denominator is incomplete.
- Zero gross never produces a rate.
- Rates do not claim marginal tax rates or final income-tax rates.

## 11. Reconciliation requirements

### Employee view

For every complete supported period, the output provides a reconciliation ledger.

For the statutory path:

`gross cash − payroll taxes − employee social insurance = estimated payroll net`

For the private path, the ledger separately shows:

`gross cash − payroll taxes − payroll deductions + supported employer subsidy = payroll payout before private premiums`

and then:

`payroll payout before private premiums − external private health/care premiums = estimated amount after private premiums`

The later calculation specification may refine exact cash-flow placement, but it must preserve the distinction.

### Employer view

`gross cash compensation + modelled employer contributions = estimated employer payroll cost`

### Reconciliation behaviour

- UI totals come from the engine ledger, not independent frontend arithmetic.
- Statutory intermediate rounding follows the calculation specification.
- Public money values display to two decimal places.
- Displayed components and totals must reconcile at cent precision.
- If a calculation method requires a rounding adjustment, expose a named `roundingAdjustment` component rather than hiding a discrepancy.
- Negative deductions, employer contributions or net values require an explicitly supported rule and explanation; otherwise they are calculation errors.

## 12. Period and conversion rules

### Recurring monthly view

- Represents a standard supported month without a one-off payment.
- Uses guaranteed recurring cash for the conservative primary result.
- Variable recurring cash, if included in another view, remains labelled variable.

### Event-month view

- Appears for each month containing a supported one-off payment.
- Shows that month's gross, deductions and net.
- Does not redefine the normal recurring-month result.

### Annual view

- Is built from the supported calculation-period model and event months.
- Is not presented as a final tax-return calculation.
- Keeps recurring, variable and one-off components visible.
- May differ from recurring monthly value multiplied by 12.

### Average monthly view

- Equals the relevant annual total divided by 12.
- Uses “average monthly” in both German and English.
- Is never the default budget-safe result when it contains variable or one-off pay.

### Input period conversion

When the user switches monthly and annual salary entry:

- the represented annual base remains stable subject to decimal precision;
- the output shows both periods;
- the UI does not re-run its own formula outside the engine/shared period utility.

## 13. Conservative and total-compensation views

### Conservative recurring view

Includes:

- base salary;
- guaranteed recurring taxable cash;
- corresponding taxes and employee contributions;
- corresponding recurring net.

Excludes:

- variable recurring pay;
- one-off pay;
- user-valued benefits;
- employer-stated benefit values.

### Guaranteed annual view

Includes guaranteed recurring cash and guaranteed supported one-off cash. One-off amounts remain visibly separate.

### Total-compensation view

May include supported variable cash, but must show:

- guaranteed amount;
- variable amount;
- one-off amount;
- payroll net attributable to the supported calculation;
- user-valued benefits outside payroll totals.

The product must not describe the total-compensation view as a safe recurring budget.

## 14. Warnings and explanation outputs

Each warning contains:

- stable warning ID;
- severity: `information`, `caution` or `blocking`;
- affected field or output IDs;
- German and English message keys;
- explanation and action keys;
- whether the warning changes result completeness.

Required warning families include:

- estimate-not-payslip;
- not-final-income-tax;
- published-average statutory health rate used;
- private premium or subsidy supplied by user;
- variable compensation included;
- one-off compensation excluded from recurring month;
- average-month value includes non-recurring pay;
- employer cost excludes unmodelled categories;
- optional comparison information missing;
- unusual but valid input;
- assumption year differs from current year;
- source or assumption set superseded;
- partial or unavailable component;
- couple total is arithmetic only.

Warnings appear before detailed assumptions when they materially affect interpretation.

## 15. Incomplete, unsupported and error outputs

### Incomplete

Return:

- `status = incomplete`;
- missing or invalid input IDs;
- translated reason and corrective action;
- safe retained inputs;
- no normal net-pay summary.

### Unsupported

Return:

- `status = unsupported`;
- the scope rule or unsupported-path identifier;
- translated explanation;
- route back to supported inputs;
- no approximated normal result.

### Error

Return:

- `status = error`;
- a non-sensitive error/reference ID;
- retry or correction guidance;
- no stale values presented as current.

A prior valid result may remain locally recoverable, but the interface must clearly mark it as previous and not generated from the current inputs.

## 16. German and English core labels

| Output | German | English |
| --- | --- | --- |
| Gross salary | Bruttogehalt | Gross salary |
| Recurring gross | Laufendes Brutto | Recurring gross |
| Guaranteed compensation | Garantierte Vergütung | Guaranteed compensation |
| Variable compensation | Variable Vergütung | Variable compensation |
| One-off payments | Einmalzahlungen | One-off payments |
| Wage tax | Lohnsteuer | Wage tax |
| Solidarity surcharge | Solidaritätszuschlag | Solidarity surcharge |
| Church tax | Kirchensteuer | Church tax |
| Pension insurance | Rentenversicherung | Pension insurance |
| Unemployment insurance | Arbeitslosenversicherung | Unemployment insurance |
| Health insurance | Krankenversicherung | Health insurance |
| Long-term care insurance | Pflegeversicherung | Long-term care insurance |
| Total payroll taxes | Steuern gesamt | Total payroll taxes |
| Total employee social insurance | Sozialabgaben gesamt | Total employee social insurance |
| Total deductions | Abzüge gesamt | Total deductions |
| Estimated net pay | Geschätztes Nettogehalt | Estimated net pay |
| Average monthly net | Durchschnittliches monatliches Netto | Average monthly net |
| Employer contributions | Arbeitgeberbeiträge | Employer contributions |
| Estimated employer payroll cost | Geschätzte Arbeitgeber-Lohnkosten | Estimated employer payroll cost |
| Effective payroll-deduction rate | Effektive Abzugsquote | Effective payroll-deduction rate |
| Calculation assumptions | Berechnungsannahmen | Calculation assumptions |
| Not available | Nicht verfügbar | Not available |
| Not applicable | Nicht zutreffend | Not applicable |
| Estimated result | Geschätztes Ergebnis | Estimated result |

The translation catalogue may refine wording after language review, but must preserve these semantic distinctions.

## 17. Metadata, sources and reproducibility

Every supported result exposes or makes available:

| Metadata field | Requirement |
| --- | --- |
| `calculationYear` | Always visible in result summary |
| `currency` | EUR in v1 |
| `locale` | Active display locale |
| `calculatedAt` | Timestamp generated locally; not evidence of legal freshness |
| `scopeVersion` | Accepted employment-scope version |
| `inputContractVersion` | NP-PD-004-compatible schema version |
| `outputContractVersion` | This output schema version |
| `assumptionSetVersion` | Exact year-specific assumption package |
| `calculationEngineVersion` | Deterministic engine version |
| `sourceManifestVersion` | Exact source registry |
| `sourceEffectiveDates` | Relevant effective dates |
| `warningsApplied` | Stable warning IDs |
| `excludedComponents` | Unsupported or intentionally unmodelled components |

Official-source references must be reachable from the assumptions view without crowding the primary result.

## 18. Individual, alternative and couple outputs

### Individual result

The individual result is the canonical output described by this document.

### Salary or offer alternative

Each alternative is independently calculated through the same output schema. A comparison may derive deltas only from compatible complete outputs. NP-PD-006 defines the comparison dimensions and neutral presentation.

### Couple total

A simple couple view contains:

- the full result for person A;
- the full result for person B;
- combined recurring monthly gross;
- combined recurring monthly estimated net;
- combined guaranteed annual gross and net;
- combined total annual gross and net when both totals are available;
- combined modelled employer cost only when clearly useful and both results are compatible;
- a list of warnings inherited from either individual.

The combined amounts are arithmetic sums. They do not represent:

- joint income-tax assessment;
- tax-class optimisation;
- government benefits;
- parental-leave or pregnancy benefits;
- household disposable income;
- a recommendation about which partner should earn or work more.

If either individual result is incomplete or unsupported, the couple total is incomplete and the valid individual result remains visible.

## 19. Accessibility and presentation order

The default supported-result order is:

1. result state, calculation year and essential warnings;
2. recurring monthly estimated net;
3. recurring monthly gross and total deductions;
4. guaranteed and total annual views;
5. deduction breakdown;
6. private-insurance reconciliation when applicable;
7. employer contributions and qualified employer cost;
8. effective rates with definitions;
9. assumptions, versions, exclusions and sources.

Requirements:

- summary values have text labels, not colour-only meaning;
- deduction tables use semantic headers;
- every expandable section is keyboard operable;
- screen-reader order matches visual order;
- changes between scenarios use signed amounts and text, not only arrows or colour;
- charts are optional supplements and never the only presentation;
- mobile layouts retain labels, periods and warning context.

## 20. Engineering handoff

Implementation should create:

1. one typed result envelope;
2. stable component and warning identifiers;
3. a reconciliation ledger for statutory and private paths;
4. period-aware recurring, event-month, annual and average-month outputs;
5. explicit supported/incomplete/unsupported/error variants;
6. locale formatting outside the calculation engine;
7. a translation catalogue keyed by output identifiers;
8. source and version metadata attached to every supported result;
9. invariant tests for compensation, deductions, net, employer cost and rates;
10. accessibility tests for summary, breakdown, warnings and result-state changes.

The frontend must not calculate totals, rates or deltas from formatted strings.

## Acceptance check for NP-PD-005

- [x] Monthly and annual gross outputs are specified.
- [x] Recurring, variable and one-off compensation remain separate.
- [x] Wage tax, solidarity surcharge and church tax are specified.
- [x] Pension, unemployment, health and care deductions are specified.
- [x] Employee and employer contributions are separated.
- [x] Statutory and private-insurance net views are reconciled.
- [x] Monthly, annual and average-month net outputs are distinguished.
- [x] Employer payroll cost is defined and appropriately qualified.
- [x] Effective rates include explicit numerators and denominators.
- [x] Conservative and total-compensation views are defined.
- [x] Currency, rounding and period semantics are defined.
- [x] German and English core labels are included.
- [x] Warnings, incomplete, unsupported and error states are defined.
- [x] Source and version metadata is specified.
- [x] Individual and simple couple-total boundaries are explicit.
