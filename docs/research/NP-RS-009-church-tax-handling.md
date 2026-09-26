# NP-RS-009 — Church-tax handling for 2026

**Status:** Proposed for review  
**Task:** NP-RS-009  
**Milestone:** M1 Research  
**Depends on:** [NP-RS-002](NP-RS-002-bmf-payroll-tax-algorithm.md)  
**Calculation year:** 2026  
**Effective period:** 2026-01-01 through 2026-12-31  
**Verified on:** 2026-09-24

## Decision

NettoPilot DE shall estimate ordinary 2026 church wage tax (Kirchenlohnsteuer) only for an employee whose current payroll church-tax status is known and whose scenario is admitted by the v1 employment scope.

The engine shall:

1. use the final BMF 2026 machine payroll plan to calculate the church-tax assessment bases;
2. use **BK** for recurring pay and **BKS** for supported other remuneration;
3. preserve the child-allowance adjustment required by EStG section 51a;
4. apply the rate for the employer's **lohnsteuerliche Betriebsstätte** (payroll tax establishment), not the employee's home or physical work location;
5. retain the commonly published 8%/9% state rates as research candidates, but enable no state in the production assumption set until that state's governing 2026 rate and final-cent treatment have both passed NP-RS-001 verification;
6. fail closed when either state-specific evidence record is absent or expired;
7. apply the verified state-specific final-cent rule only after that source gate passes;
8. keep recurring-pay and other-remuneration components separate;
9. return an incomplete or unsupported state instead of inventing church membership, establishment state, denomination eligibility or an exception result.

The result is a payroll-withholding estimate. It is not a final church-income-tax assessment. A later assessment can reconcile a different residence-state rate.

Suggested assumption-set identifier: **de-church-wage-tax-2026-v1**.

## 1. Supported result contract

An exact v1 result is supported when all of the following are true:

- calculation year is 2026;
- the scenario passes NP-PD-003 scope admission;
- the final 12 November 2025 BMF payroll plan is used;
- the employee's church-tax status for the payroll month is explicit;
- the lohnsteuerliche Betriebsstätte state is explicit;
- a liable user confirms that the ELStAM church-tax marker applies for that establishment state;
- the payroll child-allowance factor is known;
- the underlying recurring-pay or other-remuneration BMF path is complete;
- no location-, denomination- or marriage-specific exception requires data outside the v1 input contract;
- the selected state has approved, effective 2026 source records for both its governing rate and its final-cent treatment.

The following are not approved by this task:

- final annual church-income-tax assessment;
- residence-state reconciliation;
- church-tax capping (Kappung);
- minimum church tax;
- general or special church money, including besonderes Kirchgeld;
- mixed-faith or different-denomination allocation beyond the user's payroll status;
- employer-paid or flat-rate church tax;
- minijobs and other lump-sum wage-tax paths;
- capital-income church tax;
- cross-border or limited-tax-liability cases;
- multiple payroll establishments in one scenario;
- retroactive corrections not represented as explicit monthly segments;
- manual denomination-code mapping outside ELStAM;
- unsupported local or religious-community exceptions.

## 2. Authoritative sources

