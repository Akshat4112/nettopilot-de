# NP-FND-002 — React, TypeScript, and Vite scaffold

**Status:** Proposed for review  
**Task:** NP-FND-002  
**Milestone:** M2 Foundation  
**Depends on:** NP-FND-001  
**Last updated:** 2026-09-30

## Decision

NettoPilot DE uses a client-side React application compiled with strict
TypeScript and Vite. The initial application is intentionally limited to a
semantic, responsive shell. It does not add calculation logic, persistence,
localization infrastructure, test tooling, code-quality tooling, routing, or
GitHub Pages configuration assigned to later foundation tasks.

## Runtime and package contract

| Concern | Decision |
| --- | --- |
| Package manager | npm with committed `package-lock.json` |
| Node.js | `^22.13.0 || ^24.0.0 || >=26.0.0` |
| npm | `>=10` |
| UI runtime | React 19 |
| Language | TypeScript with `strict`, unchecked-index and exact-optional-property checks |
| Development server | Vite |
| Production build | `tsc -b && vite build` |

All direct dependency versions are exact in `package.json`. Contributors and
CI must use `npm ci` for reproducible installation.

## Application entry points

- `index.html` supplies the document metadata and root element.
- `src/main.tsx` validates the root element and mounts React in strict mode.
- `src/App.tsx` renders the accessible foundation shell.
- `src/styles.css` supplies responsive styling without a component framework.
- `vite.config.ts` enables the official React plugin.

## Strictness guarantees

The application configuration enables:

- strict TypeScript checking;
- no unused locals or parameters;
- no fall-through switch cases;
- checked indexed access;
- exact optional-property types;
- isolated modules;
- no JavaScript input and no emitted TypeScript artifacts.

## Verification

Run from the repository root:

```bash
npm ci
npm run build
npm run dev
```

The production build must complete without TypeScript or Vite errors. The local
development server must render the foundation shell without a missing-root
fallback or console error.

## Deferred work

- GitHub Pages base path and route refresh behaviour: NP-FND-003
- application-layer boundaries: NP-FND-004
- formatting and linting: NP-FND-005
- unit and component tests: NP-FND-006
- browser smoke tests: NP-FND-007
- complete pull-request CI: NP-FND-008

## Acceptance checklist

- [x] React, ReactDOM, TypeScript and Vite are installed with exact versions.
- [x] The dependency lockfile supports `npm ci`.
- [x] TypeScript application and build configurations are strict.
- [x] A semantic, responsive application shell renders locally.
- [x] The production build completes successfully.
- [x] Later foundation concerns remain explicitly deferred.
