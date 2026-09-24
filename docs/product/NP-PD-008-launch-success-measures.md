# NP-PD-008 — Launch success measures

**Status:** Accepted  
**Task:** NP-PD-008  
**Milestone:** M0 Plan  
**Depends on:** [NP-PD-001](NP-PD-001-public-service-purpose.md)  
**Builds on:** [NP-PD-005](NP-PD-005-calculator-outputs.md), [NP-PD-006](NP-PD-006-offer-comparison-dimensions.md), [NP-PD-007](NP-PD-007-privacy-model.md)  
**Last updated:** 2026-09-24

## Purpose

This document defines how NettoPilot DE determines whether v1 is ready to launch and whether it is delivering useful, trustworthy salary calculations and offer comparisons after launch.

It provides:

- a small KPI framework tied to user value;
- an exact metric-definition catalogue;
- hard launch gates for correctness, privacy, accessibility and reliability;
- provisional post-launch product targets;
- a privacy-safe measurement plan;
- review cadence, ownership and action rules.

There is no production baseline yet. Quality and compliance requirements can be hard gates before launch. Behavioural targets are provisional operating hypotheses and must be recalibrated after enough consented production traffic is available.

## 1. Measurement principles

1. **Measure useful outcomes, not traffic alone.** Page views do not prove that someone understood their salary.
2. **Protect trust before optimising conversion.** Accuracy, privacy and accessibility are launch gates, not tradeable growth metrics.
3. **Use few primary KPIs.** Supporting metrics diagnose why a primary KPI moves.
4. **Define every denominator.** Counts without eligible populations, windows and exclusions are not decision-ready.
5. **Separate supported and unsupported journeys.** An honest unsupported result is not a calculation failure.
6. **Do not turn missing analytics consent into failure.** Behavioural analytics describe the consented measurement cohort only.
7. **Never collect salary or personal data for measurement.** NP-PD-007 controls all instrumentation.
8. **Use reproducible quality evidence.** Accuracy and privacy gates come from versioned automated and manual evidence.
9. **Avoid false precision.** Do not publish percentage trends below minimum sample sizes.
10. **Attach actions to thresholds.** A metric matters only when movement changes a decision.

## 2. Decisions the framework supports

The framework must answer:

- Is the build safe and trustworthy enough to launch?
- Can users complete supported salary calculations?
- Can users complete a meaningful two-offer comparison?
- Where do users encounter validation, unsupported cases or technical failures?
- Are German and English, mobile and desktop journeys comparably usable?
- Are results accurate against approved references?
- Does the application meet accessibility, performance and privacy requirements?
- Do users report that the result helped them understand or compare compensation?
- Which issue should be investigated before the next release?

## 3. KPI framework

### 3.1 Primary KPI 1 — Supported calculation completion rate

**Definition:** Percentage of eligible calculator starts in the consented analytics cohort that end in a supported calculation result during the same measurement session.

**Formula:** supported calculation completions divided by eligible calculator starts, multiplied by 100.

**Why it matters:** This is the closest privacy-safe behavioural proxy for the core public-service outcome: reaching an understandable calculation result.

**Provisional target:** at least 70% after the minimum sample threshold.

**Warning:** 55% to below 70%.

**Critical:** below 55%.

**Drivers:**

- required-input completion rate;
- validation-error recovery rate;
- supported-case admission rate;
- median steps or elapsed active time to a result;
- technical calculation success rate.

**Guardrails:**

- reference-case accuracy pass rate remains 100%;
- client calculation error rate remains below 0.5%;
- privacy leakage tests remain at zero failures.

### 3.2 Primary KPI 2 — Two-offer comparison completion rate

**Definition:** Percentage of eligible comparison starts with two calculation slots opened that end in a supported comparison result during the same measurement session.

**Formula:** supported comparison completions divided by eligible comparison starts, multiplied by 100.

**Provisional target:** at least 55%.

**Warning:** 40% to below 55%.

**Critical:** below 40%.

**Drivers:**

- both-offers-input-complete rate;
- two-supported-results rate;
- comparison-dimension availability;
- comparison validation-error recovery;
- return-to-edit success after an unavailable dimension.

**Guardrails:**

- no objective “best offer” output;
- no variable or user-valued amount presented as guaranteed;
- comparison calculation error rate below 0.5%;
- zero scenario-bearing network requests.

### 3.3 Primary KPI 3 — Trustworthy result readiness

This is a release-level composite gate, not a weighted score. It passes only when every mandatory quality gate passes:

