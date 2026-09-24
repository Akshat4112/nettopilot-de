# NP-PD-007 — Privacy model

**Status:** Proposed for review  
**Task:** NP-PD-007  
**Milestone:** M0 Plan  
**Depends on:** [NP-PD-003](NP-PD-003-v1-employment-scope.md)  
**Builds on:** [NP-PD-004](NP-PD-004-salary-calculator-inputs.md), [NP-PD-005](NP-PD-005-calculator-outputs.md), [NP-PD-006](NP-PD-006-offer-comparison-dimensions.md)  
**Last updated:** 2026-09-24

## Purpose

This document defines how NettoPilot DE v1 handles salary, payroll, offer and household-scenario data.

The core privacy promise is:

> Salary calculations and offer comparisons run in the user's browser. NettoPilot DE does not send or store the user's salary inputs or calculated results on an application server.

The promise applies only to the product architecture described here. It does not claim that a user's device, browser, extensions, network, copied files or voluntarily shared content are private.

This is a product and engineering privacy contract, not a substitute for legal review. The published privacy notice, consent implementation and third-party processing must be reviewed before launch and whenever the data flow changes.

## 1. Privacy principles

1. **Local by default.** Core calculations work without an account, server-side scenario storage or a network request containing scenario data.
2. **Data minimisation.** Collect only inputs required by the supported calculation or explicitly requested comparison.
3. **Purpose separation.** Calculation data, saved scenarios, analytics and diagnostics have separate purposes and controls.
4. **No silent persistence.** A calculation exists in memory unless the user explicitly saves or exports it.
5. **No sensitive analytics.** Analytics receive allowlisted event names and coarse technical context, never form values or results.
6. **User-controlled deletion.** Users can reset the current calculation and remove locally saved data.
7. **Transparent limits.** Explain risks from shared devices, browser extensions, downloads, clipboard contents and copied links.
8. **Privacy-preserving failure.** Error handling loses diagnostic detail rather than include financial values.
9. **No dark patterns.** Rejecting analytics is as accessible as accepting it, and core calculation remains available.
10. **Review before expansion.** Accounts, cloud sync, server processing, scenario links or AI analysis require a new approved privacy design.

## 2. V1 architecture boundary

### 2.1 Browser-only core

The browser performs:

- input parsing and validation;
- scope-admission checks;
- tax and social-insurance calculations;
- salary and offer comparisons;
- break-even calculations;
- formatting and explanations;
- optional local save/load;
- JSON export and import;
- reset and local deletion.

No API request may contain raw or derived scenario data for these operations.

### 2.2 Static delivery

The application may be delivered as static HTML, CSS, JavaScript, translations and versioned assumption data from GitHub Pages or another approved static host.

Normal hosting infrastructure may receive standard request metadata such as IP address, timestamp, requested asset path, user agent and referrer. The application must not add salary inputs, results, scenario identifiers or private state to asset paths, query strings, request headers or referrers.

The public privacy notice must identify the host and link to applicable host information.

### 2.3 No application backend

V1 has no NettoPilot DE application backend for:

- calculation requests;
- user accounts;
- scenario or result history;
- offer storage;
- cloud synchronisation;
- server-generated share links;
- personalised recommendations.

An architecture change that introduces any of these capabilities requires a new review.

## 3. Data classification

| Class | Examples | Treatment |
| --- | --- | --- |
| Scenario input | Salary, bonus, tax class, state, church-tax status, date of birth, children, insurance path and premiums | Browser memory unless user explicitly saves or exports |
| Derived financial data | Gross/net results, deductions, employer cost, effective rates, deltas and break-even values | Same protection as scenario input |
| Comparison context | Hours, vacation, remote days, commute, benefits and user-assigned values | Same protection as scenario input |
| Optional labels | Scenario, employer/offer or benefit label | Local only; discourage real names and unnecessary identifiers |
| Local preference | Language, theme, analytics choice and dismissed notices | May persist locally; must not contain scenario values |
| Analytics event | Allowlisted event and product version | Sent only under approved consent and provider rules |
| Sanitised diagnostic | Stable error code, app version, route and component ID | May be sent only after removing values, URLs and user content |
| Static request metadata | IP, asset path, timestamp and user agent processed by host | Governed by host and disclosed publicly |
| Exported file | User-triggered JSON export | Controlled by user after download; application explains risk |

