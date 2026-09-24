# NP-PD-006 — Offer-comparison dimensions specification

**Status:** Proposed for review  
**Task:** NP-PD-006  
**Milestone:** M0 Plan  
**Depends on:** [NP-PD-002](NP-PD-002-primary-user-groups.md), [NP-PD-004](NP-PD-004-salary-calculator-inputs.md), [NP-PD-005](NP-PD-005-calculator-outputs.md)  
**Last updated:** 2026-09-24

## Purpose

This document defines how NettoPilot DE v1 compares exactly two supported German employment offers. It turns individually valid calculator results into a neutral, explainable comparison without declaring which job is objectively better.

The comparison helps a user answer concrete questions:

- How much recurring and annual net pay differs?
- How much compensation is guaranteed, variable or one-off?
- What is the effective compensation per contractual working hour?
- How do paid vacation, remote work and commuting affect the practical picture?
- Which monetary benefits are employer-stated, user-valued or not valued?
- Which values are missing, uncertain or not comparable?
- What salary or bonus would make selected financial measures equal?

The comparison is educational decision support, not tax, legal, financial or career advice.

## 1. Product principles

1. **Calculate first, compare second.** Each offer must produce a supported individual result under NP-PD-003 through NP-PD-005 before payroll-derived values are compared.
2. **Keep different kinds of value separate.** Cash pay, employer contributions, benefits, time and commute context are never collapsed into one unexplained score.
3. **Lead with reliable measures.** Recurring net and guaranteed annual compensation appear before variable, one-off and user-valued amounts.
4. **Make the basis visible.** Every amount states its period, view, calculation year and inclusion rules.
5. **Unknown is not zero.** Missing values remain unknown or not comparable.
6. **Show direction, not judgment.** The product may say “Offer B is EUR 220 higher per month”; it must not say “Offer B is better.”
7. **Avoid false precision.** Estimated costs, variable pay and user-valued benefits are labelled and never presented as guaranteed cash.
8. **Preserve user agency.** Users may choose which dimensions matter, but the product does not infer preferences.
9. **Use accessible, bilingual explanations.** German payroll terms accompany plain German and English labels.

## 2. Comparison admission rules

A normal comparison result requires:

- exactly two offers, labelled Offer A and Offer B;
- a supported individual result for both offers;
- the same calculation year;
- compatible scope, input-contract, assumption-set and calculation-engine versions;
- the same currency, EUR;
- an explicit comparison view;
- no unresolved blocking payroll inputs.

If either individual result is incomplete, unsupported or erroneous, the product keeps both offers visible but does not calculate payroll-derived deltas that would imply comparability. It names the blocking offer and reason.

Comparison-only fields may be missing. Their affected dimensions become unavailable while independent dimensions remain comparable.

## 3. Canonical comparison model

```ts
type OfferComparison = {
  comparisonId: string
  offerA: OfferComparisonSide
  offerB: OfferComparisonSide
  selectedView: 'recurring' | 'guaranteed_annual' | 'total_compensation'
  dimensions: ComparisonDimension[]
  breakEven: BreakEvenResult[]
  warnings: ComparisonWarning[]
  metadata: ComparisonMetadata
}

type ComparisonDimension = {
  id: string
  status: 'comparable' | 'estimated' | 'missing' | 'not_comparable' | 'not_applicable'
  offerAValue: number | string | null
  offerBValue: number | string | null
  absoluteDifference: number | null
  percentageDifference: number | null
  direction: 'offer_a_higher' | 'offer_b_higher' | 'equal' | 'neutral' | null
  unit: 'EUR' | 'EUR_per_hour' | 'hours' | 'days' | 'km' | 'minutes' | 'percent' | 'text'
  period: 'month' | 'year' | 'working_week' | 'commute_day' | null
  basis: string
  warningIds: string[]
}
```

Offer labels are presentation labels only. Swapping A and B must invert directional deltas without changing either offer’s underlying result.

## 4. Difference rules

For numeric dimension `x`:

`absoluteDifference = offerBValue - offerAValue`

When Offer A is a valid non-zero reference:

`percentageDifference = absoluteDifference / abs(offerAValue)`

Rules:

- the UI states that percentage difference uses Offer A as the reference;
- users may swap offers to change the reference;
- percentage difference is unavailable when Offer A is zero, missing or non-comparable;
- money differences are calculated from unrounded canonical values and formatted only for display;
- displayed components reconcile with NP-PD-005 rounding rules;
- text, category and boolean dimensions do not receive artificial percentage differences;
- equality uses the engine’s canonical precision, not formatted text.