- approved reference-case accuracy: pass;
- privacy and outbound-network compliance: pass;
- critical accessibility requirements: pass;
- calculation reliability: pass;
- performance budget: pass;
- German and English core-flow parity: pass.

One failing mandatory gate makes the release not ready. The team must not average a privacy or accuracy failure away with good behavioural metrics.

## 4. KPI hierarchy

| Level | Metric | Role |
| --- | --- | --- |
| Outcome | Supported calculation completion rate | Core salary-calculator value |
| Outcome | Two-offer comparison completion rate | Offer-comparison value |
| Release outcome | Trustworthy result readiness | Launch/no-launch decision |
| Driver | Required-input completion | Diagnoses form friction |
| Driver | Validation-error recovery | Diagnoses whether errors are actionable |
| Driver | Supported-case admission | Reveals scope/user mismatch |
| Driver | Result explanation engagement | Indicates whether users inspect breakdowns |
| Driver | Comparison dimension availability | Reveals missing comparison inputs |
| Guardrail | Reference-case accuracy | Prevents incorrect results |
| Guardrail | Client calculation error rate | Prevents unreliable journeys |
| Guardrail | Accessibility conformance | Protects inclusive access |
| Guardrail | Performance budget | Protects usable delivery |
| Guardrail | Privacy/network compliance | Prevents sensitive-data leakage |
| Diagnostic | German/English parity | Detects language-specific friction |
| Diagnostic | Mobile/desktop parity | Detects device-specific friction |
| Voice | Anonymous helpfulness response | Captures perceived value without free text |

## 5. Metric-definition catalogue

### 5.1 Behavioural funnel metrics

| Metric ID | Definition and formula | Eligible population | Exclusions | Source | Grain |
| --- | --- | --- | --- | --- | --- |
| calculation_start_count | Count of calculator_started events | Consented measurement sessions | Duplicate start events within 2 seconds | Analytics allowlist | Event/day |
| calculation_completion_count | Count of supported calculator_completed events | Consented sessions with a start | Unsupported, incomplete and error results | Analytics allowlist | Event/day |
| calculation_completion_rate | Supported completions / eligible starts | Sessions with calculator_started | Bot/test traffic and invalid duplicate events | Derived aggregate | Day/week |
| calculation_abandonment_rate | Eligible starts with no terminal result / eligible starts | Starts whose 30-minute session window has closed | Active windows, consent withdrawal before terminal event | Derived aggregate | Day/week |
| terminal_result_rate | Any supported, unsupported, incomplete or error terminal event / eligible starts | Closed eligible starts | Active windows | Derived aggregate | Day/week |
| comparison_start_count | Count of comparison_started events | Consented measurement sessions | Duplicates | Analytics allowlist | Event/day |
| comparison_completion_count | Count of supported comparison_completed events | Consented sessions with comparison start | Unsupported/incomplete/error comparison | Analytics allowlist | Event/day |
| comparison_completion_rate | Supported comparison completions / eligible comparison starts | Closed comparison starts | Active windows and duplicate events | Derived aggregate | Day/week |
| comparison_abandonment_rate | Starts without terminal comparison / eligible starts | Closed comparison starts | Active windows | Derived aggregate | Day/week |

A measurement session is an in-memory, random, non-personal session identifier that expires after 30 minutes of inactivity or tab closure. It is not reused across visits and is not linked to scenario data.

### 5.2 Scope and validation metrics

| Metric ID | Definition and formula | Source | Interpretation |
| --- | --- | --- | --- |
| supported_result_rate | Supported terminal calculation results / all terminal calculation results | calculator_completed state | Describes fit between traffic and v1 scope; not a correctness score |
| unsupported_result_rate | Unsupported terminal results / all terminal results | calculator_completed state | Identifies demand outside v1 without collecting unsupported field values |
| incomplete_result_rate | Incomplete terminal results / all terminal results | calculator_completed state | Reveals unresolved required inputs |
| validation_error_exposure_rate | Sessions with at least one validation_error_shown / eligible starts | Allowlisted field ID and error code | Diagnoses form friction |
| validation_error_recovery_rate | Sessions completing after a validation error / sessions with a validation error | Event sequence in same session | Measures whether guidance enables recovery |
| calculation_error_rate | Error terminal results / all calculation attempts reaching engine invocation | Sanitised terminal state | Reliability guardrail |
| comparison_error_rate | Error terminal comparisons / all comparison engine invocations | Sanitised terminal state | Comparison reliability guardrail |