Salary and payroll data are treated as sensitive product data even where a field may not receive a special legal category.

## 4. Data-handling matrix

| Data or operation | Processing location | Default persistence | Network transmission | User control | Safeguard |
| --- | --- | --- | --- | --- | --- |
| Current salary inputs | Browser | Active memory | Never for core use | Edit or reset | No URL or analytics values |
| Calculated results | Browser | Active memory | Never for core use | Recalculate or reset | Derived data treated like inputs |
| Offer comparison | Browser | Active memory | Never for core use | Edit, swap or reset | No hidden ranking or server call |
| Couple scenario | Browser | Memory unless saved | Never for core use | Edit or reset | People remain separate; names not required |
| Saved scenario | IndexedDB or approved local store | Until local deletion/browser clearing | Never | Save, load, rename or delete | Explicit save and shared-device warning |
| Preferences | Browser | Until reset | Only approved consent signal if required | Change or reset | No scenario values |
| Analytics consent | Browser | Until expiry/withdrawal | Choice may reach approved provider | Accept, reject or withdraw | No optional tracking before consent |
| Analytics event | Browser and approved provider | Provider retention | Yes after applicable consent | Withdraw future collection | Fixed schema; no arbitrary strings |
| Sanitised error report | Browser and approved provider | Provider retention | Optional | Privacy setting | Redaction before SDK |
| JSON export | Browser then user device | User-controlled file | No application transmission | Export and delete | Preview, warning and neutral filename |
| JSON import | Browser | Memory then optional save | Never | Cancel, import or reset | Size and schema validation |
| Clipboard copy | User device/OS | Platform-controlled | No application transmission | Explicit copy | State exactly what is copied |
| Generic app link | URL | Browser history | Normal navigation | Copy/share | No scenario data |
| Static asset request | Host/CDN | Host policy | Yes | Browser controls | No scenario data in path/query/referrer |

## 5. In-memory calculation state

The default lifecycle is:

1. the user enters values;
2. the browser holds the draft in application memory;
3. calculations run locally;
4. navigation inside the app may preserve the active draft;
5. reset, reload, tab closure or process termination may remove it unless explicitly saved.

Rules:

- no automatic upload or persistent save;
- no scenario data in cookies or service-worker caches;
- no scenario data in URLs, document titles or metadata;
- no form values in production console output;
- no sensitive state in global debugging objects;
- no unnecessary copies in DOM attributes.

The UI states that unsaved calculations may be lost on reload or tab closure.

## 6. Optional browser storage

### 6.1 Explicit save

If v1 enables saved scenarios, persistence begins only after “Save on this device.” Typing into the calculator does not silently create a persistent record.

Before the first save, explain:

- data stays in this browser profile on this device;
- anyone with profile access may be able to view it;
- clearing browser data or private browsing may remove it;
- NettoPilot DE cannot recover deleted or lost local data;
- local storage is not a substitute for device encryption.

### 6.2 Storage mechanism and record

Use IndexedDB unless an implementation review approves an equivalent local store. Do not use cookies, URL parameters, remote storage or analytics user properties.

A record contains only:

- random local identifier;
- optional local label;
- canonical inputs;
- calculation year;
- schema and contract versions;
- created and updated timestamps;
- display preferences required for the scenario.

Do not store formatted results when they can be deterministically recalculated. Names, email addresses, employer names and notes are excluded unless a later reviewed feature requires them.

### 6.3 Lifecycle and migration

