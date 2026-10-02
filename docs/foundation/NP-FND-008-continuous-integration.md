# NP-FND-008 — Continuous integration

## Status

Implemented for the engineering-foundation milestone. The workflow is defined in
`.github/workflows/ci.yml` and is the required automated quality gate for changes
to the default branch.

## Purpose

Continuous integration must catch reproducibility, code-quality, calculation-test,
production-build, browser-smoke, and dependency risks before a change reaches
`main`. It must use the committed lockfile and run without repository write access
or project secrets.

## Trigger and execution contract

The `CI` workflow runs for:

- pull requests targeting `main`;
- pushes to `main`; and
- manual dispatches used for maintenance or diagnosis.

Only the newest run for a workflow/ref pair remains active. Superseded runs are
cancelled to avoid wasting runner time. Every job has an explicit timeout, uses a
clean GitHub-hosted Ubuntu runner, installs Node.js 22.12.0, and restores only the
npm download cache. Dependencies are always installed from `package-lock.json`
with `npm ci`.

The workflow has read-only repository-content permission. It does not receive,
require, or persist salary data, personal data, deployment credentials, or other
application secrets.

## Required checks

| Check | Command | Failure meaning |
| --- | --- | --- |
| Formatting | `npm run format:check` | A tracked source or workflow file does not match the formatter contract. |
| Lint | `npm run lint` | Code violates the zero-warning lint rules or architecture boundaries. |
| Type checking | `npm run typecheck` | TypeScript project references do not compile cleanly. |
| Unit/component coverage | `npm run test:coverage` | A deterministic test fails or the configured coverage threshold is missed. |
| Production build and Pages verification | `npm run verify:pages` | The production bundle fails or violates the GitHub Pages base-path/deep-link contract. |
| Dependency audit | `npm run audit:dependencies` | npm reports a high- or critical-severity vulnerability in the locked dependency graph. |
| Chromium smoke | `npm run test:e2e` | The production preview cannot load cleanly or an active product-flow smoke contract fails. |

The quality/build and Chromium jobs run independently so one class of failure does
not hide the result of the other. A pull request is CI-green only when both jobs
complete successfully.

## Browser-test contract

CI installs the Playwright-pinned Chromium browser and its Linux system
dependencies with the repository-local Playwright CLI. `npm run test:e2e` creates
a fresh production build and Playwright starts a fresh Vite preview; it may not
reuse a process already listening on the preview port.

The currently active application-shell smoke test must fail on page errors,
console errors, failed navigation, or incorrect project-base links. Product-flow
specifications marked `fixme` remain visible in discovery but do not become
required until their documented UI dependencies are implemented.

## Artifacts and retention

- The HTML coverage report is uploaded after every quality job when available.
- Playwright HTML reports, traces, screenshots, videos, and test results are
  uploaded only after a browser-job failure.
- CI artifacts are retained for 14 days and must never contain salary inputs,
  exported scenarios, personal identifiers, credentials, or secrets.

## Dependency-audit policy

`npm audit --audit-level=high` checks the complete locked production and
development dependency graph. High or critical findings fail CI. Lower-severity
findings may be handled in a reviewed maintenance task, but they must not be
silently suppressed in the workflow. Dependency updates remain a separate
foundation task.

If an advisory cannot be remediated immediately, any temporary exception requires
a dedicated pull request documenting the advisory, exposure assessment, chosen
mitigation, owner, and expiry date. The default workflow contains no exception
list.

## Branch-protection handoff

Once the workflow has completed successfully on its pull request, repository
settings should require these exact checks before merging:

- `Quality and build`
- `Chromium smoke`

Repository-rule configuration is an administrative GitHub setting and is not
encoded by this task. The check names above are stable interfaces and should not
be renamed without updating branch protection and this document together.

## Maintenance rules

- Keep Node.js compatible with the `engines` field and update the workflow in the
  same pull request when the minimum version changes.
- Keep GitHub Actions on supported major versions and review action updates before
  adoption.
- Do not replace `npm ci` with a mutable install or bypass lockfile validation.
- Do not make browser tests reuse an existing preview server in CI.
- Keep new required validation in a named npm script so it can run locally as well
  as in GitHub Actions.
- Treat a skipped required check, unexpected cancellation, or missing job as not
  green; rerun or repair the workflow before merge.

## Local reproduction

Run the quality/build portion with:

```bash
npm ci
npm run format:check
npm run lint
npm run typecheck
npm run test:coverage
npm run verify:pages
npm run audit:dependencies
```

Run the browser portion with:

```bash
npm ci
npx --no-install playwright install --with-deps chromium
npm run test:e2e
```

Failure artifacts are written to `playwright-report/` and `test-results/`.
