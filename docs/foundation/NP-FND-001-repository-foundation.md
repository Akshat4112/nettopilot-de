# NP-FND-001 — Repository foundation

**Status:** Proposed for review  
**Task:** NP-FND-001  
**Milestone:** M2 Foundation  
**Depends on:** NP-PD-003  
**Last updated:** 2026-09-30

## Outcome

NettoPilot DE uses a dedicated GitHub repository with the minimum files and contribution workflow required for the engineering foundation:

- a project README;
- an MIT open-source license;
- a Node, TypeScript and Vite-ready `.gitignore`;
- contribution guidance;
- default code ownership;
- a pull-request template;
- a lightweight repository-foundation status check.

The repository foundation and required GitHub settings have been implemented and verified.

## Repository-file contract

| Artifact | Purpose |
| --- | --- |
| `README.md` | Product purpose, status, documentation index and deployment target |
| `LICENSE` | MIT open-source license |
| `.gitignore` | Excludes dependencies, builds, test output, caches, local environment files and editor artifacts |
| `CONTRIBUTING.md` | Task-scoped branch, review, data-safety and source requirements |
| `.github/CODEOWNERS` | Assigns the repository owner as the default reviewer |
| `.github/pull_request_template.md` | Makes task, verification, privacy and source checks explicit |
| `.github/workflows/repository-foundation.yml` | Confirms the required foundation files remain present and non-empty |

## Required repository settings

The repository settings below were configured and verified on 2026-09-30.

### 1. Public visibility

The repository was changed to **Public** and verified through GitHub repository metadata on 2026-09-30.

Verification:

- the repository is accessible without authentication;
- its GitHub API metadata reports `visibility: public`;
- the MIT license is visible from the repository landing page.

### 2. Protect `main`

The active **Protect main** ruleset (ID `24246755`) targets the default branch `main`.

Required rules:

- require changes through a pull request;
- require the `Foundation files` status check;
- require all review conversations to be resolved;
- block force pushes;
- block branch deletion;
- include repository administrators so direct pushes cannot bypass the workflow.

For a single-maintainer repository, an approval count of zero avoids making the owner unable to merge their own pull requests. Independent review remains required where the research specifications explicitly require it.

Verification:

- a direct push to `main` is rejected;
- a pull request cannot merge while the required status check fails or a conversation is unresolved;
- force push and deletion are unavailable;
- the ruleset is active and targets `main`.

## Workflow policy

All normal changes use a task-scoped branch and pull request. Approved changes are squash-merged to keep one auditable commit per task. Repository settings must not allow a failing required check or unresolved conversation to be bypassed.

## Acceptance checklist

- [x] Dedicated repository exists with `main` as its default branch.
- [x] Initial README describes the public-service product and its planned deployment.
- [x] MIT license is present.
- [x] Project-appropriate `.gitignore` is present.
- [x] Contribution, ownership and pull-request guidance are present.
- [x] Foundation status check is defined.
- [x] Repository visibility is verified as public.
- [x] Active protection for `main` is verified.

NP-FND-001 is ready for review in PR #23.
