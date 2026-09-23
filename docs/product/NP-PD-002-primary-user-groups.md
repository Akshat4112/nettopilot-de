# NP-PD-002 — Primary user groups and needs

**Status:** Proposed for review  
**Task:** NP-PD-002  
**Milestone:** M0 Plan  
**Depends on:** NP-PD-001  
**Last updated:** 2026-09-23

## Purpose

This document defines the primary user groups NettoPilot DE must serve and translates their questions into product requirements.

The groups are decision contexts, not fixed demographic personas. One person may belong to several groups at the same time—for example, a newcomer may also be a student entering full-time work, comparing two offers, and managing a tight monthly budget.

The public-service purpose and product principles are defined in [NP-PD-001](NP-PD-001-public-service-purpose.md).

## Prioritisation

### Primary v1 groups

1. Employees checking a current or future salary
2. Job seekers comparing employment offers
3. Newcomers learning the German payroll system
4. Students and graduates entering full-time employment
5. Couples comparing household-income scenarios
6. Workers with limited financial flexibility

### Shared jobs to be done

Across these groups, NettoPilot DE should help users:

- estimate monthly and annual take-home pay;
- understand the main difference between gross and net compensation;
- compare two employment offers using consistent assumptions;
- separate guaranteed pay from variable or subjective compensation;
- understand which inputs materially affect the result;
- identify missing information to clarify with an employer or payroll team;
- recognise when the calculator does not support their situation;
- use the core service without creating an account or disclosing salary data to a backend.

## Shared input model

The following input categories recur across the primary groups. This is a user-needs inventory, not the final calculation schema.

### Salary and employment

- gross salary and payment frequency;
- number of salary payments where relevant;
- regular bonuses and one-off payments;
- weekly working hours;
- vacation allowance;
- start date or comparison period where relevant;
- monetary and non-monetary benefits;
- whether compensation is guaranteed, conditional or user-valued.

### Payroll assumptions

- calculation year;
- tax class or other supported withholding inputs;
- federal state;
- church-tax status where applicable;
- statutory or private health-insurance situation;
- supported child or care-insurance inputs where applicable;
- any supported exemptions or special employment settings.

Exact fields and authoritative sources are defined by later scope, research and calculation-specification tasks.

### Comparison preferences

- offers to compare;
- which benefits the user wants to value;
- whether variable compensation should be included in the main result;
- preferred monthly, annual and hourly views;
- German or English interface.

## Shared output model

All primary groups need:

- estimated monthly and annual net income;
- a clear deduction breakdown;
- the calculation year and active assumptions;
- warnings for missing, uncertain or unsupported inputs;
- a separation between guaranteed, variable and user-valued compensation;
- plain-language explanations of unfamiliar terms;
- a concise limitations statement;
- a shareable or repeatable comparison that does not expose sensitive data by default.

Offer-comparison users additionally need:

- side-by-side results;
- annual and monthly differences;
- effective compensation per working hour;
- working-hours and vacation context;
- a list of material differences;
- unanswered questions to clarify before accepting an offer.

## Group 1 — Employees checking a current or future salary

### Context

An employed person wants to understand an existing salary, a planned raise, a change in working hours, or the likely impact of a bonus.

### Main questions and decisions

- What could my monthly and annual net income be?
- Why is the estimated net amount different from gross salary?
- What is the approximate net effect of a raise?
- How could a bonus affect the relevant pay period and annual result?
- Does reducing or increasing weekly hours improve my effective hourly compensation?
- Which payroll details should I verify if the estimate differs from a payslip?

### Required inputs

- current or proposed gross salary;
- payment frequency and supported one-off payments;
- supported payroll assumptions;
- weekly working hours;
- current and alternative scenario values.

### Expected outputs and explanations

- current-scenario estimate;
- alternative-scenario estimate;
- net change in euros and percentage terms;
- monthly, annual and effective-hourly views;
- explanation of the largest changed components;
- warning that an estimate is not an official payroll statement.

### Common misunderstandings to address

- A gross increase does not translate one-for-one into net income.
- A one-off payment should not be presented as regular monthly income.
- A calculator estimate may differ from an actual payslip because of unsupported or employer-specific details.
- Effective hourly compensation and monthly take-home pay answer different questions.

### Accessibility and language needs

- familiar monthly view first, with annual details available;
- plain-language labels with optional payroll terminology;
- side-by-side differences that do not rely on colour alone;
- keyboard-accessible scenario editing;
- German and English explanations.

