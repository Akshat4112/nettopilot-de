# NP-UX-012 — Calculator visual polish

## Scope and dependencies

Implementation on the dedicated `np-ux-012-calculator-visual-polish` branch, based on `main` and guided by the design principles documented in draft NP-UX-011 PR #101. **Neither PR #101 nor NP-I18N-003 PR #100 is merged into this branch.** No salary domain logic, insurance/tax assumptions, URL allowlist, persistence or reporting calculations were changed.

The specific existing UX problems addressed here are V-02 (utility actions preceding pay fields), V-03 (form rhythm), and V-04 (recurring net presentation). Homepage-first workflow entry (V-01) remains NP-UX-001; cross-app states and comparison layout remain NP-UX-013/014.

## Visual implementation

- Retain the existing typed `--np-*` color/spacing/radius tokens. No new theme or font dependency.
- **Pay first:** gross salary and frequency are now the first interactive salary fields, followed by the payroll profile. Small text headings distinguish initial pay inputs from subsequent details.
- **Primary action first:** full-year employment confirmation and the existing Check inputs / Reset controls follow the core form. Fictional salary examples and privacy-safe sharing remain accessible in a visually secondary **More options** area after the primary action. All example/loading/reset/share handlers and warnings are unchanged.
- **Mobile readability:** one-column form is preserved at ≤620 px; large gross field receives clear visual emphasis; card padding, line-height and numeric treatment are tuned at 320/375 px; no new media-query breakpoint influences payroll behavior.
- **Results:** the previously implemented recurring monthly take-home result remains the first result content. A muted background and clear left marker distinguish its admitted value from gross/employer-cost summaries. Existing monthly/annual toggle, reconciliation chart, deduction table, print warning and unavailable states are all preserved.
- **Accessibility:** labels, `aria-invalid`, live status, keyboard focus and tab order of primary inputs are retained. Secondary controls are still visible and keyboard-operable. No hidden dialogs and no click-only affordances introduced.

## Verification matrix

| Check | Evidence |
| --- | --- |
| 320, 375, 768, 1280px | `e2e/calculator-visual-polish.spec.ts`: no page overflow, pay field precedes CTA and optional actions, 44px primary button |
| Fictional supported monthly example | Same E2E: example does not auto-confirm; manual confirmation required; summary appears only after supported calculation |
| Recurring first | Same E2E: recurring take-home heading precedes salary-display period choices |
| Existing core contracts | Existing component, responsive, keyboard, privacy/URL, print, and domain suites run in CI |
| Formatting, lint, TypeScript, coverage, Pages | Required repository CI workflows; capture exact head SHA and run IDs in PR |
| Before / after visual evidence | Source-level baseline in NP-UX-011 PR #101; compare with this PR in browser. Visual QA follow-up remains NP-UX-015 |

## Release constraints

- Do not claim full bilingual UI: NP-I18N-003/004/005 are independent.
- Do not claim responsive screenshot approval without reviewing images.
- Do not change money amounts, visibility of unsupported results or source attribution through CSS.
- Rebase/reconcile wording-only changes from NP-I18N-003 when merged; this PR intentionally changes markup ordering and styles, not language strings.
