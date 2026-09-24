# NP-RS-001 — Authoritative-source standard

**Status:** Proposed for review  
**Task:** NP-RS-001  
**Milestone:** M1 Research  
**Depends on:** [NP-PD-003](NP-PD-003-v1-employment-scope.md)  
**Supports:** All research, assumption, calculation and verification tasks  
**Last updated:** 2026-09-24

## Purpose

NettoPilot DE calculates high-impact financial estimates from German tax and social-insurance rules. Every legal rule, rate, threshold, rounding instruction, eligibility condition and explanatory claim that can affect a result must be traceable to evidence appropriate for that rule.

This standard defines:

- which sources are authoritative;
- how sources are selected, recorded and verified;
- how conflicts and revisions are handled;
- how evidence maps to calculator parameters and test fixtures;
- how link rot and archived evidence are handled;
- how annual and urgent reviews work;
- how uncited regulated constants are prevented from reaching production;
- how citations are presented in German and English.

The standard does not itself approve any tax-year parameter. Each parameter requires a verified source record and reviewed assumption entry.

## 1. Core policy

1. **Use the governing primary source.** Prefer promulgated law, the legally applicable regulation or the officially designated calculation specification.
2. **Match source to claim.** A statute may govern scope while an official machine-calculation plan governs algorithm steps and rounding.
3. **Record applicability, not only publication.** A newer publication may apply to a future period and must not replace a source effective for the selected year.
4. **Trace every regulated value.** Production parameters and legal branches require one or more verified source IDs.
5. **Separate evidence from interpretation.** Source records preserve what the publisher says; assumption records document how NettoPilot DE implements it.
6. **Preserve the original German authority.** English text helps users but does not replace the German legal or administrative source.
7. **Treat official summaries as summaries.** They may explain a rule but do not override the promulgated or formally applicable text.
8. **Do not source by popularity.** Search ranking, calculator prevalence or repeated secondary citation does not establish authority.
9. **Fail closed on material uncertainty.** An unresolved conflict or missing applicable source blocks the affected calculation path or release.
10. **Keep evidence reproducible.** Store metadata, relevant extracts, retrieval date, content hash and repository-managed evidence where permitted.

## 2. Source hierarchy

The hierarchy is issue-specific. “Higher” means stronger authority for the claim it governs, not that one document answers every implementation question.

### Tier 1 — Promulgated law and legally binding instruments

Use for statutory scope, legal conditions, rates, delegation, effective dates and binding changes:

- Bundesgesetzblatt on the federal promulgation platform at recht.bund.de;
- applicable federal laws and regulations;
- official state law and official state gazettes;
- legally effective ordinances;
- binding court decisions only when directly necessary to the supported scope;
- official church-tax laws or ordinances for the applicable state and recognised body.

When enactment history or exact promulgated wording matters, the Federal Law Gazette is the controlling publication source.

### Tier 2 — Official consolidated law

Use for readable, current consolidated provisions and cross-references:

- Gesetze im Internet, provided by the Federal Ministry of Justice and Federal Office of Justice;
- official state-law portals;
- official consolidated versions linked by the responsible authority.

Consolidated text is preferred for day-to-day research, but the record must still identify the applicable version/effective period. If consolidation timing is unclear, verify against promulgation.

### Tier 3 — Official calculation programs and formal implementation instructions

Use where law or administration defines an operational calculation method:

- final BMF Programmablaufplan for machine wage-tax calculation;
- final BMF notices and letters applicable to payroll withholding;
- official schemas, interface descriptions and calculation examples;
- formal common principles or circulars issued by legally responsible social-insurance bodies;
- final administrative instructions from the competent federal or state authority.

For wage-tax algorithm steps, variables and rounding, the final applicable BMF machine Programmablaufplan is the primary implementation specification. Drafts are not production evidence.

### Tier 4 — Official parameter publications and competent-body guidance

Use for verified operational values and explanations when they are within the publisher’s competence:

- Federal Ministry of Finance;
- Federal Ministry of Labour and Social Affairs;
- Federal Ministry of Health;
- Federal Central Tax Office and official tax-administration portals;
- German Pension Insurance;
- Federal Employment Agency;
- GKV-Spitzenverband;
- Federal Office for Social Security;
- individual statutory health insurer for its own additional contribution rate;
- competent state finance ministry or tax administration;
- other public authority responsible for the specific rule.

An official summary is corroborating evidence when a higher-tier source defines the value. It may be the direct source for a publisher-controlled value, such as an insurer’s own rate, when no higher instrument publishes that individual value.

### Tier 5 — Official explanatory and educational material

Use for user-facing explanations and research discovery:

- official FAQs;
- official brochures;
- official examples;
- official press releases;
- official calculators and explanatory tools.

These sources may support plain-language explanations or cross-checks. They must not silently replace a more specific applicable legal or algorithmic source.

### Tier 6 — Secondary and tertiary sources

Examples include professional commentary, payroll vendors, tax advisers, insurers discussing rules outside their own rate, academic material, media, blogs, forums and commercial calculators.

Secondary sources may:

- identify a potentially relevant rule;
- provide implementation insight;
- expose an edge case;
- cross-check an independently sourced result;
- help locate the primary source.

They may not be the sole production evidence for a regulated rate, threshold, formula, eligibility branch or rounding rule.

## 3. Accepted official publisher registry

The registry records publisher competence, not a permanent trust exemption. A valid domain can host drafts, press material and outdated pages; every item still requires document-level review.

| Publisher/body | Typical official domain | Accepted use |
| --- | --- | --- |
| Federal promulgation platform | recht.bund.de | Federal Law Gazette, promulgated federal laws and ordinances |
| Federal Ministry of Justice / Federal Office of Justice | gesetze-im-internet.de | Consolidated federal statutes and regulations |
| Federal Ministry of Finance | bundesfinanzministerium.de | Wage-tax plans, BMF letters, tax guidance and data products |
| BMF tax calculator service | bmf-steuerrechner.de | Official wage/income-tax calculation cross-checks where applicable |
| Federal Central Tax Office | bzst.de | Federal tax administration information within its competence |
| Federal tax administrations | finanzamt.de and official state finance domains | State/federal tax guidance and responsible-office information |
| Federal Ministry of Labour and Social Affairs | bmas.de | Social-insurance ordinances, thresholds and labour/social policy guidance |
| Federal Ministry of Health | bundesgesundheitsministerium.de | Health/care rates, rules and official guidance |
| GKV-Spitzenverband | gkv-spitzenverband.de | Common principles, contribution facts and statutory-insurance operational guidance |
| Federal Office for Social Security | bundesamtsozialesicherung.de | Supervision and official social-insurance material |
| German Pension Insurance | deutsche-rentenversicherung.de | Pension contribution information and official calculation guidance |
| Federal Employment Agency | arbeitsagentur.de | Unemployment-insurance guidance within its competence |
| Federal Government | bundesregierung.de | Official summaries and policy announcements; corroborating unless governing source |
| State legal/gazette portals | Verified official state domains | State law, church-tax law and state-specific effective rules |
| Individual statutory health insurer | Verified insurer domain | That insurer’s published additional contribution rate and effective date |

Rules:

- use HTTPS canonical URLs;
- verify that the page identifies the competent publisher;
- do not accept a mirrored PDF merely because it reproduces an official logo;
- record redirects and the final canonical URL;
- confirm whether the item is final, draft, archived, corrected or superseded;
- add a new publisher only through reviewed registry change.

## 4. Claim-to-source routing

