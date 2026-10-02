# NP-FND-007 — Playwright smoke-testing foundation

**Status:** Proposed for review  
**Task:** NP-FND-007  
**Milestone:** M2 Foundation  
**Depends on:** NP-FND-002 and NP-FND-006  
**Last updated:** 2026-10-02

## Decision

NettoPilot DE uses Playwright with one pinned Chromium project for production
browser smoke testing. The suite builds the application, starts Vite preview at
the real `/nettopilot-de/` base path, and uses accessible roles and names to
check user-visible behaviour.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run test:e2e:install` | Install the pinned Chromium browser once per environment |
| `npm run test:e2e:list` | Compile the configuration and list discovered Chromium tests without starting a browser |
| `npm run test:e2e` | Build the production bundle and run the Chromium suite headlessly |
| `npm run test:e2e:headed` | Build and run with a visible browser for local diagnosis |
| `npm run test:e2e:ui` | Build and open Playwright's interactive test runner |

`npm run check` includes test discovery so invalid configuration or TypeScript
fails the normal quality gate without requiring a browser download. NP-FND-008
will install Chromium and run `npm run test:e2e` in continuous integration.

## Deterministic browser contract

- One Chromium project, one worker and no retries.
- Fixed desktop viewport, `en-GB` locale and `Europe/Berlin` timezone.
- Tests run against the production build through Vite preview, not the dev
  server.
- Each test owns its page state and may not depend on execution order.
- Traces, screenshots and video are retained only when a test fails.
- Browser console errors and uncaught page errors fail the active shell smoke
  test.
- Selectors use accessible roles, labels and names rather than CSS structure.

## Current smoke coverage

The active test verifies:

- the project URL returns a successful response;
- meaningful shell content is visible;
- the GitHub Pages base-path home link is correct;
- the current application-state notice is rendered; and
- no console or uncaught browser error occurs.

## Deferred product-flow contracts

The tracker asks this foundation to cover a basic calculation and a two-offer
comparison, but those product journeys do not exist yet. The suite registers
both flows as explicit `fixme` contracts rather than adding false tests or
inventing temporary UI:

- activate the calculation smoke test after NP-UI-003 and NP-UI-006;
- activate the comparison smoke test after NP-CMP-002 and NP-CMP-012.

The skipped contracts are visible in Playwright output and must be replaced by
real user journeys before the public-beta end-to-end gate.

## Scope boundaries

- Full calculation correctness belongs to NP-CALC-017 and NP-QA-001:004.
- Full offer-comparison correctness belongs to NP-QA-005.
- Cross-browser journeys belong to NP-QA-011.
- Comprehensive end-to-end journeys belong to NP-QA-007.
- CI orchestration and browser caching belong to NP-FND-008.

## Acceptance checklist

- [x] Playwright and Chromium configuration are pinned.
- [x] Production preview uses the GitHub Pages base path.
- [x] Active shell smoke testing fails on browser errors.
- [x] Calculation and comparison smoke contracts are registered explicitly.
- [x] Failure traces, screenshots and videos are configured.
- [x] Test discovery participates in the local quality gate.
- [x] CI and comprehensive-journey ownership are documented.