- Users can delete one scenario or all saved scenarios.
- Local schema migrations are versioned, tested and never upload data.
- A failed migration does not silently discard records.
- Unsupported old records remain exportable where safe and display an explanation.
- The app must not claim automatic expiry unless it is implemented and tested.
- Browser clearing, storage limits and private modes may remove records without notice.

## 7. Reset, clear and delete behaviour

| Action | Effect | Does not affect |
| --- | --- | --- |
| Reset current calculation | Clears current memory inputs, results and comparison state | Saved scenarios and privacy preference |
| Delete saved scenario | Removes selected local record | Other scenarios |
| Delete all saved scenarios | Removes all persisted scenario records | Language and consent unless stated |
| Reset privacy choices | Removes analytics choice and stops future optional collection until a new choice | Salary scenarios |
| Clear all NettoPilot DE data | Removes app-owned scenarios, drafts, preferences and consent records | Downloads, history, clipboard or provider-held past data |

Destructive actions require clear scope. Delete-all requires confirmation and reports success or failure.

The app must not claim to delete downloaded files, copied content, browser history, screenshots, operating-system backups or data already processed by an approved provider under its retention rules.

## 8. Share-link policy

### 8.1 V1 decision

V1 does not generate scenario-bearing share links. A copied URL may identify a public route, language or documentation page, but never contains:

- salary, bonus, tax, insurance or family inputs;
- calculated results;
- employer, offer or benefit labels;
- saved-scenario identifiers;
- compressed, encoded or encrypted scenario payloads.

There is no “secret link” claim in v1.

### 8.2 Future links

A future scenario-link feature requires a separate privacy and threat review covering remote storage versus URL fragments, encryption and key handling, expiry, revocation, deletion, visible metadata, browser history, clipboard, referrer, extension and recipient risks.

Encoding is not encryption. URL fragments may avoid ordinary host transmission but can still appear in browser history, extensions, screenshots, clipboard synchronisation and recipient devices.

## 9. JSON export and import

### 9.1 Export

Export is explicit. Before download, show:

- which scenarios are included;
- that salary and payroll data may be present;
- that the file is not automatically encrypted;
- that anyone with the file may be able to read it;
- a recommendation to store and share it securely.

The export contains only schema/format version, calculation year, contract versions, selected canonical inputs, optional label and compatibility assumptions. Canonical results are included only if a defined portability need requires them.

It excludes analytics IDs, consent records, browser/device IDs, IP addresses, debug logs, unrelated scenarios and hidden application state. The filename must not include salary, employer, person or result values.

### 9.2 Import

Import reads the selected file locally and never uploads it.

Before acceptance:

- enforce a conservative file-size limit;
- parse data, never executable code;
- validate schema and version;
- reject unsafe keys and object shapes;
- validate all fields through the current input contract;
- follow a documented unknown-field migration policy;
- escape labels before display;
- preview warnings;
- require separate confirmation before persistent save.

Invalid file content must not be attached to an error report.

## 10. Analytics model

### 10.1 Default and consent

Core calculation works without analytics. Optional analytics remain disabled until the applicable consent decision. Rejecting or withdrawing analytics does not reduce calculation, comparison, save, import or export features.

The consent interface provides equally clear accept and reject choices, details and a later change control. Implementation follows the approved legal basis and launch-jurisdiction review.

### 10.2 Allowlisted events

Only a central typed adapter emits analytics.

| Event | Allowed properties |
| --- | --- |
| page_view | Route identifier, language and application version |
| calculator_started | Calculation mode identifier |
| calculator_completed | Supported/incomplete/unsupported/error state |
| comparison_started | Comparison feature version |
| comparison_completed | Completion state and unavailable-dimension count |
| validation_error_shown | Stable field identifier and error code |
| language_changed | Supported from/to language codes |
| privacy_choice_changed | Consent category state |
| save_action | Save/load/delete action and success/failure |
| import_export_action | Action, schema version and success/failure |
| ui_interaction | Allowlisted component/action identifier |
| performance_measure | Named metric, duration and application version |