## 5. Supported-dimensions matrix

| Dimension | Canonical measure | Required inputs | Status when missing | Included in views |
| --- | --- | --- | --- | --- |
| Recurring gross pay | Regular gross per month and year | Valid offer results | Comparison blocked if payroll result unavailable | Recurring, guaranteed |
| Recurring net pay | Estimated recurring net per month and year | Valid offer results | Comparison blocked if payroll result unavailable | Recurring, guaranteed |
| Guaranteed annual cash | Base plus guaranteed supported cash | Guarantee classifications | Missing classification makes affected cash unavailable | Guaranteed, total |
| Variable annual cash | Expected variable taxable cash | Amount and variable classification | Unknown, never zero | Total only |
| One-off cash | Supported one-off taxable payments by event and annual total | Amount, month, classification, certainty | Excluded with named reason | Guaranteed or total by certainty |
| Total annual gross | All included taxable gross for selected view | Valid offer result | Unavailable if affected component unsupported | All, view-specific |
| Total annual net | NP-PD-005 annual net for selected view | Valid offer result | Unavailable if result cannot be calculated | All, view-specific |
| Employee deductions | Tax and social-insurance totals | Valid offer result | Unavailable with payroll result | All |
| Employer contributions | Modelled employer SI and private-health subsidy | Valid offer result | Unknown components remain unknown | Total/context |
| Employer payroll cost | Qualified modelled employer cost | Valid offer result | Unavailable if material component missing | Context only |
| Contractual weekly hours | Hours per week | Weekly hours for both offers | Not comparable | Time |
| Annual contractual hours | Standardised working-time denominator | Weekly hours, vacation days, common calendar convention | Estimated or not comparable | Time |
| Effective net per hour | Selected annual net / annual contractual hours | Comparable annual net and hours | Not comparable | Time |
| Effective gross per hour | Selected annual gross / annual contractual hours | Comparable gross and hours | Not comparable | Time |
| Vacation days | Paid annual days | Vacation days for both offers | Not comparable | Time |
| Remote arrangement | Typical remote days and arrangement label | Remote inputs for both offers | Descriptive only or missing | Work pattern |
| Commute distance | Typical one-way and annual distance | Distance and office days | Not comparable | Commute |
| Commute time | Typical one-way and annual time | User-entered time and office days | Not comparable | Commute |
| Commute cost | User-entered or explicitly estimated annual cost | Cost inputs and estimation basis | Estimated or missing | Context; optional adjusted view |
| Employer pension | Employer monetary contribution | Annual contribution or explicit unknown | Missing; never inferred | Guaranteed or conditional benefit |
| Monetary benefits | Employer-stated and user-valued annual amounts | Benefit entries | Item remains unvalued | Total/context |
| Health-insurance path | Statutory/private and payroll effects | Valid offer results | Comparison blocked if payroll treatment unsupported | Payroll/context |
| Break-even base salary | Salary needed to match selected measure | Valid target and recalculation engine | Unavailable if no supported solution | Analysis |
| Break-even bonus | Bonus needed to match selected measure | Valid target and supported bonus classification | Unavailable if no supported solution | Analysis |

## 6. Compensation views

### 6.1 Recurring view

The budgeting-first view includes:

- recurring base salary;
- guaranteed recurring taxable cash;
- recurring payroll deductions;
- recurring monthly and annualised net pay.

It excludes variable compensation, one-off payments and non-cash benefits. An annualised recurring value is labelled as an annual equivalent, not a prediction of the exact calendar-year payout.

### 6.2 Guaranteed annual view

This view includes recurring compensation plus supported guaranteed one-off payments. It excludes variable and conditional amounts. Each one-off payment remains visible so an annual total does not imply equal monthly availability.

### 6.3 Total-compensation view

This view may include:

- guaranteed cash;
- expected variable cash;
- supported one-off cash;
- employer pension contributions;
- employer-stated monetary benefits;
- separately identified user-valued benefits.

The UI must show subtotals for guaranteed cash, variable cash, employer contributions, employer-stated benefits and user-valued benefits. It must not present their sum as guaranteed net income.

## 7. Salary, bonus and one-off comparisons

Each offer shows:

- monthly and annual base gross;
- recurring additional cash by guarantee class;
- variable compensation amount and period;
- one-off payments by label, month, classification and certainty;
- gross and estimated net totals for each supported view;
- absolute and percentage deltas.

