# NP-RS-002 — BMF payroll-tax algorithm research

**Status:** Accepted  
**Task:** NP-RS-002  
**Milestone:** M1 Research  
**Depends on:** [NP-RS-001](NP-RS-001-authoritative-source-standard.md)  
**Calculation year:** 2026  
**Verified on:** 2026-09-24  
**Primary authority:** Bundesministerium der Finanzen (BMF)

## Decision

NettoPilot DE shall use **Anlage 1, final status 12 November 2025**, “Programmablaufplan für die maschinelle Berechnung der vom Arbeitslohn einzubehaltenden Lohnsteuer, des Solidaritätszuschlags und der Maßstabsteuer für die Kirchenlohnsteuer für 2026”, as the governing machine-calculation plan for 2026 payroll withholding.

The plan applies to:

- regular wage-payment periods ending after 31 December 2025 and before 1 January 2027;
- other remuneration received after 31 December 2025 and before 1 January 2027;
- employer annual wage-tax adjustment where its statutory conditions are met;
- daily, weekly, monthly and annual wage-payment periods.

The final plan replaces the draft dated 25 September 2025. The BMF publication page states that only minor editorial changes were made from that draft, but the draft is not an implementation source.

A review of the official BMF payroll-plan index on 24 September 2026 found no generally amended 2026 machine plan. A BMF letter dated 24 June 2026 changes the Vorsorgepauschale treatment for the special group of statutorily insured Dienstordnungsangestellte. That notice is tracked as a scope exception and does not replace the general machine plan. NettoPilot DE must keep that employment case unsupported until it is separately admitted, researched and tested.

## 1. Source records

