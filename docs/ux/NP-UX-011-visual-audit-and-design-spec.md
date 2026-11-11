# NP-UX-011 — Visual audit and UI design specification

**Status:** Feature-branch design proposal; not an approved or deployed redesign.  
**Baseline:** `main` after NP-I18N-002 (PR #99). English-content work in draft PR #100 is independent.  
**Scope:** Salary form, Offer A/B inputs, results, methodology, privacy controls, and the print-only report. No calculation, status, storage, or source changes.

## Audit evidence and limitations

This review is grounded in `src/App.tsx`, `src/styles.css`, the salary/offer components, and existing responsive browser contracts. Some findings are **code-observed risks**, not assertions about a user study or subjective appearance. The companion `e2e/visual-audit.spec.ts` produces actual Chromium baseline screenshots at 375, 768 and 1280 CSS px, with a browser artifact published by CI. Screenshots are *before-state* evidence; annotations below provide review coordinates and intended correction. Do not call screenshots independently reviewed until the CI artifact has been inspected.

The existing 320–1440 px overflow regression tests protect against page-wide overflow, but **absence of overflow is not evidence of good visual hierarchy**. The mobile offer table already collapses into labelled cards at ≤760 px; preserve its data/semantics when restyling.

## Prioritized findings and screenshot annotations

| ID | Severity | Baseline evidence / screenshot region | Problem and why it matters | Owner task |
| --- | --- | --- | --- | --- |
| V-01 | High | `hero-375.png`, `hero-1280.png`: hero, upper page | `h1` uses up to 6.25rem and the hero has 4–8rem vertical padding; no Salary/Compare action exists before the hero. The first useful action is likely below the fold. **Verify actual visibility** from screenshots before claiming a measured failure. | NP-UX-001 |
| V-02 | High | `salary-375.png`, `salary-1280.png`: salary panel before inputs | Both fictional examples and a full share-settings explanation appear before the primary gross-salary field, increasing the journey to the intended form. Do not remove controls or change privacy semantics: relocate them to clearly labelled secondary disclosures. | NP-UX-010, NP-UX-012 |
| V-03 | Medium | `salary-375.png`: form field sequence and nested disclosures | Salary form uses a two-column grid down to 620px but nested panels and free-form actions use separate spacing rules. Use a single field rhythm; keep labels, errors and help adjacent to their inputs. | NP-UX-012 |
| V-04 | Medium | `salary-result-375.png`, `salary-result-1280.png`: net figure and deductions | Recurring net is correctly primary (NP-UX-005). Subsequent summary cards, chart, table and print controls create an extended visual journey. Make the secondary information progressively scannable without hiding financial caveats. | NP-UX-012 |
| V-05 | High | `comparison-375.png`, `comparison-1280.png`: Offer A/B identifiers | Offer A and B currently share near-identical card styling. Use persistent text headers and subtle distinct borders/label markers for disambiguation; never depend on color alone. Preserve independent drafts and no implied winner. | NP-UX-013 |
| V-06 | Medium | `comparison-375.png`, `comparison-768.png`: disclosures and matched categories | Desktop compares in two columns; mobile stacks at 760px. Collapsed optional-category status text can compete visually with headings. Standardize heading rhythm and always show independent A/B completion state. | NP-UX-013 |
| V-07 | Medium | `src/styles.css`: `:root`, `h1`, `.site-header`, `.brand span`, `.notice` | Existing tokens include ink, muted, canvas, surface, line, accent, focus, error and success, but several selectors hardcode the same colors. Consolidate presentation-only colors via tokens to avoid drift. | NP-UX-011 specification; NP-UX-012–014 implementation |
| V-08 | Medium | `src/styles.css`: focus, error/success and disabled controls | Focus ring, base borders and 44px buttons are present. There is no documented visual-state matrix that ensures hover, disabled, error, in-progress, unsupported and success states remain distinct and accessible across all controls. | NP-UX-014 |
| V-09 | High | `print-report-1280.png` and `src/components/SalaryPrintReport.tsx` | Print output deliberately exposes sensitive salary, birth date and insurance fields only after explicit print. Audit A4 text wrapping, source/assumption disclaimer and no leakage of unrelated Offer A/B drafts. Never store print screenshots outside the CI artifact in public repository files. | NP-UX-015 + NP-TRUST-005 |
| V-10 | Medium | `methodology-375.png` and `methodology-1280.png` | Long technical source/methodology text must remain legible, link-identifiable and not visually mistaken for a payroll certificate. Constrain reading width and provide a clear progression from overview to official evidence. | NP-UX-015 |

## Visual language — implementation-ready decisions

**Direction:** Calm, legible financial utility, not a marketing landing page. Trust through explicit scope, precise labels and sober result treatment. Prefer visual hierarchy to more decoration.

### Tokens and type

Continue using `--np-*` in `src/styles.css`. Existing token values are the starting source of truth, **not new colors to introduce blindly**:

| Purpose | Token | Baseline |
| --- | --- | --- |
| Primary text | `--np-color-ink` | `#17221d` |
| Supporting text | `--np-color-muted` | `#46554d` |
| Page | `--np-color-canvas` | `#f4f3ed` |
| Card surface | `--np-color-surface` | `#faf9f5` |
| Border | `--np-color-line` | `#c8cec9` |
| Accent (non-status) | `--np-color-accent` | `#9c3f28` |
| Keyboard focus | `--np-color-focus` | `#135e8a` |
| Error | `--np-color-error` | `#a32632` |
| Success | `--np-color-success` | `#176a48` |

- Prefer system/Inter sans-serif for controls, body and result metrics. The existing Georgia hero heading may remain a deliberate editorial accent but must not push the useful workflow offscreen; evaluate against V-01.
- Body 16px minimum, supportive labels and statuses ~14px only where contrast is verified, with readable 1.45–1.65 line height. Do not force user-entered values into a narrower font.
- Primary calculator/result heading: 28–36px on desktop and 24–30px on mobile. Large landing title should be compact enough to show a primary next action within 720px-high desktop viewport.
- Monetary values: tabular numerals, clear `€` and period, use `Intl` only when NP-I18N-005 is delivered, never convert integer-cent calculations to floating values to produce UI.
- Spacing: keep `--np-space-1/2/3/4/6/8/12` (4/8/12/16/24/32/48px). Default form row gap 16px; section gap 24–32px desktop, 16–24px mobile. Avoid new arbitrary margins and competing nested panel padding.
- Corners: continue `--np-radius-sm/md/lg`; one card outline per semantic grouping. Nested cards should use a surface/left marker instead of repeated thick borders. Reserve `--np-shadow-raised` for intentional elevation, not every section.

### Information architecture and controls

1. On 1280×720 and 375×812, expose Salary and Compare as clear, keyboard-accessible entry actions before the complete marketing hero, with current workflow apparent. This is **NP-UX-001**, not duplicated in this PR.
2. Salary starts with gross pay, period, calculation year and core assumptions; move example and share utilities below the form lead. Provide a persistent support-scope note without asserting unsupported scenarios are calculable.
3. Advanced fields disclose availability **before** soliciting information; preserve entered drafts when a disclosure collapses.
4. Keep one dominant submit/compare action per workflow. Use secondary buttons/links for example, reset, copy, export and advanced controls. Confirm destructive overwrite and provide undo where NP-UX-010 permits it.
5. Salary result ordering: recurring take-home (only if genuinely stable), estimated/status label, chosen period switch, annual totals, employee deductions/chart, methodology and print control. Do not silently derive monthly from annual/12.
6. Comparison: stable Offer A/B identity, mirrored field ordering, mobile cards with visible A/B labels, signed difference clearly labelled **B − A**, separately listed non-cash benefits and no algorithmic winner.
7. Missing, zero, invalid and unsupported financial states must have separate text—not just separate color. If edited values invalidate results, hide stale amounts rather than presenting an obsolete number.
8. Privacy: local-only processing and sharing consent are not marketing badges. Preserve explicit opt-in copy/export and the existing URL allowlist; no salary fields in URL, analytics or screenshot filenames.

### Responsive rules

| Viewport | Layout contract | Visual acceptance |
| --- | --- | --- |
| 320–375px | Single-column field flow; A/B mirrored vertically; full-width primary action | No horizontal document overflow; labels wrap naturally; 44×44px tap targets; no clipped currencies or oversized hero |
| 376–760px | Single-column calculator/offer, optional grouping | All status and error text visible beside its field; no layout jumps from long German translations |
| 761–1023px | Two columns only where labels and controls remain legible | Comparison columns may wrap/stack at a measured breakpoint, never squeeze private amounts |
| ≥1024px (1280 baseline) | Compact hero, clear entry; salary panels with intentional max widths, side-by-side A/B inputs | Core action visible at the intended breakpoint; balanced negative space; not a narrow column lost in wide whitespace |

### Accessibility and confidence gates

- WCAG 2.2 AA contrast for normal text (at least 4.5:1), non-text meaningful UI states and focus indicators (typically at least 3:1, assessed per applicable criterion). Calculate real contrast on **actual rendered pairs**; token presence alone does not establish compliance.
- All buttons/input taps at least 44px when feasible, keyboard focus visible, label/description/error relationships verified; reduced motion respected. Use neutral icon and text alongside color for A/B, missing, invalid, and success.
- At 200% zoom on 1280px equivalent, ensure reading order and no content lost; test 320/375/768/1280 widths plus desktop browser accessibility scans.
- Status and amount updates announced in existing live regions, without duplicate announcements; no focus hijacking on editing.
- Check English/German long-label wrapping; do not truncate legal qualifiers or essential payroll warnings.
- Do not attach actual user's private salary to screenshot captures. Capture only fictional sample values provided by the app.

## Delivery and handoff

**NP-UX-011 completion gate:** source-level audit and token inventory; reproducible and inspected browser captures for the three required widths; annotated defects with ownership; agreed design decisions; no calculation or state changes. Screenshot capture tool produces artifacts on the CI run, not committed potentially sensitive PNG files.

**NP-UX-012:** implement calculator layout/primary net hierarchy according to V-02–04, include before/after screenshots and functional regression.  
**NP-UX-013:** implement offer A/B and comparison table hierarchy according to V-05–06.  
**NP-UX-014:** implement state matrix V-07–08 with tests for focus, contrast and reduced motion.  
**NP-UX-015:** execute cross-device/zoom/print review V-09–10 and close remaining findings.  
**NP-UX-001/003/004/006/010:** keep existing workflow and recovery stories separate—visual work must not replace them.

## Non-goals

No change to 2026 rules, admitted scenarios, interest/tax rates, payroll math, domain state, data persistence, API calls, dependency versions or finance-reporting semantics. No subjective claims of improved conversion absent user research or experiment.