### Representative scenario

An employee compares an existing salary with a proposed raise and wants to know the estimated monthly improvement, the annual difference, and whether the result justifies additional responsibilities or hours.

### v1

- one current and one alternative salary scenario;
- monthly and annual comparison;
- supported bonuses;
- effective hourly compensation;
- transparent assumptions and limitations.

### Later

- payslip reconciliation;
- historical salary tracking;
- personalised negotiation guidance;
- complex multi-employment cases.

## Group 2 — Job seekers comparing offers

### Context

A job seeker has two or more offers with different base salaries, bonuses, hours, vacation and benefits.

### Main questions and decisions

- Which offer provides more reliable take-home income?
- Does a higher bonus compensate for a lower base salary?
- How do working hours and vacation change the comparison?
- Which benefits have a clear monetary value and which depend on personal preference?
- What offer details are still missing?
- Which offer is stronger under conservative assumptions?

### Required inputs

- base salary for each offer;
- guaranteed and variable compensation;
- bonus target and certainty;
- weekly working hours;
- vacation days;
- benefits and user-assigned values where supported;
- consistent payroll assumptions for all offers.

### Expected outputs and explanations

- side-by-side monthly and annual estimates;
- guaranteed compensation separated from variable compensation;
- effective compensation per working hour;
- vacation and working-time comparison;
- conservative and total-compensation views;
- missing-information checklist;
- explanation of why one offer leads under the selected view.

### Common misunderstandings to address

- Target bonus is not guaranteed base salary.
- A user-valued benefit is not equivalent to cash.
- A higher annual gross figure may not be the strongest offer after hours and certainty are considered.
- Results are only comparable when assumptions and periods are consistent.

### Accessibility and language needs

- comparison table that remains usable on mobile;
- summary before detailed breakdown;
- explicit text labels for better, worse, unknown and not comparable;
- no ranking based only on colour or a single score;
- definitions for offer terminology in German and English.

### Representative scenario

A job seeker compares one offer with higher base pay and longer hours against another with lower base pay, a target bonus, more vacation and better benefits.

### v1

- comparison of two offers;
- base, bonus, hours, vacation and user-valued benefits;
- conservative and inclusive totals;
- monthly, annual and hourly views;
- missing-data warnings.

### Later

- comparison of more than two offers;
- scenario weighting or personal preference profiles;
- relocation and cost-of-living comparisons;
- employer or market-salary data.

## Group 3 — Newcomers learning the German payroll system

### Context

A person who is new to Germany may understand the offer amount but not the payroll terms, required inputs, deductions or limits of a calculator.

### Main questions and decisions

- What do the requested payroll inputs mean?
- Which information can I find in my employment offer or insurance documents?
- What are the main categories deducted from gross pay?
- Which inputs are required and which are optional?
- Is the estimate suitable for planning rent and living costs?
- Who should I ask when I do not know an input?

### Required inputs

The calculation inputs are the same as for other users, but every unfamiliar field needs:

- a plain-language definition;
- a reason the input matters;
- an example of where to find it;
- a safe default only when a default is legally and mathematically appropriate;
- an “I do not know” path when uncertainty must remain visible.

### Expected outputs and explanations

- net estimate with a beginner-friendly breakdown;
- glossary for German payroll terms;
- visible calculation year;
- input checklist;
- uncertainty or missing-input warnings;
- questions to take to HR, payroll, an insurer or a qualified adviser.

### Common misunderstandings to address

- Gross salary is not disposable income.
- The same gross salary can produce different estimates under different supported assumptions.
- A calculator is not an employment contract or official payroll statement.
- Unknown inputs should not be silently replaced with hidden assumptions.
- English translations should retain the corresponding German term where it helps users recognise documents.

### Accessibility and language needs

- complete German and English core flow;
- short sentences and progressive disclosure;
- German term shown beside the English explanation;
- examples using German number and currency conventions;
- no reliance on prior knowledge of the German tax or insurance system;
- mobile-first input guidance.

### Representative scenario

A newcomer receives a first German employment offer and needs to estimate monthly take-home pay, understand the requested fields, and build a list of questions for HR.

### v1

- bilingual core calculator and comparison;
- contextual explanations;
- glossary links;
- “I do not know” handling;
- official-source links where later research tasks establish them.

### Later

