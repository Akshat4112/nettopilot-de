# NP-UI-002 — Accessible visual design system

**Status:** Review  
**Dependencies:** NP-UI-001 (merged PR #56)  
**Milestone:** M4 Calculator MVP

## Visual direction

A trustworthy, editorial German-finance tool rather than an AI-marketing dashboard. Reuse NettoPilot's warm neutral canvas, deep evergreen text and restrained terracotta accent. Prefer legible typography and explicit data labels over decorative gradients.

## Token contract

The reusable CSS tokens are defined in `src/styles.css`. Colours: ink, muted text, canvas, surface, border, accent, focus, error and success. Layout tokens: 4/8/12/16/24/32/48px spacing, small/medium/large radii, body font and raised shadow. All future calculator components must consume shared variables rather than introduce unrelated hardcoded colours.

## Component primitives

- `.np-panel`: bounded surface with padding and border; mobile-safe width
- `.np-field`: stacked field with associated label, explanatory hint and optionally an error message
- `.np-input-error` and `.np-field-error`: never convey invalidity by colour alone; use `aria-invalid` and `aria-describedby`
- `.np-button-primary` and `.np-button-secondary`: minimum 44px touch target, keyboard focus indicator and disabled state
- `.np-status-error` and `.np-status-success`: textual status required as well as left-edge visual accent
- `.np-results-grid`: desktop input/results columns becoming a single column below 760px

## Tables and charts

Present all financial amounts as locale-formatted EUR with the period named. Align numeric columns and use tabular numerals when appropriate. Charts must always have corresponding accessible text/table alternatives. Variance or error states must not be colour only. Unsupported/incomplete values render as labels and explanations, never fabricated zero.

## Typography, hierarchy and responsive behavior

Use body UI sans-serif and the established restrained editorial display headline. Keep line length approximately 60–75 characters for explanatory copy. Mobile layout starts at 320px, with no horizontal page overflow. Long German compound words, large salary amounts and browser zoom to 200% must not clip content. Respect `prefers-reduced-motion`.

## Accessibility acceptance tests

1. Complete every critical flow using keyboard alone.
2. Focus indicators remain visible on interactive elements.
3. Form fields retain labels, hints, errors, and programmatic associations.
4. Focus follows DOM order, never CSS visual ordering alone.
5. Text and component contrast meet WCAG AA for their intended size and state.
6. A 320px viewport and 200% browser zoom retain usable controls.
7. German and English variants fit without truncated labels.
8. Status/error/success never rely solely on colour.

## Product and privacy guardrails

Do not embed salary or PKV/PPV data into analytics, URLs or server requests. Calculator scenarios stay in browser memory by default. The design components are presentational only; the deterministic domain engine owns all numerical results.

**Handoff:** NP-UI-003 and NP-UI-004 can build input panels from these primitives; NP-UI-006/007 can compose result and deduction panels.
