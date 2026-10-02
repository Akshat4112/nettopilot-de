# Security policy

## Supported versions

NettoPilot DE is under active development before its first public versioned
release.

| Version                                        | Supported |
| ---------------------------------------------- | --------- |
| Current `main` branch                          | Yes       |
| Historical commits and untagged preview builds | No        |

After version 1.0, this table will identify supported release lines explicitly.

## Reporting a vulnerability

Do not disclose a suspected vulnerability in a public issue, discussion, pull
request, test fixture, or log.

Use the repository's private vulnerability-reporting form:

<https://github.com/Akshat4112/nettopilot-de/security/advisories/new>

Include the affected component and version, reproduction conditions, likely
impact, and any suggested mitigation. Use synthetic data only; never attach real
salary information, payslips, credentials, tokens, browser storage, or personal
information.

If private reporting is unavailable, open a public issue containing only a
request for a private contact channel. Do not include exploit details or affected
user data in that issue.

## Response targets

These are operating targets, not guarantees:

- acknowledge a private report within three business days;
- complete initial severity and exposure triage within five business days;
- target a fix or effective mitigation within seven days for critical issues and
  fourteen days for high-severity issues;
- coordinate disclosure only after a fix or mitigation is available.

Medium and low findings are prioritised according to exploitability, user impact,
and release timing.

## Handling process

1. Confirm the report privately and minimise access to the details.
2. Reproduce with synthetic data and identify affected releases, dependencies,
   and deployment surfaces.
3. Assign severity using impact and exploitability, not an advisory score alone.
4. Prepare the smallest safe fix on a private security-advisory branch when
   disclosure would create exploitation risk.
5. Add regression coverage that contains no exploit secret or personal data.
6. Run the complete CI, dependency audit, production build, and relevant browser
   checks.
7. Publish the fix, credit the reporter if requested, and document user action
   when necessary.
8. Rotate credentials and review logs only if the incident could have exposed
   them. NettoPilot DE v1 is designed not to store salary inputs server-side.

## Dependency advisories

Dependabot alerts and `npm audit` findings are triaged by reachability,
exploitability, affected environment, and severity.

- Critical and high findings block normal releases until fixed or explicitly
  mitigated in a reviewed pull request.
- Do not run `npm audit fix --force` as an unreviewed shortcut.
- Update direct dependencies and `package-lock.json` together, then run the full
  CI gate.
- A temporary exception must document the advisory, exposure assessment,
  mitigation, owner, review date, and expiry date.
- Dismissals in GitHub require a written reason and must be revisited when the
  dependency graph or application surface changes.

## Scope

Useful reports include dependency or build-chain compromise, malicious scenario
imports, cross-site scripting, unsafe URL/state sharing, browser-storage data
exposure, analytics leakage, and GitHub Pages deployment integrity problems.

General product feedback, unsupported payroll cases, and calculation disagreements
without a security impact belong in normal issues.