- additional languages;
- guided onboarding by residence or employment history;
- visa, residence-permit or relocation advice;
- document upload and extraction.

## Group 4 — Students and graduates entering full-time employment

### Context

A student or recent graduate is moving from student income, a working-student role or no regular income into a standard full-time employment offer.

### Main questions and decisions

- What could my first monthly take-home salary be?
- How much can I safely budget for housing and recurring costs?
- How do two entry-level offers compare?
- What do probation-period, bonus and benefit terms mean for reliable income?
- Which student or part-time assumptions are not supported by the full-time v1 calculator?

### Required inputs

- first full-time gross salary;
- supported payroll assumptions;
- start date where partial-year context is shown;
- offer hours, vacation, bonuses and benefits;
- clear employment-type selection or scope confirmation.

### Expected outputs and explanations

- stable monthly estimate for a supported full-time case;
- annualised result separated from any partial-year view;
- offer comparison;
- beginner explanations;
- unsupported-case warning when the user is still in a student, mini-job or other deferred employment category.

### Common misunderstandings to address

- Annualised income and income received during a partial first year are different.
- A signing or target bonus should not define the recurring monthly budget.
- Student-employment rules should not be assumed to match standard full-time employment.
- Benefits do not always increase spendable monthly income.

### Accessibility and language needs

- guided defaults with explanations;
- budget-friendly monthly view;
- prominent separation of recurring and one-off compensation;
- plain German and English;
- responsive use on a phone.

### Representative scenario

A graduate compares two first full-time offers and wants a conservative monthly budget based on guaranteed compensation.

### v1

- supported standard full-time employment;
- recurring versus one-off compensation;
- two-offer comparison;
- partial-year explanation only if the required calculation support is validated.

### Later

- working-student, internship, mini-job and midijob calculations;
- student-loan or education-finance planning;
- broader early-career guidance.

## Group 5 — Couples comparing household-income scenarios

### Context

Two partners want to understand how one or more employment choices affect their combined estimated take-home income.

### Main questions and decisions

- What is our combined estimated monthly income under each scenario?
- What happens if one partner accepts a different offer or changes hours?
- How much of the household result is recurring and guaranteed?
- Are the two individual calculations based on consistent assumptions?
- Which household tax, benefit or filing effects are outside the calculator's scope?

### Required inputs

- separate supported salary and payroll inputs for each partner;
- scenario-specific offer data;
- working hours, vacation, bonuses and benefits for each offer;
- household scenario labels;
- explicit confirmation of unsupported household effects.

### Expected outputs and explanations

- individual results kept visible;
- combined monthly and annual totals;
- difference between household scenarios;
- guaranteed and variable compensation separated;
- warning that combined payroll estimates are not a complete household tax return, benefit calculation or financial plan.

### Common misunderstandings to address

- Adding two estimated payslips does not model every household tax or benefit consequence.
- A withholding estimate should not be presented as a guaranteed final household liability.
- One partner's variable bonus should not be treated as reliable recurring household income.
- Household comparison should not hide which partner or assumption caused a change.

### Accessibility and language needs

- clear Partner A/Partner B labels that users can rename;
- individual and combined views;
- privacy-safe local scenarios;
- readable comparison on small screens;
- neutral language that does not assume gender, marriage structure or which partner earns more.

### Representative scenario

A couple compares the household effect of one partner keeping a current role versus accepting a new offer with different pay and working hours.

### v1

- two separately calculated supported employee scenarios;
- combined estimated totals;
- scenario comparison;
- prominent scope and uncertainty statements.

### Later

- detailed joint tax-return modelling;
- government-benefit interactions;
- parental-leave and pregnancy-benefit scenarios;
- household budgeting and shared accounts.

## Group 6 — Workers with limited financial flexibility

### Context

A small difference between estimated and actual take-home pay can materially affect rent, food, transport or debt payments. This is a cross-cutting priority group rather than a separate employment category.

### Main questions and decisions

- What amount is safe to use for a recurring monthly budget?
- Which part of compensation is guaranteed?
- How sensitive is the result to uncertain inputs?
- What could cause the actual payslip to be lower?
- Is an offer still viable under conservative assumptions?

### Required inputs

- guaranteed recurring gross pay;
- variable and one-off compensation entered separately;
- supported payroll assumptions;
- working hours;
- uncertainty or unknown status for inputs the user cannot confirm.

### Expected outputs and explanations

