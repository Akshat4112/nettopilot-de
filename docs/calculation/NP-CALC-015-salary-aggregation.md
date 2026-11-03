# NP-CALC-015 — Monthly and annual salary result aggregation (2026)

## Contract

`aggregateSalaryResults2026` accepts exactly twelve month-specific **admitted, pre-calculated** payroll components. It does not estimate tax or insurance on its own, and does not treat missing values as zero. The upstream scenario admission and engines must produce complete values (including tax, social insurance, PKV employer subsidy and verified one-off settlements). If an upstream month is incomplete or unsupported, the aggregate returns that state with the affected month.

All amounts use integer EUR cents and overflow checking. Annual amounts are calculated by **summing the twelve monthly results**, never by multiplying an estimated monthly value by twelve. An effective deduction ratio is an observed gross-to-total-deduction fraction (parts per million), not an employee's marginal tax rate.

## Breakdown

Each month and the year provide:
- recurring gross, one-off gross, total gross;
- guaranteed and variable gross (variable does not imply guaranteed net);
- wage tax, solidarity surcharge, church tax;
- recurring employee pension, unemployment, statutory health and care deductions, plus one-off employee social contributions in the aggregate insurance total;
- regular employer pension, unemployment, health and care costs plus one-off employer social contributions in aggregate employer cost;
- payroll net (gross minus payroll tax/social deductions);
- external private-insurance cash outflow (premium minus employer subsidy), and estimated disposable cash after it;
- employer cost (gross plus represented employer contributions); and
- effective deduction ratio.

One-off taxes, social deductions and cost are taken from `BonusSettlement2026`, preserving bonus receipt month and guarantee status. Bonus inputs are checked for cash and employer-cost reconciliation to prevent double counting.

## Recurring net policy

`recurringMonthlyNetCents` is populated only when all twelve **recurring-only** monthly net-cash amounts match. If months vary because of tax, rates, employment or insurance changes, the field is null and `recurringMonthlyNetIsStable=false`. It never silently substitutes annual total divided by twelve, since a bonus month is not an ordinary recurring month.

## Scope and next tasks

NP-CALC-015 is an aggregate **output contract**, not a new annual-payroll computation engine. Monthly input construction from validated salary scenarios, jurisdictional payroll-tax evidence, private-insurance cash semantics, and bonus admission are handled by upstream modules. A result is `calculated` only when every month has a calculated upstream payload.

The itemised explanatory formula/source model is NP-CALC-016. Independent payslip reference fixtures are NP-CALC-017. The bilingual UI and browser-only scenario flow are subsequent NP-UI tasks. No salary data is stored or sent anywhere by this pure module.
