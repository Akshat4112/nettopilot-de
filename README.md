# NettoPilot DE

A free, bilingual and privacy-respecting German salary calculator and job-offer comparison tool.

NettoPilot DE is designed to help employees and job seekers understand what a gross salary could mean in everyday life, see the major deductions behind an estimated net result, and compare offers using salary, bonuses, benefits, vacation and working hours.

## Project status

The project has entered engineering foundation work. A strict React, TypeScript
and Vite application shell is available; calculation rules and user-facing
calculator flows will be added through reviewed, task-scoped changes.

## Product principles

- Deterministic and testable salary calculations
- Transparent assumptions and limitations
- German and English from the public v1
- Privacy by default and no account required for core use
- Accessible mobile and desktop experience
- Neutral offer comparison without sponsored rankings
- Educational estimates, not personalized tax, legal or financial advice

## Product documentation

- [NP-PD-001 — Public-service purpose](docs/product/NP-PD-001-public-service-purpose.md)
- [NP-PD-002 — Primary user groups and needs](docs/product/NP-PD-002-primary-user-groups.md)
- [NP-PD-003 — Version-one employment scope](docs/product/NP-PD-003-v1-employment-scope.md)
- [NP-PD-004 — Salary calculator input specification](docs/product/NP-PD-004-salary-calculator-inputs.md)
- [NP-PD-005 — Calculator output specification](docs/product/NP-PD-005-calculator-outputs.md)
- [NP-PD-006 — Offer-comparison dimensions specification](docs/product/NP-PD-006-offer-comparison-dimensions.md)
- [NP-PD-007 — Privacy model](docs/product/NP-PD-007-privacy-model.md)
- [NP-PD-008 — Launch success measures](docs/product/NP-PD-008-launch-success-measures.md)

## Research documentation

- [NP-RS-001 — Authoritative-source standard](docs/research/NP-RS-001-authoritative-source-standard.md)
- [NP-RS-002 — BMF payroll-tax algorithm research](docs/research/NP-RS-002-bmf-payroll-tax-algorithm.md)
- [NP-RS-003 — Annual tax parameters for 2026](docs/research/NP-RS-003-annual-tax-parameters.md)
- [NP-RS-004 — Pension-insurance rules for 2026](docs/research/NP-RS-004-pension-insurance-rules.md)
- [NP-RS-005 — Unemployment-insurance rules for 2026](docs/research/NP-RS-005-unemployment-insurance-rules.md)
- [NP-RS-006 — Statutory health-insurance rules for 2026](docs/research/NP-RS-006-statutory-health-insurance-rules.md)
- [NP-RS-007 — Long-term-care insurance rules for 2026](docs/research/NP-RS-007-long-term-care-insurance-rules.md)
- [NP-RS-008 — Solidarity-surcharge calculation for 2026](docs/research/NP-RS-008-solidarity-surcharge-rules.md)
- [NP-RS-009 — Church-tax handling for 2026](docs/research/NP-RS-009-church-tax-handling.md)
- [NP-RS-010 — Private health-insurance treatment for 2026](docs/research/NP-RS-010-private-health-insurance-treatment.md)
- [NP-RS-011 — Bonuses and one-time payments for 2026](docs/research/NP-RS-011-bonuses-one-time-payments.md)
- [NP-RS-012 — Official reference scenarios for 2026](docs/research/NP-RS-012-official-reference-scenarios.md)
- [NP-RS-013 — Versioned assumptions data](docs/research/NP-RS-013-versioned-assumptions-data.md)
- [NP-RS-014 — Annual maintenance process](docs/research/NP-RS-014-annual-maintenance-process.md)

## Repository workflow

Changes are developed on task-scoped branches and merged into `main` through pull requests. The foundation check verifies that the repository's required governance files remain present. See [CONTRIBUTING.md](CONTRIBUTING.md) and the [repository-foundation specification](docs/foundation/NP-FND-001-repository-foundation.md).

## Local development

Requirements: Node.js 22.12 or newer and npm 10 or newer.

```bash
npm ci
npm run dev
```

Create a verified production build with:

```bash
npm run build
```

See [NP-FND-002 — React, TypeScript, and Vite scaffold](docs/foundation/NP-FND-002-application-scaffold.md) for the current application contract and deferred foundation work.

Verify the GitHub Pages base path and deep-link refresh contract with:

```bash
npm run verify:pages
```

See [NP-FND-003 — GitHub Pages base path and refresh routing](docs/foundation/NP-FND-003-github-pages-base-path.md) for the URL and fallback-routing contract.

Run the complete local quality gate with:

```bash
npm run check
```

Individual commands are available as `npm run format:check`, `npm run lint`,
`npm run typecheck`, `npm test`, `npm run test:coverage`, and
`npm run verify:pages`. Use `npm run test:watch` during test-driven local
development. See
[NP-FND-005 — Code-quality tooling](docs/foundation/NP-FND-005-code-quality-tooling.md)
for the enforced standards and architecture-boundary rules, and
[NP-FND-006 — Unit and component test foundation](docs/foundation/NP-FND-006-test-foundation.md)
for the deterministic testing and coverage contract.

Install Chromium and run the production browser smoke suite with:

```bash
npm run test:e2e:install
npm run test:e2e
```

See
[NP-FND-007 — Playwright smoke-testing foundation](docs/foundation/NP-FND-007-playwright-smoke-testing.md)
for deterministic browser settings, artifacts, and the deferred calculation and
offer-comparison contracts.

## Architecture documentation

- [ADR-001 — Browser-first application architecture](docs/architecture/ADR-001-browser-first-application-architecture.md)

## Planned deployment

The public application is planned as a static GitHub Pages project at:

`https://akshat4112.github.io/nettopilot-de/`

## License

NettoPilot DE is open-source software available under the [MIT License](LICENSE).