Annual bonus comparisons must distinguish target, maximum and expected amounts when those concepts are provided. V1 compares an explicitly entered expected amount; it does not infer achievement probability from target or maximum.

A signing bonus or other non-recurring payment is not blended into recurring monthly net. The interface may show its annual effect and event-month effect.

## 8. Employee deductions and health insurance

The comparison may show differences in:

- wage tax;
- solidarity surcharge;
- church tax;
- employee pension contribution;
- employee unemployment contribution;
- employee health-insurance contribution;
- employee care-insurance contribution.

For statutory health insurance, the comparison names the additional contribution rate and whether it is insurer-specific or the published average.

For private health insurance, it separately shows:

- payroll payout before private premiums;
- employee-paid health and care premiums outside payroll;
- employer private-insurance subsidy;
- estimated after-premium amount.

A statutory/private difference is descriptive. The product must not recommend switching insurance systems or assume that premiums, coverage or future costs are equivalent.

## 9. Employer contributions and pension

Employer social-insurance contributions and employer total payroll cost follow NP-PD-005 and remain separate from employee net pay.

Employer pension entries record:

- employer contribution amount;
- period;
- guaranteed or conditional status;
- vesting or eligibility note when known;
- source type: offer document, employer statement or user estimate.

The product does not convert a pension contribution into present-day cash or predict investment returns. An unknown contribution stays unknown.

## 10. Working time and effective hourly compensation

When both offers provide contractual weekly hours and annual paid vacation days, the product may calculate a standardised annual contractual-hours estimate:

`annualContractualHours = weeklyHours × (calendarWeeks - vacationDays / standardWorkingDaysPerWeek)`

The comparison metadata must expose `calendarWeeks` and `standardWorkingDaysPerWeek`. Public holidays, sickness, overtime, unpaid leave and actual worked hours are excluded unless a later approved specification adds them.

For selected annual view:

`effectiveGrossPerHour = annualGross / annualContractualHours`

`effectiveNetPerHour = annualNet / annualContractualHours`

These are standardised comparison estimates, not payslip rates. If working days per week are not known, the product uses a visible common convention for both offers or marks the measure unavailable; it must not silently apply different conventions.

Overtime expectations may be shown as unvalued context in v1 but are not monetised without explicit supported hours and treatment.

## 11. Vacation comparison

The core dimension is contractual paid vacation days per year. It shows the day difference and feeds the standardised annual-hours estimate.

Rules:

- public holidays are not added to contractual vacation;
- half-days may be represented as decimals;
- unlimited vacation is descriptive and not converted to a number without a user-entered planning value;
- carry-over, purchase and sabbatical rules are explanatory notes, not core v1 calculations.

## 12. Remote, hybrid and office arrangements

Each offer may record:

- arrangement: remote, hybrid, office or flexible/unknown;
- typical remote days per working week;
- expected office days per working week;
- required office location;
- user-entered explanatory note.

The product compares arrangement and days directly. It does not assign a universal monetary value to remote work.

If typical office days are derived as `workingDaysPerWeek - remoteDaysPerWeek`, both inputs and the convention must be shown. Flexible or irregular requirements remain descriptive when a stable number is unavailable.

## 13. Commute time, distance and cost

Commute inputs are comparison-only and never alter payroll tax or social-insurance results.

Supported measures:

- one-way distance in kilometres;
- one-way time in minutes;
- typical office days per week;
- user-entered transport cost per month or year;
- optional calculated annual distance and time using a visible common working-week convention.

Calculations:

`annualCommuteDays = officeDaysPerWeek × effectiveWorkingWeeks`

`annualCommuteDistance = oneWayKm × 2 × annualCommuteDays`

`annualCommuteTimeHours = oneWayMinutes × 2 × annualCommuteDays / 60`

The product may show `netAfterEnteredCommuteCost = selectedAnnualNet - enteredAnnualCommuteCost` as an optional adjusted context measure. It must label the result as user-adjusted, keep the original net visible and avoid inventing fuel, depreciation, ticket, parking, home-office or tax-deduction amounts.

## 14. Benefits and monetary value

Benefit entries use the input contract from NP-PD-004 and add a comparison category such as pension, mobility, meal, learning, health, childcare or other.

For each benefit, show separately:

- employer-stated annual value;
- user-assigned annual value;
- guaranteed, conditional or unknown certainty;
- eligibility or vesting note when supplied;
- whether tax treatment is included in payroll calculation.

Rules:

