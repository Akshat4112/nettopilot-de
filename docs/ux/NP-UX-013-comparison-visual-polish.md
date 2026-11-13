# NP-UX-013 — Offer comparison visual polish

## Purpose

Improve readability and scannability of the existing independent Offer A and Offer B form and results, guided by the NP-UX-011 design audit (PR #101). This is presentation-only work layered on merged NP-UX-012. It does not alter compensation domain calculations, shared payroll admission, source rules, calculated comparison outcomes, storage, exports or user privacy.

## Before / after

| Surface | Existing behavior | Presentation change |
| --- | --- | --- |
| Base offer entry | Two nearly identical fieldsets with textual legends | Clear, persistent **Offer A** and **Offer B** legends with token-color side markers and distinct top borders, usable without color |
| Salary inputs | Matched A/B salary and period fields | More consistent group padding, readable legends, form labels and controls without modifying values or order |
| Optional categories | Five semantic disclosures with textual completion states | Unified summary spacing, opened state, scannable **Offer A/B: Not supplied / Incomplete / Supplied** status chips; state stays text-first |
| Comparison result | Existing breakdown and neutral trade-offs | Stronger table header/divider rhythm, readable numeric cells, alternating desktop rows; mobile table-card semantics kept |
| Share / print | Existing explicit consent and disclosure | Secondary treatment using the existing canvas surface; no URL or salary handling changes |
| Mobile | Existing one-column A/B at ≤760px | Consistent card/summary gutters and button wrapping; no viewport overflow |

No invented winners or automatic financial valuations. A/B side identity persists in base and optional categories. Color is an additional differentiator alongside explicit headings; the status chip's dashed border and text clarify incomplete entries.

## Verification

- `e2e/comparison-visual-polish.spec.ts` checks 320, 375, 768, and 1280px, stable A/B identity, horizontal or stacked layout, five optional categories, status A/B differentiation, independent values when disclosures open and no document overflow.
- Existing `e2e/offer-optional-categories.spec.ts`, `e2e/offer-primary-action.spec.ts`, `e2e/offer-private-sharing.spec.ts`, privacy, focus and comparison regression tests remain in CI.
- Run formatting, lint, typecheck, all unit/component tests, browser smoke tests, Pages verification and dependency audit.
- Manual screenshot review on mobile, tablet and desktop should be completed during NP-UX-015 cross-device visual QA. No actual salary data is captured in the repository.

## Related tasks

NP-UX-011: design audit, PR #101 is still draft; this task consumes the source-level spec without merging the draft. NP-UX-014: harmonize all feedback/focus/hover states across the app, and NP-UX-015: complete cross-device visual QA.
