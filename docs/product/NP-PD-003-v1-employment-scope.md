# NP-PD-003 — Version-one employment scope

**Status:** Accepted  
**Task:** NP-PD-003  
**Milestone:** M0 Plan  
**Depends on:** NP-PD-001  
**Last updated:** 2026-09-24  
**Follow-on:** [NP-PD-004 — Salary calculator input specification](NP-PD-004-salary-calculator-inputs.md)

## Purpose

This document defines the employment situations NettoPilot DE may calculate and compare in its first public version.

It is a product-scope contract, not a tax-law specification. Exact inputs, rule values, official sources and formulas are defined in later product, research and calculation tasks.

The calculator must never silently force an unsupported situation into the supported model. A scenario is either:

- **Supported** — the public v1 intends to calculate it;
- **Conditionally supported** — it is calculated only when the stated conditions are satisfied;
- **Deferred** — the public v1 must not calculate it as though it were supported;
- **Informational only** — it may be shown in a comparison but does not affect the payroll calculation.

## v1 scope statement

NettoPilot DE v1 supports an individual who has one regular salaried employment relationship whose payroll is calculated entirely under the supported German wage-tax and social-insurance assumptions for a selected calculation year.

The core calculation covers:

- regular full-time or standard part-time employment;
- one primary employment relationship;
- gross salary entered as a monthly or annual amount;
- the tax-class values supported by the official payroll specification for the selected calculation year;
- federal-state and church-tax inputs required by the supported rule set;
- statutory or private health-insurance input paths;
- supported children and care-insurance inputs;
- regular cash compensation;
- supported taxable bonuses and one-off cash payments;
- a current salary and alternative salary scenario;
- comparison of two employment offers;
- two independent individual calculations that may be added into a simple household total.

The public v1 calculates payroll estimates. It does not calculate a final income-tax return, determine legal entitlement, model every employer-specific payroll item or provide personalised tax, legal, insurance or financial advice.

## Scope invariants

A scenario is within scope only when all of these conditions are true:

1. The employment is salaried employment, not self-employment or freelance business income.
2. German payroll rules are sufficient for the calculation; no foreign payroll or cross-border allocation is required.
3. The person has one employment relationship in the scenario.
4. The employment type is regular full-time or standard part-time employment.
5. Compensation can be represented using supported cash salary and supported one-off payment inputs.
6. The user's tax, state, church-tax, health-insurance and care-insurance selections exist in the versioned assumption set for the selected year.
7. No deferred special case is required to produce a materially reliable result.

If any invariant fails, the interface must identify the unsupported condition and withhold or clearly limit the result. It must not substitute a convenient default that implies full support.

## Supported-case matrix

