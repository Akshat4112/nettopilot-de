# NP-RS-014 — Annual maintenance process

**Status:** Proposed for review  
**Task:** NP-RS-014  
**Milestone:** M1 Research  
**Depends on:** [NP-RS-013](NP-RS-013-versioned-assumptions-data.md)  
**Supports:** annual payroll updates, mid-year corrections, release operations and user trust  
**Last updated:** 2026-09-26

## Decision

NettoPilot DE shall treat every calculation year as a reviewed release, not as a date label placed over last year's constants.

A new year becomes available only after the applicable official sources, versioned assumptions, calculation procedures, fixtures, interface labels and warnings pass the gates in this process. If an approved set is missing, incomplete, stale for an effective change or incompatible with the engine, the affected calculation is blocked. The application must never silently substitute a prior year or an unreviewed value.

The operational checklist is maintained in [the annual-update template](templates/NP-RS-014-annual-update-checklist.md).

## 1. Scope

This process covers:

- normal calendar-year rollover;
- official publications released in stages;
- mid-year legal, rate or administrative changes;
- corrected or superseded official documents;
- source-link and evidence maintenance;
- assumptions, calculation code and reference fixtures;
- German and English explanations;
- outdated-calculator and unavailable-year behaviour;
- release, rollback and historical reproduction.

It does not authorize prediction from draft legislation. Proposed values may be tracked in an unreleased branch, but production remains on the last approved applicable set.

## 2. Maintenance principles

1. **Applicability beats publication recency.** Select evidence by effective period and jurisdiction.
2. **No silent carry-forward.** Every year-specific parameter must be positively confirmed, even if its value did not change.
3. **Separate research from approval.** The person extracting a production-critical change cannot be its only approver.
4. **Immutable released years.** Correct an approved set through a new version, not an in-place edit.
5. **Small dated changes.** A mid-year change gets a new effective segment and fixtures on both sides of the boundary.
6. **Independent expectations.** The implementation being tested must not generate its own expected values.
7. **Fail closed.** Missing, ambiguous or conflicted rules produce a named unavailable/incomplete state.
8. **Preserve history.** A calculation made with an earlier approved set remains reproducible.
9. **One release unit.** Assumptions, compatible engine code, fixtures, citations, translations and warnings ship together.
10. **Explain the year.** Every result shows its calculation year, assumption-set version and verification state.

## 3. Roles and separation of duties

One contributor may hold several roles in a small project, except that a production-critical source or parameter needs an independent second reviewer.

| Role | Accountabilities | May approve own production-critical extraction? |
| --- | --- | --- |
| Maintenance owner | Opens yearly work, coordinates dependencies, owns completion record | No |
| Source researcher | Finds final official material, records metadata, effective dates and exact locators | No |
| Calculation engineer | Updates procedure mappings, assumptions loader and engine behaviour | No, when also researcher |
| Fixture maintainer | Updates independent official and source-derived expectations | No, when also calculation implementer |
| Independent calculation reviewer | Verifies interpretation, derivation, rounding and fixture independence | Yes, for work they did not author |
| UX and language reviewer | Checks German/English labels, citations, warnings and accessibility | May approve presentation only |
| Release approver | Confirms all gates and activates the set | No, if sole author of the material change |
| Incident owner | Assesses urgent defects, disables affected paths and coordinates correction | Subject to normal correction review |

The pull request must name the people acting in each required role. “Repository owner” is not a substitute for independent review.

## 4. Annual operating calendar

Dates are planning targets. Source finality and effective dates control activation.

| Window relative to 1 January | Work |
| --- | --- |
| Continuous | Monitor accepted official publishers, broken links, corrections and enacted changes |
| T-180 to T-120 | Open the next-year maintenance record; inventory likely changes and pending instruments |
| T-120 to T-90 | Collect final laws, ordinances, social-insurance values and official notices as published |
| T-90 to T-60 | Verify sources; draft the new assumption set; identify unsupported or unresolved paths |
| T-60 to T-30 | Implement year module and dated rules; update fixtures, citations and bilingual content |
| T-30 to T-14 | Run complete regression, independent review and release-candidate checks |
| T-14 to T-1 | Approve and package the new set; keep activation date-controlled |
| Effective date | Activate only the approved compatible set and verify the public build |
| T+1 to T+30 | Compare production metadata and feedback with the release; close the maintenance record |