| Claim type | Required primary evidence | Recommended corroboration |
| --- | --- | --- |
| Statutory tax rule | Applicable EStG/other law and amendments | BMF guidance or official explanation |
| Wage-tax algorithm | Final applicable BMF machine Programmablaufplan | Official BMF calculator/example and statutory basis |
| Solidarity surcharge | Applicable law plus PAP where payroll calculation is involved | BMF explanation |
| Church-tax rate/treatment | Applicable state law/ordinance and competent state authority | State tax guidance |
| Social-insurance ceiling | Final applicable ordinance/law | BMAS, BMG, DRV or GKV factsheet |
| Pension contribution rate | Applicable SGB/regulation or formal rate instrument | DRV official values |
| Unemployment contribution rate | Applicable SGB/regulation | BMAS/DRV/BA official publication |
| Statutory health base rate | Applicable SGB provision | BMG/GKV official guidance |
| Average additional contribution | Formal BMG publication for the applicable year | BMG/GKV summary |
| Insurer-specific additional rate | Insurer’s official publication and effective date | GKV list or corroborating official source |
| Care-insurance rate/child rules | Applicable SGB XI/instrument | BMG/GKV official guidance |
| Private-insurance employer subsidy cap | Applicable legal provisions and year-specific ceilings | BMG/DRV/GKV official explanation |
| Federal-state identifier | Official federal/state registry | None normally required |
| User-facing explanation | Same governing evidence as underlying calculation | Official FAQ/brochure |

## 5. Source acceptance rules

A source is accepted only when all relevant checks pass:

- publisher identity is verified;
- authority/competence matches the claim;
- document is final, not merely a draft or proposal;
- applicability covers the calculation year and period;
- jurisdiction covers the supported user case;
- relevant provision, table, variable or paragraph is identifiable;
- publication and amendment status are understood;
- source is consistent with higher-tier governing evidence or a conflict record exists;
- source metadata is complete;
- reviewer confirms the extraction and mapping;
- archived evidence is stored or an explicit non-archivable reason is recorded.

A page being “official” is not sufficient if it is outdated, outside the publisher’s competence, a proposal, or too general for the implemented rule.

## 6. Draft, proposal and pending-law handling

Draft bills, cabinet decisions, consultation drafts, forecasts and press reports are not production sources.

They may be recorded with status proposed for planning purposes, but:

- they never populate a released assumption set;
- the interface never presents them as current law;
- tests based on them are isolated from released-year fixtures;
- implementation may be prepared behind an unreleased version only;
- final promulgation and applicable operational guidance must be verified before activation.

When a final rule is promulgated but a required operational plan is pending, the affected year remains not fully supported unless a reviewed calculation specification can be implemented directly from controlling law without guessing.

## 7. Source-record schema

Every evidence item receives a stable source record.

### 7.1 Identity and provenance

| Field | Requirement |
| --- | --- |
| source_id | Required stable repository identifier |
| publisher_name | Required official publisher |
| publisher_type | Required enum: legislature, ministry, authority, self_government_body, insurer, court, secondary |
| source_tier | Required hierarchy tier 1–6 |
| document_title_de | Required original German title |
| document_title_en | Optional explanatory English translation, marked non-authoritative |
| document_type | Required: law, ordinance, gazette, PAP, letter, circular, dataset, table, FAQ, brochure, calculator, other |
| canonical_url | Required official URL |
| retrieved_url | Required final URL after redirects |
| language | Required |
| mime_type | Required |

### 7.2 Publication and applicability

| Field | Requirement |
| --- | --- |
| jurisdiction | Required: federal, named state, named insurer or other competent scope |
| rule_category | Required controlled category |
| calculation_years | Required explicit list/range |
| effective_from | Required when applicable |
| effective_to | Required or explicit open-ended value |
| publication_date | Required when available |
| last_updated_date | Required when publisher exposes it |
| retrieved_at | Required timestamp |
| verified_at | Required timestamp after review |
| document_version | Required publisher version/date/identifier |
| finality | Required: final, amended, corrected, draft, proposed, withdrawn |

### 7.3 Exact evidence mapping

| Field | Requirement |
| --- | --- |
| locator | Required section, paragraph, page, table, row, variable or schema path |
| extract_de | Short necessary German extract or structured value; respect quotation limits |
| interpretation_en | Optional English explanation, not a substitute for original |
| rule_ids | Required calculator rule identifiers |
| parameter_ids | Required for numeric/configuration evidence |
| evidence_role | Required: governing, implementation, corroborating, explanation, cross_check |
| transformation | Required description of any conversion or derivation |
| units | Required for numeric values |
| rounding_scope | Required when source defines or affects rounding |