| Area | v1 status | v1 decision | Required product behaviour |
| --- | --- | --- | --- |
| Regular salaried employee in Germany | Supported | Core audience and calculation case | Allow calculation when all other scope conditions pass |
| Monthly gross salary | Supported | Core salary entry mode | Convert through the documented period rules |
| Annual gross salary | Supported | Core salary entry mode | Derive the supported payroll-period amount transparently |
| Full-time employment | Supported | Standard employee case | Calculate using the entered weekly hours for comparison metrics |
| Standard part-time employment | Supported | Same payroll model with lower hours or salary | Do not treat part-time status as a separate tax rule unless later research requires it |
| One primary employment relationship | Supported | One employment per individual scenario | Reject or defer additional simultaneous jobs |
| Calculation year | Supported | Every result belongs to a versioned year | Display the year and load only that year's assumption set |
| Tax class | Conditionally supported | Support the values present in the validated official payroll specification for the selected year | NP-PD-004 defines the UI values; research tasks validate year-specific availability |
| Federal state | Supported | Needed for supported state-sensitive rules and labels | Require a state when the selected calculation path needs it |
| Church-tax status | Supported | User declares whether the supported church-tax path applies | Show the assumption and state-dependent treatment |
| Statutory health insurance | Supported | Standard statutory-insurance input path | Collect the required contribution inputs and show the active assumption |
| Private health insurance | Conditionally supported | User-supplied contribution path within statutory payroll limits and rules | Do not infer an unknown private premium; exact fields are defined later |
| Children/care-insurance inputs | Conditionally supported | Collect only inputs required by the validated social-insurance rule set | Explain why the input is needed and allow only supported values |
| Regular cash salary | Supported | Core taxable compensation | Include in monthly and annual views |
| Regular taxable bonus | Conditionally supported | Supported when representable by the validated payroll rule set | Keep it separate from guaranteed base salary |
| One-off taxable cash payment | Conditionally supported | Supported when representable by the validated payroll rule set | Label the payment period and keep it out of recurring monthly income |
| Salary increase scenario | Supported | Recalculate the same person under an alternative salary | Show net change and changed assumptions |
| Alternative working-hours scenario | Supported for comparison | Payroll uses supported salary inputs; hours affect comparison metrics | Do not imply that hours directly change payroll unless salary also changes |
| Two-offer comparison | Supported | Compare two independently calculated supported scenarios | Use consistent year and compatible assumptions |
| Vacation days | Informational only | Offer-comparison dimension | Do not alter payroll; show separately |
| Commute and remote work | Informational only | Offer-comparison context | Do not invent tax savings or monetary value |
| User-valued benefits | Informational only | Optional comparison value, separate from payroll | Never present user value as cash salary or guaranteed net pay |
| Couple household total | Conditionally supported | Sum two supported individual estimates | Keep individual results visible and state that the total is not joint-tax or benefit modelling |

## Calculation-period boundaries

### Supported

- A regular monthly estimate based on supported payroll inputs.
- An annual view derived through documented, versioned calculation-period rules.
- Monthly and annual comparison using the same calculation year.
- Supported one-off payment scenarios with their period clearly labelled.

### Not implied by the annual view

An annual display must not be described as:

- a final annual income-tax liability;
- a tax-return refund or payment estimate;
- a complete partial-year employment calculation;
- a household filing calculation;
- a guarantee that every actual payslip will match.

Partial-year employment, job changes during a tax year and irregular payroll histories require explicit later support before the product may claim to model them.

## Offer-comparison boundaries

The v1 compares two offers only when each offer independently passes the employment-scope checks.

### Payroll-affecting fields

Only fields connected to the validated calculation engine may affect estimated net pay.

### Comparison-only fields

Working hours, vacation, commute, remote work, employer pension descriptions and non-cash benefits may be displayed as separate comparison dimensions. They must not modify tax or social-insurance results unless a later specification defines a validated payroll treatment.

### No subjective recommendation

The product may explain measurable differences but must not claim that one employer or offer is universally better. It may show:

- higher supported estimated net income;
- more guaranteed compensation;
- higher effective compensation per working hour;
- more vacation;
- user-entered benefit values;
- missing or incomparable information.

It must show the basis for each comparison.

## Couple-scenario boundaries

The public v1 may calculate two supported individual employee scenarios and show:

- each person's monthly and annual estimate;
- the arithmetic sum of those estimates;
- the difference between two household scenarios;
- guaranteed and variable compensation separately.

The combined total is not:

- a complete joint tax-return calculation;
- a recommendation of tax-class selection;
- a government-benefit calculation;
- a parental-leave or pregnancy-benefit calculation;
- a model of every household allowance, deduction or filing consequence.

The interface must retain both individual results so users can see which person and assumption caused a household difference.

## Explicitly deferred from v1

### Employment and income types

- Self-employment and freelancing
- Multiple simultaneous jobs
- Mini-jobs
- Midijobs
- Working-student employment
- Short-time work
- Severance calculations
- Stock options, restricted stock, virtual shares and other complex equity compensation
- Company-car taxation

### Geography and taxation

- Cross-border employment or taxation
- Foreign payroll
- Split residency or income allocation between countries
- Complete annual income-tax returns
- Complete joint tax-return modelling

### Benefits and household programmes