Properties pass a fixed schema. Arbitrary strings, object spreading, form-state attachment and dynamic event names are prohibited.

### 10.3 Never collect in analytics

- salary, bonus, pension, benefit or one-off amounts;
- gross, net, deductions, employer cost, rates, differences or break-even results;
- exact or bucketed income;
- tax class, church-tax status or allowances;
- date of birth, age or age range;
- child status/count or couple composition;
- insurance type, insurer rate, premiums or subsidy;
- calculation-derived federal state;
- working hours, vacation, remote days or commute data;
- employer, offer, benefit or scenario labels;
- import/export content or filenames;
- validation input text;
- query strings, URL fragments, full referrers or data-bearing titles;
- advertising IDs or cross-site profiles;
- hashes or buckets derived from scenario data;
- free text, complete client state or DOM snapshots.

Hashing or bucketing a prohibited value does not make it allowed.

### 10.4 Identity and retention

V1 analytics does not set person, email, account or advertising IDs. Prefer session-scoped or cookieless measurement when approved. Use the shortest practical reviewed retention and disable advertising, profiling, data sharing and cross-site tracking.

## 11. Logging and error reporting

Production logs contain approved technical events only. Never log inputs, results, full state, imports, exports, clipboard content or local records.

If client error reporting is enabled, a wrapper must:

- emit stable error/component codes;
- remove query strings and URL fragments;
- remove request/response bodies;
- remove breadcrumbs containing input changes or clicked text;
- disable session replay, DOM snapshots and keystroke capture;
- scrub local storage, IndexedDB, cookies and state;
- block attachments by default;
- sanitise stack metadata;
- test redaction with sensitive fixtures.

Validation failures and unsupported cases are product states, not detailed exceptions. Unhandled errors show a local message and copyable sanitised diagnostic code.

## 12. Third-party services, cookies and network controls

### 12.1 Approved categories

V1 may use a static host/CDN, consent mechanism, optional approved analytics provider and optional approved sanitised error-reporting provider.

Every provider requires documented purpose, transmitted fields, location, retention, configuration owner and privacy-notice entry.

### 12.2 Prohibited by default

Do not embed:

- advertising or retargeting pixels;
- social-media tracking widgets;
- replay or heat-map scripts;
- chat widgets that read page content;
- unreviewed remote fonts, images or scripts;
- third-party calculators;
- AI assistants receiving scenario data;
- fingerprinting libraries;
- cross-site identity services.

Prefer self-hosted fonts, icons, scripts and assets.

### 12.3 Cookies and controls

No cookie contains scenario data. Necessary storage is documented. Optional identifiers follow consent and are removed or disabled on withdrawal subject to disclosed provider limitations.

The deployment should use HTTPS, a restrictive Content Security Policy, strict referrer policy, framing protection where compatible, reviewed dependencies, no mixed content, an outbound-domain allowlist and automated checks for unexpected requests.

The core acceptance test is that calculating, comparing, saving locally, importing and exporting produce no scenario-bearing network request.

## 13. Data minimisation

The core calculator does not require:

- name, email, phone or address;
- employer name;
- tax or social-insurance identifier;
- insurance membership number;
- bank data;
- account credentials;
- precise location.

Date of birth is used only because age-dependent rules may apply. If a less precise value becomes sufficient, prefer it after calculation review.

Optional labels stay optional. Recommend neutral labels such as “Current offer” and “Offer B.” Explain “why we ask” for fields whose purpose is not obvious.

## 14. User-facing privacy controls

An always-accessible privacy area shows:

- the browser-only processing explanation;
- saved-on-device status and scenario count;
- delete-one and delete-all controls;
- import/export explanation;
- analytics status and change control;
- hosting and third-party disclosure;
- full privacy-notice link;
- application and privacy-contract version.

The calculator shows a concise local-processing message near the start. Controls are keyboard accessible, screen-reader labelled and not dependent on colour.

