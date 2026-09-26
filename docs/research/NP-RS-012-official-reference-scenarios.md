# NP-RS-012 — Official reference scenarios for 2026

**Status:** Accepted  
**Task:** NP-RS-012  
**Milestone:** M1 Research  
**Depends on:** [NP-RS-002](NP-RS-002-bmf-payroll-tax-algorithm.md), [NP-RS-004](NP-RS-004-pension-insurance-rules.md) through [NP-RS-011](NP-RS-011-bonuses-one-time-payments.md)  
**Calculation year:** 2026  
**Effective period:** 2026-01-01 through 2026-12-31  
**Verified on:** 2026-09-26

## Decision

NettoPilot DE shall validate the 2026 calculation engine against a layered reference set rather than treat one third-party net-salary calculator as an oracle.

The reference set contains:

1. the complete official BMF 2026 annual wage-tax check tables for all six tax classes;
2. exact component scenarios derived from the accepted official-source research for pension, unemployment, statutory health, care, solidarity surcharge, private-insurance subsidies and one-time payments;
3. admission-gate scenarios that assert incomplete or unsupported results where the source or input contract does not permit a number.

No fixture may be labelled “official exact” unless the expected output is copied from an official published check table or official machine interface. A value calculated from official parameters is labelled “source-derived exact.” This distinction must remain visible in test names and failure reports.

Suggested fixture-set identifier: **de-payroll-reference-2026-v1**.

## 1. Deliverables

| Artifact | Purpose |
| --- | --- |
| [BMF annual wage-tax check table](../../fixtures/reference/2026/bmf-annual-wage-tax-check-table.csv) | Full machine-readable transcription of the official general and special annual check tables |
| [NettoPilot reference scenarios](../../fixtures/reference/2026/nettopilot-reference-scenarios.json) | Versioned component, integration-boundary and admission fixtures |
| This note | Provenance, interpretation, tolerances and implementation contract |

The CSV and JSON are test inputs. They are not application configuration and must not be loaded as production tax tables.

## 2. Source hierarchy

