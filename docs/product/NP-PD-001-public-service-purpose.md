# NP-PD-001 — Public-service purpose

**Status:** Accepted  
**Task:** NP-PD-001  
**Milestone:** M0 Plan  
**Last updated:** 2026-09-23

## Product purpose

NettoPilot DE is a free, bilingual and privacy-respecting decision aid for understanding German employment income.

Its public-service purpose is to translate a complicated salary offer into information that ordinary people can use: expected take-home pay, the main deductions behind it, and the practical value of one offer compared with another.

The product should help people make informed employment decisions without requiring payroll expertise, paid advice, an account, or the disclosure of salary data to a third party.

## Problem

A gross annual salary does not tell a person what they can actually spend or whether one job offer is better than another.

In Germany, take-home pay depends on several interacting assumptions, including the tax year, tax class, federal state, church-tax status, health-insurance situation, social-insurance rules and one-off compensation. Offer quality also depends on factors that a basic net-salary calculator usually ignores, such as bonuses, working hours, vacation, benefits and the timing or certainty of compensation.

This creates recurring problems:

- People compare offers using gross salary alone.
- Newcomers and first-time employees struggle with unfamiliar payroll terminology.
- Employees cannot easily understand why gross and net pay differ.
- Bonuses and benefits are mistaken for guaranteed base compensation.
- Two offers with different hours or vacation allowances are difficult to compare fairly.
- Users may rely on opaque calculators without knowing the calculation year, assumptions, limitations or source of a result.
- People may share sensitive salary or payslip data merely to obtain a basic explanation.

The result is an information imbalance between employers, payroll specialists and individual workers. That imbalance is especially harmful when a person has limited financial margin, limited German-language proficiency, or little experience with the German employment system.

## Intended social value

NettoPilot DE should reduce that information imbalance by making salary calculations understandable, comparable and inspectable.

The intended value is:

1. **Financial clarity** — turn gross compensation into an understandable monthly and annual estimate.
2. **Better employment choices** — compare offers on more than headline salary.
3. **Fairer access to information** — provide the core service free of charge in German and English.
4. **Confidence for newcomers** — explain German payroll concepts in plain language without assuming prior knowledge.
5. **Privacy by default** — allow the core calculation and comparison to work without an account and, for the public v1, without sending salary inputs to a backend.
6. **Transparent uncertainty** — distinguish calculated estimates, user inputs, official assumptions and items that cannot be known precisely in advance.
7. **Practical agency** — help users identify which questions to ask an employer, recruiter, payroll department or qualified adviser.

The product is successful when users understand their situation better and can make a more informed decision. It is not successful merely because it produces a number.

## Decisions the product should support

NettoPilot DE should help a user answer these questions:

### Understand one salary

- What could my estimated monthly and annual net income be?
- Which deductions account for most of the difference between gross and net?
- Which inputs and tax-year assumptions produced the estimate?
- How could a bonus or salary increase affect the result?
- Which result components are estimates rather than guarantees?

### Compare employment offers

- Which offer provides more estimated take-home income?
- How do bonus certainty, benefits, vacation and weekly working hours change the comparison?
- What is the effective compensation per working hour?
- Is a higher gross salary still better after considering the complete offer?
- Which missing or ambiguous terms should I clarify before accepting?

### Prepare for a conversation

- What should I ask HR or payroll to confirm?
- Which assumptions have the greatest effect on the estimate?
- When is the situation complex enough to require professional tax, legal, payroll or financial advice?

## Intended beneficiaries

The service is intended for employees, job seekers and households making employment-income decisions in Germany. It should be particularly useful to newcomers, students entering full-time work, first-time employees, people comparing offers, couples planning household income, and workers for whom a payroll surprise would create financial stress.

Detailed user groups, needs and scenarios are defined in [NP-PD-002 — Primary user groups and needs](NP-PD-002-primary-user-groups.md).

## Public-service principles

All product and engineering decisions should follow these principles:

1. **Correctness before novelty**  
   The calculation engine must be deterministic, tested and based on versioned assumptions. AI must not generate payroll results.

2. **Explain the result**  
   Show the important inputs, deductions, assumptions and calculation year. Avoid presenting unexplained totals as authoritative facts.

3. **Plain language first**  
   Use understandable German and English. Introduce payroll terminology only when it helps the user interpret a real decision.

4. **Privacy by default**  
   Keep the public v1 usable without registration. Process salary inputs locally wherever feasible and avoid collecting sensitive employment data.

5. **Accessible to ordinary users**  
   Design for mobile and desktop use, keyboard navigation, readable content, clear errors and accessible visual contrast.

6. **Neutral comparison**  
   Do not rank offers using salary alone or steer users toward an employer, insurer, tax adviser or financial product.

7. **Visible limitations**  
   State what the calculator supports, what it approximates, and what remains outside scope.

8. **Free core utility**  
   The salary calculation, explanation and basic offer comparison should remain available without payment.

9. **No engagement traps**  
   Do not use fear, artificial urgency, hidden assumptions or dark patterns to retain users.

## Public v1 boundaries

The first public version should focus on:

- a deterministic German gross-to-net salary estimate;
- monthly and annual results;
- an understandable deduction breakdown;
- versioned, visible calculation assumptions;
- German and English user experiences;
- side-by-side comparison of employment offers;
- comparison factors such as base salary, bonus, benefits, vacation and working hours;
- effective hourly compensation;
- privacy, accessibility and trust disclosures;
- a static deployment suitable for GitHub Pages.

The public v1 does **not** aim to provide:

- an official payroll statement;
- tax-return preparation;
- personalized tax, legal, payroll, insurance or financial advice;
- every exceptional employment or household case at launch;
- employer recommendations or sponsored rankings;
- user accounts or cloud storage of salary data;
- AI-generated tax calculations;
- payslip upload or AI extraction.

Privacy-safe payslip analysis may be explored after the public v1, but it must be treated as a separate feature with explicit consent, data-lifecycle controls and independent validation.

## Trust and safety position

Every result is an estimate based on the user's inputs and the supported rule set for a stated tax year. NettoPilot DE must not imply that an estimate is an official calculation or a guaranteed future payslip.

The interface should:

- show the calculation year and relevant assumptions;
- identify missing, unsupported or uncertain inputs;
- avoid false precision where an exact result cannot be known;
- distinguish guaranteed compensation from variable or user-valued benefits;
- provide a concise educational-use disclaimer;
- direct users to official information or qualified professionals when the decision exceeds the tool's scope.

Specific legal wording, source requirements, retention rules and privacy controls are defined in later trust, privacy and research tasks.

## Initial success criteria

The public-service purpose is being met when the product can demonstrate that:

- a user can calculate an estimate without creating an account;
- the user can see why the estimated net amount differs from gross pay;
- the calculation year and major assumptions are visible;
- two offers can be compared using both compensation and working conditions;
- variable compensation is not presented as guaranteed base pay;
- German and English users can complete the core flow;
- the core flow works with keyboard navigation and on a mobile viewport;
- salary inputs are not transmitted to a backend in the public v1;
- calculation tests cover the supported rule set and published reference cases;
- user testing shows that participants can correctly identify the financially stronger offer and explain the main reason for the difference.

Quantitative product targets and the user-testing protocol should be set after NP-PD-002 defines the primary user groups and scenarios.

## Product promise

> NettoPilot DE helps people understand what a German salary means in everyday life and compare job offers with greater confidence, using transparent calculations, plain-language explanations and privacy-respecting design.

## Acceptance check for NP-PD-001

- [x] The user problem is documented.
- [x] The intended social value is documented.
- [x] The decisions supported by the product are documented.
- [x] Public-service principles and v1 boundaries are recorded.
- [x] Limitations and safety expectations are explicit.
- [x] The document separates this task from the detailed persona work in NP-PD-002.
