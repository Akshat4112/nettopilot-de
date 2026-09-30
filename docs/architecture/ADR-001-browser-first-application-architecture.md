# ADR-001 — Browser-first application architecture

**Status:** Proposed for review  
**Task:** NP-FND-004  
**Milestone:** M2 Foundation  
**Depends on:** NP-PD-004 through NP-PD-007  
**Decision date:** 2026-09-30

## Context

NettoPilot DE must turn versioned German payroll rules into deterministic,
explainable results while remaining a static, browser-only application. The
product specifications require salary calculation, offer comparison,
localisation and optional on-device persistence without allowing presentation,
storage or analytics concerns to become hidden calculation inputs.

The repository currently contains a React and Vite shell. Before salary-domain
types or formulas are implemented, the project needs explicit module
boundaries, dependency rules and stable interfaces. Those rules must support:

- canonical inputs and outputs from NP-PD-004 and NP-PD-005;
- comparison-only dimensions from NP-PD-006;
- the browser-only privacy contract from NP-PD-007;
- versioned assumptions and source evidence from NP-RS-001 through NP-RS-014;
- deterministic unit testing without React, browser storage or network access;
- German and English presentation without translated strings entering the
  calculation engine.

## Decision

Adopt a browser-first, ports-and-adapters architecture with a pure TypeScript
calculation core. Dependencies point inward toward domain contracts. React,
browser APIs, persistence implementations and translated copy remain adapters
at the outside of the system.

The initial module map is:

```text
src/
  domain/          Canonical types, money rules and pure calculations
  assumptions/     Versioned parameter models, registry and loaders
  validation/      Input, scope-admission and import validation
  application/     Use cases that coordinate domain ports
  comparison/      Offer and couple arithmetic built on individual results
  persistence/     Local repository ports and browser adapters
  i18n/            Message catalogues, locale selection and formatting
  presentation/    React routes, views, forms and view models
  platform/        Browser, analytics and diagnostic adapters
  config/          Non-sensitive build and application configuration
```

Directories are introduced by the task that first owns executable code in that
area. This ADR defines their contracts; it does not pre-empt NP-CALC-001 by
creating the salary-domain model.

## Architectural principles

1. **One canonical model.** UI forms, imports and saved records are converted
   into the same validated scenario model before calculation.
2. **Pure calculation core.** Given validated inputs and one immutable
   assumption set, calculations return the same result without I/O, clocks,
   locale state or browser globals.
3. **Versioned facts are dependencies.** Legal rates and thresholds enter
   through a verified assumption-set port; they are never uncited constants in
   formulas or components.
4. **Validation precedes calculation.** Missing, invalid and unsupported states
   are first-class outcomes. The engine never manufactures a plausible result
   from incomplete material inputs.
5. **Individual calculation is the primitive.** Offer and couple views compose
   independently calculated people; they do not introduce a joint-tax model.
6. **Formatting is not arithmetic.** Domain values use canonical units and
   identifiers. Currency, percentages, dates and messages are formatted only at
   the presentation boundary.
7. **Persistence is optional and explicit.** Application use cases depend on a
   local repository interface. Typing into a form does not persist a scenario.
8. **Privacy constrains adapters.** Core calculation needs no application
   backend and makes no network request. Analytics and diagnostics cannot
   receive scenario inputs or derived financial values.
9. **Errors are data.** Expected validation, support and compatibility failures
   use typed outcomes, not exceptions or translated strings.
10. **Public contracts change deliberately.** Breaking changes to canonical
    inputs, outputs, assumptions or saved records require explicit versioning
    and migration decisions.

## Layers and responsibilities

| Area | Owns | Must not own |
| --- | --- | --- |
| `domain` | Canonical salary types, money/rounding primitives, payroll formulas, result contracts and stable rule identifiers | React, browser APIs, storage, translation, analytics or network access |
| `assumptions` | Assumption-set schema, supported-year registry, source/version metadata and verified lookup | Form defaults that are not legal assumptions, UI copy or silent fallbacks |
| `validation` | Parsing boundary values, field validation, cross-field rules, scope admission and import compatibility | Payroll formulas, formatted messages or persistence |
| `application` | Calculate, compare, save, load, import, export and reset use cases; orchestration of ports | Legal constants, DOM access or provider-specific storage code |
| `comparison` | Two-offer deltas, conservative/total views, effective-hour measures, break-even orchestration and simple couple totals | Joint filing simulation, subjective rankings or storage |
| `persistence` | Scenario repository contract, record envelope, migrations and IndexedDB implementation | Recalculated result snapshots when inputs are sufficient, cookies or cloud sync |
| `i18n` | German/English catalogues, locale choice, number/date presentation and message resolution | Business decisions, formula branching or field identity |
| `presentation` | React routes, accessible controls, draft state, view models and user interaction | Payroll arithmetic, assumption constants, direct IndexedDB calls or analytics SDK calls |
| `platform` | Allowlisted analytics, sanitised diagnostics and browser capability adapters | Salary values, arbitrary labels, full URLs or calculated results |
| `config` | Public build-time settings such as the application base path | Secrets, salary data or legal parameters |