### 7.4 Integrity and lifecycle

| Field | Requirement |
| --- | --- |
| content_sha256 | Required for stored/downloaded evidence; otherwise reason |
| archive_path | Required repository/archive reference where legally and technically permitted |
| archive_status | Required: stored, external_official_archive, prohibited, unavailable |
| supersedes | Prior source IDs replaced by this source |
| superseded_by | Later verified source ID when known |
| verification_status | Required: candidate, verified, conflict, superseded, withdrawn |
| primary_reviewer | Required |
| second_reviewer | Required for production-critical rules |
| review_notes | Required for ambiguity, derived values or exceptions |
| issue_reference | Link to conflict/change issue when applicable |

## 8. Source-record example

An illustrative record for a BMF wage-tax plan would state:

- stable ID such as DE-BMF-PAP-2026-001;
- Federal Ministry of Finance as publisher;
- tier 3 and document type PAP;
- final applicable 2026 machine plan;
- official canonical page and linked PDF/schema;
- publication/version date;
- federal jurisdiction and 2026 applicability;
- exact variable, step or page locators;
- mapped engine rule IDs;
- stored file hash and archive path;
- two reviewers;
- verified status.

The example does not approve a particular plan revision. NP-RS-002 must select and verify the final applicable version.

## 9. Assumption and parameter linkage

Every production parameter entry must contain:

- parameter ID;
- typed value and unit;
- applicable calculation year and effective period;
- one or more source IDs;
- exact source locator;
- derivation/transformation description;
- rounding instruction;
- assumption-set version;
- reviewer approval;
- change reason;
- superseded value reference when updated.

Composite values must reference every input source. A derived employee share cannot cite only the resulting percentage; it records the total rate, sharing rule, exceptions and derivation.

The application displays source metadata from the same versioned assumption manifest used by the engine. UI citations must not be maintained as an unrelated manual list.

## 10. Rules for laws, algorithms and guidance

### Laws and regulations

- use the version effective for the calculation period;
- record provision and amendment provenance;
- distinguish promulgation date from effective date;
- capture transitional rules;
- do not infer implementation details that the text leaves to another formal instrument.

### Official calculation programs

- use only final applicable versions;
- record every correction or mid-year revision;
- implement variable definitions, sequence and rounding faithfully;
- preserve a mapping from plan step/variable to engine function;
- test old and new effective periods separately when a plan changes mid-year.

### Administrative guidance

- confirm publisher competence and scope;
- distinguish binding/formal instruction from explanatory page;
- do not let general guidance override a specific plan or law;
- record whether guidance is current, archived or corrected.

### Official calculators

- use as a cross-check unless the authority explicitly defines the calculator/output as normative for the implemented purpose;
- record inputs, date, version and output;
- never reverse-engineer a hidden rule and treat it as primary evidence.

## 11. Secondary-source policy

Secondary sources are permitted only for discovery, interpretation support and independent cross-checks.

They must never:

- be the sole source for a production constant;
- override a competent official source;
- supply an uncited legal interpretation;
- establish an effective date;
- justify broadening v1 scope;
- be shown to users as the governing authority.

If official evidence cannot be found:

1. mark the rule unresolved;
2. document search paths and candidate secondary material;
3. ask a qualified reviewer when necessary;
4. keep the affected path unsupported or block the release;
5. do not “temporarily” ship a guessed constant.

## 12. Conflict-resolution procedure

A conflict exists when sources imply materially different values, formulas, applicability, timing or interpretation for the same supported case.

### Step 1 — Confirm the conflict

- verify both documents are authentic;
- compare jurisdiction, period, population and version;
- check whether one is draft, corrected or superseded;
- confirm units, period and rounding;
- distinguish actual contradiction from different scopes.

### Step 2 — Classify the issue

- statutory scope/condition;
- algorithm or rounding;
- numeric parameter;
- administrative procedure;
- explanatory wording;
- publisher-specific value.

### Step 3 — Select the governing source