If final authoritative material arrives later, the affected stage moves later. A calendar target never justifies a guessed release.

## 5. Source inventory

The maintenance owner creates one record for the target year and checks every category.

| Category | Expected authority or artifact | Owning research specification |
| --- | --- | --- |
| Wage-tax procedure | Final BMF machine Programmablaufplan, interfaces and corrections | NP-RS-002, NP-RS-003 |
| Tax allowances and tariff values | Applicable BMF plan, law and official tables | NP-RS-003 |
| Pension insurance | Rate, contribution ceiling and allocation rules | NP-RS-004 |
| Unemployment insurance | Rate, ceiling and allocation rules | NP-RS-005 |
| Statutory health insurance | General rate, published average additional rate, BBG and JAEG | NP-RS-006 |
| Long-term care insurance | Base rate, childless surcharge, child discounts and Saxony allocation | NP-RS-007 |
| Solidarity surcharge | Thresholds, taper, cap and assessment-base rules | NP-RS-008 |
| Church tax | State rates, bases, rounding and source admission gates | NP-RS-009 |
| Private insurance | Employer-subsidy rules and annual caps | NP-RS-010 |
| Bonuses and one-time pay | Allocation, proportional ceilings, March clause and PAP inputs | NP-RS-011 |
| Reference evidence | Official BMF tables/interfaces and source-derived boundary cases | NP-RS-012 |

For each category, record one of:

- changed and verified;
- unchanged and re-verified for the new year;
- not applicable;
- pending final source;
- conflicted;
- unsupported.

Blank is not a status.

## 6. Change detection

Change detection is evidence collection, not automatic production configuration.

### Scheduled checks

During annual preparation, check official publisher pages at least at each operating-calendar stage. After activation, check again when an authority announces a correction or the product receives a credible discrepancy report.

For each accepted source:

1. resolve the canonical URL;
2. record the final redirected URL;
3. compare document identifier, publication/update date and finality;
4. compare the stored content hash where archival is permitted;
5. compare the exact cited section, table, variable or schema path;
6. record whether the effective period changed;
7. classify the finding.

### Finding classifications

| Classification | Meaning | Required response |
| --- | --- | --- |
| No change | Same applicable rule and evidence | Record re-verification date |
| Metadata only | URL, title or non-substantive metadata changed | Review and issue a patch version if bundled metadata changes |
| Parameter change | Rate, threshold, allowance or table value changed | Update assumptions and affected fixtures |
| Algorithm change | Sequence, branch, base or rounding changed | Update engine procedure and conformance tests |
| Scope change | A supported case gains or loses legal validity | Product-scope and UX review |
| Correction | Authority corrects an applicable publication | Impact assessment and new immutable patch |
| Conflict | Applicable official sources disagree | Block affected path until resolved |
| Withdrawal | Evidence is withdrawn or no longer final | Remove activation through a reviewed replacement or disable path |

Automated link or hash checks may open a review issue. They may not approve a source, change a parameter or activate a set.

## 7. Responsible repository artifacts

Paths marked “future” become mandatory when the engineering foundation creates them.

| Artifact | Annual action | Owner |
| --- | --- | --- |
| `docs/research/NP-RS-002:011` | Add a dated addendum or successor note for changed interpretations | Source researcher |
| `schemas/assumptions/assumption-set.schema.json` | Change only if the data contract changes | Calculation engineer + schema reviewer |
| `assumptions/<year>/de-payroll-<year>-v<version>.json` (future) | Create complete approved year set; never overwrite released file | Source researcher + calculation engineer |
| `assumptions/index.json` (future) | Register the approved set, digest and validity atomically | Release approver |
| `fixtures/reference/<year>/bmf-annual-wage-tax-check-table.csv` | Import the final official table and verify dimensions/content | Fixture maintainer |
| `fixtures/reference/<year>/nettopilot-reference-scenarios.json` | Add component, boundary, admission and changed-rule scenarios | Fixture maintainer |
| year-specific calculation module (future) | Implement the final BMF procedure and changed rule logic | Calculation engineer |
| assumptions validator/resolver (future) | Confirm compatibility with the new schema/set | Calculation engineer |
| German/English messages and citations (future) | Update year, value, warning and source wording together | UX/language reviewer |
| release notes and public metadata (future) | Publish supported years, versions, hashes and known limitations | Release approver |
| this checklist record | Preserve decisions, evidence, reviewers and sign-off | Maintenance owner |