## Dependency direction

The allowed compile-time direction is inward:

```text
presentation ──> application ──> domain
       │               │            ▲
       ├──> i18n       ├──> validation
       ├──> platform   ├──> comparison
       └──> persistence adapters ──> persistence ports
                            │
assumption loaders ──> assumptions contracts ──> domain-compatible values
```

The diagram describes dependency direction, not runtime call order.

### Import rules

- `domain` imports only domain modules and dependency-free shared primitives.
- `assumptions` may import domain identifiers/value types, but domain formulas
  do not import JSON files or a concrete loader.
- `validation` may import canonical domain and assumption contracts.
- `comparison` may import domain results and pure comparison primitives.
- `application` may import domain, assumptions, validation, comparison and
  persistence port contracts.
- `presentation` may import application-facing contracts, view models, i18n and
  platform ports. Components do not import domain formula implementations.
- Concrete IndexedDB, analytics, diagnostic and browser adapters are composed
  at the application entry point.
- No inner module imports React, React DOM, `window`, `document`, IndexedDB,
  `localStorage`, an analytics SDK or translated message catalogues.
- Deep relative imports into another area's internals are forbidden. Each area
  exposes an intentional public entry point when executable modules arrive.

NP-FND-005 will select and configure automated enforcement for these rules.

## Stable port contracts

The following TypeScript-like signatures define responsibilities and naming.
Concrete types are introduced and tested by their owning implementation tasks.

### Assumptions

```ts
interface AssumptionSetRepository {
  listSupportedYears(): readonly CalculationYear[]
  load(year: CalculationYear): Promise<AssumptionSetLoadResult>
}

type AssumptionSetLoadResult =
  | { status: 'ready'; value: AssumptionSet }
  | { status: 'unsupported-year'; year: number }
  | { status: 'invalid-set'; issues: readonly ContractIssue[] }
```

The loaded set contains calculation year, schema version, rule version, source
record references and verification metadata. Consumers never select “nearest”
year data when an exact supported year is unavailable.

### Validation and scope admission

```ts
interface ScenarioValidator {
  validate(
    draft: SalaryScenarioDraft,
    assumptions: AssumptionSet,
  ): ScenarioValidationResult
}

type ScenarioValidationResult =
  | { status: 'valid'; value: ValidatedSalaryScenario }
  | { status: 'invalid'; issues: readonly FieldIssue[] }
  | { status: 'unsupported'; reasons: readonly SupportIssue[] }
```

Issues contain stable field and rule identifiers plus structured parameters.
They contain no translated text. Missing remains distinct from zero, and an
unsupported case remains distinct from invalid entry.

### Salary calculation

```ts
interface SalaryCalculator {
  calculate(
    scenario: ValidatedSalaryScenario,
    assumptions: AssumptionSet,
  ): SalaryCalculationResult
}
```

The result contains canonical monetary amounts, recurring/annual views,
deduction components, employer contributions, effective rates, warnings and
calculation/source version metadata. Domain money values cannot be binary
floating-point euro amounts; NP-CALC-003 owns the precision representation and
rounding implementation.

### Comparison

```ts
interface OfferComparisonService {
  compare(input: ValidatedOfferComparison): OfferComparisonResult
}

interface CoupleTotalService {
  combine(
    first: SalaryCalculationResult,
    second: SalaryCalculationResult,
  ): SimpleCoupleTotalResult
}
```

Comparison consumes complete individual results plus comparison-only inputs.
It never changes payroll deductions. A couple result is labelled as arithmetic
combination and never implies joint assessment.

### Persistence