| Issue | Governing preference |
| --- | --- |
| Enacted rule/effective date | Promulgated applicable law or regulation |
| Current readable provision | Official consolidated law verified against amendments as needed |
| Wage-tax machine algorithm | Final applicable BMF machine PAP within its delegated scope |
| State-specific rule | Applicable state law/official state authority |
| Insurer-specific rate | That insurer’s final official rate for the effective period |
| Social-insurance operational rule | Governing law/instrument plus competent formal common principle |
| Plain-language explanation | Explanation consistent with governing evidence |

### Step 4 — Escalate material ambiguity

Create a conflict record containing:

- source IDs and exact locators;
- competing interpretations;
- affected parameters, scenarios and tests;
- materiality assessment;
- proposed resolution;
- reviewer decision and date.

Production-critical conflicts require two-person review. Seek qualified tax/legal/payroll review when repository evidence cannot resolve the issue.

### Step 5 — Fail safely

Until resolved:

- do not activate the parameter;
- keep the affected case unsupported or block the calculation year;
- show no approximate normal result;
- preserve the conflict in release notes/known limitations where user-relevant.

## 13. Change detection and versioning

### Source monitoring

For each active calculation year:

- monitor official publisher pages and document registries;
- record HTTP metadata where available;
- compare normalized content and file hashes;
- check page-linked document versions, not only page text;
- treat changed publication/update dates as review signals;
- manually verify semantic changes.

ETag, Last-Modified and hash changes detect change but do not interpret it. No automated change directly updates a production parameter.

### Version rules

- source records are immutable after verification except for lifecycle metadata and corrections;
- corrected evidence creates a new source version/record;
- assumption manifests are versioned independently by calculation year;
- any result-affecting change increments the assumption-set version;
- engine version and source-manifest version appear in result metadata;
- previous calculation years retain their original verified evidence;
- a changed URL alone does not change a rule version if content is identical and provenance is recorded.

### Change classifications

| Change | Required action |
| --- | --- |
| Editorial/no semantic impact | Verify, record hash/version, no parameter change |
| Source relocation | Update canonical/retrieval metadata and preserve old provenance |
| Clarification | Review affected interpretation/tests |
| Numeric parameter change | New parameter version, fixtures and release review |
| Algorithm/rounding change | New engine/assumption version and regression suite |
| Effective-date change | Update applicability and re-evaluate affected results |
| Correction/supersession | Mark old record, create replacement and assess incident impact |

## 14. Link rot and evidence preservation

For production-critical sources:

- store the original official document in the repository or approved evidence archive when legally and technically permitted;
- store SHA-256 hash, filename, MIME type and retrieval timestamp;
- retain canonical and final redirected URLs;
- preserve the smallest sufficient extract and locator;
- prefer publisher-provided permanent identifiers;
- link to official archives where local storage is prohibited;
- never use a public web archive as a substitute for primary provenance when an official archive exists.

If a link fails:

1. check redirects and the publisher’s archive/search;
2. locate the same document using title, date and identifier;
3. verify content against stored hash/copy;
4. update retrieval metadata without erasing prior URL;
5. if authenticity cannot be re-established, mark the source unavailable and review dependent rules.

The calculator may continue using a previously verified archived source for a historical year if integrity and applicability remain established.

## 15. Verification checklist

### Document verification

- [ ] Publisher and competence verified
- [ ] Official canonical URL recorded
- [ ] Title and document identifier recorded
- [ ] Final/draft/corrected status confirmed
- [ ] Publication, version and retrieval dates recorded
- [ ] Jurisdiction and target population confirmed
- [ ] Calculation year and effective period confirmed
- [ ] Exact locator recorded
- [ ] Stored evidence/hash completed or exception documented

### Rule extraction

- [ ] Rule/parameter IDs mapped
- [ ] Units and periods confirmed
- [ ] Threshold inclusion/exclusion boundaries confirmed
- [ ] Employee/employer shares distinguished
- [ ] Rounding stage and precision captured
- [ ] Transitional and special rules assessed
- [ ] Derivation documented
- [ ] Conflicting sources checked