- no value is inferred from a label;
- employer-stated and user-assigned values are never added together for the same item;
- unvalued benefits remain visible;
- taxable benefits not supported by the payroll engine are excluded from net calculations and warned;
- benefits are not used to produce a hidden ranking.

## 15. Break-even calculations

### 15.1 Break-even base salary

The user selects:

- the offer to adjust;
- the target measure: recurring monthly net, guaranteed annual net, selected annual net or effective net per hour;
- which non-salary inputs remain fixed.

The engine searches for the gross base salary at which the adjustable offer matches the other offer’s canonical target value. It must recalculate tax and social insurance at every candidate salary; it may not apply a flat gross-to-net ratio.

### 15.2 Break-even bonus

The engine searches for an additional supported bonus amount required to match a selected annual measure. The result states the assumed payment classification, month, guarantee view and tax treatment.

### 15.3 Break-even result contract

A result includes:

- target dimension and value;
- adjusted offer and field;
- required gross salary or bonus;
- resulting matched value and residual difference;
- search range, tolerance and engine version;
- warnings and excluded dimensions.

Return unavailable when the target is unsupported, inputs are incompatible, no solution exists inside the validated product range, the function is not safely solvable under the supported model, or effective-hour inputs are missing. Never extrapolate beyond the validated input range.

## 16. Missing, uncertain and non-comparable values

| State | Meaning | UI behaviour |
| --- | --- | --- |
| Comparable | Both values share a valid definition and basis | Show values and deltas |
| Estimated | Both can be compared but at least one uses a disclosed estimate | Show values, delta and estimate badge |
| Missing | A required comparison-only value was not provided | Show which offer and input is missing; no delta |
| Not comparable | Values use incompatible definitions, periods or versions | Explain the mismatch; no delta |
| Not applicable | The dimension does not apply to an offer | Show “Not applicable”; never zero |

Material uncertainties must remain attached to affected dimensions. A total-compensation total becomes partial when any included material component is unknown; it is not presented as complete.

## 17. Neutral summary contract

The summary may state factual differences such as:

- “Offer B provides EUR 220 more estimated recurring net per month.”
- “Offer A includes 5 more paid vacation days.”
- “Effective net per contractual hour is unavailable because Offer B has no weekly-hours value.”
- “Offer B’s total-compensation view includes EUR 8,000 of variable pay.”

It must not state or imply:

- “best offer,” “winner,” “recommended” or an overall score;
- that higher employer cost means greater employee value;
- that a user-valued benefit is cash or guaranteed;
- that statutory or private health insurance is preferable;
- career, immigration, family or lifestyle conclusions not supplied by the user.

The default ordering is recurring net, guaranteed annual cash, uncertainty, working time, vacation, commute, benefits and employer context.

## 18. German and English labels

| Identifier | German | English |
| --- | --- | --- |
| `comparison.title` | Angebote vergleichen | Compare offers |
| `offer.a` | Angebot A | Offer A |
| `offer.b` | Angebot B | Offer B |
| `view.recurring` | Wiederkehrend | Recurring |
| `view.guaranteedAnnual` | Garantiert pro Jahr | Guaranteed annual |
| `view.totalCompensation` | Gesamtvergütung | Total compensation |
| `pay.recurringNetMonthly` | Geschätztes monatliches Netto | Estimated monthly net |
| `pay.annualNet` | Geschätztes jährliches Netto | Estimated annual net |
| `pay.guaranteedCash` | Garantierte Barvergütung | Guaranteed cash compensation |
| `pay.variableCash` | Variable Vergütung | Variable compensation |
| `time.weeklyHours` | Vertragliche Wochenstunden | Contractual weekly hours |
| `time.effectiveNetHourly` | Geschätztes Netto je Vertragsstunde | Estimated net per contractual hour |
| `time.vacationDays` | Bezahlte Urlaubstage | Paid vacation days |
| `work.remoteDays` | Homeoffice-Tage pro Woche | Remote days per week |
| `commute.annualTime` | Geschätzte Pendelzeit pro Jahr | Estimated annual commute time |
| `commute.enteredCost` | Angegebene Pendelkosten | Entered commute cost |
| `benefit.employerPension` | Arbeitgeberbeitrag zur Altersvorsorge | Employer pension contribution |
| `difference.absolute` | Absoluter Unterschied | Absolute difference |
| `difference.percentVsA` | Prozentualer Unterschied zu Angebot A | Percentage difference versus Offer A |
| `state.missing` | Angabe fehlt | Missing value |
| `state.notComparable` | Nicht vergleichbar | Not comparable |
| `state.estimated` | Geschätzt | Estimated |
| `breakEven.salary` | Gleichwertiges Grundgehalt | Break-even base salary |
| `breakEven.bonus` | Gleichwertiger Bonus | Break-even bonus |