Unsupported results are successful honesty when the case is outside NP-PD-003. Review unsupported rate for roadmap insight; do not reduce it by approximating unsupported cases.

### 5.3 Accuracy metrics

| Metric ID | Definition and formula | Source | Launch target |
| --- | --- | --- | --- |
| approved_fixture_pass_rate | Passing approved fixtures / executed approved fixtures | Versioned automated reference suite | 100% |
| statutory_path_pass_rate | Passing statutory fixtures / executed statutory fixtures | Reference suite | 100% |
| private_path_pass_rate | Passing private fixtures / executed private fixtures | Reference suite | 100% |
| one_off_payment_pass_rate | Passing supported one-off fixtures / executed fixtures | Reference suite | 100% |
| comparison_invariant_pass_rate | Passing delta, swap and reconciliation invariants / executed invariants | Automated suite | 100% |
| independent_review_pass_rate | Independently checked reference cases passing / reviewed cases | Signed review record | 100% before launch |
| maximum_rounding_variance | Largest absolute difference versus approved expected output | Reference suite | At or below the explicitly approved component tolerance |

The calculation specification must define component-level tolerances. A broad percentage tolerance cannot hide a wrong payroll component. Any change to an approved expected result requires a cited assumption change and reviewer approval, not merely updating the snapshot.

### 5.4 Language and device usability metrics

| Metric ID | Formula | Minimum sample | Provisional target |
| --- | --- | --- | --- |
| german_completion_rate | German supported completions / eligible German starts | 100 starts | Report against primary target |
| english_completion_rate | English supported completions / eligible English starts | 100 starts | Report against primary target |
| language_completion_gap | Absolute percentage-point difference between German and English completion | 100 starts per language | At most 10 percentage points |
| mobile_completion_rate | Mobile supported completions / eligible mobile starts | 100 starts | Report against primary target |
| desktop_completion_rate | Desktop supported completions / eligible desktop starts | 100 starts | Report against primary target |
| device_completion_gap | Absolute percentage-point difference between mobile and desktop completion | 100 starts per class | At most 10 percentage points |
| core_task_usability_pass_rate | Moderated core tasks completed without facilitator rescue / attempted tasks | 5 participants per priority persona/device round | 100% for blocking tasks before launch |

Language and device are coarse presentation context, not inferred identity. Do not combine small segments that could expose individuals. No public segmented rate is shown below its minimum sample.

### 5.5 Accessibility metrics

| Metric ID | Definition | Launch target |
| --- | --- | --- |
| critical_accessibility_violations | Open critical or serious automated findings in core routes | 0 |
| keyboard_core_flow_pass_rate | Core flows completed using keyboard only / core flows tested | 100% |
| screen_reader_core_flow_pass_rate | Required flows passing the approved screen-reader matrix / flows tested | 100% |
| focus_and_error_announcement_pass_rate | Passing focus, validation and result-update tests / tests executed | 100% |
| contrast_pass_rate | Tested required UI states passing approved contrast criteria / states tested | 100% |
| bilingual_accessibility_parity | Required accessibility checks passing in both languages | 100% |

Automated checks are necessary but not sufficient. Manual keyboard and screen-reader evidence is mandatory for launch.

### 5.6 Performance metrics

| Metric ID | Measurement | Green | Warning | Critical |
| --- | --- | --- | --- | --- |
| p75_lcp | 75th-percentile largest content render for eligible measured page views | At most 2.5 s | Above 2.5 to 4.0 s | Above 4.0 s |
| p75_inp | 75th-percentile interaction responsiveness | At most 200 ms | Above 200 to 500 ms | Above 500 ms |
| p75_cls | 75th-percentile cumulative layout shift | At most 0.10 | Above 0.10 to 0.25 | Above 0.25 |
| calculation_latency_p95 | 95th-percentile browser calculation duration in supported fixtures/devices | At most 250 ms | Above 250 to 500 ms | Above 500 ms |
| comparison_latency_p95 | 95th-percentile comparison duration | At most 500 ms | Above 500 to 1,000 ms | Above 1,000 ms |
| compressed_initial_js | Transfer size of initial required JavaScript | At most approved build budget | Up to 10% over budget | More than 10% over budget |

Field performance is reported only from consented eligible events. Lab checks run in CI for every release candidate. The exact device/network test profile must be versioned with the evidence.

### 5.7 Privacy and network metrics