Unchanged files still require an explicit “reviewed, no change required” entry in the maintenance record.

## 8. Annual workflow

### Stage A — Open and baseline

- create the checklist from the template;
- name the target year, maintenance owner and planned activation date;
- record the currently released set, engine version and fixture set;
- inventory supported and intentionally unsupported cases;
- freeze a reproducible prior-year baseline report.

Exit gate: the work has an owner, target, baseline and complete category inventory.

### Stage B — Discover and qualify sources

- search only accepted official publishers first;
- distinguish final documents from drafts and announcements;
- capture NP-RS-001 source metadata and archived evidence;
- identify effective dates, transitional rules and corrections;
- list unresolved conflicts and missing official implementation material.

Exit gate: every category has a recorded status; unresolved production dependencies are visible.

### Stage C — Extract and review rules

- map every changed or re-verified source to stable parameter and procedure IDs;
- record exact values, units, derivations and rounding stages;
- compare with the previous approved set;
- explain every added, removed or changed value;
- obtain independent review for production-critical records.

Exit gate: no candidate, conflicted, uncited or single-reviewed production-critical input remains.

### Stage D — Build the versioned set

- create a new immutable assumption-set ID;
- use exact decimal strings and integer money units;
- set complete effective periods and engine compatibility;
- update the change log and supersession links;
- validate schema and cross-record invariants;
- keep production activation disabled until final approval.

Exit gate: the set is structurally valid, year-complete and reviewable but not yet active.

### Stage E — Implement calculation changes

- implement changed procedure IDs and dated branches;
- preserve old-year modules;
- reject unknown years and incompatible sets;
- remove or replace any regulated literal duplicated outside assumptions;
- propagate result provenance through every supported output.

Exit gate: the engine can deterministically select the target set without affecting historical selection.

### Stage F — Update independent fixtures

- obtain the official BMF check table/interface expectations where available;
- update source-derived expectations independently from engine output;
- add one-cent-below, exact-boundary and one-cent-above cases;
- add before/after cases for every effective-date change;
- add admission cases for every unresolved or unsupported path;
- document fixture provenance and tolerances.

Exit gate: changed behavior has an independent oracle or an explicit admission gate.

### Stage G — Regression and review

Run all gates in section 9. Review the result diff, warnings, citations and translations. Any unexplained cent change is a failure.

Exit gate: all required checks pass, reviewers sign, and known limitations are published.

### Stage H — Release and activate

- mark the set approved with two reviewers;
- produce canonical JSON and digest;
- register the set atomically with the compatible engine;
- package it locally in the static application;
- deploy before but activate no earlier than its effective date;
- smoke-test the public build with a known fixture;
- confirm no salary inputs or results leave the browser.

Exit gate: the production application reports the intended set, year, digest and engine version.

### Stage I — Post-release

- verify public metadata and both language journeys;
- monitor calculation errors and privacy-safe feedback;
- compare reported discrepancies with reference fixtures;
- retain the prior release and rollback instructions;
- close the checklist only after all follow-up items have owners.

## 9. Regression requirements

### Mandatory automated gates

| Gate | Required evidence |
| --- | --- |
| Schema | Assumption set validates against the supported JSON Schema |
| Cross-record integrity | Unique IDs, resolvable sources/formulas, valid periods and no overlaps |
| Approval | Year complete, approved, production enabled and independently reviewed |
| Digest | Canonical content matches the registered SHA-256 |
| Engine compatibility | Target engine is inside the declared version interval |
| Uncited constants | No regulated production constant exists outside approved assumptions |
| Unit/component tests | Tax and every social-insurance/tax component pass exact rounding cases |
| BMF conformance | All official BMF expectations available for the year pass exactly |
| Source-derived fixtures | Every applicable NP-RS-012-style component case passes exactly |
| Boundary tests | Below/at/above thresholds and every dated transition pass |
| Admission tests | Missing, unsupported and conflicted cases return no normal number |
| Historical replay | Previously approved years still reproduce their recorded results |
| Result provenance | Outputs report the actual set, digest, engine, year and sources |
| Locale | German and English labels, amounts, dates, warnings and citations are correct |
| Accessibility | Updated warning and result paths pass keyboard and assistive checks |
| Privacy/network | Calculation produces no prohibited analytics payload or outbound salary data |
| Static production build | Bundled files load under the GitHub Pages base path without runtime source fetching |