## 15. German and English core copy

| Identifier | German | English |
| --- | --- | --- |
| privacy.local.summary | Deine Gehaltsdaten werden für die Berechnung in diesem Browser verarbeitet und nicht an einen NettoPilot-DE-Anwendungsserver gesendet. | Your salary data is processed in this browser and is not sent to a NettoPilot DE application server. |
| privacy.memory.notice | Nicht gespeicherte Eingaben können beim Neuladen oder Schließen des Tabs verloren gehen. | Unsaved inputs may be lost when you reload or close the tab. |
| privacy.save.action | Auf diesem Gerät speichern | Save on this device |
| privacy.save.warning | Personen mit Zugriff auf dieses Browserprofil können gespeicherte Szenarien möglicherweise sehen. | People with access to this browser profile may be able to view saved scenarios. |
| privacy.delete.one | Gespeichertes Szenario löschen | Delete saved scenario |
| privacy.delete.all | Alle lokalen Szenarien löschen | Delete all local scenarios |
| privacy.clear.all | Alle NettoPilot-DE-Daten in diesem Browser löschen | Clear all NettoPilot DE data in this browser |
| privacy.export.warning | Die Exportdatei kann sensible Gehalts- und Steuerdaten enthalten und ist nicht automatisch verschlüsselt. | The export file may contain sensitive salary and tax data and is not automatically encrypted. |
| privacy.import.local | Die ausgewählte Datei wird lokal in deinem Browser gelesen und nicht hochgeladen. | The selected file is read locally in your browser and is not uploaded. |
| privacy.analytics.accept | Optionale Analyse zulassen | Allow optional analytics |
| privacy.analytics.reject | Optionale Analyse ablehnen | Reject optional analytics |
| privacy.analytics.change | Datenschutzeinstellungen ändern | Change privacy settings |
| privacy.share.disabled | Links enthalten in Version 1 keine Gehaltsszenarien. | Links do not contain salary scenarios in version one. |
| privacy.reset.current | Aktuelle Berechnung zurücksetzen | Reset current calculation |
| privacy.host.limit | Der Hosting-Anbieter kann technische Zugriffsdaten wie IP-Adresse und Zeitpunkt verarbeiten. | The hosting provider may process technical access data such as IP address and timestamp. |

Final translations require native-language and legal review. Copy must not imply protection from the user's device, extensions, malware or voluntary sharing.

## 16. Threat model

| Threat | Example | V1 mitigation | Residual limitation |
| --- | --- | --- | --- |
| Shared profile | Another household member opens saved scenarios | Explicit save, delete controls and warning | No local-user authentication |
| Browser extension | Extension reads form/page | Minimise DOM exposure and third parties | Permissioned extensions may read data |
| Compromised device | Local process reads storage | No server copy; recommend device security | Cannot protect a compromised device |
| Browser history | Sensitive URL state | No scenario data in URLs | Generic routes remain |
| Clipboard sync | Copied result syncs elsewhere | Explicit copy and content explanation | OS/browser controls clipboard |
| Export leakage | JSON shared insecurely | Preview, warning and neutral filename | User controls downloaded file |
| Screenshot/print | Result captured | No automatic capture | Device/user controls capture |
| Third-party script | Dependency exfiltrates state | Self-host, CSP and dependency review | Supply-chain risk remains |
| Analytics regression | Form values added to event | Typed allowlist and payload tests | Requires ongoing review |
| Error-report leakage | SDK captures state | Wrapper, scrubber and no replay | Provider processes allowed diagnostics |
| Static host logging | Host logs IP/request | No scenario data in requests | Access metadata may remain |
| Malicious import | Crafted JSON attacks parser/UI | Limits, safe parse, schema validation and escaping | Resource risk reduced, not eliminated |
| Shoulder surfing | Nearby person sees screen | Quick reset and clear design | Screen visibility remains user responsibility |
| Service-worker cache | Sensitive response cached | No scenario API/state caching | Static assets remain cached |

