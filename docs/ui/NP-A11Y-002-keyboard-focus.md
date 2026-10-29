# NP-A11Y-002 — Keyboard navigation and focus

## Acceptance contract

- The first Tab stop is a visible “Skip to main content” link. Enter moves focus to the main landmark.
- Native fields, selects, checkboxes, buttons and disclosures keep their browser keyboard behavior and DOM order. No positive tab indices or focus traps are introduced.
- Submitting salary inputs with Enter moves focus to the first invalid field in DOM order. If that field is inside a closed disclosure, the disclosure opens first.
- With valid fields, missing payroll confirmation receives focus. A confirmed submission moves focus to the salary result, including an explicit unavailable result.
- Calculate net compensation moves focus to the current offer results. Recalculation can deliberately focus the existing results again.
- Salary reset returns focus to gross salary; payroll-assumption reset returns focus to comparison tax class.
- Editing a draft, changing a display period or expanding a disclosure does not move focus away from the control being used.
- Focus rings cover native disclosures and programmatic main/result destinations as well as input controls and links.

## Verification

`e2e/keyboard-navigation.spec.ts` exercises keyboard activation and browser focus. Fixture setup uses Playwright field filling/selecting where native date and select editing differs across platforms; submission, confirmation, disclosure activation, period selection and reset use Enter, Space and Tab without pointer clicks.

Initial Chromium RED verification on 2026-10-29 found all four intended gaps: missing skip link, no salary invalid-input focus, inconsistent disclosure outline, and no offer-results focus. Salary forms already opt out of native validation, so browser constraint validation does not intercept their application-level validation route.

After implementation, all four Chromium keyboard journeys pass. The focused component regression run passes 27 tests across the focus helper, essential salary inputs, salary summary and offer net compensation. Type checking, production build, focused ESLint and formatting checks pass. The coordinator runs the complete integrated suite.

Focus moves in a layout effect only when an explicit submit, calculate or reset action records a new request. Live edits therefore retain focus. The shared helper opens enclosing disclosures and resolves a group-level invalid state to its first enabled control. Result regions use `tabIndex={-1}`, keeping them out of normal Tab order while allowing deliberate result focus.

These checks verify Chromium keyboard behavior and DOM focus. Screen-reader announcements and platform-specific native date/select popups require manual assistive-technology testing.

Privacy and calculation rules are unchanged: focus management neither stores drafts nor creates network requests, and unsupported payroll cases remain unavailable.
