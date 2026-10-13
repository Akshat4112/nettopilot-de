# NP-CALC-010 — 2026 long-term-care contribution module

**Status:** Implemented  
**Calculation year:** 2026  
**Assumption set:** de-social-care-insurance-2026-v1  
**Research dependency:** NP-RS-007

## Supported calculation

The module calculates social long-term-care insurance for ordinary salaried
employees on the statutory path. It applies the EUR 5,812.50 monthly ceiling,
the nationwide 3.6% base rate, the employee-only childless surcharge, temporary
multi-child reductions, and Saxony's unequal employee/employer allocation.

Parent status and qualifying-child count are separate inputs. Parent status
permanently removes the childless surcharge; qualifying children from the
second through fifth temporarily reduce the employee rate by 0.25 percentage
points each. Counts above five remain valid but do not increase the reduction.

## Month-aware rules

The childless surcharge begins in the month after the employee's 23rd-birthday
month. Annual calculations therefore execute twelve monthly payroll periods.
They accept month-specific qualifying-child counts so a child aging out after
the month of their 25th birthday can change later payroll months without
altering recognised parent status.

Partial contribution months preserve the exact 30-day ceiling fraction through
the contribution calculation. Employee and employer shares are rounded
separately with half-up cent rounding. Expected one-cent differences between
Saxony and other states are not force-balanced.

## Boundaries and result quality

Unknown parent status, birth date, insurance path, qualifying-child count, or
payroll-relevant state blocks a normal result. Private insurance, transition
range, mini-job, student, pensioner, cross-border, possible surcharge-exception,
and one-off-payment paths fail closed for their dedicated future rules.

Confirmed payroll evidence produces an exact result. User-supplied legal status
that may not yet be recognised in payroll is labelled as a scenario estimate.
Every calculated result includes its rates, adjustments, state allocation,
contribution base, amounts, source identifiers, and assumption-set version.
