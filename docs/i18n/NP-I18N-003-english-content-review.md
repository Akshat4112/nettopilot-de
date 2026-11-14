# NP-I18N-003 — English interface content review

**Status:** In progress on the NP-I18N-003 feature branch  
**Depends on:** NP-I18N-001 (EN/DE terminology standard), NP-I18N-002 (typed localization architecture)  
**Scope:** Public salary calculator, job-offer comparison, validation, explanation, methodology, privacy and printable/shared results.  
**Calculation year:** 2026 only until annual assumptions and admission are updated.

## Editorial rules and acceptance criteria

This task reviews and stabilizes **English user-facing wording**. It must not alter calculation inputs, legal rates, supported scenarios, validation logic, arithmetic, result-state transitions or sensitive-data handling.

1. **Name the year precisely:** use *calculation year* for the 2026 assumption set, rather than implying a complete income-tax filing workflow. The same vocabulary applies to form and result context.
2. **Do not mix pension concepts:** *employee statutory pension insurance* is an employee deduction; *employer occupational pension contribution* is a separate offered benefit/value. The latter is not an employer statutory pension-insurance contribution, does not enter payroll net and is not immediately spendable cash.
3. **Do not promise unimplemented payroll cases:** private health insurance, church-tax-liable scenarios, children, special payroll adjustments and bonuses remain unsupported for admitted net results. Distinguish an incomplete draft from an unsupported scenario.
4. **Keep zero distinct from unknown:** unknown/unavailable values must not display as €0.00. Employer-stated and user-assigned benefit valuations remain separate.
5. **Identify comparison math:** all signed differences are B − A, not overall offer rankings. Effective hourly compensation is an estimate based on the specified net, work and commute time assumptions.
6. **Plain-language sharing:** a URL carrying only non-sensitive settings is a **shareable settings link**, not proof of a private URL. A salary comparison export contains compensation figures, requires explicit consent and must not be put into URL parameters.
7. **Accessibility:** review accessible label equivalence, proper group headings, focus order, keyboard journeys and source descriptions when altering visible labels; update unit and Playwright regression assertions together.
8. **Warnings and evidence:** make methodology, result limitations, unsupported input paths and authoritative source citations discoverable. Never imply a test suite certifies every payroll scenario or that an in-progress translation is complete.
9. **Avoid stale snapshots:** result text must describe the current supported calculation or clearly mark it unavailable, and must never preserve a previous result after a blocked input change.
10. **English as an independent product language:** English messages are the canonical meaning source for NP-I18N-004 German translation; translating a label cannot change a calculation, status, period or decimal precision.

## Reviewed surfaces / editorial decisions

| Surface | Files | English copy and contract to review | Initial work |
| --- | --- | --- | --- |
| Site shell, hero, navigation | `src/App.tsx`, `src/i18n/messages.ts` | English default, explicit translation-in-progress note for German, honest calculator preview | NP-I18N-002 established; no semantic change |
| Main salary form | `src/components/EssentialSalaryInputs.tsx` | Gross salary, frequency, **calculation year**, tax class, federal state, church-tax liability, birth date, insurance; restore and reset help | Calculation-year wording aligned |
| Salary validation | `src/components/essential-salary-validation.ts`, `advanced-salary-validation.ts` | Distinguish absent, invalid and unsupported; next action, not fake net pay | Reviewed; detailed full migration pending |
| Advanced salary inputs | `src/components/AdvancedSalaryInputs.tsx` | Additional health rate, confirmed allowance/addition, PKV premiums, one-off bonus treatment | Existing supported/unsupported distinctions retained |
| Salary scope messages | `src/components/PayrollScopeGuidance.tsx`, `payroll-scope.ts` | Limited 2026 monthly bounds, 12 equal months, GKV, no children/church tax; avoid implying broader support | Reviewed; same limits |
| Salary result summaries | `src/components/SalarySummary.tsx`, `SalaryDeductionBreakdown.tsx`, `salary-deductions.ts` | Estimated recurring net vs annual result, employee statutory pension, wages vs private cash outflows | Calculation-year wording aligned |
| Report & print | `src/components/SalaryPrintReport.tsx`, `SalaryGrossToNetChart.tsx` | Local-only private report, period and assumptions, warning; amount labels | Reviewed; no money-format change |
| Offer inputs | `src/components/OfferComparisonInputs.tsx`, `OfferBenefitsInputs.tsx` | Offer A/B, optional categories, independent pay frequency, **occupational pension** and benefit valuations | Pension labels clarified |
| Offer result summary | `src/components/OfferComparisonSummary.tsx` | B − A, money and hour bases, missing rather than zero, occupational vs statutory pension | Pension row clarified |
| Offer trade-offs | `src/components/OfferComparisonTradeoffs.tsx`, `offer-comparison-tradeoffs.ts` | Neutral explanations and properly reconciled facts, never a ranking | Pension dimension clarified |
| Local comparison export | `src/components/OfferComparisonShare.tsx`, `offer-comparison-share.ts` | Copy/download only after consent, current values only, no private salary URL | Pension label clarified |
| Sources and methods | `src/components/CalculationMethodology.tsx` | BMF, DRV, care/health sources; scope and calculation distinctions; working-time and commute basis | Occupational pension context clarified |
| Sharing settings | `src/components/EssentialSalaryInputs.tsx`, `salary-share-link.ts` | Only year, period and optional state in URL, no private payroll inputs | Link label clarified |
| Locale and formatting | `src/i18n/catalog.ts`, `messages.ts` | English copy keys; German value parity and display-boundary `Intl` conventions | NP-I18N-004/005 follow |

## This PR’s changes

- Salary form: **Tax year → Calculation year**, matching NP-I18N-001 and report methodology.
- Salary summary: calculation-year phrasing rather than generic income-tax year.
- Settings URL: **Shareable settings link (select and copy)**; the existing privacy-safe URL contract remains unchanged.
- Employer optional pension throughout the comparison UI, narrative, export, benefits input and methodology: call it **occupational** pension rather than ambiguously “employer pension”.
- Update relevant component tests and Playwright keyboard, benefits, trade-off and output paths to verify the new text without weakening any validation or money checks.

## Completion gate before NP-I18N-003 may be marked Done

- [ ] Inventory and migrate **all remaining English feature copy** (labels, validation explanations, warnings, assumptions, methodology links, chart alternatives, print/export content) into registered UI message keys where appropriate; retain exact domain constants and source metadata separately.
- [ ] Confirm every registered English message has a defined German counterpart or is flagged for the explicit NP-I18N-004 migration; no pretend completed translation.
- [ ] Independent English review of form guidance and method links, including unsupported scenarios and employer-cost qualification.
- [ ] Review desktop/mobile labels, screen-reader associations and keyboard focus after content migration.
- [ ] Full formatting/lint/typecheck, unit/coverage, Chromium and GitHub Pages build checks on the exact final commit.
- [ ] Review PR discussion comments and update the Google Sheet only after evidence.

**Handoff:** NP-I18N-004 completes domain-reviewed German equivalents; NP-I18N-005 implements German/English amount and percentage formatting. Do not call this site fully bilingual until those tasks and their verification are complete.
