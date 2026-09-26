# NP-RS-011 — Bonuses and one-time payments for 2026

**Status:** Proposed for review  
**Task:** NP-RS-011  
**Milestone:** M1 Research  
**Depends on:** [NP-RS-002](NP-RS-002-bmf-payroll-tax-algorithm.md)  
**Calculation year:** 2026  
**Effective period:** 2026-01-01 through 2026-12-31  
**Verified on:** 2026-09-26  
**Follow-on:** NP-RS-012 — Create official reference scenarios

## Decision

NettoPilot DE shall support ordinary taxable cash bonuses and one-time cash payments for a single German salaried employment when the payment can be classified without ambiguity and the current-year payroll context required by the official 2026 rules is available.

The engine must keep two legal classifications separate:

1. **Wage tax:** laufender Arbeitslohn (running pay) or sonstiger Bezug (other remuneration).
2. **Social insurance:** laufendes Arbeitsentgelt (recurring remuneration) or einmalig gezahltes Arbeitsentgelt (one-time remuneration).

These classifications often agree, but they are not one interchangeable flag. A versioned payment-classification registry must resolve both. Unknown or conflicting classifications produce an incomplete result, never a guessed normal calculation.

Supported v1 examples include a cash performance bonus, gratuity, thirteenth salary, non-recurring Christmas pay and non-recurring holiday pay when the ordinary conditions below are met. Severance, equity compensation, multi-year compensation, non-cash awards, special tax exemptions and March-clause allocations remain outside the exact v1 path.

Suggested assumption-set identifier: **de-bonus-one-time-2026-v1**.

## 1. Authoritative sources