| Metric ID | Definition | Launch target |
| --- | --- | --- |
| sensitive_canary_leak_count | Unique canary values found in requests, logs, analytics, errors, URLs, titles or storage outside the approved local store | 0 |
| unapproved_outbound_domain_count | Outbound domains not present in reviewed allowlist | 0 |
| scenario_bearing_request_count | Network requests containing raw, transformed, hashed or bucketed scenario data | 0 |
| analytics_schema_violation_count | Emitted events or properties outside typed allowlist | 0 |
| analytics_before_consent_count | Optional analytics requests before applicable consent | 0 |
| rejected_consent_request_count | Optional analytics requests after rejection/withdrawal | 0 |
| import_upload_count | Import-file transmissions | 0 |
| deletion_scope_test_pass_rate | Passing delete/reset/clear tests / executed tests | 100% |
| privacy_regression_pass_rate | Passing required privacy tests / required tests | 100% |

Any non-zero sensitive leak, scenario-bearing request or pre-consent optional analytics event is a launch blocker and incident triage trigger.

### 5.8 Anonymous user feedback

V1 may ask one optional structured question after a supported result:

“Did this help you understand your salary or compare your offers?”

Allowed answers are Yes, Partly, No and Skip. Free text is disabled in v1 to reduce personal-data risk.

| Metric ID | Formula | Provisional target |
| --- | --- | --- |
| helpful_response_rate | Yes responses / Yes + Partly + No | At least 70% after 50 responses |
| positive_or_partial_rate | Yes + Partly / all non-skipped responses | At least 85% after 50 responses |
| feedback_response_rate | Non-skipped responses / prompts shown | Diagnostic only; no optimisation target |

The feedback event contains only the allowlisted answer code, language, feature area and app version. It is never joined to salary values or scenario content.

## 6. Event contract

The measurement plan uses the NP-PD-007 allowlist.

| Event | Required properties | Explicitly forbidden |
| --- | --- | --- |
| calculator_started | event version, mode, locale, coarse device class, app version | Every calculator input |
| validation_error_shown | stable field ID, stable error code, locale, app version | Entered value or message text |
| calculator_completed | result state, warning count, locale, coarse device class, app version | Gross/net values, tax class, state, insurance or child data |
| comparison_started | event version, locale, device class, app version | Offer labels and compensation |
| comparison_completed | result state, unavailable-dimension count, locale, device class, app version | Deltas, salaries, benefits and commute values |
| performance_measure | metric ID, duration/value, route ID, app version | Scenario or result state linkage |
| anonymous_feedback | fixed answer code, feature area, locale, app version | Free text and scenario identifiers |

Rules:

- properties use enumerated values and fixed types;
- no arbitrary strings or spread client state;
- no persistent person, account or advertising identifier;
- session identifier is memory-only, random and short-lived;
- event URLs exclude query strings and fragments;
- consent status gates optional analytics;
- staging, bots and automated tests are marked through build/environment configuration and excluded;
- analytics schema changes require privacy review.

## 7. Abandonment and session rules

A calculator start becomes:

- **completed** when a supported result occurs;
- **terminated unsupported** when an unsupported result occurs;
- **terminated incomplete** when the explicit result state is incomplete;
- **terminated error** when the calculation engine returns an error;
- **abandoned** when no terminal event occurs before 30 minutes of inactivity.

Only one terminal classification is assigned per funnel attempt. Starting a new calculation after a terminal state begins a new attempt. Reload behaviour is not stitched across visits because the identifier is not persistent.

This means abandonment is a consented-session estimate, not a claim about every visitor.

## 8. Launch-readiness scorecard

| Area | Evidence | Green/pass | Warning | Blocker |
| --- | --- | --- | --- | --- |
| Accuracy | Approved fixtures and independent review | 100% pass | Not applicable | Any approved case fails |
| Reliability | Automated tests and release-candidate run | Error rate below 0.5%; no open P0/P1 calculation defect | 0.5% to below 1% | At least 1% or known material wrong result |
| Accessibility | Automated and manual core-flow evidence | Zero critical/serious issues; all core flows pass | Minor non-blocking issues with owner/date | Any core flow unavailable |
| Privacy | Canary, consent and outbound-network tests | All required tests pass; zero leaks | Not applicable | Any sensitive leak or unapproved scenario transmission |
| Performance | Versioned lab profile and available field data | All core green targets | One warning with accepted mitigation | Any critical target or unusable core flow |
| German/English | Translation and journey evidence | Both core journeys pass | Minor copy issue with no decision impact | Missing/wrong material explanation |
| Mobile/desktop | Required viewport/device matrix | Both core journeys pass | Minor layout defect | Core input/result inaccessible |
| Documentation | Sources, versions, limitations and privacy notice | Complete and reviewed | Small non-material gap with owner/date | Missing calculation source, limitation or privacy disclosure |

