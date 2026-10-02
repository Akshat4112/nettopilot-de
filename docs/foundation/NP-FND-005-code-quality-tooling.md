# NP-FND-005 — Code-quality tooling

**Status:** Proposed for review  
**Task:** NP-FND-005  
**Milestone:** M2 Foundation  
**Depends on:** NP-FND-002 and ADR-001  
**Last updated:** 2026-09-30

## Decision

NettoPilot DE uses a single reproducible local quality gate built from Prettier,
ESLint, strict TypeScript and the existing production/Pages verification.
Warnings fail linting so a green command has one meaning locally and in the
future continuous-integration workflow.

## Commands

| Command | Purpose | Mutates files |
| --- | --- | --- |
| `npm run format` | Apply the repository's Prettier policy to maintained source and configuration files | Yes |
| `npm run format:check` | Verify formatting without changing files | No |
| `npm run lint` | Run ESLint with zero allowed warnings | No |
| `npm run lint:fix` | Apply ESLint's safe automatic fixes and then enforce zero warnings | Yes |
| `npm run typecheck` | Run the strict composite TypeScript projects without emitting application code | No |
| `npm run build` | Type-check and create the Vite production output | Creates ignored `dist/` |
| `npm run verify:pages` | Build and validate the GitHub Pages asset/deep-link contract | Creates ignored `dist/` |
| `npm run check` | Run formatting, lint, type-checking and Pages verification in order | Creates ignored `dist/` |

`npm run check` is the canonical pre-push command and the handoff for
NP-FND-008 continuous integration.

## Formatting policy

Prettier owns whitespace and wrapping for application source, scripts, root
configuration, root HTML and the README. The policy uses single quotes, no
semicolons, trailing commas and an 80-column target.

The existing research/product corpus, assumption schemas and official fixture
data are excluded from automatic whole-repository formatting. Those files are
reviewed as task-owned evidence and must not receive unrelated mechanical
rewrites during a tooling change. New executable modules and configuration must
be included in the maintained formatting globs.

## ESLint policy

The flat ESLint configuration applies:

- JavaScript's recommended correctness rules to configuration and scripts;
- strict, type-aware TypeScript-ESLint rules;
- type-aware stylistic rules that improve contract consistency;
- React Hooks and Vite React-refresh rules;
- consistent type-only imports and exports;
- zero warning tolerance;
- generated-output ignores.

Type-aware linting uses TypeScript project service, allowing source files and
Vite configuration to resolve through their owning composite projects.

## Architecture-boundary enforcement

The ESLint configuration implements the dependency direction from ADR-001:

- domain, assumptions, validation, comparison and application modules cannot
  import outward areas that they do not own;
- inner modules cannot import React/React DOM or access any global exposed by
  the browser environment;
- platform adapters cannot import calculation internals or financial state;
- presentation modules consume application contracts instead of domain
  implementations.

Rules are path-based and activate automatically as the planned architecture
directories are introduced. This is a guardrail, not a substitute for review of
data ownership and adapter design.

## TypeScript compatibility

TypeScript is pinned to 6.0.3 because the selected TypeScript-ESLint 8.71.0
toolchain supports TypeScript versions below 6.1. The prior 7.0.2 compiler is
outside that declared compatibility range. The supported compiler preserves the
repository's existing strict options, including unchecked-index and exact
optional-property checks, while avoiding ignored peer constraints.

Compiler or linter upgrades require:

1. a compatible declared version range;
2. `npm ci` without peer-dependency overrides;
3. a passing `npm run check`;
4. review of rule/configuration changes before lockfile update.

## Scope boundaries

- Unit and component test frameworks remain NP-FND-006.
- Playwright smoke tests remain NP-FND-007.
- Pull-request CI orchestration remains NP-FND-008.
- Dependency-update and advisory automation remain NP-FND-010.

## Acceptance checklist

- [x] Formatting has deterministic check and write commands.
- [x] ESLint covers JavaScript, strict typed TypeScript, React Hooks and refresh.
- [x] Architecture dependency direction is enforced for planned module areas.
- [x] Strict TypeScript has a dedicated non-emitting command.
- [x] Build and Pages verification retain strict type checking.
- [x] One `npm run check` command represents the complete current quality gate.
- [x] Tool versions and the lockfile are pinned reproducibly.
- [x] Test and CI framework work remains in its assigned follow-on tasks.
