# NP-CALC-002 — Validated input schema

## Decision

`validateIndividualSalaryScenario` is the only supported boundary from
untrusted form, import, or share-link data into the canonical salary domain.
It accepts `unknown`, applies a year-specific option registry, and returns a
discriminated result.

- Success contains the complete `IndividualSalaryScenarioInput` and warnings.
- Failure contains field errors and warnings but never a partial domain value.
- Missing, explicit `unknown`, `false`, and numeric zero remain distinct.
- Monetary and rate inputs use canonical non-negative decimal strings; runtime
  validation does not convert them through binary floating-point numbers.

## Validation context

Callers provide a `SalaryValidationRules` record resolved from the approved
assumption set for the calculation year. It supplies the supported tax-class,
pension-status, unemployment-status, one-off classification, and maximum child
allowance options. The submitted calculation year must equal the registry year.
This keeps legal options out of the validator and prevents uncited constants
from entering the calculation engine.

## Enforced boundaries

The validator covers all canonical input groups from NP-PD-004:

- calculation context, locale, currency, and labels;
- v1 scope-admission answers, including explicit unknown states;
- base, recurring, and up to 12 one-off compensation entries;
- tax class, federal state, church-tax status, date of birth, child allowance,
  and annual allowance/additional amounts;
- statutory, private, and explicit-unknown health-insurance paths;
- pension, unemployment, care-insurance, and child-count inputs;
- working time, vacation, remote work, commute, and up to 20 benefits;
- field ranges, dependent fields, currency consistency, and aggregate annual
  compensation limits.

Annual compensation above EUR 1,000,000 produces a warning. Annual
compensation above EUR 10,000,000 is rejected. Private basic-coverage and known
employer-contribution amounts cannot exceed the combined monthly health and
care premium.

## Error contract

Every issue provides:

- a stable dot-separated field path;
- a machine-readable issue code;
- concise German and English user-facing messages.

Consumers may choose the message matching `context.locale`, focus the field by
path, and group repeated collection errors. Calculations must not run when
`success` is `false`; this prevents incomplete data from producing a
plausible-looking result.

## Non-goals and handoff

Locale-specific text entry parsing belongs at the form adapter before this
canonical boundary. Legal calculation formulas belong to later calculation
engine tasks. NP-CALC-003 may reuse the decimal-string invariant when it
introduces the shared monetary precision and rounding primitives.