### Implementation readiness

- [ ] Applicable source set complete
- [ ] Assumption manifest references source IDs
- [ ] Engine mapping references rule IDs
- [ ] Positive, boundary and negative fixtures added
- [ ] Independent reviewer approved production-critical entries
- [ ] User-facing citation/explanation prepared
- [ ] Unsupported gaps documented

## 16. Test-fixture evidence standard

Every fixture records:

- fixture ID and purpose;
- supported scope case;
- calculation year and effective period;
- canonical inputs;
- expected outputs and component precision;
- source IDs and locators;
- derivation worksheet or implementation-plan steps;
- rounding sequence;
- reviewer;
- last verification date;
- engine and assumption versions.

Fixture categories:

1. **Official examples:** Reproduce a competent authority’s published example.
2. **Normative-plan fixtures:** Derived step-by-step from an official calculation plan.
3. **Boundary fixtures:** Values immediately below, at and above a sourced threshold.
4. **Invariant fixtures:** Reconciliation, monotonicity where legally expected, caps and zero cases.
5. **Cross-check fixtures:** Compared with an official calculator or independent payroll result, never replacing governing evidence.
6. **Regression fixtures:** Preserve a previously resolved defect with its source chain.

Snapshot updates require explanation. A failing fixture may not be “fixed” by accepting new output without a verified rule/source change.

## 17. Preventing uncited constants

### Repository rules

- regulated constants live in versioned assumption manifests, not UI components;
- every regulated constant requires source_ids and effective dates;
- engine code consumes typed manifest values;
- source and assumption schemas reject missing references;
- values derived from other parameters declare the derivation;
- generic mathematical constants and unit conversions use an explicit non-regulated allowlist;
- examples/documentation are never imported as production assumptions.

### CI gates

CI must fail when:

- a regulated parameter lacks a verified source;
- a source is draft, conflicted, withdrawn or outside the calculation period;
- a parameter unit/effective period is missing;
- source-manifest integrity/hash checks fail;
- a production calculation module introduces an unapproved numeric literal;
- fixture expected results lack evidence IDs;
- result metadata cannot identify assumption/source versions;
- a source marked superseded remains active without explicit historical applicability.

### Review gates

Every result-affecting PR identifies:

- changed rule and parameter IDs;
- old/new source IDs;
- effective period;
- affected scenarios;
- fixture changes;
- user-facing impact;
- rollback or historical-version behaviour.

## 18. Annual review workflow

### Phase A — Horizon scan

**Timing:** From the first official proposals for the next calculation year.

- identify planned laws, ordinances and annual parameters;
- register candidates as proposed/draft only;
- create a change inventory;
- do not activate values.

### Phase B — Final-source collection

**Timing:** After promulgation/final publication.

- collect final laws, ordinances, rates, ceilings and official plans;
- verify effective dates and corrections;
- archive evidence and hashes;
- create year-specific source records.

### Phase C — Assumption-set preparation

- map sources to typed parameters;
- implement algorithms/rounding;
- create official, boundary and regression fixtures;
- perform first review.

### Phase D — Independent verification

- second reviewer validates sources, applicability, extraction and expected results;
- compare with official tools/examples where available;
- resolve or block every conflict;
- approve the year manifest.

### Phase E — Release and publication

- publish source/assumption version;
- expose calculation year and citations;
- publish limitations and unsupported cases;
- retain prior-year manifests.

### Phase F — In-year monitoring

- monitor corrections, court decisions, ministry notices and mid-year plan revisions;
- triage every material source change;
- issue a new version when results change;
- assess whether previously generated results need a public notice.

### Phase G — Year-end close

- freeze the reviewed historical manifest;
- document final corrections;
- confirm archives and hashes;
- record known limitations and handoff to the next-year review.

## 19. Urgent change workflow

For an unexpected in-year change:

1. open a source-change issue;
2. identify authoritative publication and effective time;
3. classify severity and affected calculations;
4. disable affected path/year when accuracy cannot be maintained;
5. update source and assumption records;
6. add before/after boundary fixtures;
7. obtain required reviews;
8. release a new version with effective-date routing;
9. publish a concise user-facing notice if material;
10. complete a retrospective if incorrect results were publicly available.