```ts
interface ScenarioRepository {
  list(): Promise<readonly SavedScenarioSummary[]>
  get(id: LocalScenarioId): Promise<SavedScenarioLoadResult>
  save(record: SaveScenarioCommand): Promise<SaveScenarioResult>
  delete(id: LocalScenarioId): Promise<DeleteScenarioResult>
  deleteAll(): Promise<DeleteAllScenariosResult>
}
```

The repository stores canonical inputs and contract versions, not formatted
results that can be recomputed. The application layer invokes it only after an
explicit user save/delete action. The first implementation is local IndexedDB;
the port does not promise cloud storage.

### Localisation

```ts
interface MessageResolver {
  message(id: MessageId, values?: MessageValues): string
}

interface ValueFormatter {
  money(value: Money, options?: MoneyFormatOptions): string
  percent(value: Rate, options?: RateFormatOptions): string
  date(value: IsoDate): string
}
```

Domain and validation modules emit identifiers and structured values. The UI
resolves German or English wording and applies locale formatting afterwards.

## End-to-end data flow

1. Presentation captures a draft. Empty fields remain empty; parsing does not
   coerce them to zero.
2. The application use case requests the exact selected-year assumption set.
3. Validation parses canonical units, checks fields and cross-field rules, then
   performs scope admission.
4. Only a valid, supported scenario reaches the salary calculator.
5. The pure calculator returns canonical amounts and rule/source metadata.
6. Comparison use cases combine complete individual results with explicitly
   separate comparison-only inputs.
7. Presentation maps typed issues/results to a view model, resolves messages and
   formats values for `de-DE` or `en-DE`.
8. Persistence occurs only through an explicit save command. Analytics, when
   consented, receives only allowlisted event identifiers and coarse states.

At no stage does formatted UI text become a calculation input.

## State ownership

| State | Owner | Lifetime |
| --- | --- | --- |
| Active form draft | Presentation/application state | Memory by default |
| Validated scenario | Application use case | One operation or active session |
| Assumption set | Assumption registry/loader | Immutable, cacheable by exact version |
| Calculation result | Application state | Recomputed from validated inputs |
| Saved scenario | Local repository adapter | Until explicit local deletion/browser clearing |
| Locale and display preferences | i18n/preference adapter | May persist without scenario values |
| Analytics consent | Privacy preference adapter | Per approved consent lifecycle |

React components do not become the canonical store for legal assumptions or
calculated results. Derived results are recalculated rather than independently
edited.

## Error and result policy

- Expected business outcomes use discriminated unions with stable codes.
- Exceptions are reserved for programming faults or unavailable platform
  capabilities and are converted into a sanitised application failure.
- An unavailable assumption set blocks calculation; it does not fall back to a
  different year.
- Validation issues identify a canonical field path and code. Localised copy is
  resolved at the presentation edge.
- Unsupported cases show the relevant scope reason and preserve user input for
  correction, but they do not show a normal net result.
- Unknown outputs remain unknown and include a reason; they are not zero.
- Diagnostics may contain a stable code, app version and route identifier, but
  no draft, salary, result, arbitrary label or full URL.

## Assumption and result versioning

Every normal calculation result exposes enough metadata to reproduce its rule
context:

- calculation year;
- assumption-set identifier and version;
- calculation-contract/engine version;
- applicable source-record identifiers;
- calculation timestamp supplied by the outer application when needed for
  display, not used as a formula input;
- warnings for provisional, superseded or compatibility states.

Version metadata travels with exports and saved inputs according to NP-PD-007.
It does not permit a stale or unverifiable set to be silently treated as current.

## Privacy and network boundary

The core path—parse, validate, calculate, compare, format, save locally, import
and export—must work without sending scenario data over the network.

- Static application and assumption assets may be fetched from the approved
  host before a calculation.
- Asset URLs never contain scenario or result data.
- Core ports have no remote-calculation implementation in v1.
- Scenario persistence uses an on-device adapter after explicit user action.
- Shareable URLs contain public route/language state only.
- Analytics and diagnostics are separate platform ports with fixed schemas and
  redaction before provider SDKs.
- An account, cloud repository, remote calculation API or scenario-bearing link
  is an architecture change requiring privacy review.

## Testing strategy enabled by the boundaries

| Test level | Boundary under test |
| --- | --- |
| Domain unit | Pure formula with fixed validated input and immutable assumptions |
| Validation unit | Draft-to-valid/invalid/unsupported outcomes and stable issue codes |
| Assumption contract | Schema, registry, source metadata and exact-year loading |
| Comparison unit | Individual-result composition without payroll mutation |
| Persistence contract | Repository behaviour, migration and failure outcomes |
| Component | View model, accessibility, locale resolution and user interaction with fake ports |
| End to end | Browser composition using production adapters and local-only data flow |
| Reference scenario | Full result against approved official fixtures and recorded tolerances |

