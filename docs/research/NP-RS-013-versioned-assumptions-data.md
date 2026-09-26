# NP-RS-013 — Versioned assumptions data

**Status:** Proposed for review  
**Task:** NP-RS-013  
**Milestone:** M1 Research  
**Depends on:** [NP-RS-003](NP-RS-003-annual-tax-parameters.md) through [NP-RS-011](NP-RS-011-bonuses-one-time-payments.md)  
**Supports:** calculation engine, reference fixtures, annual maintenance and result provenance  
**Last updated:** 2026-09-26

## Decision

NettoPilot DE shall store regulated payroll constants and calculation-rule references in immutable, year-scoped JSON assumption sets validated against [the normative JSON Schema](../../schemas/assumptions/assumption-set.schema.json).

The calculation engine must load one explicitly approved set for the requested calculation date. It must not fetch current values from the internet, silently fall back to another year, choose between overlapping records, or contain uncited regulated constants in source code.

The [2026 example](../../schemas/assumptions/examples/de-payroll-2026-example.json) demonstrates the contract only. It is partial, has production activation disabled and must never be used for a salary result.

## 1. Goals and boundaries

The contract provides:

- tax year and exact effective periods;
- stable source and parameter identifiers;
- official URLs, source locators and verification dates;
- exact typed values without binary floating-point ambiguity;
- applicability and unsupported-case gates;
- rounding stage and derivation;
- reviewer and lifecycle state;
- engine compatibility, supersession and change notes;
- reproducible version selection and historical-result metadata.

It does not:

- replace the authoritative-source review in NP-RS-001;
- make a draft or partial file production-ready;
- encode arbitrary executable code in JSON;
- merge user-entered insurer rates into official assumptions;
- treat reference fixtures as production configuration;
- infer missing rules.

## 2. Artifact layout

| Path | Purpose |
| --- | --- |
| `schemas/assumptions/assumption-set.schema.json` | Normative JSON Schema Draft 2020-12 contract |
| `schemas/assumptions/examples/de-payroll-2026-example.json` | Valid partial example with production activation disabled |
| `schemas/assumptions/README.md` | Engineering quick start and release gates |
| future `assumptions/<year>/de-payroll-<year>-v<version>.json` | Reviewed immutable production sets |
| future `assumptions/index.json` | Small registry of approved set IDs, hashes and validity periods |

Production manifests must not be created by copying the example and changing its lifecycle flag. They require complete NP-RS-003:011 extraction, source verification, fixtures and approval.

## 3. Top-level manifest

| Field | Contract |
| --- | --- |
| `schemaVersion` | Schema semantic version understood by the loader |
| `assumptionSetId` | Stable ID containing jurisdiction, year and set version |
| `calculationYear` | Calendar year selected by the calculation |
| `jurisdiction` | `DE` for this product scope |
| `description` | Human-readable purpose |
| `completeness` | Partial example, module complete or year complete |
| `lifecycle` | Draft/review/approved/retired state and approvals |
| `validity` | Inclusive effective start and end |
| `engineCompatibility` | Minimum and exclusive maximum engine versions |
| `supersedes` | Prior set replaced by this set, if any |
| `contentDigest` | SHA-256 digest for an immutable released file |
| `sources` | Embedded source registry used by this exact set |
| `parameters` | Typed, dated and sourced calculation inputs |
| `changeLog` | Versioned reasons and affected IDs |

Embedding the relevant source records makes a released set self-describing. It does not duplicate archived evidence; records point to repository evidence or explain why archival is unavailable.

## 4. Source records

Source records implement the NP-RS-001 metadata standard. Each record includes publisher, tier, titles, document type, official and retrieved URLs, jurisdiction, category, calculation years, applicability dates, publication/document version, retrieval and verification timestamps, exact locator, evidence role, status and reviewers.

A record must also provide either:

- a SHA-256 content hash and archive path; or
- a reason that evidence cannot yet be archived.

For production-critical rules, release validation requires two reviewers even though the structural schema permits one reviewer while a set is being drafted. Draft, proposed, conflicted, superseded or withdrawn evidence cannot activate a production parameter.

## 5. Parameter records

Every parameter has:

- a stable `parameterId` and category;
- an exact typed value;
- unit and effective period;
- jurisdiction and applicability conditions;
- one or more source references with exact locators and evidence roles;
- derivation and rounding contract;
- verification status, date and reviewers;
- supersession link and mandatory change note.

### Value types

| Kind | Use | Encoding |
| --- | --- | --- |
| `integer` | days, counts, integer flags | JSON integer |
| `decimal` | exact non-rate decimal | canonical decimal string |
| `money` | currency amount | integer minor units, `EUR`, scale 2 |
| `rate` | ratios and percentages | decimal string; optional basis-point cross-check |
| `enum` | controlled mode | string |
| `boolean` | exact switch | JSON boolean |
| `formula` | algorithm reference | stable procedure ID plus parameter dependencies |
| `table` | official lookup table | named columns and rows |

Money and rates must never be stored as JSON floating-point numbers. Formulas identify reviewed engine procedures; the loader must not evaluate arbitrary expressions from data.

## 6. Identifier and reference integrity

JSON Schema validates shape. The loader must additionally enforce:

1. unique `sourceId` values;
2. unique `parameterId` values;
3. every source reference resolves to exactly one embedded source;
4. every formula input resolves to one parameter in the same set;
5. every change-log ID exists or identifies an intentional removal;
6. rate decimal and basis-point encodings agree when both exist;
7. every parameter period lies inside the manifest period;
8. every source covers the parameter's calculation year and effective date;
9. applicable parameter records for the same ID never overlap;
10. required categories for a supported path are complete.