- conservative recurring monthly estimate;
- separate variable-compensation view;
- visible unknowns and unsupported factors;
- no false precision;
- strongest result drivers;
- clear instruction to confirm uncertain details before relying on the estimate.

### Common misunderstandings to address

- Best-case total compensation is not a safe monthly budget.
- One-off payments should not be averaged into recurring income without a clear label.
- An estimate with unknown inputs carries more uncertainty.
- The product cannot guarantee an exact payslip.

### Accessibility and language needs

- essential result visible without complex charts;
- no fear-based warnings or upselling;
- plain-language uncertainty messages;
- no forced account or data collection;
- usable on low-resolution mobile screens and with keyboard or assistive technology.

### Representative scenario

A worker compares an offer with higher possible total compensation against one with slightly lower but more reliable guaranteed pay, using a conservative monthly view.

### v1

- guaranteed-versus-variable separation;
- conservative result view;
- visible uncertainty and unsupported-input warnings;
- free, accountless core flow.

### Later

- budgeting tools;
- alerts for assumption-year changes;
- links to verified public support resources;
- specialised benefit interactions.

## Cross-group design requirements

### Information architecture

The core flow should use progressive disclosure:

1. essential salary and payroll inputs;
2. estimated result;
3. explanation and deduction detail;
4. optional offer factors;
5. assumptions, sources and limitations.

Users should not have to understand every payroll term before seeing a useful result.

### Comparison integrity

- Use the same calculation year and compatible assumptions across compared offers.
- Keep guaranteed, variable and user-valued compensation separate.
- Mark missing or incomparable values instead of assigning a misleading zero.
- Explain the reason for any ranking or summary.
- Do not reduce a decision to one opaque score.

### Language

- German and English must cover the complete core flow.
- Translations must preserve meaning rather than mirror wording mechanically.
- When an English user may encounter a German term in official or employer documents, show both.
- Number, currency and date formats must follow the selected locale consistently.

### Accessibility

- Core actions must work by keyboard.
- Labels and errors must be available to assistive technology.
- Colour must not be the only indicator of status or difference.
- Tables must have a usable narrow-screen presentation.
- Explanations must be readable without specialist knowledge.
- Motion, if introduced later, must not be required to understand results.

### Privacy

- No account should be required for the v1 core flow.
- Salary inputs should remain in the browser for the static public v1.
- Analytics, if added, must not capture salary values or sensitive scenario content.
- Saved or shared scenarios require separate privacy design before implementation.

## v1 needs matrix

| Need | v1 | Later |
| --- | --- | --- |
| Standard supported employee salary estimate | Yes | Broader exceptional cases |
| Monthly and annual net estimate | Yes | Historical tracking |
| Deduction explanations | Yes | Payslip reconciliation |
| German and English core flow | Yes | Additional languages |
| Compare two offers | Yes | Three or more offers |
| Base, bonus, benefits, hours and vacation | Yes | Employer and market data |
| Guaranteed versus variable compensation | Yes | Probabilistic bonus modelling |
| Effective hourly compensation | Yes | Cost-of-living adjustment |
| Individual couple calculations and combined totals | Yes | Full household tax/benefit modelling |
| Beginner guidance and glossary | Yes | Personalised onboarding |
| Accountless local calculation | Yes | Optional privacy-reviewed sync |
| AI payslip extraction | No | Separate post-v1 feature |

## Research and validation questions

Later discovery and usability work should test:

- Can each group identify the correct inputs without help?
- Which payroll terms require examples rather than definitions?
- Can users distinguish gross, net, guaranteed, variable and user-valued compensation?
- Can users explain why one offer leads in the selected view?
- Do users notice the calculation year and unsupported-case warnings?
- Can users with limited payroll knowledge recognise when to ask HR or seek professional advice?
- Does the mobile comparison remain understandable without hiding important differences?
- Do German and English versions communicate equivalent meaning?

## Acceptance check for NP-PD-002

- [x] Employees checking salaries are documented.
- [x] Job seekers comparing offers are documented.
- [x] Newcomers to Germany are documented.
- [x] Students entering full-time employment are documented.
- [x] Couples comparing household scenarios are documented.
- [x] Workers with limited financial flexibility are documented.
- [x] Each group includes questions, inputs, outputs, misunderstandings, accessibility and language needs, a representative scenario, and v1/later boundaries.
- [x] Shared product requirements and validation questions are recorded.
- [x] The document remains consistent with NP-PD-001.