Translations must preserve the qualified words “estimated,” “modelled,” “user-assigned,” “employer-stated,” “guaranteed” and “variable.”

## 19. Warnings

Stable warning identifiers should include:

- `comparison.partial_total`;
- `comparison.variable_pay_included`;
- `comparison.one_off_included`;
- `comparison.user_valued_benefit`;
- `comparison.employer_stated_value`;
- `comparison.commute_estimate`;
- `comparison.hours_convention`;
- `comparison.private_health_not_equivalent`;
- `comparison.incompatible_year`;
- `comparison.incompatible_version`;
- `comparison.missing_dimension`;
- `comparison.unsupported_component`;
- `comparison.break_even_unavailable`.

Warnings are attached to affected cards and repeated in an accessible summary. Colour alone cannot communicate state.

## 20. Metadata and reproducibility

Every comparison stores or displays:

- comparison-contract version;
- scope, input-contract and output-contract versions;
- calculation year;
- assumption-set and calculation-engine versions for both offers;
- canonical inputs or stable scenario references;
- selected comparison view;
- working-time and commute conventions;
- value-source type for benefits and commute costs;
- rounding and currency rules;
- generated-at timestamp;
- warnings and unavailable dimensions.

Analytics must not receive salaries, benefits, commute values, scenario labels or other raw comparison content.

## 21. Accessibility and presentation

- Present a concise summary followed by a dimension table and expandable detail.
- Do not rely on left/right position or colour; always name Offer A and Offer B.
- Each delta announces its direction, amount, unit, period and basis.
- Tables retain row headers on mobile or transform into equally labelled cards.
- View changes and recalculated break-even results are announced to assistive technology.
- Users can swap offers without re-entering data.
- Keyboard and screen-reader users can reach every explanation and warning.
- German payroll terms appear alongside plain-language explanations where helpful.

## 22. Explicitly deferred

V1 does not provide:

- an overall offer score, winner or personalised recommendation;
- automatic cost-of-living comparison between cities or countries;
- cross-border currency or payroll comparison;
- subjective culture, manager, promotion or job-security scoring;
- commute routing, live fares, fuel-price or vehicle-depreciation estimates;
- tax-return deductions for commuting or home office;
- pension present-value or investment-return forecasts;
- probability models for bonuses or equity;
- stock-option, RSU or complex equity valuation;
- government-benefit interactions;
- more than two offers at once;
- negotiation scripts generated from personal salary data.

## 23. Engineering handoff

Implementation should create:

1. a typed two-offer comparison schema;
2. a dimension registry with requirements, units, periods and view membership;
3. pure delta and status functions operating on canonical values;
4. comparison admission and compatibility validation;
5. standardised hours and commute functions with explicit conventions;
6. a benefit-value model that separates employer-stated and user-assigned values;
7. a recalculation-based break-even solver with bounded ranges and tolerances;
8. stable warning and explanation identifiers;
9. German and English translation keys;
10. invariant, swap-symmetry, missing-value, accessibility and formatting tests.

The frontend must not calculate deltas or break-even values from formatted strings. Payroll-derived figures must come from NP-PD-005 result objects.

## Acceptance check for NP-PD-006

- [x] Exactly two compatible supported offers are required for a normal comparison.
- [x] Monthly and annual gross and net measures are defined.
- [x] Guaranteed, variable and one-off compensation remain separate.
- [x] Employer pension and monetary-benefit values are classified by source and certainty.
- [x] Contractual hours and effective hourly compensation are defined with visible conventions.
- [x] Vacation, remote-work and commute dimensions are defined.
- [x] Statutory and private health-insurance effects remain qualified and separate.
- [x] Employer contributions and modelled employer cost are contextual, not employee net.
- [x] Recurring, guaranteed-annual and total-compensation views are defined.
- [x] Absolute and percentage-difference rules are explicit.
- [x] Break-even salary and bonus calculations require full engine recalculation.
- [x] Missing, estimated, not-comparable and not-applicable states never become zero.
- [x] German and English core labels are included.
- [x] Neutral-summary rules prohibit an objective “best offer” claim.
- [x] Metadata, privacy, accessibility and engineering requirements are included.