- Detailed government-benefit interactions
- Parental-leave and pregnancy-benefit calculations
- Means-tested benefit eligibility
- Household budgeting or affordability advice

### Documents and AI

- Payslip upload
- OCR or field extraction
- AI-generated payroll interpretation
- AI reconciliation of a payslip against the estimate

These features require separate scope, privacy, legal, research and validation work before implementation.

## Unsupported-case behaviour

The interface must detect scope boundaries as early as practical.

For a deferred case, it should:

1. state that the situation is not supported in v1;
2. name the specific unsupported condition;
3. avoid showing a normal result that could be mistaken for a validated estimate;
4. preserve safe, non-sensitive inputs locally when practical so the user can revise the scenario;
5. offer a route back to the supported flow;
6. avoid directing the user to a commercial provider as though it were an endorsement;
7. recommend official information or a qualified professional only when the situation requires it.

### Example messages

- “NettoPilot DE v1 supports one salaried employment relationship per person. Multiple simultaneous jobs are not yet calculated.”
- “This scenario requires cross-border tax treatment, which is outside the current calculator scope.”
- “Working-student rules are not included in the current calculation model.”
- “The household total adds two individual estimates; it is not a joint tax-return calculation.”

Final interface copy will be written and translated in later UX and language tasks.

## Unknown and missing inputs

An unknown input is not automatically an unsupported case.

The input specification must classify each field as:

- required to calculate;
- optional with a transparent default;
- optional and omitted from the calculation;
- required only for a specific supported path.

If a required input is unknown, the product must either:

- pause calculation and explain how to find it; or
- provide an explicitly labelled range or provisional result only when the calculation specification validates that behaviour.

Hidden defaults must not be used for inputs that can materially change the result.

## Scope versioning

Every calculation result must be reproducible from:

- a scope version;
- a calculation year;
- an assumption-set version;
- the user's supported inputs;
- the calculation-engine version.

A later release may expand support without changing what an earlier v1 result claimed to cover.

Adding a new employment type is a scope change, not merely a new form field. It requires:

1. an approved scope update;
2. authoritative rule research;
3. input and output specification changes;
4. deterministic implementation;
5. reference cases and tests;
6. translated explanations;
7. privacy, accessibility and trust review.

## v1 admission checklist

The product may present a normal supported result only when it can answer “yes” to all applicable checks:

- Is this salaried employment?
- Is the calculation entirely within the supported German payroll model?
- Is there only one employment relationship for this individual scenario?
- Is the employment regular full-time or standard part-time?
- Is the calculation year supported?
- Are the required tax, state and church-tax selections supported for that year?
- Is the selected health-insurance path supported and sufficiently specified?
- Are required children/care-insurance inputs available?
- Can every cash payment be represented by a supported salary or one-off-payment field?
- Are deferred cases absent?
- For comparison, do both scenarios pass independently?
- For a couple total, do both individuals pass independently?

## Handoff to NP-PD-004

NP-PD-004 must turn this scope into an input specification that defines:

- required and optional fields;
- valid values and ranges;
- units and periods;
- defaults and unknown states;
- conditional visibility;
- tax and social-insurance relevance;
- validation errors;
- unsupported-case triggers;
- source and assumption-version requirements.

NP-PD-004 must not introduce a new employment case without updating this scope contract.

## Acceptance check for NP-PD-003

- [x] The supported v1 employment situation is stated.
- [x] Monthly and annual gross salary modes are addressed.
- [x] Full-time and standard part-time employment are addressed.
- [x] One primary employment relationship is enforced.
- [x] Tax class, state, church tax, health insurance and care-insurance paths are bounded.
- [x] Bonuses and one-off payments are bounded.
- [x] Salary alternatives and two-offer comparison are bounded.
- [x] Simple couple totals are distinguished from joint-tax modelling.
- [x] Every requested deferred case is listed.
- [x] Unsupported-case behaviour is defined.
- [x] A supported-case matrix and admission checklist are included.
- [x] The handoff to NP-PD-004 is explicit.