A failed invariant produces an invalid-assumptions error, not a partial numeric result.

## 7. Resolution algorithm

Given calculation date `d`, requested year `y` and engine version `e`:

1. find sets with `calculationYear = y` and `validity.effectiveFrom <= d <= effectiveTo`;
2. retain only `approved`, production-enabled, year-complete sets;
3. require `e` to fall inside the declared compatibility interval;
4. verify the canonical-file SHA-256 digest;
5. require exactly one eligible set;
6. resolve each required parameter whose effective period contains `d`;
7. evaluate applicability conditions from typed calculation inputs;
8. reject missing, overlapping, conflicted, unsupported or unverified records;
9. return values together with the set ID, version, digest, source IDs and effective periods.

Zero eligible sets is `assumptions_unavailable`. More than one is `assumptions_ambiguous`. Neither condition may fall back to “latest.”

## 8. Lifecycle and approval

| State | May change? | May calculate production results? |
| --- | --- | --- |
| `draft` | Yes | No |
| `in_review` | Only through review commits | No |
| `approved` | No; publish a new version | Yes, if all gates pass |
| `retired` | No | No new results; retain for historical reproduction |

Approval requires:

- a year-complete manifest;
- all sources and parameters verified;
- two-person review for production-critical records and the set;
- passing schema, cross-record, fixture and uncited-constant checks;
- compatible calculation-engine version;
- final canonical digest;
- documented pull request and change reason.

An approved file is immutable. Corrections create a new version; history is retained.

## 9. Versioning policy

The assumption-set version uses semantic versioning independently of the schema version.

- **Major:** incompatible meaning, identifier or algorithm contract.
- **Minor:** a new effective-period segment, parameter or supported case that preserves prior records.
- **Patch:** corrected value, locator, metadata or non-breaking clarification.

Any numeric correction still requires fixture impact analysis and explicit release notes. An emergency correction uses a new version and the same approval gates; urgency never authorizes in-place edits.

The schema version changes when consumers must understand a new document shape. The loader rejects unknown major schema versions.

## 10. Change and migration procedure

For every source revision or annual rollover:

1. open a source-change record under NP-RS-001;
2. determine effective date, affected parameters and finality;
3. add or revise source records;
4. copy the prior manifest into a new ID; never edit an approved file;
5. make the smallest dated parameter changes;
6. record classification, reason, source IDs and affected parameters;
7. validate schema and cross-record invariants;
8. regenerate or independently update affected fixtures;
9. run fast and extended NP-RS-012 conformance suites;
10. compare before/after results for boundary cases;
11. obtain the required reviews and produce the canonical digest;
12. update the registry atomically with the engine release.

A mid-year change uses distinct non-overlapping effective periods and fixtures on both sides of the boundary.

## 11. User-entered and runtime data

User inputs are not official assumptions. Insurer-specific additional rates, private premiums and scenario values stay in scenario data with origin and calculation date. They may be validated against sourced bounds but must not mutate the manifest.

The static application packages approved manifests locally. No salary input, selected assumption or calculation result is sent to a source publisher. Source URLs are opened only after an explicit user action.

## 12. Result provenance

Every numeric result must retain:

- assumption-set ID and release version;
- calculation year and effective date;
- content digest;
- engine version;
- parameter IDs used;
- source IDs used;
- warnings and result-quality state.

German and English citations are rendered from the same embedded source records. The German title and official URL remain authoritative; an English title is explanatory.

## 13. Security and failure behaviour

The loader must:

- accept only bundled allow-listed files;
- validate before use;
- prohibit dynamic code evaluation;
- cap table sizes and nesting;
- treat URLs as display metadata, not runtime dependencies;
- escape all source text before rendering;
- verify digest before activation;
- fail closed on unknown versions or incomplete provenance.

A malformed manifest must not degrade into zero deductions, a prior-year calculation or a best-effort result.

## 14. Required automated checks

The engineering implementation must add:

- Draft 2020-12 schema validation;
- uniqueness and reference-integrity validation;
- date-order and non-overlap validation;
- source-year coverage validation;
- exact rate/basis-point reconciliation;
- approval and reviewer-count gates;
- canonical digest verification;
- unsupported/applicability tests;
- no regulated numeric literal outside approved manifests;
- manifest-to-result provenance assertions;
- historical version reproduction test;
- NP-RS-012 fast and extended fixture suites.

## 15. Engineering handoff

1. Generate typed application models from or alongside the schema.
2. Build a pure manifest validator and resolver.
3. Keep decimal/rate parsing exact and money in integer cents.
4. Define stable procedure IDs for algorithms in NP-RS-002:011.
5. Create the complete 2026 source registry and parameter extraction.
6. Add canonical JSON serialization and SHA-256 calculation.
7. Add the approved-set registry and build-time bundling.
8. Expose result provenance and bilingual citations without exposing internal implementation detail.
9. Block the release if any required parameter is uncited, ambiguous or unverified.

## Acceptance check for NP-RS-013

- [x] A normative machine-readable schema is included.
- [x] Tax year, validity, source links, verification date and change notes are required.
- [x] Money and decimal encodings avoid binary floating-point ambiguity.
- [x] Source, parameter, applicability and rounding records are defined.
- [x] Lifecycle, approval and production-activation gates are defined.
- [x] Version selection and fail-closed behaviour are defined.
- [x] Immutable release, correction and migration rules are defined.
- [x] Result provenance and bilingual citation requirements are defined.
- [x] A valid partial example is clearly blocked from production.
- [x] Engineering validation and handoff requirements are documented.