Launch requires every blocker column to be clear and all mandatory gates green. A warning needs an owner, mitigation and review date.

## 9. Provisional operating thresholds

| Metric | Green | Warning | Critical | Minimum evidence |
| --- | --- | --- | --- | --- |
| Calculation completion rate | At least 70% | 55% to below 70% | Below 55% | 200 eligible starts |
| Comparison completion rate | At least 55% | 40% to below 55% | Below 40% | 100 eligible starts |
| Validation-error recovery | At least 75% | 60% to below 75% | Below 60% | 100 error sessions |
| Client calculation error rate | Below 0.5% | 0.5% to below 1% | At least 1% | 500 attempts or any reproducible material defect |
| Client comparison error rate | Below 0.5% | 0.5% to below 1% | At least 1% | 200 attempts |
| Helpfulness yes rate | At least 70% | 55% to below 70% | Below 55% | 50 responses |
| Language completion gap | At most 10 pp | Above 10 to 15 pp | Above 15 pp | 100 starts per language |
| Device completion gap | At most 10 pp | Above 10 to 15 pp | Above 15 pp | 100 starts per device class |

These thresholds are initial product hypotheses, not external benchmarks. Recalibrate after four weeks of stable traffic or 1,000 eligible calculator starts, whichever occurs later. Do not lower accuracy, privacy or accessibility gates based on production performance.

## 10. Review cadence and action rules

### Before every release

- run correctness, reconciliation and invariant suites;
- run privacy canary and outbound-domain tests;
- run automated accessibility and performance checks;
- complete required manual accessibility checks for material UI changes;
- review source/assumption versions and unsupported-case messages;
- complete the launch-readiness scorecard.

### First 72 hours after launch or material release

- review calculation and comparison error rates daily;
- inspect sanitised error codes;
- confirm no analytics-schema or outbound-domain regression;
- verify performance against release candidate expectations.

### Weekly for the first eight weeks

- review the three primary KPIs;
- review funnel drivers, unsupported states and validation recovery;
- compare language and device segments only above minimum samples;
- assign an owner and next action to every critical threshold.

### Monthly after stabilisation

- review KPI trends and confidence;
- review anonymous feedback;
- review scope demand from aggregate unsupported reason codes only when those codes reveal no personal input;
- recalibrate provisional behavioural thresholds with documented rationale;
- review instrumentation and privacy inventory changes.

### Annually and when calculation rules change

- refresh approved reference cases;
- revalidate official-source assumptions;
- repeat independent accuracy review;
- review privacy notice, providers and retention;
- review accessibility matrix and supported browsers.

## 11. Ownership

| Area | Accountable role | Required action |
| --- | --- | --- |
| Product KPIs | Product owner | Review trends, decide priorities and approve threshold changes |
| Calculation accuracy | Calculation owner/reviewer | Maintain fixtures, sources and independent review |
| Analytics contract | Product and privacy owner | Approve events/properties and audit payloads |
| Accessibility | Accessibility/release owner | Maintain manual and automated evidence |
| Performance | Frontend owner | Maintain budgets and investigate regressions |
| Privacy/security | Privacy/security reviewer | Approve data-flow changes and investigate leaks |
| Release decision | Release owner | Confirm every mandatory gate |

One person may hold multiple roles in an open-source project, but the evidence and approvals remain explicit.

## 12. Dashboard and reporting contract

The initial scorecard should show:

1. release version and measurement window;
2. trustworthy-result readiness gate;
3. supported calculation completion;
4. two-offer comparison completion;
5. calculation/comparison error guardrails;
6. accuracy, privacy and accessibility gate status;
7. performance status;
8. German/English and mobile/desktop gaps above minimum samples;
9. anonymous helpfulness;
10. open critical actions with owner and due date.

Do not display:

- salary or result distributions;
- tax, insurance, state, family or income segments;
- user-level journeys;
- small cohorts below minimum sample;
- employer or scenario labels;
- raw error payloads;
- a weighted launch score that can hide a failed mandatory gate.

## 13. Data quality and metric integrity

Every published metric includes:

- definition version;
- event/schema version;
- numerator and denominator;
- time window and timezone;
- eligible cohort and exclusions;
- minimum sample status;
- data freshness;
- consented-cohort qualification;
- known instrumentation changes;
- owner and last review date.

Quality checks include:

- duplicate event rate;
- missing required-property rate;
- invalid enum/property rate;
- impossible event-order rate;
- terminal states exceeding starts;
- environment/bot contamination;
- abrupt changes after instrumentation releases.

If a data-quality check fails materially, label the affected KPI unavailable rather than publish a misleading value.

## 14. Privacy limitations and bias

Optional analytics creates selection bias: people who consent may behave differently from those who do not. Therefore:

- behavioural rates are labelled “consented measurement cohort”;
- analytics counts are not presented as total users;
- no attempt is made to fingerprint or reconstruct non-consenting journeys;
- hosting page views are not joined to product analytics;
- rejected consent is not treated as abandonment;
- quality gates rely primarily on controlled tests, not personal telemetry.

No metric may contain or derive from:

- salary, gross, net, bonus, deductions, rates or employer cost;
- tax class, church-tax status, age, birth date or children;
- health-insurance path, premium or subsidy;
- federal state from a scenario;
- working hours, vacation, remote or commute values;
- employer, offer, benefit or scenario labels;
- imported/exported content or filenames;
- full URLs, free text or client-state snapshots;
- persistent person, advertising or cross-site IDs;
- hashes, buckets or classifications derived from prohibited values.

## 15. Target-setting and recalibration

### Hard gates

Accuracy, privacy, accessibility and material correctness targets are requirement-derived. They remain fixed unless the governing product requirement changes through review.

### Provisional behavioural targets

Completion, recovery, parity and helpfulness targets are top-down hypotheses chosen to make the v1 experience meaningfully usable without hiding early uncertainty. They are not based on a production baseline.

After the calibration window:

1. verify instrumentation quality;
2. calculate distributions and confidence intervals for allowed aggregate metrics;
3. compare by release period, not user identity;
4. retain or change thresholds based on observed baseline and desired improvement;
5. document the evidence, decision and effective date;
6. never weaken a guardrail merely to make the scorecard green.

## 16. Explicitly rejected metrics

V1 must not use:

- total page views as the main success metric;
- time on page as proof of understanding;
- salary amount or average salary;
- net-pay distribution;
- tax-class, state, insurance or family segmentation;
- number of saved scenarios as a target that encourages silent persistence;
- analytics-consent acceptance rate as a product-growth target;
- a single weighted KPI score;
- an AI-generated “understanding score”;
- free-text sentiment processing;
- employer rankings;
- “best offer” selection rate;
- unsupported-rate reduction achieved by approximating unsupported cases.

## 17. Engineering handoff

Implementation should create:

1. a versioned typed event schema matching NP-PD-007;
2. memory-only attempt/session correlation;
3. one terminal-state classifier per funnel attempt;
4. fixed analytics property enums;
5. consent gates and withdrawal tests;
6. CI evidence for accuracy, accessibility, performance and privacy;
7. privacy canary and outbound-domain assertions;
8. a metric semantic layer with versioned formulas;
9. minimum-sample suppression;
10. data-quality checks and unavailable states;
11. a launch-readiness scorecard template;
12. an owner/action log for warnings and blockers.

## Acceptance check for NP-PD-008

- [x] One calculation outcome KPI, one comparison outcome KPI and one release gate are defined.
- [x] Driver and guardrail metrics support diagnosis.
- [x] Completion and abandonment formulas are explicit.
- [x] Supported, unsupported, incomplete and error results remain distinct.
- [x] Accuracy metrics require approved reference evidence.
- [x] German/English and mobile/desktop parity are measurable.
- [x] Accessibility includes automated and manual evidence.
- [x] Performance targets and measurement contexts are specified.
- [x] Privacy and outbound-network metrics have zero-leak gates.
- [x] Anonymous feedback is structured and contains no free text.
- [x] The metric catalogue defines populations, formulas, sources and grain.
- [x] Launch targets, warning thresholds and minimum samples are included.
- [x] Review cadence and owners are defined.
- [x] Behavioural targets are explicitly provisional pending a baseline.
- [x] Analytics complies with NP-PD-007 and excludes salary/personal data.
- [x] Launch readiness cannot average away a failed mandatory gate.


## Follow-on standard

The evidence hierarchy, source-record schema and verification workflow for research and calculation assumptions are defined in [NP-RS-001](../research/NP-RS-001-authoritative-source-standard.md).
