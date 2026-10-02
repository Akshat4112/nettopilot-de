# NP-FND-009 — GitHub Pages deployment

## Status

Implemented for the engineering-foundation milestone. The deployment workflow is
defined in `.github/workflows/deploy-pages.yml`.

## Decision

NettoPilot DE deploys the verified Vite production bundle from `main` to the
standard GitHub Pages `github-pages` environment. Pull requests never deploy.
Production deployment starts only after the `CI` workflow completes successfully
for a `main` commit, or through an explicit manual run whose selected ref is
`main`.

The canonical public URL is:

`https://akshat4112.github.io/nettopilot-de/`

## Deployment sequence

1. A commit reaches `main`.
2. The `CI` workflow runs its quality/build and Chromium smoke jobs.
3. A successful completed `CI` run triggers `Deploy GitHub Pages`.
4. The deployment workflow checks out the exact `workflow_run.head_sha`, not a
   moving branch tip.
5. A clean runner installs the lockfile with `npm ci`.
6. `npm run verify:pages` rebuilds and verifies the production bundle, project
   base path, static assets, and deep-link fallback.
7. Only `dist/` is packaged as the one-day `github-pages` artifact.
8. A separate least-privilege job deploys the artifact and records the returned
   Pages URL on the `github-pages` environment.

## Trigger policy

| Trigger | Allowed ref | Behaviour |
| --- | --- | --- |
| Successful `CI` workflow run | `main` | Deploy the exact commit that passed CI. |
| Failed, cancelled, neutral, or skipped `CI` run | `main` | Do not build or deploy. |
| Pull request | Any | Never deploy. Pull requests validate the workflow through normal CI only. |
| Manual dispatch | `main` only | Rebuild, verify, and deploy the selected `main` commit. |
| Manual dispatch | Any other ref | Skip the deployment jobs. |

The manual path is intended for recovery and controlled redeployment. It still
performs a clean install and the full Pages build verification before upload.

## Permissions and trust boundary

The workflow declares no default token permissions. Each job receives only what
it needs:

- the build job receives `contents: read` to check out the validated commit;
- the deploy job receives `pages: write` and `id-token: write` for the official
  Pages deployment and OIDC provenance check.

The deploy job does not check out or execute repository code. It consumes only
the Pages artifact created by the successful build job. No application secrets,
personal data, salary inputs, analytics identifiers, or third-party deployment
credentials are required.

## Concurrency and environment

All production deployments share the `github-pages` concurrency group. Queued
deployments are serialized and an in-progress production deployment is never
cancelled, preventing a partially published site. The deploy job targets the
standard `github-pages` environment and sets its URL from
`steps.deployment.outputs.page_url`.

Repository Pages settings must use **GitHub Actions** as the build and deployment
source. The first post-merge run is the authoritative confirmation that the
repository setting and environment are enabled.

## Artifact contract

- The artifact contains the contents of `dist/` at its root, including
  `index.html` and `404.html`.
- Source files, test results, coverage output, dependency caches, and repository
  metadata are excluded.
- The artifact is retained for one day because the repository and lockfile are
  the durable source of truth.
- Vite's production base remains `/nettopilot-de/`.
- The existing `404.html` redirect and index restoration logic remain part of
  the deployment bundle for GitHub Pages deep links.

## Failure behaviour

- A failed CI run produces no deployment attempt.
- A failed clean install, build, Pages verification, configuration, upload, or
  deployment leaves the previous successful Pages deployment serving traffic.
- Deployment failures must be diagnosed from the named workflow step; they must
  not be bypassed by uploading `dist/` manually or publishing an unverified
  branch.
- No workflow uses force pushes, a generated deployment branch, or mutable files
  committed back to the repository.

## Rollback

Rollback is an explicit manual deployment of a known-good commit that is present
on `main`:

1. Revert the faulty change through a reviewed pull request, producing a new
   `main` commit.
2. Allow CI to validate the revert commit.
3. The successful CI run automatically rebuilds and deploys that commit.

For a transient Pages failure where source code is unchanged, rerun the failed
deployment workflow. Do not deploy a PR SHA, rewrite `main`, or reuse an artifact
whose source cannot be identified.

## Acceptance checklist

- [x] Deployment is gated by successful CI on `main`.
- [x] The exact validated SHA is checked out and rebuilt.
- [x] The production bundle is reverified before upload.
- [x] Only `dist/` is uploaded as the Pages artifact.
- [x] Build and deploy jobs use least-privilege permissions.
- [x] The deploy job exposes the environment URL.
- [x] Production deployments use safe concurrency without cancellation.
- [x] Pull requests cannot deploy.
- [x] Manual runs are restricted to `main`.
- [x] Failure and rollback behaviour are documented.