| Source ID | Publisher and title | Official URL | Role | Applicability | Status |
| --- | --- | --- | --- | --- | --- |
| DE-BMF-PAP-2026-PUBLICATION | BMF — Programmablaufpläne zur Lohnsteuer für/ab 2026 | [Publication page](https://www.bundesfinanzministerium.de/Content/DE/Downloads/Steuern/Steuerarten/Lohnsteuer/Programmablaufplan/2025-11-12-PAP-2026.html) | Governing publication record | 2026 | Verified |
| DE-BMF-PAP-2026-LETTER | BMF — Letter announcing the 2026 plans; GZ IV C 5 - S 2361/00025/016/028, DOK COO.7005.100.2.13473826 | [BMF letter](https://www.bundesfinanzministerium.de/Content/DE/Downloads/Steuern/Steuerarten/Lohnsteuer/Programmablaufplan/2025-11-12-PAP-2026-bmf-schreiben.pdf?__blob=publicationFile&v=4) | Governing provenance | Published 12 November 2025; plans applicable in 2026 | Verified |
| DE-BMF-PAP-2026-A1 | BMF — Machine calculation plan, Anlage 1, status 12 November 2025 (final) | [Anlage 1 PDF](https://www.bundesfinanzministerium.de/Content/DE/Downloads/Steuern/Steuerarten/Lohnsteuer/Programmablaufplan/2025-11-12-PAP-2026-anlage-1.pdf?__blob=publicationFile&v=2) | Governing algorithm, interface and rounding | 1 January–31 December 2026 | Verified |
| DE-BMF-PAP-2026-XML | BMF data portal — Programmablaufplan 2026 XML/XHTML pseudocode | [XML/XHTML pseudocode](https://www.bundesfinanzministerium.de/Datenportal/Daten/frei-nutzbare-produkte/Anwendungen/Programmablaufplan-2026/Programmablaufplan-2026-XML.xhtml?__blob=publicationFile&v=3) | Implementation aid; must agree with Anlage 1 | 2026 | Verified as official aid |
| DE-BMF-PAP-FAQ | BMF — FAQ zum Lohn- und Einkommensteuerrechner | [FAQ](https://www.bundesfinanzministerium.de/Content/DE/Standardartikel/Service/Abgabenrechner/FAQ.html) | Official explanation and QA guidance | Current at verification | Corroborating |
| DE-BMF-VSP-2026-DOA | BMF — Änderung des Schreibens zur Vorsorgepauschale for Dienstordnungsangestellte, 24 June 2026 | [BMF letters index](https://www.bundesfinanzministerium.de/Web/DE/Themen/Steuern/Steuerarten/Lohnsteuer/BMF_Schreiben_Allgemeines/bmf_schreiben_allgemeines.html) | Special-case change signal | From 1 January 2026 for the named group | Monitored exception |

The repository must later archive permitted source artifacts and hashes under the NP-RS-001 evidence process. URLs alone are not sufficient production evidence.

## 2. Authority and implementation rules

1. Anlage 1 is normative for the supported machine payroll-withholding path.
2. The official XML/XHTML pseudocode is an implementation aid, not an independently selectable algorithm.
3. The BMF online calculator/interface is suitable for comparison and quality assurance, not as the production calculation service.
4. If the XML, diagram, explanatory text or calculator appears inconsistent, implementation stops and a source conflict is opened under NP-RS-001.
5. No constant in this note becomes production-ready merely because it appears here. Each value must enter a versioned assumption manifest with source ID, locator, unit, effective period and review.
6. The plan does not validate its inputs. NettoPilot DE must validate them before invoking the algorithm.

## 3. What the BMF plan calculates

The plan calculates payroll-withholding amounts for:

- wage tax on recurring pay;
- solidarity surcharge on recurring pay;
- the assessment base for church wage tax on recurring pay;
- wage tax on other remuneration;
- solidarity surcharge on other remuneration;
- the assessment base for church wage tax on other remuneration.

It does **not** calculate:

- the final church-tax amount or state-specific church-tax rate;
- actual employee pension, unemployment, health or care-insurance contributions;
- employer social-insurance contributions;
- net salary;
- employer total employment cost;
- annual income-tax-return liability;
- benefits, household transfers or complete joint assessment.

The plan uses social-insurance attributes and rates only to form the Vorsorgepauschale used in wage-tax withholding. Separate sourced modules must calculate actual social-insurance deductions and the final user-facing net result.

## 4. Interface inputs

All money values described as cents are integer cents at the public algorithm boundary. Percentages retain the stated decimal precision. “Required” means required by the machine interface when the associated path is invoked; the UI may derive or default a value only where a separately approved product rule permits it.

| Field | Meaning and unit | Applicability / validation |
| --- | --- | --- |
| AF | Factor-method flag | 1 only when factor method is selected; tax class IV only |
| AJAHR | Calendar year following completion of age 64 | Required when ALTER1 = 1 |
| ALTER1 | Age-relief flag | 1 when age 64 was completed before the start of the relevant calendar year; otherwise 0 |
| ALV | Unemployment-insurance status for Vorsorgepauschale | 0 for compulsory coverage using the general ceiling; 1 otherwise |
| F | Entered factor, three decimals | Factor method only; tax class IV |
| JFREIB | Annual allowance for other remuneration and relevant section 19a benefits, cents | Zero when absent |
| JHINZU | Annual addition for the same annual path, cents | Zero when absent; not allowed with tax class VI |
| JRE4 | Expected annual employment income excluding the current other remuneration, cents | Required, including zero, when SONSTB is supplied; prior other remuneration is added as instructed by the plan |
| JRE4ENT | Compensation under section 24 no. 1 EStG and taxable section 19a benefits included in JRE4, cents | Subset of JRE4 |
| JVBEZ | Pension payments included in JRE4, cents | Subset of JRE4 |
| KRV | Pension-insurance status for Vorsorgepauschale | 0 for named statutory/professional coverage cases using the general ceiling; 1 otherwise |
| KVZ | Applicable full insurer-specific additional GKV contribution rate, percent with two decimals | Full rate, not employee half; use the rate applicable under section 2.4 of the plan |
| LZZ | Wage-payment period | 1 year, 2 month, 3 week, 4 day |
| LZZFREIB | Allowance for the wage-payment period, cents | ELStAM/certificate value |
| LZZHINZU | Addition for the wage-payment period, cents | ELStAM/certificate value; not allowed with tax class VI |
| MBV | Non-taxed section 19a benefit, cents | Relevant section 19a path only |
| PKPV | Private basic health and mandatory care-insurance contribution, monthly cents | Always a monthly amount regardless of LZZ |
| PKPVAGZ | Tax-free employer subsidy for private health/care insurance, monthly cents | Always a monthly amount regardless of LZZ |
| PKV | Health-insurance system | 0 statutory, 1 exclusively private |
| PVA | Number of care-insurance discounts for multiple children | Integer 0–4 |
| PVS | Saxony care-insurance special-rule flag | 1 when the Saxony rule applies/would apply, otherwise 0 |
| PVZ | Childless care-insurance surcharge flag | 1 when surcharge applies, otherwise 0 |
| R | Employee religious-community code from ELStAM/certificate | 0 for no affiliation; retained for downstream church-tax handling |
| RE4 | Taxable wage for the payment period before named pension, age and ELStAM allowance/addition adjustments, cents | Must not be negative |
| SONSTB | Other remuneration including named benefits/death benefits/capital payments, cents | Zero when absent |
| SONSTENT | Compensation and taxable section 19a benefits included in SONSTB, cents | Subset of SONSTB |
| STERBE | Death benefit and named capital payments included in SONSTB, cents | Subset of SONSTB |
| STKL | Tax class | Integer 1–6 |
| VBEZ | Pension benefits included in RE4, cents | Must be no greater than RE4 |
| VBEZM | Monthly reference amount for pension benefits, cents | Pension-benefit path |
| VBEZS | Expected pension special payments in first benefit year, cents | Pension-benefit path |
| VBS | Pension benefits included in SONSTB, cents | Subset of SONSTB |
| VJAHR | First calendar year of pension benefit | Pension-benefit path |
| ZKF | Number of child allowances, one decimal | Tax classes I–IV only |
| ZMVB | Number of months in which pension benefits were received | Required for the relevant annual pension calculation |

### Mandatory pre-validation

At minimum, the application layer must enforce:

- permitted enum and flag values;
- non-negative monetary inputs where the plan requires them;
- subset relations such as VBEZ ≤ RE4;
- factor method only with tax class IV;
- no factor together with an allowance;
- no JHINZU or LZZHINZU with tax class VI;
- SONSTB dependencies, including JRE4;
- monthly semantics for PKPV and PKPVAGZ regardless of LZZ;
- correct event-month KVZ for other remuneration;
- scope admission before special pension, section 19a, death-benefit or compensation paths are exposed.

Unsupported fields must not be silently filled with invented values.

## 5. Interface outputs

| Field | Meaning | Unit / rule |
| --- | --- | --- |
| LSTLZZ | Wage tax for the selected regular wage-payment period | Integer cents |
| SOLZLZZ | Solidarity surcharge for the selected regular period | Integer cents |
| BK | Assessment base for church wage tax on regular pay | Integer cents; not the final church tax |
| STS | Wage tax on other remuneration | Integer cents |
| SOLZS | Solidarity surcharge on other remuneration | Integer cents |
| BKS | Assessment base for church wage tax on other remuneration | Integer cents; not the final church tax |

The plan also exposes DBA/pension-limitation values VFRB, VFRBS1, VFRBS2, WVFRB, WVFRBM and WVFRBO for a separate treaty-related process. Cross-border/DBA modelling is outside v1. These fields must not be presented as supported results, but their existence should be preserved in the adapter design to avoid falsely treating the published interface as smaller than it is.

## 6. Algorithm structure

The 2026 plan’s top-level procedure is LST2026. An implementation should retain traceability to its named procedures instead of collapsing the algorithm into an opaque formula.

| Phase | Representative plan procedures | Responsibility |
| --- | --- | --- |
| Parameter initialisation | MPARA | Load 2026 tariff and social-insurance parameters |
| Annualisation | MRE4JL | Convert the selected wage-payment period to annual values using statutory fractions |
| Pension/age adjustments | MRE4 | Calculate pension allowance and age-relief values where applicable |
| Allowance application | MRE4ABZ | Apply annualised allowance/addition amounts |
| Main withholding calculation | MBERECH, MZTABFB, MLSTJAHR | Determine table allowances and annual wage tax |
| Vorsorgepauschale | UPEVP | Determine the tax withholding allowance for pension, health and care coverage |
| Tariff | UPMLST, UPTAB26 | Apply the 2026 income-tax tariff or tax-class V/VI path |
| Period conversion | UPANTEIL | Convert annual results to the selected payment period |
| Other remuneration | MSONST | Calculate withholding for SONSTB using expected annual wage inputs |
| Surcharge/bases | MSOLZ | Calculate solidarity surcharge and church-tax assessment bases |

Engineering must create a mapping from every implemented function and branch to the corresponding plan procedure, field and decision. The table above is a navigation map, not substitute pseudocode.

## 7. Rounding and numeric contract

The rounding rules are part of the algorithm and are release-blocking requirements.

1. Use decimal arithmetic capable of exact base-10 values. Binary floating point is not acceptable for tax calculation.
2. Preserve integer cents at the external money boundary.
3. Respect every explicit down-arrow (round down) and up-arrow (round up) in the plan at the stated unit.
4. When a named plan result is assigned to another named field that declares fewer decimal places, discard excess decimals unless the plan explicitly says otherwise.
5. Do not round implementation-created intermediate values merely because a receiving language type would normally do so.
6. Do not apply a global “round every step to cents” policy.
7. Daily, weekly, monthly and annual conversion uses the fractions defined in the plan and section 39b EStG; arbitrary payment periods are not supported.
8. Final interface outputs are integer cents.
9. Test fixtures must assert intermediate rounding checkpoints, not only the final net result.

A decimal library or fixed-decimal type should be selected in the later architecture task. Its configuration must reproduce truncation, floor and ceiling operations explicitly.

## 8. 2026 parameters identified in the plan

These values are recorded for research traceability. Production use still requires assumption-manifest entries and review.

| Parameter | 2026 value | Source locator / note |
| --- | ---: | --- |
| Basic personal allowance | €12,348 | Anlage 1, pages 1–2 and MPARA |
| Child allowance used by the plan | €4,878 / €9,756 | Anlage 1, pages 1–2 and tariff path |
| Solidarity-surcharge exemption threshold | €20,350 | Anlage 1, page 2 |
| Health/care contribution ceiling | €69,750 annual | Anlage 1, page 2 |
| Pension/unemployment contribution ceiling | €101,400 annual | Anlage 1, page 2 |
| Reduced statutory health rate used in the allowance logic | 14.0% | Anlage 1, page 2 |
| Pension-insurance total rate | 18.6% | Anlage 1, page 2 |
| Unemployment-insurance total rate | 2.6% | Anlage 1, page 2 |
| Care-insurance total rate | 3.6% | Anlage 1, page 2 |
| Childless care surcharge | 0.6 percentage points | Anlage 1, page 2 |
| Multi-child care discount | 0.25 percentage points for each eligible child from second through fifth | Anlage 1, page 2 |

For KVZ, the normal statutory-insurance input is the **full applicable insurer-specific additional rate**. The engine performs the employee/employer split. The published average additional rate is not a universal default for ordinary insured employees; only the special cases identified by the plan may use it.

## 9. Recurring pay and other remuneration

### Recurring pay

For a monthly v1 calculation, the adapter passes LZZ = 2, maps the taxable recurring wage to RE4 and supplies all other applicable status inputs. The plan annualises the value, calculates annual withholding and converts the result back to the payment period.

### Other remuneration

The one-off path is not a simple addition to monthly salary. It uses SONSTB together with the expected annual wage JRE4 and related annual fields. The applicable KVZ is generally the rate in force at the end of the month in which the payment is received. Previously paid other remuneration may have to be included in the annual basis as instructed by the plan.

Consequences for NettoPilot DE:

- a one-off payment needs a payment month or an explicit documented simplifying assumption;
- a user-entered annual bonus without timing cannot be presented as exact;
- current-year prior other remuneration may affect the result;
- recurring and one-off taxes must remain separately visible and reconcilable;
- the conservative versus total-compensation views from NP-PD-005 must not combine periods in a way that hides timing assumptions.

## 10. Mapping to v1 scope

| v1 case | PAP support | NettoPilot DE decision |
| --- | --- | --- |
| Regular salaried employee | Direct | Supported after the full tax and social-insurance modules are verified |
| Monthly gross salary | Direct via LZZ = 2 | Primary v1 path |
| Annual gross salary | Direct via LZZ = 1 or carefully specified conversion | Supported with explicit period semantics |
| Standard part-time employment | Same algorithm | Supported when other admission rules pass |
| Tax classes I–VI | Direct | Support subject to input rules and product specification |
| Factor method | Direct | Only class IV and only after factor input/validation is implemented |
| Statutory health insurance | Direct input to tax allowance | Tax side supported; actual contribution needs separate research |
| Private health insurance | Direct input to tax allowance | Tax side supported; actual contribution/employer subsidy needs separate research |
| Saxony care rule and child status | Direct input to tax allowance | Supported when actual care-contribution module agrees |
| Regular bonus/one-off payment | Direct other-remuneration path | Supported only with timing and annual-basis inputs/assumptions |
| Two-offer comparison | Reuse individual calculations | Both scenarios must use identical year/source versions |
| Simple couple totals | Sum of individual results only | No joint tax-return modelling |
| Cross-border/DBA | Separate plan/outputs | Deferred |
| Multiple jobs, mini/midijobs, working students | Not admitted by v1 scope | Deferred |
| Stock options/complex section 19a cases | Interface contains related fields | Deferred unless separately scoped and researched |
| Dienstordnungsangestellte special case | 2026 notice exists | Unsupported pending dedicated review |

## 11. Test and verification requirements

The implementation task must create fixtures covering:

- each LZZ value supported by the product;
- tax classes I–VI and factor method boundaries;
- zero tax and first taxable-cent boundaries;
- values immediately below, at and above the basic allowance and Soli threshold effects;
- health/care and pension/unemployment ceilings;
- statutory and private health-insurance paths;
- KVZ values with two decimals and a mid-year/event-month change case;
- PVZ, PVA 0–4 and Saxony PVS branches;
- child allowances for applicable tax classes;
- allowance/addition inputs and prohibited combinations;
- recurring pay and other remuneration separately;
- explicit rounding checkpoints;
- official BMF test-table or calculator comparisons where available;
- invalid inputs rejected before the PAP;
- unsupported cases that return no normal estimate.

Expected outputs must cite DE-BMF-PAP-2026-A1 and exact plan locators. Cross-check results must never replace plan-derived expectations.

## 12. Update monitoring

For the active 2026 year:

1. monitor the official BMF payroll-plan index and the data-portal record;
2. compare the linked PDF and XML artifacts, not only the publication-page date;
3. record hashes and retrieval dates when evidence archiving is implemented;
4. treat a new “geändert”, “korrigiert” or replacement version as a release-blocking review signal;
5. assess BMF letters that change the Vorsorgepauschale or named employee groups;
6. never switch production assumptions automatically;
7. preserve the final 2026 source set for historical calculations after the year closes.

## 13. Engineering handoff

The next implementation-oriented tasks should produce:

- a typed PAP input/output adapter;
- exact decimal and rounding primitives;
- a 2026 assumption manifest linked to the source records;
- input validation separate from the PAP core;
- a trace map from plan procedures to engine functions;
- separate recurring-pay and other-remuneration paths;
- a separate church-tax-rate module;
- separate actual social-insurance modules;
- deterministic fixtures with intermediate checkpoints;
- result metadata exposing calculation year, PAP version, assumption version and engine version;
- a fail-closed route for unsupported or unresolved cases.

## Acceptance check for NP-RS-002

- [x] The final applicable 2026 BMF machine plan is identified.
- [x] Publication, document status, year and effective period are recorded.
- [x] Official PDF, pseudocode and explanatory sources are linked.
- [x] The full external input set is catalogued.
- [x] Output fields and their boundaries are documented.
- [x] High-level algorithm phases and named procedures are mapped.
- [x] Rounding and decimal requirements are explicit.
- [x] Key 2026 parameters are recorded with source context.
- [x] Recurring and other-remuneration paths are distinguished.
- [x] PAP outputs are separated from actual contributions, net pay and final church tax.
- [x] v1 supported/deferred cases are mapped.
- [x] Validation, fixture and monitoring requirements are defined.
- [x] The 24 June 2026 special-case notice is captured without silently broadening scope.
- [x] Implementation handoff requirements are stated.


## Follow-on research

- [NP-RS-003 — Annual tax parameters for 2026](NP-RS-003-annual-tax-parameters.md)