| Source ID | Authority and document | Evidence role | Applicability | Status |
| --- | --- | --- | --- | --- |
| DE-BMF-LSTH-2026-R39B2 | [BMF 2026 payroll-tax handbook — R 39b.2](https://amtliche-handbuecher.bundesfinanzministerium.de/lsth/2026/A-Einkommensteuergesetz/VI-Steuererhebung-36-47/2-Steuerabzug-vom-Arbeitslohn-Lohnsteuer-38-42g/Paragraf-39b/r-39b-2.html) | Distinguishes running pay from other remuneration and gives examples | 2026 | Verified |
| DE-BMF-LSTH-2026-R39B6 | [BMF 2026 payroll-tax handbook — R 39b.6](https://amtliche-handbuecher.bundesfinanzministerium.de/lsth/2026/A-Einkommensteuergesetz/VI-Steuererhebung-36-47/2-Steuerabzug-vom-Arbeitslohn-Lohnsteuer-38-42g/Paragraf-39b/r-39b-6.html) | Receipt-month ELStAM and expected annual-pay method | 2026 | Verified |
| DE-ESTG-39B | [EStG section 39b](https://www.gesetze-im-internet.de/estg/__39b.html) | Statutory payroll-withholding method for other remuneration | Current 2026 law | Verified |
| DE-BMF-PAP-2026-A1 | [BMF — final 2026 machine payroll plan, Annex 1](https://www.bundesfinanzministerium.de/Content/DE/Downloads/Steuern/Steuerarten/Lohnsteuer/Programmablaufplan/2025-11-12-PAP-2026-anlage-1.pdf?__blob=publicationFile&v=2) | Machine calculation through JRE4, SONSTB, STS, SOLZS and BKS | 2026 | Verified |
| DE-SGB4-23A | [SGB IV section 23a](https://www.gesetze-im-internet.de/sgb_4/__23a.html) | Definition, allocation, proportional annual ceilings and March clause | Current 2026 law | Verified |
| DE-DRV-EINMALZAHLUNG | [German Pension Insurance — one-time payment](https://www.deutsche-rentenversicherung.de/DRV/DE/Experten/Arbeitgeber-und-Steuerberater/summa-summarum/Lexikon/E/einmalzahlung.html) | Official operational explanation and examples | Current | Verified |
| DE-DRV-23A-GRA | [German Pension Insurance — guidance on section 23a SGB IV](https://rvrecht.deutsche-rentenversicherung.de/SharedDocs/rvRecht/01_GRA_SGB/04_SGB_IV/pp_0001_25/gra_sgb004_p_0023a.html) | Contribution days, allocation and special cases | Current | Verified |
| DE-DRV-MARCH-CLAUSE | [German Pension Insurance — March clause](https://www.deutsche-rentenversicherung.de/DRV/DE/Experten/Arbeitgeber-und-Steuerberater/summa-summarum/Lexikon/M/maerzklausel) | Conditions for mandatory prior-year allocation | Current | Verified |
| DE-DRV-CONTRIBUTIONS-2026 | [German Pension Insurance — Beiträge 2026](https://www.deutsche-rentenversicherung.de/SharedDocs/Downloads/DE/Fachliteratur_Kommentare_Gesetzestexte/summa_summarum/e_paper_und_broschueren/broschueren/beitraege.pdf?__blob=publicationFile&v=10) | 2026 operational contribution calculation | 2026 | Verified |

The calculation also depends on the accepted 2026 pension, unemployment, health, care, solidarity-surcharge, church-tax and private-insurance modules in NP-RS-004 through NP-RS-010. This note does not duplicate their rates.

## 2. Classification rules

### 2.1 Wage-tax classification

Running pay is remuneration paid regularly for a wage-payment period. Typical supported examples are monthly base salary, a monthly fixed allowance and a monthly recurring commission or bonus.

Other remuneration is taxable employment income that is not running pay. Official examples include:

- thirteenth or fourteenth salary;
- non-recurring Christmas or holiday pay;
- non-recurring bonus, gratuity or tantième;
- jubilee payment;
- quarterly or half-yearly payment;
- certain retroactive payments relating to another calendar year.

A label such as “bonus” does not decide the classification. Frequency, entitlement period and payroll treatment do.

### 2.2 Social-insurance classification

One-time remuneration is remuneration that is not attributable to one specific payroll period. Common examples are Christmas pay, holiday pay and gratuities. A payment attributable to a specific payroll period remains recurring remuneration even when paid late.

### 2.3 Required dual registry

Each supported classification record must contain:

| Property | Purpose |
| --- | --- |
| Stable classification ID | Shared German/English identity |
| Tax class | running pay or other remuneration |
| Social-insurance class | recurring or one-time remuneration |
| Included examples | User guidance |
| Excluded look-alikes | Prevents label-based guesses |
| Required context | Timing and prior-payroll facts |
| Source records | Exact rule evidence |
| Effective dates | Year/version control |
| Verification status | Admission gate |

The UI may offer user-friendly labels, but the engine receives the two resolved legal classifications.

## 3. V1 support boundary

### Supported exact path

All conditions must hold:

- calculation year 2026;
- one ordinary German salaried employment;
- taxable cash payment from the same employer;
- payment occurs while the employment is active;
- payment month is known;
- classification is in the verified registry;
- no cross-border, tax-exempt, lump-sum-taxed or special valuation rule applies;
- current-year expected annual taxable pay can be determined;
- prior current-year other remuneration is known;
- social-insurance contribution days and year-to-date contributory remuneration can be determined;
- payment is not subject to prior-year allocation under the March clause;
- all underlying tax and social-insurance modules admit the scenario.

### Supported payment classes

| Product class | Wage tax | Social insurance | V1 treatment |
| --- | --- | --- | --- |
| Monthly recurring bonus or commission | Running pay | Recurring | Add to the normal payment-period gross |
| Non-recurring cash performance bonus | Other remuneration | One-time | Separate other-remuneration and proportional-ceiling paths |
| Thirteenth/fourteenth salary | Other remuneration | One-time | Supported when ordinary conditions pass |
| Non-recurring Christmas or holiday pay | Other remuneration | One-time | Supported when ordinary conditions pass |
| Gratuity or non-recurring tantième | Other remuneration | One-time | Supported when ordinary conditions pass |
| Quarterly or half-yearly bonus | Other remuneration | Resolve from registry; ordinarily one-time when not attributable to a period | Supported only after unambiguous registry resolution |

### Deferred or unsupported

- severance and compensation under EStG section 24;
- multi-year remuneration and section 34 treatment;
- stock options, restricted stock, virtual shares and section 19a cases;
- non-cash awards, employee discounts and company-car benefits;
- tax-free, partially tax-free or lump-sum-taxed payments;
- retroactive pay that requires another-year or special correction logic;
- third-party payments and payments after employment termination;
- multiple simultaneous employers;
- foreign or cross-border payroll;
- mini-jobs, midijobs, working students and short-time work;
- insolvency, contribution refund, recovery or correction cases;
- March-clause allocation to the previous year;
- any payment whose tax or social-insurance classification is unknown.

Unsupported rows remain visible and are excluded from normal totals with a specific explanation.

## 4. Canonical inputs and derived context

NP-PD-004 remains the public input contract. Its existing `oneOffPayments[]` rows are used:

| Field | Rule |
| --- | --- |
| `oneOffPayments[].amount` | Positive gross cash amount in EUR |
| `oneOffPayments[].paymentMonth` | Required integer 1–12 |
| `oneOffPayments[].classification` | Verified year-specific registry value |
| `oneOffPayments[].guarantee` | Guaranteed or variable; comparison only |
| `oneOffPayments[].label` | Optional display label; never determines legal treatment |

The classification record resolves independent `taxTreatment` and `socialInsuranceTreatment` values. The engine also needs the following scenario context, preferably derived rather than re-entered:

- expected current-year running taxable pay excluding the current payment;
- gross prior other remuneration already paid in the year;
- current payment sequence when multiple payments share a month;
- current ELStAM/tax inputs at the end of the receipt month;
- current-year social-insurance contribution days through the allocation period;
- year-to-date contributory recurring and prior one-time remuneration for KV/PV and RV/AV;
- employment start/end facts and unpaid/non-contributory periods;
- same-employer prior-year coverage fact for January–March screening;
- health-insurance path and all applicable year-module inputs.

Future expected other remuneration must not be added to the tax annual basis. A user-entered annual bonus without a payment month cannot produce an exact result.

## 5. Wage-tax calculation

### 5.1 Running bonus

A bonus classified as running pay is combined with taxable recurring remuneration for its wage-payment period and passed through the normal BMF PAP path. It is not also sent as `SONSTB`.

### 5.2 Other remuneration

For each payment in chronological order:

1. Select ELStAM and other payroll attributes applicable at the end of the receipt month.
2. Build `JRE4` from expected running taxable pay for the year plus prior other remuneration already received, excluding the current payment and excluding future expected other remuneration.
3. Pass the current gross other remuneration as `SONSTB`.
4. Pass only supported subsets such as `SONSTENT`, `STERBE` or `VBS`; v1 uses zero because those special classes are deferred.
5. Run the final 2026 BMF PAP.
6. Read `STS` as wage tax on the current other remuneration, `SOLZS` as solidarity surcharge and `BKS` as the church-tax assessment base.
7. Calculate church tax only through the accepted NP-RS-009 state/rate module.
8. Add the payment to prior other remuneration before calculating the next payment.

Conceptually, the wage tax is the difference between the annual withholding result including the current other remuneration and the annual withholding result without it. The engine must use the PAP rather than reproduce that concept with a marginal-rate shortcut.

Payroll withholding remains an estimate of annual liability. A later income-tax assessment can differ.

## 6. Social-insurance calculation

### 6.1 Running bonus

Recurring remuneration is added to the applicable payroll period and capped under each accepted branch module's normal period rules.

### 6.2 One-time remuneration

A one-time payment is generally allocated to the payroll period in which it is paid. For each insurance branch, calculate the proportional annual contribution ceiling from contribution-bearing employment time with the paying employer:

`proportionalCeiling = annualCeiling × socialInsuranceDays / 360`

Then calculate available headroom through the allocation period:

`headroom = max(0, proportionalCeiling - priorContributoryRemuneration)`

And the contribution-liable portion of the current payment:

`liableOneTimeAmount = min(currentGrossPayment, headroom)`

Rules:

- social-insurance days include only the contribution-bearing periods admitted by section 23a; calendar months conventionally contribute 30 days;
- prior contributory remuneration includes recurring remuneration and the contribution-liable portion of earlier one-time payments through the allocation period;
- calculate KV/PV and RV/AV against their applicable ceilings and statuses;
- process multiple payments chronologically so an earlier payment consumes headroom;
- calculate employee and employer contributions with the accepted year modules and their rounding rules;
- never apply a single combined “social-insurance rate” to the gross bonus.

For a privately insured employee, no employee statutory KV/PV contribution is created by the bonus. RV/AV may still apply. The monthly PKV/PPV employer subsidy remains governed by NP-RS-010 and does not rise above the monthly cap because of a one-time payment.

## 7. March-clause gate

A payment made from January through March can be compulsorily allocated to the last payroll period of the previous calendar year when:

- it is not fully contribution-liable in every applicable social-insurance branch under the current-year proportional ceilings; and
- the employee was contribution-liable with the same employer in the previous year.

The allocation decision is made consistently across branches under the statutory rule. For a person compulsorily insured in GKV, the GKV threshold controls the allocation test; otherwise the pension-insurance threshold controls it.

NP-RS-011 does not introduce previous-year assumption sets or corrections. Therefore:

- January–March payments are supported only when the engine can prove that the March clause does not apply;
- if prior-year same-employer status is unknown, return incomplete;
- if the clause applies, return unsupported for the one-time component and explain that previous-year payroll data is required;
- do not calculate part in the current year and part in the prior year.

## 8. Outputs

Each payment must expose:

| Output | Meaning |
| --- | --- |
| Gross payment | Entered amount and receipt month |
| Tax classification | Running pay or other remuneration |
| SI classification | Recurring or one-time remuneration |
| Wage tax | Increment attributable to the payment |
| Solidarity surcharge | Increment attributable to the payment |
| Church tax | Increment attributable to the payment when supported |
| KV/PV liable amount | Contribution base for the one-time component |
| RV/AV liable amount | Contribution base for the one-time component |
| Employee contributions by branch | Payment-specific deductions |
| Employer contributions by branch | Payment-specific employer cost |
| Estimated net payment | Gross less payment-specific taxes and employee contributions |
| Employer incremental cost | Gross plus payment-specific employer contributions |
| Result quality | Exact supported, guided, incomplete or unsupported |
| Assumptions and sources | Year, payment month, registry, PAP and module versions |

Annual totals must keep recurring, variable and one-time compensation separately reconcilable. The user must be able to see that the net payment in its receipt month is not a new permanent monthly net salary.

## 9. Offer-comparison treatment

- Guaranteed payments appear in both conservative and total-compensation views.
- Variable payments are excluded from the conservative view unless NP-PD-006 explicitly defines a user-selected guaranteed floor.
- The total-compensation view uses the entered scenario amount and payment timing.
- Do not imply that a target bonus is certain.
- Compare absolute and percentage differences only where both sides have supported results.
- Missing bonus timing or classification makes bonus-adjusted net comparison incomplete, while the supported base-salary comparison may remain available.
- Break-even calculations must reuse the full deterministic bonus path; they may not apply an assumed marginal tax rate.
- The product remains neutral and must not declare an offer objectively better.

## 10. Warnings and explanations

Required messages include:

- “A recurring monthly bonus and a one-time bonus are calculated differently.”
- “The payment month and earlier bonuses can change the withholding estimate.”
- “Future expected bonuses are not included in the annual basis for this payment.”
- “Social-insurance contributions use remaining proportional annual ceilings, not only the normal monthly ceiling.”
- “A January–March payment may require previous-year payroll data.”
- “Payroll withholding is not the final annual income-tax assessment.”
- “Variable compensation is not guaranteed.”
- “Unsupported payments are excluded from normal totals.”

German and English labels:

| Concept | German | English |
| --- | --- | --- |
| Recurring bonus | Laufender Bonus | Recurring bonus |
| One-time payment | Einmalzahlung | One-time payment |
| Other remuneration | Sonstiger Bezug | Other remuneration |
| Payment month | Auszahlungsmonat | Payment month |
| Guaranteed compensation | Garantierte Vergütung | Guaranteed compensation |
| Variable compensation | Variable Vergütung | Variable compensation |
| Contribution-liable amount | Beitragspflichtiger Betrag | Contribution-liable amount |
| Remaining contribution ceiling | Verbleibende Beitragsbemessungsgrenze | Remaining contribution ceiling |
| Estimated net payment | Geschätzte Netto-Einmalzahlung | Estimated net one-time payment |
| March-clause check | Prüfung der Märzklausel | March-clause check |

## 11. Privacy and accessibility

Under NP-PD-007:

- calculate in the browser;
- do not send payment amounts, months, labels, classifications, tax values or contribution values to analytics;
- do not place scenario data in URLs or share links;
- saved scenarios remain opt-in and locally deletable;
- free-text labels never enter formulas or telemetry;
- generic validation and terminal events may be emitted only under the NP-PD-008 allowlist.

Inputs and result tables need accessible names, programmatic error associations, locale-aware currency entry, keyboard operation and non-color-only status cues. Explanations must identify the affected payment row.

## 12. Validation matrix

Required deterministic fixtures include:

- monthly recurring bonus treated as running pay;
- non-recurring performance bonus treated as other/one-time remuneration;
- thirteenth salary, Christmas pay and holiday pay;
- payment below, at and above KV/PV and RV/AV remaining headroom;
- employee already above a ceiling before the payment;
- different KV/PV and RV/AV liable amounts;
- multiple payments in chronological order;
- two payments in one month with deterministic ordering;
- prior other remuneration changing `JRE4`;
- future expected bonus excluded from `JRE4`;
- zero `STS`, first taxable cent and high-income cases;
- `STS`, `SOLZS` and `BKS` PAP outputs;
- supported church-tax and no-church-tax cases;
- GKV and PKV paths;
- PKV subsidy unchanged by a bonus;
- full-year employment and reduced social-insurance days;
- January–March payment where the March clause provably does not apply;
- January–March unknown/applicable case failing closed;
- unsupported severance, equity, non-cash and post-termination payments;
- guaranteed and variable offer-comparison views;
- privacy-safe analytics assertions;
- cent-level rounding checkpoints and reconciliation to annual totals.

Reference cases must cite exact source locators and the final 2026 PAP. At least one official or approved payroll cross-check is required for each supported classification family.

## 13. Engineering handoff

Implementation should provide:

1. a versioned dual tax/SI classification registry;
2. chronological payment sequencing;
3. a dedicated PAP other-remuneration adapter using `JRE4` and `SONSTB`;
4. independent social-insurance headroom calculations by branch;
5. explicit contribution-day calculation;
6. a March-clause admission gate;
7. separate payment-level and annual outputs;
8. conservative and total-compensation comparison integration;
9. exact decimal and year-module reuse;
10. fail-closed unsupported and incomplete states;
11. bilingual guidance;
12. source/version metadata and deterministic fixtures.

## Acceptance check for NP-RS-011

- [x] Running bonuses and other remuneration are distinguished for wage tax.
- [x] Recurring and one-time remuneration are distinguished for social insurance.
- [x] Independent tax and SI classifications are required.
- [x] Supported and deferred payment classes are explicit.
- [x] Existing product inputs are mapped and missing payroll context is defined.
- [x] The 2026 PAP other-remuneration path is specified.
- [x] Proportional annual contribution-ceiling logic is specified.
- [x] Multiple-payment ordering is defined.
- [x] Private-insurance behavior is bounded.
- [x] The March clause fails closed without previous-year data.
- [x] Outputs, offer comparison, warnings and bilingual labels are defined.
- [x] Privacy, accessibility, fixtures and engineering handoff are included.