## 20. German and English citation presentation

### German

Show:

- original German document title;
- publisher;
- applicable year/effective date;
- provision/page/table or PAP version;
- verification date;
- official link.

### English

Show:

- clear English explanation;
- original German title and publisher;
- optional translated title labelled as a translation;
- same year/effective date, locator, verification date and official link.

Rules:

- the German original remains authoritative;
- do not imply an official English translation exists unless the publisher provides one;
- translations must not simplify away thresholds, exceptions or uncertainty;
- inaccessible/legal wording gets a plain-language explanation without replacing the citation;
- citations are attached to assumptions/results, not hidden only in a legal page.

## 21. Initial official evidence validating this policy

The policy’s publisher routing was checked against:

- [Federal Law Gazette promulgation platform](https://www.recht.bund.de/de/home/home_node.html);
- [Gesetze im Internet — Einkommensteuergesetz](https://www.gesetze-im-internet.de/estg/);
- [BMF — Programmablaufpläne zur Lohnsteuer](https://www.bundesfinanzministerium.de/Web/DE/Themen/Steuern/Steuerarten/Lohnsteuer/Programmablaufplan/programmablaufplan.html);
- [BMAS — Sozialversicherungsrechengrößen-Verordnung](https://www.bmas.de/DE/Service/Statistiken-Open-Data/Sozialversicherungsrechengroessen-Verordnung/sozialversicherungsrechengroessen-verordnung.html);
- [BMG — Beiträge der gesetzlichen Krankenversicherung](https://www.bundesgesundheitsministerium.de/beitraege);
- [BMG — Finanzierung der Pflegeversicherung](https://www.bundesgesundheitsministerium.de/themen/pflege/online-ratgeber-pflege/die-pflegeversicherung/finanzierung);
- [GKV-Spitzenverband — Zahlen und Grafiken](https://www.gkv-spitzenverband.de/gkv_spitzenverband/presse/zahlen_und_grafiken/zahlen_und_grafiken.jsp);
- [Deutsche Rentenversicherung — Werte der Rentenversicherung](https://www.deutsche-rentenversicherung.de/DRV/DE/Experten/Zahlen-und-Fakten/Werte-der-Rentenversicherung/werte-der-rentenversicherung).

These links validate the authority categories and routing approach. They do not approve a complete calculation-year assumption set.

## 22. Engineering and research handoff

Implementation should create:

1. a machine-readable source-record schema;
2. a controlled publisher and rule-category registry;
3. a versioned source manifest per calculation year;
4. an evidence archive with integrity hashes;
5. typed links from assumptions to source IDs;
6. typed links from engine rules and fixtures to evidence;
7. CI checks for completeness, applicability and uncited literals;
8. a source-change issue template;
9. a conflict record template;
10. annual and urgent review checklists;
11. a user-facing bilingual citation component;
12. a report listing every active production parameter and its evidence chain.

## Acceptance check for NP-RS-001

- [x] Source hierarchy prioritises governing official evidence.
- [x] Federal, state, tax and social-insurance publishers are classified.
- [x] Laws, regulations, PAPs, guidance and official calculators have usage rules.
- [x] Secondary sources cannot be sole production evidence.
- [x] Draft and proposed rules cannot enter released assumptions.
- [x] Source metadata covers publisher, URL, dates, jurisdiction, locator, parameters and review.
- [x] Conflict resolution selects authority by issue type and fails safely.
- [x] Link-rot and evidence-preservation procedures are defined.
- [x] Change detection and versioning distinguish technical from semantic changes.
- [x] Test fixtures require a complete evidence chain.
- [x] Uncited regulated constants are blocked by schema, CI and review gates.
- [x] Annual and urgent review workflows are defined.
- [x] German and English citation presentation preserves the German authority.
- [x] Initial publisher routing is validated against official sources.
- [x] The policy does not itself approve any tax-year parameter.
