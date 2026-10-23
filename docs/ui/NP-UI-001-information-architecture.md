# NP-UI-001 — Calculator information architecture

**Status:** Ready for review  
**Milestone:** M4 Calculator MVP  
**Depends on:** NP-PD-004, NP-PD-005, NP-PD-006  
**Contract:** German and English, browser-only processing, accessible and privacy-preserving

## Primary journey

1. **Choose tax year and employment context.** Show the current supported calculation year and local-processing assurance. Ask scope-admission questions before offering an authoritative result.
2. **Enter salary essentials.** Gross salary and monthly/annual period, tax class, federal state, birth date, church-tax status, children and statutory/private insurance must be explicitly controlled, with no hidden material defaults.
3. **Resolve dependent questions.** Show insurer-specific contribution fields or private health/care premium, tax-eligible basic amount and employer-subsidy evidence only when relevant. Show bonuses and allowances in an advanced disclosure.
4. **Validate locally.** Field-level errors, unknown-input guidance and unsupported-scope explanations precede calculation. Keep entered values intact when status is incomplete.
5. **Review results.** Lead with recurring monthly net, followed by guaranteed annual total, optional variable/one-off amounts and employer costs. Show the tax year and estimate quality.
6. **Investigate why.** Expand deductions, contribution bases, statutory ceiling effects, exceptions, methodology and dated sources without leaving the calculation context.
7. **Change or compare.** Users can change any input, compare two valid offers, review simple couple totals (not joint taxation), or reset. Sharing and export require separate privacy approval.

## Sitemap and sections

| Route or screen | Purpose | Primary content |
| --- | --- | --- |
| `/` | Find a calculator | Value proposition, limitations, local-first statement, calculator entry |
| `/salary` | Individual gross-to-net | Input panel, validation status, net summary, detailed breakdown |
| `/compare` | Compare two offers | Two independent forms, recurring/guaranteed/total tabs, differences |
| `/couple` | Simple household totals | Two separate individual calculations plus arithmetic total; no joint tax |
| `/methodology` | Explain calculations | 2026 assumption IDs, official references, limitations and last verified date |
| `/privacy` | Privacy contract | Browser-only model, analytics choices, local deletion and sharing warnings |

Routes are proposed IA, not a mandate to implement unapproved features early. The individual calculator is the M4 priority.

## Calculator layout

**Desktop:** Two-column layout: an input rail (about 40%) beside a result workspace (about 60%); no sticky results that obscure focus or the footer. **Mobile:** One column, inputs before results, clear jump links between sections, no horizontal scrolling.

Input order: year and scope → salary and pay frequency → personal tax situation → statutory/private insurance → advanced compensation → calculate/reset. Group sensitive private-insurance values under a clear disclosure with a note that amounts stay in the browser.

Result order: status → main recurring net number → gross/deductions/employer cost summary → monthly/annual toggle → itemised breakdown → annual extras → assumptions and source details → reset/compare/print when available.

## State machine

- `editing`: no stale result is represented as current
- `incomplete`: show missing facts and per-field corrections; never invent zero values
- `unsupported`: show reason and scope explanation; never show a normal net amount
- `calculating`: only a lightweight synchronous pending state where needed
- `supported` and `supported_with_warnings`: show reconciled complete results
- `error`: suppress stale numeric result, show safe recovery without sensitive logs

Changing a material input immediately marks the previous result stale. A new supported result must come from the domain engine, never from presentation arithmetic.

## Content and interaction rules

- Always distinguish *recurring monthly net* from *annual total / 12*. A bonus month is never silently treated as recurring.
- For PKV, separately show payroll net before premiums, employer subsidy, full premiums, and disposable cash after private insurance; do not deduct premiums or add subsidies twice.
- Tax classes, federal states and contribution inputs come from the year-specific registry.
- Explain employer-cost coverage rather than claiming all overhead is included.
- No autonomous recommendation such as “Offer B is better”; display transparent deltas and uncertainty.
- Every error has a text message and accessible association to its field. Keyboard ordering follows visual ordering. Charts require a table or text equivalent. Status must not rely on colour.
- Translate labels and explanatory text in German and English while preserving stable data keys and identical calculations.

## Navigation and page metadata

Primary navigation: Salary Calculator, Compare Offers, Methodology, Privacy. Footer: open-source repository, methodology/version, privacy, legal/contact links as supported. Mobile navigation must be keyboard-operable and not hide critical reset or methodology access.

Page titles and descriptions should be locale-aware, accurate and non-promissory. Never expose salary values in URLs, analytics or crash reports. Scenario-bearing share links remain disallowed until a separate privacy review resolves NP-PD-007 restrictions.

## Acceptance criteria for subsequent UI tasks

1. Every accepted NP-PD-004 material input is discoverable in a sensible group; unsupported paths are intercepted.
2. All five NP-PD-005 result states are visually and semantically distinct.
3. Supported results lead with recurring monthly net; annual averages are accurately labelled.
4. Private premiums and subsidies reconcile exactly once to disposable cash.
5. DE/EN terminology, keyboard traversal, accessible errors and screen-reader status are tested.
6. Browser-only state is the default; clearing removes current inputs and results.
7. At 320px to desktop widths there is no content clipping or page-level horizontal overflow.
8. No sharing of sensitive scenario data; any later share feature must pass privacy review.

**Implementation handoff:** NP-UI-002 uses this document for tokens/components; NP-UI-003 implements essential inputs; NP-UI-006 and NP-UI-007 implement the result hierarchy.
