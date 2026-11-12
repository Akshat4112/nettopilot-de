# NP-UX-014 — Consistent interaction and feedback states

## Implementation slice

Applies one semantic state system across existing inputs, buttons, disclosures and status messages without modifying finance data, validation logic, URL sharing or focus destinations.

| State | Existing semantics | Visual treatment / verification |
| --- | --- | --- |
| Normal | Native control | Existing input/background tokens remain |
| Keyboard focus | `:focus-visible` | Existing 3px focus outline retained on all controls |
| Hover | Enabled buttons, disclosures and inputs | Secondary/primary tokens and higher contrast border |
| Disabled | Native `:disabled` | Border and color distinguish from enabled; cursor not-allowed, no opacity-only cue |
| Invalid | `aria-invalid=true`, browser `:user-invalid` | Error-color border and inset ring; alert labels remain nearby |
| Unsupported/incomplete | Existing visible reason and role=status | Preserve status copy and avoid showing fabricated salary |
| Calculating | Optional `aria-busy=true`/`data-state=calculating` | Cursor-only affordance for **actual** busy state; don't fake asynchronous work |
| Success | Existing validated calculation and supported status | Existing semantic labels and success border token; no green success purely from unvalidated form |
| Empty | Existing missing-input guidance | Neutral, no invented zero salary |
| Reduced motion | `prefers-reduced-motion` | Disable transient control animations and keep high-contrast focus |

New `e2e/interaction-states.spec.ts` tests focus/error/hover/disabled/disclosure behavior at 375 and 1280px and reduced motion. No app component props, validation, calculation engine, copy or ARIA announcements are modified.

## Dependencies and limitations

Remaining NP-UX-004 validation wording, NP-UX-006 result editing state, NP-A11Y-003 screen-reader announcements and NP-UX-011 review must be completed separately; this PR does not claim to close those dependencies. Do not merge with failing accessibility or mobile browser checks. Follow-up end-to-end visual/contrast review belongs to NP-UX-015.

## Regression

Run formatting, lint, TypeScript, unit/component, Chromium, Pages verification and dependency audit. Maintain no horizontal overflow at 320/375/768/1280 widths and independent salary/comparison states.