## 17. Verification requirements

Automated and manual verification covers:

1. complete calculations send no input or result values;
2. comparisons and break-even calculations remain local;
3. local save occurs only after explicit action;
4. reset and deletion affect exactly the stated stores;
5. export filenames/metadata contain no hidden identifiers;
6. imports run without upload;
7. rejected analytics sends no optional analytics request;
8. accepted analytics emits only allowlisted schemas;
9. representative sensitive values never appear in requests, logs, error reports, URLs, titles or analytics;
10. diagnostic URLs are scrubbed;
11. production has no state logging or replay;
12. outbound domains match the allowlist;
13. controls work by keyboard and screen reader;
14. German and English explain the same behaviour;
15. clear-all covers every app-owned browser store.

Tests use unique canary values to detect exact and transformed leakage.

## 18. Governance and change control

Maintain a versioned data-flow inventory with data class, source, purpose, processing location, persistence, recipients, retention, consent or other approved basis, deletion path, owner and review date.

Any change to storage, network calls, analytics, error reporting, import/export, URLs or third-party dependencies includes a privacy-impact checklist.

Update the public notice and consent copy before deploying a material flow change. Legal and security owners review new recipients or server-side processing.

## 19. Future accounts or cloud storage

Accounts, sync or server storage require a new design covering:

- controller/processor roles and provider agreements;
- lawful basis and notices;
- authentication, authorisation and recovery;
- encryption in transit and at rest;
- key and secret management;
- user/tenant isolation and access logging;
- retention, deletion, export and correction;
- backup deletion/restoration behaviour;
- incident response;
- abuse prevention and rate limits;
- data location and international transfers;
- consent migration;
- threat modelling, security testing and privacy-impact assessment;
- a migration path that never uploads local scenarios without explicit action.

No future feature may silently convert local records into cloud records.

## 20. Explicitly deferred or prohibited in v1

V1 has no:

- account or login;
- cloud scenario storage or sync;
- scenario-bearing share link;
- server-side calculation;
- AI analysis of payslips, offers or scenarios;
- document upload;
- email delivery of results;
- advertising, retargeting or data brokerage;
- session replay;
- automatic feedback containing scenario state;
- support-agent access to calculations;
- remote recovery of deleted local scenarios.

## 21. Engineering handoff

Implementation should create:

1. an in-memory scenario store with no automatic persistence;
2. a versioned local repository for explicitly saved scenarios;
3. reset, delete-one, delete-all and clear-all actions;
4. a local-only import/export service;
5. a typed analytics allowlist;
6. a sanitising error-report wrapper;
7. an outbound-domain policy and network regression test;
8. a privacy settings screen and bilingual copy;
9. production guards against console/state logging;
10. privacy canary fixtures and leakage tests;
11. a versioned data-flow inventory;
12. a release checklist for privacy-impacting changes.

Core calculation code must not depend on analytics, consent or a remote service.

## Acceptance check for NP-PD-007

- [x] Browser-only processing and static-host boundaries are explicit.
- [x] V1 has no application-server storage of salary inputs or results.
- [x] In-memory state and loss-on-close behaviour are defined.
- [x] Optional local save requires explicit action.
- [x] Reset, delete and clear-all scopes are defined.
- [x] Scenario-bearing share links are prohibited in v1.
- [x] JSON export/import remain local and disclose risks.
- [x] Analytics has an allowlist and sensitive-value prohibition list.
- [x] Logging and error-report restrictions are defined.
- [x] Third-party, cookie and network boundaries are defined.
- [x] Data minimisation requirements are explicit.
- [x] German and English core privacy copy is included.
- [x] Consent controls preserve core functionality.
- [x] Shared-device, extension, export and supply-chain threats are documented.
- [x] Verification includes canary and outbound-request tests.
- [x] Future accounts/cloud storage require a new design.
