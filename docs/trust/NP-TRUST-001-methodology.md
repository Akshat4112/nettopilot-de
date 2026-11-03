# NP-TRUST-001 — Public calculation methodology

## Published surface

`src/components/CalculationMethodology.tsx` supplies a public, named section at
`#methodology`. It is static application content, available without submitting
salary inputs. The parent application mounts it once and may link to the anchor.
It makes no network requests, loads no remote evidence at runtime, adds no
analytics and stores no user data. Official source links are ordinary links;
opening one is a reader action.

The copy distinguishes the current interface's admitted scenarios from broader
calculation modules. A module implementation or fixture is not proof that a
scenario is connected to the interface. It makes no independent certification,
accuracy percentage or freshly audited legal-currentness claim.

## Current supported calculation

The authoritative integration for this explanation is
`src/components/calculate-simple-salary.ts`, together with its essential and
advanced validators and `src/domain/salary/salary-boundary.ts`:

- Germany, EUR, 2026; confirmed ordinary employment for a full year, compulsory
  pension, unemployment and statutory general-rate health insurance;
- twelve equal payroll months and 30 contribution days per month;
- monthly gross strictly greater than EUR 2,000 and strictly less than
  EUR 5,800; these conservative application bounds are not presented as legal
  thresholds;
- classes I, III, IV without factor, V and VI; no children and no church tax;
- birth dates inclusive from 1963-01-01 to 2002-12-31; Saxony is passed to the
  care-insurance module rather than assumed equal to other states;
- an optional explicitly entered additional GKV rate; blank uses the module's
  2.9% published average estimate, not an insurer-specific rate;
- no allowances, tax additions, private premiums, one-off bonus or special
  wage components in the connected calculation.

Missing or invalid inputs remain incomplete; unsupported scenarios remain
unsupported. The copy does not promise results for minijobs, transition-range
employment, civil servants, self-employment, cross-border work or other special
cases. Eligibility outside the admitted profile requires further research and
integration, not interpolation from supported salaries.

## Monthly/annual and precision basis

The UI adapter requires annual gross to divide into twelve equal integer-cent
monthly amounts. The broader `frequency.ts` module can preserve exact annual
quotients, but that is not represented as current UI admission. Every supported
calculation builds all twelve monthly payroll rows; `salary-aggregation.ts`
sums them for the annual result. Switching display period does not change the
underlying employment scenario or invoke the BMF annual-payment path. A stable
recurring monthly value is required before a monthly value is shown.

The BMF 2026 machine plan is the governing wage-tax/solidarity algorithm, not a
net-salary or actual social-insurance calculator. Actual RV/AV/GKV/PV shares
come from separate source-backed modules. Net payroll deducts employee tax and
insurance shares; employer shares belong to employer-cost context.

`payroll-tax.ts` uses exact rational intermediates and explicit BMF rounding.
Insurance modules preserve exact intermediate products and perform the
applicable BVV share rounding. The public copy describes these observable
rules without claiming that every module uses the shared `ExactDecimal` class.
Canonical monetary equality uses integer EUR cents before formatting. An hourly
ratio has a separate denominator and presentation precision, not a payroll
rounding rule. Supporting records: NP-CALC-003, NP-CALC-004, NP-CALC-006 and
NP-CALC-015.

## Comparison boundary

`offer-net-calculation.ts` runs the same admitted base-salary calculation for
each offer with shared payroll assumptions. Signed differences are B minus A.
Recurring additional cash, variable cash and one-offs block that offer's net
estimate; they are neither silently ignored nor converted using a flat ratio.
NP-CMP-010 documents this separation.

Benefits, employer pension entries, commute costs, remote work and working time
are separate comparison dimensions, not changes to raw payroll net. NP-CMP-004
and `working-time.ts` define annual contractual hours as:

`weekly hours × (52 − annual paid vacation days / working days per week)`

This convention excludes public holidays, sickness, overtime and unpaid leave.
The methodology states that net-per-hour requires validated annual net and a
valid annual-hours basis. It does not promise that every proposed adjusted
hourly measure is implemented; any such measure must state the costs and time
basis it actually uses. No overall offer recommendation follows from a single
higher measure.

## Evidence mapping and official links

All links are copied from existing checked-in research. No new remote source
fetch, legal audit or source re-verification was performed for this copy.

| Claim | Repository evidence | Source IDs / public official links |
| --- | --- | --- |
| Final 2026 BMF plan, 12 November 2025; tax and solidarity scope | NP-RS-002, `payroll-tax.ts` | `DE-BMF-PAP-2026-A1`: [BMF Anlage 1](https://www.bundesfinanzministerium.de/Content/DE/Downloads/Steuern/Steuerarten/Lohnsteuer/Programmablaufplan/2025-11-12-PAP-2026-anlage-1.pdf?__blob=publicationFile&v=2) |
| Pension contributions and 2026 values | NP-RS-004, `pension.ts` | `DE-DRV-SV-VALUES-2026`: [DRV 2026 values](https://www.deutsche-rentenversicherung.de/KnappschaftBahnSee/DE/Aktuelles/Meldungen/2026/2026_01_02_Sozialversicherungsrechengroessen2026.html) |
| Unemployment contribution framework | NP-RS-005, `unemployment.ts` | `DE-SGBIII-341`: [SGB III § 341](https://www.gesetze-im-internet.de/sgb_3/__341.html) |
| General GKV rate and 2.9% average fallback | NP-RS-006, `health.ts` | `DE-SGBV-241`: [SGB V § 241](https://www.gesetze-im-internet.de/sgb_5/__241.html); `DE-BMG-GKV-CONTRIBUTIONS-2026`: [BMG contributions](https://www.bundesgesundheitsministerium.de/beitraege) |
| Childless care status and Saxony employee allocation | NP-RS-007, `care.ts` | `DE-SGBXI-55`: [SGB XI § 55](https://www.gesetze-im-internet.de/sgb_11/__55.html); `DE-SGBXI-58`: [SGB XI § 58](https://www.gesetze-im-internet.de/sgb_11/__58.html) |
| Contribution-period and share rounding | NP-RS-004–007, NP-CALC-003 | `DE-BVV-1-2`: [BVV §§ 1–2](https://www.gesetze-im-internet.de/beitrvv/BJNR113800006.html) |

Research records NP-RS-002 and NP-RS-004–007 state verification on 2026-09-24.
The NP-RS-013 example records 2026-09-26. The component labels these as recorded
research dates, not a new check date. Changing the bundled year, admitted
scope, source versions or calculation basis requires reviewing this copy.

## Verification limits

`reference-full-bmf-table.test.ts` executes 43 rows × 12 general/special class
values = 516 official annual wage-tax table comparisons in integer cents.
This matrix verifies the PAP reference path and does not independently certify
all integrated payroll results or interface scenarios. In particular:

- the BMF annual-payment reference path differs from twelve monthly payrolls;
- special-table settings do not admit ordinary private-insurance payroll;
- NP-CALC-017 lists independently sourced 12-month integration fixtures as
  outstanding, separate from component coverage;
- `schemas/assumptions/examples/de-payroll-2026-example.json` has
  `completeness: partial_example`, lifecycle `draft`,
  `productionActivationAllowed: false` and `approvedAt: null`; module source
  IDs do not turn it into a complete approved annual manifest.

Four rendered-component tests protect the public anchor and accessible region,
current scope and annual basis, official source destinations, and verification
and comparison disclosures. They use the actual component with no remote calls
or mocks. The initial red run failed all four because the public surface was
missing; the implemented component passed all four.
