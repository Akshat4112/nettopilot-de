# NP-CALC-011 — 2026 solidarity-surcharge module

**Status:** Implemented  
**Calculation year:** 2026  
**Assumption set:** de-solidarity-surcharge-2026-v1  
**Research dependency:** NP-RS-008

## Supported calculation

The module calculates the 2026 payroll solidarity surcharge from the annual,
child-adjusted BMF assessment base (`JBMG`). It supports the basic and splitting
thresholds, the zero and taper zones, the full 5.5% rate, and exact annual,
monthly, weekly, and daily period allocation.

The input is an assessment tax amount, not gross salary or taxable income. The
existing BMF payroll-tax implementation remains responsible for deriving that
base, including the child-allowance treatment. It now calls this module for the
final surcharge arithmetic so the rule is reusable and independently testable.

## Recurring pay

- Basic threshold: EUR 20,350 annual assessment tax.
- Splitting threshold: EUR 40,700 annual assessment tax.
- At or below the applicable threshold: zero surcharge.
- Above the threshold: the lower of 5.5% of the assessment base and 11.9% of
  the amount above the threshold.
- The exact lower rate candidate is preserved through period allocation;
  fractions of a cent are discarded only at the annual or selected-period
  output boundary.

Each result identifies the applied zone, threshold, rates, annual amount,
period amount, sources, calculation year, and assumption-set version.

## Other remuneration

For supported other remuneration, the module tests the annual assessment base
after the payment against the applicable threshold. Once the gate is passed,
it applies 5.5% to the wage tax attributable to the other remuneration. The
recurring-pay taper is intentionally not applied to this incremental amount.

## Boundaries

The module implements payroll withholding for 2026 only. It does not calculate
final assessed income tax, annual tax-return liability, capital-income SolZ,
flat-rate wage-tax cases, or derive an assessment base directly from gross pay.
Unsupported upstream BMF inputs continue to fail in the payroll-tax preparation
and calculation layers before this arithmetic is called.