| Source ID | Authority and document | Evidence role | Applicability | Status |
| --- | --- | --- | --- | --- |
| DE-BMF-PAP-2026-PUBLICATION | [Federal Ministry of Finance — 2026 payroll-program publication](https://www.bundesfinanzministerium.de/Content/DE/Downloads/Steuern/Steuerarten/Lohnsteuer/Programmablaufplan/2025-11-12-PAP-2026.html) | Final publication record | 2026 | Verified |
| DE-BMF-PAP-2026-A1 | [BMF — final 2026 machine payroll plan, Annex 1](https://www.bundesfinanzministerium.de/Content/DE/Downloads/Steuern/Steuerarten/Lohnsteuer/Programmablaufplan/2025-11-12-PAP-2026-anlage-1.pdf?__blob=publicationFile&v=2) | R input; BK/BKS outputs; section-51a base; period allocation | 2026 | Verified |
| DE-ESTG-51A | [Income Tax Act, section 51a](https://www.gesetze-im-internet.de/estg/__51a.html) | Payroll assessment base and child-allowance treatment | Current 2026 law | Verified |
| DE-ELSTER-ELSTAM-FAQ | [ELSTER — employee ELStAM FAQ](https://www.elster.de/eportal/start?themaGlobal=help_arbeitnehmer_eop) | Establishment-state availability of church markers and binding ELStAM behavior | Current | Verified |
| DE-BB-KIST | [Brandenburg tax administration — church tax](https://finanzamt.brandenburg.de/fa/de/steuern/steuerinformationen/kirchensteuer/) | 9% rate, establishment principle, cross-state example, child treatment | Current | Verified |
| DE-BW-KIST | [Serviceportal Baden-Württemberg — church membership and tax](https://www.service-bw.de/zufi/leistungen/248) | General 8% rate, ELStAM basis and Bad Wimpfen exception | Current | Verified |
| DE-BW-KIST-2026 | [Baden-Württemberg Ministry of Finance — 2026 church-tax resolutions, FM3-S 2442-3/38, BStBl 2026 I p. 869](https://datenbank.nwb.de/Dokument/1097618/) | 2026 8% general rate and 9% Roman Catholic Bad Wimpfen payroll-establishment exception | 2026 | Verified official notice reproduction |
| DE-BY-KIST | [Bavarian tax administration — church-tax rate in payroll guidance](https://finanzamt.bayern.de/Informationen/Steuerinfos/Haeufig_gestellte_Fragen/Geringfuegige_Beschaeftigung/default.php) | Bavaria 8% state rate | Current | Corroborating |
| DE-NI-KIST-RG-11 | [Lower Saxony church-tax framework, section 11](https://voris.wolterskluwer-online.de/browse/document/3ba2a2c8-2db4-350b-872c-4eebef004766) | Downward rounding to full cents in Lower Saxony only | Current | Corroborating state law |
| DE-BMF-TAX-AZ-2025 | [Federal Ministry of Finance — Taxes from A to Z, 2025](https://www.bundesfinanzministerium.de/Content/DE/Downloads/Broschueren_Bestellservice/steuern-von-a-z.pdf?__blob=publicationFile&v=7) | Federal overview that rates vary between 8% and 9%; not a state governing instrument | General background | Corroborating only |
| DE-BE-KIST-SERVICE | [Berlin service portal — church-tax assessment](https://service.berlin.de/dienstleistung/326175/) | Berlin 9% rate | Current | Corroborating; 2026 governing resolution and rounding still required |

The product shall use the final BMF plan for the assessment base. It shall not reproduce the assessment base from a third-party salary table.

## 3. Rate matrix

The ordinary payroll rate is selected by the federal state of the employer's lohnsteuerliche Betriebsstätte.

| Payroll-establishment state | Code | v1 rate | v1 handling |
| --- | --- | ---: | --- |
| Baden-Württemberg | BW | 8% candidate | Blocked until the 2026 rate record and BW final-cent rule are both verified; exception control also required |
| Bavaria | BY | 8% candidate | Blocked until the 2026 governing rate and final-cent records are verified |
| Berlin | BE | 9% candidate | Blocked until the 2026 governing resolution and final-cent record are verified |
| Brandenburg | BB | 9% candidate | Blocked until the 2026 governing resolution and final-cent record are verified |
| Bremen | HB | 9% candidate | Blocked until the 2026 governing resolution and final-cent record are verified |
| Hamburg | HH | 9% candidate | Blocked until the 2026 governing resolution and final-cent record are verified |
| Hesse | HE | 9% candidate | Blocked until the 2026 governing resolution and final-cent record are verified |
| Mecklenburg-Vorpommern | MV | 9% candidate | Blocked until the 2026 governing resolution and final-cent record are verified |
| Lower Saxony | NI | 9% candidate | Blocked until the 2026 governing rate record is verified; rounding evidence is state-specific |
| North Rhine-Westphalia | NW | 9% candidate | Blocked until the 2026 governing resolution and final-cent record are verified |
| Rhineland-Palatinate | RP | 9% candidate | Blocked until the 2026 governing resolution and final-cent record are verified |
| Saarland | SL | 9% candidate | Blocked until the 2026 governing resolution and final-cent record are verified |
| Saxony | SN | 9% candidate | Blocked until the 2026 governing resolution and final-cent record are verified |
| Saxony-Anhalt | ST | 9% candidate | Blocked until the 2026 governing resolution and final-cent record are verified |
| Schleswig-Holstein | SH | 9% candidate | Blocked until the 2026 governing resolution and final-cent record are verified |
| Thuringia | TH | 9% candidate | Blocked until the 2026 governing resolution and final-cent record are verified |

Canonical parameters:

| Parameter ID | Value | Unit | Effective period |
| --- | ---: | --- | --- |
| church_wage_tax.2026.BW.general_rate_candidate | 0.08 | ratio | 2026; not production-approved |
| church_wage_tax.2026.BY.general_rate_candidate | 0.08 | ratio | 2026; not production-approved |
| church_wage_tax.2026.other_states.general_rate_candidate | 0.09 | ratio | 2026; not production-approved |
| church_wage_tax.2026.output_unit | integer cent | unit | 2026 |
| church_wage_tax.2026.rounding | no nationwide fallback | rule | 2026 |

The rate registry must store one explicit record per state even when values are equal. Each record needs its own governing 2026 source and final-cent rule. A federal overview, another state's law, or an uncited common rate may corroborate research but must never activate a production path.

### 3.1 Baden-Württemberg exception

The 2026 Baden-Württemberg church-tax resolution preserves a special payroll-establishment case for Bad Wimpfen, postcode 74206, including post-office-box and bulk-recipient postcodes. A payroll establishment in that area applies 9% for Roman Catholic church wage tax; the ordinary Baden-Württemberg rate remains 8% for other supported cases.

The current v1 input contract does not contain the establishment postcode and exception confirmation needed to decide this reliably. Therefore:

- the calculator must ask whether the payroll establishment is in postcode area 74206 when BW is selected;
- if yes, it must ask the user to confirm whether the Roman Catholic 9% payroll exception applies, using a neutral `applies / does_not_apply / unknown` control;
- `applies` selects 9%;
- `does_not_apply` selects 8%;
- `unknown` produces an incomplete result, not an assumed 8%;
- the exception must not be inferred from a free-text city field;
- a BW payroll establishment outside 74206 uses 8%;
- an employee who lives in Bad Wimpfen but is paid from a payroll establishment elsewhere in BW is withheld at that establishment's rate; final assessment may reconcile a residence-based difference;
- Stuttgart and other ordinary BW payroll establishments continue to use 8%.

Engineering must not collapse payroll-establishment location and employee residence into one unlabeled state value.

## 4. Establishment principle

For church **wage-tax withholding**, the rate follows the lohnsteuerliche Betriebsstätte of the employer.

This is not necessarily:

- the employee's residence state;
- the employee's physical office;
- the employee's remote-work location;
- the employer's registered headquarters;
- the state named in the job advertisement.

The Brandenburg tax administration gives the decisive example: an employee living in Brandenburg but paid from a Bavarian payroll establishment is withheld at Bavaria's 8% rate. A later assessment applies the residence-state rate and reconciles the difference.

Product consequences:

- rename or clarify the NP-PD-004 state input as **Payroll-establishment state / Bundesland der lohnsteuerlichen Betriebsstätte** for church-tax purposes;
- do not silently use the employee's home state;
- if the payroll-establishment state is unknown, return an incomplete church-tax result;
- offer comparison may use different establishment states for the two offers;
- the product must explain that the annual tax assessment can differ.

## 5. Applicability input and ELStAM

The BMF plan input **R** represents the employee's religious community according to ELStAM or the 2026 payroll certificate; R = 0 means no religious affiliation for the plan.

The v1 product field remains:

`tax.churchTaxStatus`

Allowed values:

| Product value | PAP behavior | Result behavior |
| --- | --- | --- |
| `liable` | Run the BMF plan with a non-zero R control after eligibility confirmation | Calculate ordinary church wage tax |
| `not_liable` | R = 0 | No church-tax deduction |
| `unknown` | Do not invent R | Incomplete result |

A user's personal belief, baptism, marital status or self-described denomination is not a substitute for the payroll ELStAM marker.

For `liable`, the UI must ask the user to confirm the status shown on a current payslip, ELStAM record or payroll information. The user does not need to disclose a denomination for the ordinary v1 path, but v1 must stop where a denomination-specific exception may apply.

ELSTER states that church-tax markers are provided only where the religious community is collected in the state of the employer's payroll establishment, and the employer is bound by the supplied ELStAM. Therefore:

- do not maintain an invented nationwide denomination allow-list;
- do not infer that every religious affiliation creates payroll church tax;
- a liable result requires a payroll-applicable marker, not membership alone;
- a changed or disputed ELStAM must be treated as user-supplied uncertainty.

## 6. Assessment base

Church wage tax is not always the selected percentage of the ordinary wage-tax amount displayed to the user.

Under EStG section 51a and the final BMF 2026 plan:

- the assessment base for recurring pay is the child-adjusted wage-tax measure produced by the BMF plan;
- the output **BK** is the recurring church-wage-tax assessment base in integer cents;
- the output **BKS** is the assessment base for supported other remuneration in integer cents;
- BK and BKS are assessment bases, not final church-tax deductions;
- BK is allocated to the wage-payment period through the PAP's UPANTEIL path;
- BKS is the wage tax attributable to the other remuneration when R is non-zero;
- if R = 0, the plan sets the church-tax bases to zero.

Child treatment:

- use `tax.childAllowanceFactor` / PAP ZKF;
- do not use the number of children directly;
- do not use care-insurance child status;
- do not calculate church tax as rate × displayed LSTLZZ when BK differs;
- an unknown child-allowance factor makes the exact liable result incomplete.

## 7. Calculation

For a liable scenario that has passed the state-specific rate-and-rounding source gate:

```
recurring_church_tax_cents =
  floor(BK_cents × establishment_rate)

other_remuneration_church_tax_cents =
  floor(BKS_cents × establishment_rate)

period_church_tax_cents =
  recurring_church_tax_cents
  + other_remuneration_church_tax_cents
```

Where:

- `establishment_rate` is 0.08 or 0.09;
- BK and BKS come directly from the final 2026 PAP;
- the final-cent operation is taken from the approved rule for the selected state; `floor` is used only where that state's governing evidence explicitly requires downward truncation;
- no intermediate conversion through binary floating point is allowed.

Implementation with integer arithmetic:

```
rate_basis_points = approved_state_rate_basis_points
church_tax_cents = apply_approved_state_cent_rule(
  base_cents × rate_basis_points / 10_000
)
```

Do not:

- multiply gross salary by 8% or 9%;
- multiply displayed net pay;
- apply the rate to solidarity surcharge;
- add BK and BKS before separately preserving their components;
- apply a nationwide rounding fallback or borrow another state's cent rule;
- apply a residence-state rate to the payroll result;
- use an approximate annual value to reconstruct monthly withholding.

## 8. Recurring pay and other remuneration

### Recurring pay

- Run the supported 2026 PAP for the actual wage-payment period.
- Use BK as returned.
- Apply the establishment-state rate.
- Preserve the rate, base and final integer-cent result.

### Other remuneration

- Use the complete BMF other-remuneration path required by NP-RS-002.
- Use BKS, not the bonus amount and not total period wage tax.
- Apply the same establishment-state rate.
- Keep the one-off component separate from recurring church tax.
- If JRE4, SONSTB or another required input is missing, return incomplete.

### Annual salary entry

An annual salary entered in the UI normally represents twelve monthly payrolls.

Therefore:

- run twelve monthly periods;
- sum the twelve integer-cent church-tax outputs;
- segment months when ELStAM status, establishment state or other inputs change;
- do not substitute a genuine annual LZZ calculation;
- label the annual result as a sum of payroll periods.

## 9. Rounding fixtures

These fixtures begin with verified BK or BKS outputs. They do not assert that a particular gross salary produces that base.

| Base | Rate | Exact product | Final deduction |
| ---: | ---: | ---: | ---: |
| EUR 0.00 | 8% | EUR 0.0000 | EUR 0.00 |
| EUR 1,000.00 | 8% | EUR 80.0000 | EUR 80.00 |
| EUR 1,000.00 | 9% | EUR 90.0000 | EUR 90.00 |
| EUR 123.45 | 8% | EUR 9.8760 | EUR 9.87 |
| EUR 123.45 | 9% | EUR 11.1105 | EUR 11.11 |
| EUR 0.11 | 9% | EUR 0.0099 | EUR 0.00 |

Required assertions:

- base is measured in integer cents;
- rate comes from the payroll-establishment state;
- fractional cents are discarded;
- R = 0 produces no deduction;
- the recurring and other-remuneration results remain separately addressable.

## 10. Mid-year and correction behavior

Church-tax status and the relevant payroll information can change during a year.

For v1:

- each month has an effective church-tax status;
- each month has an effective payroll-establishment state;
- a known change is modelled by segmenting the year;
- a future planned church exit is not assumed effective without a month;
- a pending ELStAM correction remains unknown;
- retroactive employer corrections are outside the normal forward estimate;
- the annual total is the arithmetic sum of supported period results.

The UI must not advise whether a user should join, leave or change a religious community.

## 11. Couple and offer-comparison boundaries

### Couple totals

- calculate each partner independently;
- use each partner's own church-tax status, child factor and payroll establishment;
- add supported results arithmetically;
- do not model joint church-income-tax assessment;
- do not model besonderes Kirchgeld;
- warn that the total is not a final household tax-return result.

### Offer comparison

- let each offer specify its payroll-establishment state;
- keep personal ELStAM assumptions equal unless the user changes them;
- compare monthly and annual church-tax deductions;
- explain a rate difference without claiming one offer is objectively better;
- flag missing establishment-state information;
- do not assume the work location is the payroll establishment.

## 12. Result states

### Exact supported

Return when liability, establishment state, PAP inputs and exception status are all known.

### No deduction

Return when `tax.churchTaxStatus = not_liable`. The explanation must say that the estimate uses no payroll church-tax marker; it must not make a statement about the user's beliefs.

### Incomplete

Return when any required value is unknown, including:

- church-tax status;
- payroll-establishment state;
- child-allowance factor for a liable user;
- required other-remuneration inputs;
- whether a possible BW exception applies.

### Unsupported

Return for:

- a selected state without approved 2026 governing rate and final-cent source records;
- a religious-community treatment not represented by a payroll-applicable ELStAM marker;
- special or general church money;
- church-tax capping;
- minimum church tax;
- flat-rate wage-tax paths;
- final assessment or residence-state reconciliation;
- cross-border cases;
- unsupported mixed-faith allocation.

## 13. Required warnings

- “Payroll withholding estimate, not final church-tax assessment.”
- “The payroll rate follows the employer's payroll tax establishment.”
- “Child allowances can reduce the church-tax assessment base.”
- “The displayed wage tax may differ from the church-tax assessment base.”
- “Annual amount is the sum of payroll periods.”
- “Special church-tax rules are not included.”
- “Exact result unavailable because required payroll information is missing.”

BW-specific warning:

- “Baden-Württemberg generally uses 8%. A payroll establishment in Bad Wimpfen (74206) uses 9% for the Roman Catholic payroll exception; confirm whether it applies.”

## 14. Bilingual labels

| Concept | German | English |
| --- | --- | --- |
| Church wage tax | Kirchenlohnsteuer | Church wage tax |
| Church-tax status | Kirchensteuermerkmal | Church-tax status |
| Liable | Kirchensteuer wird laut Lohnabrechnungsmerkmal einbehalten | Liable according to payroll marker |
| Not liable | Kein Kirchensteuerabzug laut Lohnabrechnungsmerkmal | No deduction according to payroll marker |
| Unknown | Unbekannt | Unknown |
| Assessment base | Bemessungsgrundlage der Kirchenlohnsteuer | Church-wage-tax assessment base |
| Payroll establishment | Lohnsteuerliche Betriebsstätte | Payroll tax establishment |
| Recurring-pay church tax | Kirchenlohnsteuer auf laufenden Arbeitslohn | Church tax on recurring pay |
| Other-remuneration church tax | Kirchenlohnsteuer auf sonstige Bezüge | Church tax on other remuneration |
| Payroll estimate | Lohnabrechnungs-Schätzung | Payroll estimate |
| Final assessment | Endgültige Kirchensteuerveranlagung | Final church-tax assessment |

German explanation:

> Die Kirchenlohnsteuer wird auf eine nach § 51a EStG und dem BMF-Programm ermittelte Bemessungsgrundlage angewendet. Für den Lohnsteuerabzug gilt grundsätzlich der Hebesatz am Ort der lohnsteuerlichen Betriebsstätte des Arbeitgebers. Das Ergebnis ist eine Schätzung des Lohnsteuerabzugs und keine endgültige Kirchensteuerveranlagung.

English explanation:

> Church wage tax is applied to an assessment base calculated under section 51a EStG and the BMF payroll program. Payroll withholding generally uses the rate at the employer's payroll tax establishment. The result estimates payroll withholding and is not a final church-tax assessment.

## 15. Canonical input changes

NP-PD-004 currently contains the state and liability concepts needed for a basic estimate, but engineering must make the state meaning explicit.

| Field | v1 requirement | Validation |
| --- | --- | --- |
| `calculationYear` | Required | 2026 |
| `tax.churchTaxStatus` | Required | `liable`, `not_liable`, `unknown` |
| `tax.payrollEstablishmentState` | Required for liable result | One of 16 codes |
| `tax.childAllowanceFactor` | Required for liable exact result | PAP-supported precision |
| `tax.payrollEstablishmentPostcode` | Required when BW is selected | Valid German postcode; use only for the explicit exception gate |
| `tax.churchTaxExceptionStatus` | Required when establishment postcode is 74206 | `applies`, `does_not_apply`, `unknown` |
| PAP R | Derived control | 0 for not liable; non-zero only after liable admission |
| PAP BK | Engine output | Integer cents |
| PAP BKS | Engine output | Integer cents |

Migration rule:

- do not silently reinterpret a saved `tax.federalState`;
- migrate only when its original semantics explicitly mean payroll establishment;
- otherwise require confirmation.

A later release may store the authoritative ELStAM religious-community code, but v1 must not request more sensitive religion detail than the calculation needs.

## 16. Privacy and accessibility

Religion is sensitive personal information.

In accordance with NP-PD-007:

- process the status in the browser;
- never send church-tax status, denomination or assessment bases to analytics;
- do not include the status in public share links by default;
- make saved-scenario behavior explicit;
- provide clear/delete controls;
- use neutral language;
- never infer religion;
- do not require denomination except where a supported exception genuinely needs it;
- ensure the three-state status control is keyboard- and screen-reader-accessible;
- explain `unknown` without pressuring disclosure.

Allowed privacy-safe analytics may record only that the church-tax section was completed, incomplete or unsupported, without the selected state, status, base or amount.

## 17. Output and metadata requirements

Each individual result must expose:

- recurring BK;
- other-remuneration BKS;
- recurring church-tax deduction;
- other-remuneration church-tax deduction;
- combined period deduction;
- annual sum of period deductions;
- applied rate;
- payroll-establishment state;
- church-tax result state;
- child-allowance factor used;
- calculation year;
- PAP version and publication date;
- assumption-set ID;
- source IDs;
- warnings and result quality.

Do not expose the internal PAP R value as a denomination label.

## 18. Versioning requirements

Each rate record requires:

- stable parameter ID;
- state code;
- value and unit;
- effective-from and effective-to dates;
- source IDs and locators;
- exception references;
- verification date;
- reviewer and review date;
- superseded parameter;
- support status.

Annual review must verify:

- the final BMF plan;
- all sixteen state rates;
- new local or community exceptions;
- establishment-principle changes;
- ELStAM behavior;
- cent-rounding rules;
- effective dates.

An uncited fallback rate is prohibited.

## 19. Validation matrix

Required fixtures include:

- liable, not-liable and unknown status;
- each of the sixteen establishment states, asserting that the source gate blocks it until both required state records are approved;
- 8% and 9% calculations only for state fixtures whose governing 2026 rate and cent rule have been approved;
- employee residence different from establishment state;
- zero and positive BK;
- fractional-cent truncation;
- ZKF zero and positive;
- tax classes I through VI on admitted PAP paths;
- recurring monthly pay;
- annual input mapped to twelve monthly periods;
- BKS zero and positive;
- incomplete other-remuneration inputs;
- establishment-state change during the year;
- church-status change during the year;
- BW ordinary case;
- possible Bad Wimpfen Roman Catholic case blocked;
- couple arithmetic total;
- offers with different payroll establishments;
- privacy-safe analytics assertion.

At least one gross-to-net fixture for each rate class must be compared with an approved implementation of the final 2026 PAP and a trusted payroll reference.

## 20. Engineering handoff

Implementation should provide:

1. the final 2026 PAP adapter from NP-RS-002;
2. a versioned sixteen-state rate registry with independent rate and final-cent source gates;
3. explicit payroll-establishment input semantics;
4. tri-state liability handling;
5. exact integer-cent arithmetic;
6. separate BK and BKS calculations;
7. state-specific final-cent handling with no nationwide fallback;
8. monthly segmentation;
9. BW exception admission control;
10. fail-closed handling of unknown values;
11. result provenance and source metadata;
12. bilingual explanations and warnings;
13. privacy-safe storage and analytics;
14. fixtures for rates, bases, periods and exceptions.

## Acceptance check for NP-RS-009

- [x] The final 2026 BMF path is identified.
- [x] BK and BKS assessment bases are defined.
- [x] EStG section 51a child treatment is documented.
- [x] Candidate rates for all sixteen federal states are recorded.
- [ ] Each state has an approved 2026 governing rate and final-cent source record; production remains fail-closed until this evidence is complete.
- [x] The payroll-establishment principle is explicit.
- [x] Liability and unknown-state behavior are defined.
- [x] Downward cent truncation is specified.
- [x] Recurring and other-remuneration paths are separated.
- [x] Annual, couple and offer-comparison boundaries are defined.
- [x] The Baden-Württemberg exception is handled safely.
- [x] Special church-tax cases are deferred.
- [x] Bilingual, privacy and accessibility requirements are included.