| Source ID | Source | Fixture use | Status |
| --- | --- | --- | --- |
| DE-BMF-PAP-2026-A2 | [BMF final 2026 manual wage-tax table program, Annex 2](https://www.bundesfinanzministerium.de/Content/DE/Downloads/Steuern/Steuerarten/Lohnsteuer/Programmablaufplan/2025-11-12-PAP-2026-anlage-2.pdf?__blob=publicationFile&v=2) | Official annual check-table values, pages 21–22 | Verified |
| DE-BMF-PAP-2026-A1 | [BMF final 2026 machine payroll plan, Annex 1](https://www.bundesfinanzministerium.de/Content/DE/Downloads/Steuern/Steuerarten/Lohnsteuer/Programmablaufplan/2025-11-12-PAP-2026-anlage-1.pdf?__blob=publicationFile&v=2) | Machine-interface semantics and later period/bonus oracle comparisons | Verified |
| DE-BMF-PAP-2026-DATA | [BMF 2026 data-portal record](https://www.bundesfinanzministerium.de/Datenportal/Daten/frei-nutzbare-produkte/Anwendungen/Programmablaufplan-2026/Programmablaufplan-2026.html) | Publication status, date and downloadable artifacts | Verified |
| DE-BMF-CALC-API | [BMF external program interface](https://www.bmf-steuerrechner.de/interface/einganginterface.xhtml) | Approved program-test oracle for later engine verification | Verified interface; automated use must follow BMF terms |
| NP-RS-004:011 | Accepted repository research | Source-derived component and admission fixtures | Accepted |

The official BMF calculator calculates payroll tax, solidarity surcharge and the church-tax assessment base. It does not calculate social-insurance contributions or net pay. Consequently, an end-to-end net result cannot be called an official BMF result.

## 3. Verification tiers

### 3.1 Official exact

The expected output is copied exactly from an official check table.

Current fixtures:

- 43 gross-reference rows;
- all tax classes I through VI;
- the general annual table;
- the special annual table;
- 516 official wage-tax cells in total.

The complete table is kept in CSV instead of duplicating hundreds of values in this note.

### 3.2 Source-derived exact

The expected output is calculated only from accepted parameters and formulas, including their specified rounding order.

Current families:

- solidarity-surcharge threshold, taper and full-rate cases;
- recurring pension, unemployment, statutory-health and care contributions;
- Saxony and non-Saxony care allocation;
- parent, childless and multi-child cases;
- pay below and above contribution ceilings;
- private health/care employer-subsidy caps;
- church-tax component rounding;
- one-time-payment proportional annual ceilings and contributions.

These values are exact for the stated component inputs. They are not a claim that an authority published the combined scenario as a payslip.

### 3.3 Admission gate

The expected output is a result state and reason code, not an amount.

Current cases cover:

- a January–March bonus without prior-year facts;
- a church-tax state whose governing rate or final-cent evidence has not passed the NP-RS-009 source gate.

Admission fixtures are mandatory. Returning zero where the expected result is incomplete is a test failure.

## 4. Official BMF check-table contract

The CSV transcribes the official 2026 Annex 2 tables on pages 21 and 22.

### General table

The general table represents the BMF table path for an employee insured in the social-insurance branches. The official footnote specifies the general-table marker and a 2.90% additional health rate.

The table provides:

- a reference annual gross amount;
- the exact lower and upper table-step boundaries;
- annual wage tax for classes I–VI.

### Special table

The special table represents a person not insured in any social-insurance branch for the table calculation.

It is retained because it validates a distinct BMF adapter branch. It is **not** admitted as an ordinary NettoPilot v1 employment scenario. A private-health employee can still be subject to pension and unemployment insurance, so “private health insurance” must never be mapped automatically to the BMF special table.

### Product boundary

The BMF annual check table validates the PAP/table implementation. It is not the expected result for every user who enters an annual salary.

NP-PD-004 and NP-RS-008 require an annual salary representing twelve monthly payments to be calculated as twelve monthly payroll periods. Monthly rounding can differ from one genuine annual wage-payment period. Tests must therefore name the oracle mode explicitly:

- `bmf_annual_table` for the published annual check table;
- `monthly_payroll_12x` for the product's ordinary annual-salary path.

A test must not compare these two modes as though they were identical.

## 5. Representative scenario matrix

### Payroll-tax coverage

| Scenario | Gross reference | Tax class | Expected annual wage tax | Tier |
| --- | ---: | ---: | ---: | --- |
| BMF-GEN-030K-I | EUR 30,000 | I | EUR 2,299 | Official exact |
| BMF-GEN-050K-II | EUR 50,000 | II | EUR 5,580 | Official exact |
| BMF-GEN-060K-III | EUR 60,000 | III | EUR 4,918 | Official exact |
| BMF-GEN-100K-IV | EUR 100,000 | IV | EUR 23,426 | Official exact |
| BMF-GEN-040K-V | EUR 40,000 | V | EUR 8,824 | Official exact |
| BMF-GEN-070K-VI | EUR 70,000 | VI | EUR 19,443 | Official exact |
| BMF-SPECIAL-060K-I | EUR 60,000 | I | EUR 13,751 | Official exact; adapter only |

These selected JSON cases provide fast smoke coverage. The CSV provides the full matrix and should run in the extended conformance suite.

### Statutory social insurance

| Scenario | Monthly pay | State/status | Employee total | Employer total |
| --- | ---: | --- | ---: | ---: |
| SI-STAT-4000-BW-CHILDLESS | EUR 4,000 | BW, childless over 23 | EUR 870.00 | EUR 846.00 |
| SI-STAT-BBG-BW-PARENT | EUR 5,812.50 | BW, parent, one qualifying child | EUR 1,229.34 | EUR 1,229.34 |
| SI-STAT-BBG-SN-CHILDLESS | EUR 5,812.50 | Saxony, childless over 23 | EUR 1,293.27 | EUR 1,200.27 |
| SI-STAT-10000-BW-PARENT2 | EUR 10,000 | BW, parent, two qualifying children | EUR 1,494.38 | EUR 1,508.92 |

Each JSON expectation also asserts the RV/AV and KV/PV contribution bases and every branch amount. The total alone is not sufficient.

All statutory-health scenarios use the published-average 2.90% additional rate as an explicit test input. Production results must use the insurer-specific rate when the user selects that mode.

### Private insurance

| Scenario | Assessable monthly pay | Expected health subsidy | Expected care subsidy |
| --- | ---: | ---: | ---: |
| PKV-SUBSIDY-CAP-BW | EUR 6,000 | EUR 508.59 | EUR 104.63 |
| PKV-SUBSIDY-LOW-INCOME-BW | EUR 4,000 | EUR 350.00 | EUR 72.00 |

These fixtures validate the subsidy cap only. They do not invent the user's total premium, ELStAM basic contribution or wage-tax output.

### State and church-tax components

| Scenario | Input | Expected |
| --- | --- | --- |
| SI-STAT-BBG-SN-CHILDLESS | Saxony employment state | Unequal care split, EUR 168.56 employee / EUR 75.56 employer |
| CHURCH-ROUND-08 | EUR 123.45 assessment base, 8% | EUR 9.87 |
| CHURCH-ROUND-09 | EUR 123.45 assessment base, 9% | EUR 11.11 |
| CHURCH-STATE-SOURCE-GATE | Liable, BE, state evidence incomplete | Incomplete; no normal amount |

The 8% and 9% cases validate arithmetic and cent truncation only. They do not bypass NP-RS-009's state-by-state governing-source gate.

### Solidarity surcharge

| Scenario | Annual assessment base | Expected annual surcharge |
| --- | ---: | ---: |
| SOLI-BASIC-THRESHOLD | EUR 20,350 | EUR 0.00 |
| SOLI-BASIC-TAPER | EUR 25,000 | EUR 553.35 |
| SOLI-BASIC-FULL | EUR 40,000 | EUR 2,200.00 |

These begin with a verified assessment-base input. They do not claim that a named gross salary always produces that base.

### One-time payment

BONUS-JULY-FULL-LIABLE models:

- seven EUR 4,000 recurring payroll months through July;
- one EUR 5,000 July cash bonus;
- 210 social-insurance days;
- no prior one-time payment;
- statutory insurance, published-average health rate and childless non-Saxony care treatment.

Expected results include:

- KV/PV proportional ceiling: EUR 40,687.50;
- RV/AV proportional ceiling: EUR 59,150.00;
- the complete EUR 5,000 bonus contribution-liable in both ceiling groups;
- employee social contributions: EUR 1,087.50;
- employer social contributions: EUR 1,057.50.

The fixture deliberately does not assert bonus wage tax until the implementation runner captures the official BMF machine-interface output for the exact `JRE4` and `SONSTB` inputs.

BONUS-MARCH-PRIOR-YEAR-UNKNOWN asserts an incomplete result. It protects the March-clause fail-closed rule.

## 6. Machine-readable schema

All money in the JSON is stored as integer cents. Rates that require decimal precision are strings or basis points. This prevents fixture parsing from introducing binary floating-point error.

Every scenario contains:

| Field | Requirement |
| --- | --- |
| `id` | Stable identifier |
| `family` | Calculation module or admission family |
| `verificationTier` | Official exact, source-derived exact or admission gate |
| `inputs` | Complete inputs for the asserted component |
| `expected` | Expected amounts, bases, states and reason codes |
| `toleranceCents` | Zero for deterministic monetary fixtures |
| `sources` | Source IDs or accepted repository specifications |

Optional descriptions clarify boundaries but never alter execution.

Schema changes require a version increment. Changing an expected value requires:

- a source or derivation explanation;
- reviewer approval;
- a changelog entry in the pull request;
- regeneration or re-verification of affected cases.

## 7. Test execution contract

### Fast suite

Run on every calculation-engine change:

- the seven selected BMF tax cases;
- three solidarity-surcharge cases;
- four statutory social-insurance cases;
- two private-subsidy cases;
- two church component cases;
- one supported one-time contribution case;
- two admission-gate cases.

### Extended conformance suite

Run before merging a year-module change and before release:

- all 516 BMF CSV tax expectations;
- all JSON scenarios;
- engine metadata assertions;
- no uncited production constant check;
- source-version and calculation-year assertions.

### Required assertion depth

For tax:

- table step selected;
- tax class;
- wage-tax output;
- exact official equality.

For social insurance:

- applied ceiling;
- contribution base;
- employee amount by branch;
- employer amount by branch;
- branch total and aggregate total;
- half-up rounding stage.

For unsupported/incomplete cases:

- result state;
- reason code;
- absence of a normal amount;
- absence of the value from total net pay.

## 8. Tolerances and comparison rules

| Output | Tolerance | Rule |
| --- | ---: | --- |
| Official BMF table wage tax | EUR 0.00 | Exact integer-cent equality after converting published whole euros to cents |
| BMF machine-interface cents | EUR 0.00 | Exact equality |
| Social-insurance contributions | EUR 0.00 | Exact equality after branch-specific statutory rounding |
| Solidarity surcharge | EUR 0.00 | Exact integer-cent equality after truncation |
| Church component | EUR 0.00 | Exact integer-cent equality after approved truncation rule |
| Display-formatted values | Not an engine assertion | Test locale formatting separately |

Do not add a broad tolerance to hide rounding defects. A one-cent difference is a failure until the calculation step explains and resolves it.

## 9. Provenance and reproducibility

A test report must record:

- fixture-set ID and schema version;
- calculation year;
- source/assumption versions;
- engine version or commit;
- scenario ID;
- expected and actual values;
- first mismatching field;
- exact decimal/rounding mode;
- execution timestamp.

Reference artifacts must remain immutable for a released calculation year. If the BMF replaces or corrects the 2026 plan:

1. open a source-change review under NP-RS-001;
2. archive and hash the new artifact;
3. diff the official table and XML;
4. create a new fixture-set version;
5. do not silently overwrite released expectations;
6. retain the prior version for historical result reproduction.

## 10. Independent verification process

Before the engine can claim 2026 conformance:

1. import the CSV and assert all row/column counts;
2. compare a generated tax matrix with all official cells;
3. run selected machine-interface comparisons using the BMF interface only for permitted program testing;
4. independently recalculate each source-derived fixture from versioned parameters;
5. verify the JSON totals reconcile to their branch amounts;
6. run admission cases and confirm no normal number appears;
7. have a reviewer check source locators and transcribed official values;
8. record verification status in release metadata.

The implementation that is being tested must not generate its own expected fixture values.

## 11. Known limitations

This reference set does not yet claim an official end-to-end payslip oracle because no single accepted authority in the current source set publishes all tax, contribution, employer-cost and net outputs together.

Not included as official end-to-end fixtures:

- twelve-month product payroll results;
- factor-method class IV;
- child-allowance effects on BK and solidarity surcharge from a gross input;
- exact bonus wage tax from `JRE4`/`SONSTB`;
- private-health PAP cases using real ELStAM values;
- partial employment months;
- voluntary GKV extra-income cases;
- state-activated church-tax results before NP-RS-009 source gates pass;
- deferred employment cases from NP-PD-003.

These are not invitations to use a commercial calculator as truth. They must be added through the same provenance and review process.

## 12. Engineering handoff

Implementation should provide:

1. a fixture loader that rejects an unknown schema version;
2. integer-cent parsing for CSV and JSON money;
3. a PAP conformance runner for the official table;
4. component runners for social insurance, Soli, church arithmetic and PKV subsidy;
5. result-state assertions for admission fixtures;
6. a clear official-versus-derived label in test output;
7. exact mismatch diagnostics;
8. fixture and assumption version metadata;
9. CI fast and extended suites;
10. a controlled command for permitted BMF interface cross-checks that is never used as the production calculation service.

## Acceptance check for NP-RS-012

- [x] The final official 2026 BMF check table is identified and cited.
- [x] General and special annual tables are transcribed for all six classes.
- [x] Full official table data is machine-readable.
- [x] Representative low, middle and high incomes are covered.
- [x] Tax classes I through VI are covered.
- [x] Statutory and private-insurance component cases are covered.
- [x] Saxony and non-Saxony care cases are covered.
- [x] Parent, childless and multi-child cases are covered.
- [x] Solidarity-surcharge boundaries are covered.
- [x] Church arithmetic and source-gate cases are covered without bypassing NP-RS-009.
- [x] A supported one-time contribution case and March-clause gate are covered.
- [x] Official, source-derived and admission fixtures are distinguished.
- [x] Exact tolerances, provenance and update rules are defined.
- [x] Machine-readable fixture artifacts and engineering handoff are included.