NP-FND-006 and NP-FND-007 own the test frameworks. Calculation tasks own their
domain fixtures and reference assertions.

## Security and trust consequences

- A malicious imported file is handled by validation before it can become a
  scenario or saved record.
- Persisted records carry schema versions and pass validation again when loaded.
- UI labels and imported strings never select formulas or executable modules.
- The browser adapter prevents accidental direct use of storage or analytics
  inside domain code.
- Source and rule metadata can be surfaced with results without coupling the
  domain engine to translated explanations.

These boundaries reduce accidental leakage and hidden coupling; they do not by
themselves protect a compromised device, browser extension or dependency.

## Consequences

### Benefits

- Payroll rules can be tested independently of React and the browser.
- Annual assumption updates do not require duplicating legal constants across
  components.
- German and English journeys share calculation semantics.
- Storage can evolve without changing formula code or weakening explicit-save
  behaviour.
- Offer comparison cannot silently contaminate individual payroll results.
- Privacy and diagnostic restrictions have enforceable integration seams.

### Costs

- Small features cross explicit draft, validation, application and presentation
  boundaries.
- Mapping between canonical values and view models creates deliberate code.
- Contract and assumption versions require maintenance and migration tests.
- Dependency rules need automated enforcement as the repository grows.

The additional structure is accepted because calculation correctness,
explainability and privacy are core product requirements.

## Rejected alternatives

### Put calculations in React hooks or components

Rejected because formula correctness would depend on rendering/state behaviour,
reuse would be limited and untranslated/raw values could mix with display text.

### One global application store containing drafts, assumptions and results

Rejected as the architectural primitive because ownership and persistence would
become implicit. A UI state library may later coordinate view state, but it must
respect these contracts and derived-result rules.

### Fetch results from an application backend

Rejected for v1 because it conflicts with the accepted browser-only privacy
model and is unnecessary for deterministic public calculations.

### Store formatted results as the source of truth

Rejected because locale changes, assumption updates and migrations would leave
stale or ambiguous values. Canonical inputs plus versions are the durable truth.

### Import assumption JSON directly inside formula modules

Rejected because it hides the selected version, complicates testing and permits
uncited constants to enter the engine without an explicit contract.

## Implementation sequence and ownership

| Follow-on | Architectural responsibility |
| --- | --- |
| NP-FND-005 | Formatting, lint/type scripts and automated import-boundary enforcement |
| NP-FND-006 | Unit/component test framework and deterministic test environment |
| NP-FND-007 | Browser smoke-test foundation |
| NP-CALC-001 | Canonical salary-domain types and public domain entry point |
| NP-CALC-002 | Validation result model and validated-scenario boundary |
| NP-CALC-003 | Money/rate precision and rounding primitives |
| Assumption implementation tasks | Repository, exact-year registry and schema-backed loaders |
| Calculator UI tasks | Presentation/view models and application composition |
| Persistence tasks | IndexedDB adapter, record envelope and migrations |
| Localisation tasks | Typed catalogues, message resolution and locale formatting |

## Acceptance checklist

- [x] Domain calculations, assumptions, validation, presentation, localisation
  and persistence have distinct responsibilities.
- [x] Compile-time dependency direction and prohibited imports are explicit.
- [x] Stable ports cover assumption loading, validation, calculation,
  comparison, local persistence and localisation.
- [x] Browser-only processing and analytics/diagnostic restrictions match
  NP-PD-007.
- [x] Missing, invalid, unsupported and unknown states cannot silently become
  normal numeric results.
- [x] Assumption and result version metadata are part of the architecture.
- [x] Individual payroll results remain the primitive for offer and couple
  views.
- [x] Concrete domain modelling remains assigned to NP-CALC-001.
- [x] Code-quality and test-framework choices remain assigned to NP-FND-005
  through NP-FND-007.

## Review triggers

Revisit this ADR before introducing any of the following:

- an application backend, account or cloud scenario storage;
- remote calculation or AI payslip analysis;
- scenario data in URLs or share links;
- worker/server execution that changes the trusted calculation boundary;
- a second calculation engine or non-German payroll jurisdiction;
- joint-tax modelling instead of arithmetic couple totals;
- an assumption source that cannot provide the required verification metadata.
