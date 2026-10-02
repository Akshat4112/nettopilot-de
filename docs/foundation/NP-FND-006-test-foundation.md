# NP-FND-006 — Unit and component test foundation

**Status:** Proposed for review  
**Task:** NP-FND-006  
**Milestone:** M2 Foundation  
**Depends on:** NP-FND-002 and NP-FND-005  
**Last updated:** 2026-10-02

## Decision

NettoPilot DE uses Vitest for unit and component tests, React Testing Library
for user-observable component behaviour, `user-event` for realistic
interactions, jsdom for the browser-like test environment, and V8 for coverage.
All packages are pinned in the lockfile.

## Commands

| Command | Purpose |
| --- | --- |
| `npm test` | Run the complete unit and component suite once |
| `npm run test:watch` | Re-run affected tests while developing |
| `npm run test:coverage` | Run once and create text, HTML and LCOV coverage reports |
| `npm run check` | Run formatting, lint, types, coverage tests and the production/Pages verification |

Coverage output is generated under the ignored `coverage/` directory.

## Deterministic execution contract

- Tests run once outside watch mode in `npm test` and all quality gates.
- Test files do not run in parallel, and tests are not marked concurrent.
- Mocks are cleared, reset and restored between tests.
- React trees are cleaned up after every test.
- Tests must not depend on the real network, wall-clock time, random values or
  execution order. Use explicit fakes when a future module owns such a boundary.
- Every test must create its own state and must not reuse mutable fixtures.

## Test structure

- Co-locate `*.test.ts` and `*.test.tsx` files with the module they verify.
- Put shared setup and render helpers in `src/test/`.
- Prefer accessible roles, names and visible text over implementation selectors.
- Test domain modules as pure functions and presentation modules through public
  user behaviour.
- Use Arrange–Act–Assert and keep each test focused on one behaviour.

The initial suite covers the application shell as a component and GitHub Pages
route preservation as a pure unit. `renderWithUser` establishes the shared
component-test entry point for later interactive controls.

## Coverage policy

The current maintained runtime surface has a 90% minimum for branches,
functions, lines and statements. Entry scripts that only connect already-tested
modules to the browser are excluded. Coverage is a regression signal, not a
substitute for reference scenarios, boundary analysis or user-journey tests.
The included runtime surface must grow with future implementation tasks.

## Scope boundaries

- Official salary reference and golden cases remain NP-CALC-017 and NP-QA-003.
- Playwright browser journeys remain NP-FND-007 and NP-QA-007.
- Pull-request CI orchestration remains NP-FND-008.
- Accessibility automation remains NP-QA-008.

## Acceptance checklist

- [x] Vitest and jsdom are pinned and configured.
- [x] Testing Library, jest-dom and user-event are available.
- [x] Shared cleanup and render utilities are present.
- [x] Unit and component examples exercise real application behaviour.
- [x] Coverage reports and enforceable thresholds are configured.
- [x] The canonical quality gate runs the deterministic coverage suite.
- [x] Local test commands and follow-on boundaries are documented.
