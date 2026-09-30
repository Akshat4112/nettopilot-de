# NP-FND-003 — GitHub Pages base path and refresh routing

**Status:** Proposed for review  
**Task:** NP-FND-003  
**Milestone:** M2 Foundation  
**Depends on:** NP-FND-002  
**Last updated:** 2026-09-30

## Decision

The production application is built for the GitHub Pages project path
`/nettopilot-de/`. Vite owns asset URL generation through its `base`
configuration. Application links use `import.meta.env.BASE_URL` instead of a
domain-root path.

GitHub Pages does not provide a configurable SPA rewrite. A small static
`404.html` fallback therefore preserves a requested project route in a
reserved query parameter, redirects to the project entry document, and restores
the original path with `history.replaceState` before React mounts.

## URL contract

| Concern | Contract |
| --- | --- |
| Public origin | `https://akshat4112.github.io` |
| Application base | `/nettopilot-de/` |
| Application URL | `https://akshat4112.github.io/nettopilot-de/` |
| Assets | `/nettopilot-de/assets/*` |
| Deep-link fallback | `/nettopilot-de/404.html` |
| Reserved redirect parameter | `__route` |

The redirect helper accepts only same-origin paths under
`/nettopilot-de/`. An external URL or path outside the project base is never
restored.

## Direct navigation and refresh sequence

1. A user requests a future route such as
   `/nettopilot-de/offers/compare?lang=en#summary`.
2. GitHub Pages serves the repository's `404.html`.
3. The fallback encodes the complete project path, query and fragment and
   redirects to `/nettopilot-de/`.
4. The entry document validates and restores the original same-origin project
   URL before the React entry module executes.
5. The client application can render the restored route without a server-side
   rewrite.

The fallback may initially be returned with HTTP status 404 because that is
GitHub Pages behaviour. The browser immediately replaces it with the canonical
entry URL while preserving the intended route.

## Repository artifacts

- `vite.config.ts` defines the production base path.
- `src/config/app.ts` exposes the Vite-provided base path to application code.
- `src/pages-routing.ts` contains the pure redirect and restoration rules.
- `src/pages-redirect.ts` performs the GitHub Pages fallback redirect.
- `src/pages-restore.ts` restores a validated route before application startup.
- `404.html` and `index.html` are separate Vite HTML entries that load those
  typed modules.
- `scripts/verify-pages-build.mjs` verifies output asset paths and the full
  deep-link round trip.

## Verification

```bash
npm ci
npm run verify:pages
```

The verification performs a strict TypeScript and Vite production build, checks
the generated project-relative asset URLs, confirms both Pages entry documents
load the routing helper, and exercises a direct-navigation round trip including
query parameters and a fragment.

## Deferred work

- application route definitions and layer boundaries: NP-FND-004
- complete pull-request CI: NP-FND-008
- Pages artifact upload, deployment and environment configuration: NP-FND-009

## Acceptance checklist

- [x] Production assets resolve from `/nettopilot-de/`.
- [x] Application home links respect the configured base path.
- [x] A static GitHub Pages fallback handles future client-side deep links.
- [x] Direct navigation preserves path, query parameters and fragments.
- [x] Refresh restoration rejects paths outside the project origin/base.
- [x] The production build and Pages verification pass reproducibly.
- [x] Deployment automation remains deferred to NP-FND-009.