### Result-diff review

Generate a comparison across representative salary bands, tax classes, insurance paths, states and bonus cases.

Every difference must be classified as:

- expected rule change;
- expected parameter change;
- expected source/metadata change with no result effect;
- intended product behavior change;
- defect.

Unclassified differences block release. The report must show the first changed component, not only net-pay totals.

### Historical protection

The new release must run at least one fixture from every previously supported year. Historical results use their original approved assumption set and compatible engine path. A new year's default must not rewrite old saved or shared scenarios.

## 10. Outdated-calculator states

“Outdated” is determined from the requested calculation date, packaged approved sets and known effective changes. It is not based only on today's calendar year.

| State | Condition | Calculation behaviour |
| --- | --- | --- |
| Current | Exactly one approved compatible set covers the requested date | Calculate normally and show year/version |
| Update pending | A recorded change has not yet reached its effective date; approval may still be pending | Continue only with the currently applicable set; show the future effective date and dated notice |
| Affected rule stale | A known change is already effective but the applicable set is not approved | Block affected result; do not use old value |
| Year unavailable | No approved set covers the requested year/date | Block calculation |
| Assumptions ambiguous | Multiple sets or parameter segments qualify | Block calculation and report internal configuration error |
| Set invalid | Schema, digest, approval or compatibility check fails | Block calculation |
| Retired/withdrawn | Set was withdrawn for new results | Block new calculation; preserve historical record |
| Historical supported | Approved historical set covers explicitly selected past date | Calculate and label as historical |

A warning must never sit beside a number that was produced with knowingly inapplicable assumptions.

## 11. Warning contract

Warnings appear before calculation where possible and remain attached to any result they qualify.

### German

| Code | User-facing text |
| --- | --- |
| `update_pending` | „Für den gewählten Zeitraum ist eine Änderung angekündigt. Bis zum Wirksamkeitsdatum gelten weiterhin die angezeigten Annahmen.“ |
| `affected_rule_stale` | „Diese Berechnung ist vorübergehend nicht verfügbar, weil eine bereits wirksame Regel noch geprüft wird. Es wurden keine alten Werte verwendet.“ |
| `year_unavailable` | „NettoPilot DE unterstützt das ausgewählte Berechnungsjahr noch nicht. Ein anderes Jahr wird nicht automatisch verwendet.“ |
| `assumptions_invalid` | „Die Berechnungsgrundlagen konnten nicht sicher geladen werden. Es wurde kein Ergebnis berechnet.“ |
| `historical_supported` | „Historische Berechnung mit den für {year} freigegebenen Annahmen, Version {version}.“ |

### English

| Code | User-facing text |
| --- | --- |
| `update_pending` | “A change has been announced for the selected period. The displayed assumptions remain applicable until its effective date.” |
| `affected_rule_stale` | “This calculation is temporarily unavailable because an already-effective rule is still being verified. No old value was used.” |
| `year_unavailable` | “NettoPilot DE does not yet support the selected calculation year. Another year will not be used automatically.” |
| `assumptions_invalid` | “The calculation assumptions could not be loaded safely. No result was calculated.” |
| `historical_supported` | “Historical calculation using the approved {year} assumptions, version {version}.” |

Each warning includes:

- requested calculation date/year;
- latest applicable approved year, if useful;
- affected component or whole-calculation scope;
- last verification date;
- status page or release-note link when available;
- no speculative completion date.

## 12. Partial availability

A component may continue only when it is independent of the stale rule and the interface cannot imply a complete net result.

Rules:

- a blocked deduction is not replaced with zero;
- net pay, total deductions, effective rates and offer-comparison totals are unavailable if any required component is blocked;
- unaffected educational component outputs may be shown only as partial and separated from totals;
- exports and share links retain the incomplete state and reason code;
- couple totals are unavailable if either individual result is incomplete;
- the UI must not rank an offer using incomplete financial totals.

## 13. Mid-year and emergency corrections

### Normal mid-year change

1. open a change record and classify the source;
2. verify effective date and transitional rules;
3. create a new immutable assumption-set version containing the compatible dated parameter segment; never add a segment to an already approved set;
4. add before/after boundary fixtures;
5. run the full affected-module suite plus extended conformance;
6. publish and activate by requested calculation date;
7. retain the previous version for reproduction.

### Emergency correction

Use when a released result is materially wrong, an official source is corrected, or integrity/compatibility fails.

1. disable the affected calculation path or set immediately through the safest available release mechanism;
2. show `affected_rule_stale` or `assumptions_invalid`;
3. record affected years, paths, versions and known impact;
4. prepare a new immutable patch version;
5. complete independent source and calculation review;
6. run all affected tests and historical replay;
7. release with a correction note;
8. do not identify users or reconstruct salary inputs;
9. document whether previously shared/exported results need a general public notice.

Urgency does not permit editing an approved manifest in place or skipping independent review.

## 14. Rollback

A rollback restores the last approved compatible application release and assumption registry only if that version remains legally applicable for the requested date.

If no applicable safe version exists:

- keep the affected path disabled;
- show a clear unavailable state;
- leave historical sets accessible only for dates they cover;
- do not roll back to an inapplicable prior-year constant.

Record the rollback commit, set IDs, reason, start/end times and verification result without logging salary data.

## 15. Release evidence and sign-off

The maintenance pull request must contain or link:

- completed annual checklist;
- source inventory and unresolved-items register;
- previous-versus-new assumptions diff;
- source/parameter/procedure mapping;
- fixture provenance and change list;
- full regression report;
- representative result-diff report;
- German and English warning/citation review;
- accessibility and privacy/network checks;
- release and rollback instructions;
- named researcher, independent reviewer and approver;
- assumption-set ID, schema version, digest and engine compatibility;
- known limitations and unsupported cases.

Approval statement:

> I verified that the listed sources are final and applicable, every production parameter and changed procedure is traceable, regression gates passed, warnings accurately describe unavailable cases, and no prior-year value is used outside its effective period.

## 16. Annual completion criteria

The yearly update is complete only when:

- all source categories have explicit dispositions;
- all required official sources are final and verified;
- the assumption set is year-complete and independently approved;
- changed algorithms and dated branches are implemented;
- official and source-derived fixtures pass exactly;
- boundaries and unsupported cases fail safely;
- prior supported years reproduce correctly;
- bilingual citations and warnings are reviewed;
- privacy, accessibility and static-build gates pass;
- the production build reports the intended version metadata;
- rollback is tested or demonstrably available;
- the maintenance record is preserved.

## 17. Engineering handoff

Implementation tasks should create:

1. a year-support registry with approved set IDs, validity, digests and engine ranges;
2. a build command that runs all release gates;
3. a source-link/hash monitor that only opens review findings;
4. an assumptions diff grouped by source, parameter and effective date;
5. a representative result-diff report by component;
6. a UI availability state machine using the warning codes in this specification;
7. a release manifest shown in the application;
8. historical replay tests;
9. a safe component-disable mechanism;
10. a reusable checklist issue or pull-request template based on the included Markdown file.

## Acceptance check for NP-RS-014

- [x] A yearly operating calendar is defined.
- [x] Roles and independent-review rules are defined.
- [x] Every research and future engineering artifact has an owner.
- [x] Source discovery, change detection and conflict handling are defined.
- [x] Assumptions, engine, fixtures, UI and release stages have exit gates.
- [x] Complete regression and historical-replay requirements are defined.
- [x] Outdated, unavailable, ambiguous and invalid states fail closed.
- [x] German and English warning text is specified.
- [x] Mid-year changes, emergency corrections and rollback are covered.
- [x] A reusable annual-update checklist is included.
