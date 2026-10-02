# NP-FND-010 — Dependency and security maintenance

## Status

Implemented for the engineering-foundation milestone through
`.github/dependabot.yml`, `.npmrc`, `SECURITY.md`, the CI dependency audit, and
the contributor workflow.

## Objectives

- keep npm and GitHub Actions dependencies visible and routinely maintained;
- preserve reproducible installs through exact direct versions and a committed
  lockfile;
- prevent unsupported runtime versions from silently entering CI;
- give security researchers a private reporting path;
- define consistent triage, remediation, exception, and disclosure rules.

## Automated update policy

Dependabot checks npm at 06:00 and GitHub Actions at 06:30 every Monday in the
`Europe/Berlin` timezone.

| Ecosystem | Grouping | Pull-request limit | Review rule |
| --- | --- | ---: | --- |
| npm production dependencies | Minor and patch updates grouped | 5 npm PRs | Run full CI; inspect runtime and bundle impact. |
| npm development dependencies | Minor and patch updates grouped | 5 npm PRs | Run full CI; inspect tooling, test, and build changes. |
| npm major updates | One dependency per PR | 5 npm PRs | Review release notes and migration guidance; never auto-merge. |
| GitHub Actions | All action updates grouped | 3 action PRs | Review action provenance, permissions, runtime change, and workflow result. |

Dependabot targets `main`, rebases automatically when needed, and uses a `deps`
commit prefix. Automated pull requests are proposals only. No dependency PR is
auto-merged by repository code.

Dependabot security updates and alerts should be enabled in repository security
settings. Version-update configuration remains useful independently, but the
security settings are required for private advisory-based update PRs.

## Lockfile and install policy

`.npmrc` enforces:

- `package-lock=true`: npm must maintain the lockfile;
- `save-exact=true`: newly added direct dependencies are exact by default;
- `engine-strict=true`: unsupported Node.js versions fail installation;
- `audit=true`: installs retain npm's advisory check.

The authoritative dependency graph is the combination of `package.json` and
`package-lock.json`. Any dependency change must commit both files when npm changes
the lockfile. Reviewers reject manually edited lockfile content, unpinned direct
versions, install commands that bypass peer-dependency constraints, and unrelated
feature changes bundled into maintenance PRs.

Clean reproduction uses:

```bash
npm ci
npm run check
npm run audit:dependencies
```

The minimum Node.js version is 22.13.0 because the current ESLint 10 dependency
line requires Node.js 22.13 or newer. CI and Pages builds use the same minimum.

## Vulnerability policy

`npm run audit:dependencies` fails for high and critical advisories. An advisory
is then assessed for:

1. whether the vulnerable package and code path are present in the locked graph;
2. whether it executes in production, build, test, or developer-only contexts;
3. whether the vulnerable path is reachable in NettoPilot DE;
4. confidentiality, integrity, availability, and privacy impact;
5. an available patched version or practical mitigation.

Critical and high findings block normal releases until repaired or covered by a
reviewed, time-limited exception. An exception records the advisory identifier,
affected versions, reachability analysis, compensating control, owner, review
date, and expiry date. CI is not weakened merely to make an advisory disappear.

Do not apply `npm audit fix --force` automatically. Major-version changes remain
normal reviewed upgrades with migration evidence.

## Security-report handling

`SECURITY.md` routes vulnerability reports to GitHub's private advisory flow and
defines acknowledgement, triage, remediation, testing, disclosure, and reporter
credit expectations. Reports and regression fixtures must use synthetic data.
Sensitive details stay out of public issues and pull requests until coordinated
disclosure is safe.

Private vulnerability reporting must be enabled in repository security settings
for the preferred flow to work. If it is unavailable, reporters are instructed
to request a private channel publicly without disclosing details.

## GitHub Actions maintenance

Action updates receive the same review as code dependencies. Reviewers verify:

- the action still comes from the expected official publisher;
- requested token permissions have not expanded;
- inputs, outputs, Node.js runtime, artifact format, and runner requirements have
  not changed incompatibly;
- CI and deployment triggers preserve their branch and trust boundaries.

Mutable major tags are accepted for the current foundation workflows and updated
by Dependabot. A future supply-chain hardening task may pin actions to immutable
commit SHAs while retaining version comments.

## Acceptance checklist

- [x] npm version updates are scheduled weekly.
- [x] GitHub Actions updates are scheduled weekly.
- [x] Minor and patch npm updates are grouped; majors remain isolated.
- [x] Direct dependencies remain exact and the lockfile is mandatory.
- [x] Unsupported Node.js versions fail installation.
- [x] CI fails on high and critical npm audit findings.
- [x] Private vulnerability reporting and response handling are documented.
- [x] Temporary advisory exceptions require ownership and expiry.
- [x] Automated updates are reviewed and never auto-merged by repository code.
