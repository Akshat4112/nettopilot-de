# NP-I18N-001 — German–English terminology standard

**Status:** Proposed for review  
**Version:** 1.0.0  
**Languages:** English (`en`, existing interface) and German (`de`, planned)  
**Source of truth:** [`terminology.json`](terminology.json)

## Purpose

Define a single, stable bilingual naming contract for the 2026 salary calculator and neutral A/B offer comparison. This standard maps **112 semantic IDs** into German and English. A change of language must never change a calculation, status, unit, inclusion rule or supported-case decision.

This task creates the terminology and editorial contract only. **NP-I18N-002** will build localization architecture, and **NP-I18N-003/004/005** will migrate English/German UI copy and locale formatting. Do not claim the current application is already fully bilingual.

## Language and editorial rules

1. **English default, German alternative:** default locale `en`; use standard written German and clear neutral/formal phrasing (formal *Sie* where direct address is necessary). Avoid switching between *du* and *Sie*.
2. **Stable meaning:** translation IDs and engine identifiers stay fixed; translate only labels, validation messages, explanations, and other presentation text.
3. **Payroll distinctions:** *Lohnsteuer* is wage-tax withholding, not generic *Einkommensteuer*. Keep *Solidaritätszuschlag*, *Kirchensteuer*, and employee social-insurance contributions separate.
4. **Pensions:** statutory employee/employer pension insurance (*gesetzliche Rentenversicherung*) is not employer occupational retirement provision (*betriebliche Altersversorgung*).
5. **Health insurance:** distinguish GKV from PKV; distinguish a user/insurer-specific *Zusatzbeitragssatz* from a published average. Translation must not imply unsupported private-insurance computations work.
6. **Cash vs valuation:** base salary, guaranteed recurring cash, variable pay and one-off cash are different. Pension and stated/personal benefit values remain outside payroll net.
7. **Input/result states:** `Nicht angegeben`, `Unbekannt`, `Unvollständig`, `Ungültig`, `Nicht verfügbar`, `Nicht unterstützt` and an explicit `0,00 €` have different meanings. Never silently translate missing into zero.
8. **Comparisons:** `B − A` is a signed arithmetic difference with Offer A as reference; a higher amount is not an overall recommendation. Hours include the stated working/commute basis.
9. **Privacy:** no wording should imply salaries can safely be put into URLs. Share/export buttons warn about private amounts and require explicit acknowledgement.
10. **Not a legal certification:** use *geschätzt* for supported payroll estimates; never call the output an official payslip, annual tax assessment, or tax advice.

## Locale formatting handoff (NP-I18N-005)

| Concept | English `en` | German `de` |
| --- | --- | --- |
| EUR | `€1,234.56` | `1.234,56 €` |
| Percent | `3.50%` | `3,50 %` |
| Annual period | `per year` | `pro Jahr` |
| Monthly period | `per month` | `pro Monat` |
| One-way trip | `one-way` | `einfach` |
| Comparison direction | `B − A` | `B − A` |
| Zero | `€0.00` | `0,00 €` |

Use locale-aware formatting at the display boundary only; canonical money remains exact integer cents or decimal EUR and calculation formulas are untouched. Examples demonstrate a presentation convention; implementation/verification is deferred to NP-I18N-005.

## Glossary

Columns give the exact preferred UI terms; `Meaning / usage` states the narrow semantic contract. For a longer explanation, keep the same ID and compose a full localized message in NP-I18N-002 rather than overloading a short label.

### Interface

| Stable ID | English | Deutsch | Meaning / usage |
| --- | --- | --- | --- |
| `ui.calculation_year` | Calculation year | Berechnungsjahr | The year of the payroll assumptions, not the filing year. |
| `ui.currency_eur` | Euro (EUR) | Euro (EUR) | Never translate the ISO currency code EUR. |
| `ui.monthly` | Monthly | Monatlich | Pay frequency or a clearly labelled monthly output. |
| `ui.annual` | Annual | Jährlich | Pay frequency or a clearly labelled annual output. |
| `ui.month` | Month | Monat | Calendar/payroll month. |
| `ui.year` | Year | Jahr | Calendar or calculation year. |
| `ui.required` | Required | Erforderlich | A supported calculation needs a supplied valid value. |
| `ui.optional` | Optional | Optional | An input can be left empty under the stated rules. |
| `ui.calculate` | Calculate | Berechnen | Use for an actual calculation action, not a saved draft. |
| `ui.reset` | Reset | Zurücksetzen | Clears the specified current browser state. |
| `ui.copy` | Copy | Kopieren | Copies only the explicitly described content. |
| `ui.download` | Download | Herunterladen | Browser-local file download. |
| `ui.print` | Print | Drucken | Do not imply comparison values appear on the salary report. |
| `ui.assumptions` | Calculation assumptions | Berechnungsannahmen | Name assumptions before presenting a numeric result. |
| `ui.sources` | Sources | Quellen | References supporting the assumptions. |
| `ui.methodology` | Calculation methodology | Berechnungsmethodik | How admitted amounts are calculated and qualified. |
| `ui.estimated` | Estimated | Geschätzt | Qualify a forecast; not a certified payslip. |
| `ui.information_only` | For information only | Nur zur Information | Not tax, legal or financial advice. |

### Payroll

| Stable ID | English | Deutsch | Meaning / usage |
| --- | --- | --- | --- |
| `payroll.salary_calculator` | Salary calculator | Gehaltsrechner | The standard employment salary calculator. |
| `payroll.gross_salary` | Gross salary | Bruttogehalt | Cash pay before employee withholding/deductions. |
| `payroll.net_salary` | Net salary | Nettogehalt | Label estimate status and accounting basis nearby. |
| `payroll.base_salary` | Base salary | Grundgehalt | Do not include bonuses, benefits or pension valuation. |
| `payroll.annual_base_gross` | Annual base gross | Jährliches Bruttogrundgehalt | Annual base cash only; not total compensation. |
| `payroll.recurring_gross` | Recurring gross pay | Regelmäßiges Bruttogehalt | Regular payroll pay, not one-off cash. |
| `payroll.recurring_monthly_net` | Estimated recurring monthly net pay | Geschätztes regelmäßiges Monatsnetto | Primary result, not a twelve-month bonus average. |
| `payroll.annual_payroll_net` | Estimated annual net payroll pay | Geschätztes jährliches Netto laut Lohnabrechnung | Distinguish payroll net from outside-payroll costs. |
| `payroll.payment_frequency` | Salary frequency | Gehaltsintervall | Monthly versus annual input; not number of payroll runs. |
| `payroll.deductions` | Employee deductions | Arbeitnehmerabzüge | Identify any additional outside-payroll costs separately. |
| `payroll.deduction_breakdown` | Deduction breakdown | Aufschlüsselung der Abzüge | Describe amounts and sources without inventing rates. |
| `payroll.employer_cost` | Estimated employer cost | Geschätzte Arbeitgeberkosten | Not identical to employee gross pay. |
| `payroll.employer_contribution` | Employer contribution | Arbeitgeberbeitrag | Name the relevant insurance or benefit scheme. |
| `payroll.employee_contribution` | Employee contribution | Arbeitnehmerbeitrag | Name the relevant insurance or benefit scheme. |
| `payroll.variable_pay` | Variable compensation | Variable Vergütung | Not guaranteed recurring base pay. |
| `payroll.guaranteed_cash` | Guaranteed cash compensation | Garantierte Geldvergütung | Only contractually guaranteed cash, not user valuations. |
| `payroll.one_off_payment` | One-off payment | Einmalzahlung | Separate event payment, not recurring wages. |
| `payroll.bonus` | Bonus | Bonus | Specific compensation type; payment month can matter. |
| `payroll.special_payment` | Special payment | Sonderzahlung | Do not infer guaranteed status. |
| `payroll.annual_equivalent` | Annual equivalent | Jahresäquivalent | Derived comparable period amount, not necessarily paid at once. |
| `payroll.payroll_month` | Payroll month | Abrechnungsmonat | Specific settlement month, not annual total. |

### Tax

| Stable ID | English | Deutsch | Meaning / usage |
| --- | --- | --- | --- |
| `tax.wage_tax` | Wage tax withholding | Lohnsteuer | Payroll wage-tax deduction. Do not translate as Einkommensteuer. |
| `tax.income_tax` | Income tax | Einkommensteuer | Annual income tax concept; not interchangeable with Lohnsteuer. |
| `tax.tax_class` | Tax class | Steuerklasse | German payroll tax class, not tax bracket. |
| `tax.federal_state` | Federal state | Bundesland | German Bundesland; independent of country. |
| `tax.solidarity` | Solidarity surcharge | Solidaritätszuschlag | Separate levy; never bundle into wage tax label. |
| `tax.church_tax` | Church tax | Kirchensteuer | Liability selection, not religion inferred from another field. |
| `tax.church_tax_liability` | Church-tax liability | Kirchensteuerpflicht | Do not infer liability from residence or marital status. |
| `tax.allowance` | Tax allowance | Steuerfreibetrag | Name exact allowance when available; do not overclaim deductibility. |
| `tax.addition_amount` | Tax addition amount | Steuerlicher Hinzurechnungsbetrag | Not another allowance; increases relevant tax basis. |
| `tax.bmf` | German Federal Ministry of Finance | Bundesministerium der Finanzen (BMF) | Official institution/source reference. |
| `tax.pap` | Official payroll-tax calculation algorithm | Programmablaufplan zur Lohnsteuerberechnung (PAP) | German BMF PAP; not a tax return model. |

### Insurance

| Stable ID | English | Deutsch | Meaning / usage |
| --- | --- | --- | --- |
| `insurance.social` | Social insurance | Sozialversicherung | General collective term, not a separate deduction. |
| `insurance.statutory_health` | Statutory health insurance (GKV) | Gesetzliche Krankenversicherung (GKV) | Use GKV for German compulsory/statutory coverage. |
| `insurance.private_health` | Private health insurance (PKV) | Private Krankenversicherung (PKV) | Do not imply current calculator supports every PKV case. |
| `insurance.health_contribution` | Health insurance contribution | Krankenversicherungsbeitrag | May have separate employee and employer portions. |
| `insurance.additional_health_rate` | Additional health contribution rate | Zusatzbeitragssatz zur Krankenversicherung | Rate from insurer/user input or published average; label source. |
| `insurance.average_additional_rate` | Average additional health contribution rate | Durchschnittlicher Zusatzbeitragssatz | Published annual average, not a user's actual insurer rate. |
| `insurance.pension` | Statutory pension insurance | Gesetzliche Rentenversicherung | Distinct from employer occupational retirement benefits. |
| `insurance.pension_employee` | Employee pension insurance contribution | Arbeitnehmerbeitrag zur Rentenversicherung | Employee statutory pension withholding, not occupational pension. |
| `insurance.pension_employer` | Employer statutory pension contribution | Arbeitgeberbeitrag zur gesetzlichen Rentenversicherung | Statutory employer contribution, not occupational benefits. |
| `insurance.unemployment` | Unemployment insurance | Arbeitslosenversicherung | Separate contribution, not unemployment benefit. |
| `insurance.care` | Long-term care insurance | Pflegeversicherung | German social care contribution, not health insurance. |
| `insurance.child_count` | Number of children | Anzahl der Kinder | Care-insurance rules require explicit relevant inputs. |
| `insurance.contribution_ceiling` | Contribution assessment ceiling | Beitragsbemessungsgrenze | Annual/year-specific insurance basis cap, not salary maximum. |
| `insurance.employer_occupational_pension` | Employer occupational pension contribution | Arbeitgeberbeitrag zur betrieblichen Altersversorgung | Never conflate with employer statutory pension contribution. |

### Comparison

| Stable ID | English | Deutsch | Meaning / usage |
| --- | --- | --- | --- |
| `comparison.offer_a` | Offer A | Angebot A | Reference offer for differences. |
| `comparison.offer_b` | Offer B | Angebot B | Compared against offer A. |
| `comparison.compare_offers` | Compare two job offers | Zwei Stellenangebote vergleichen | Neutral comparison, no overall ranking. |
| `comparison.shared_payroll_assumptions` | Shared payroll assumptions | Gemeinsame Annahmen zur Lohnabrechnung | Both offers use the same explicit payroll profile. |
| `comparison.b_minus_a` | B − A difference | Differenz B − A | Signed B minus A; not evidence of a better offer. |
| `comparison.net_difference` | Net-pay difference | Nettogehaltsdifferenz | Only comparable when both payroll results are supported. |
| `comparison.commute_costs` | Commuting costs | Pendelkosten | User-entered costs, not automatically computed tax deductions. |
| `comparison.one_way_commute` | One-way commute time | Einfache Pendelzeit | Time for one direction; two trips used for round-trip totals. |
| `comparison.annual_commute_hours` | Annual commute hours | Jährliche Pendelstunden | Based on supplied office frequency and paid leave. |
| `comparison.office_days` | Office days per week | Bürotage pro Woche | Not identical to working days per week. |
| `comparison.remote_days` | Remote days per week | Remote-Tage pro Woche | Derived only from valid working-day and office-day schedule. |
| `comparison.work_arrangement` | Work arrangement | Arbeitsmodell | On-site, hybrid, fully remote, or unknown. |
| `comparison.onsite` | On-site | Vor Ort | Work physically at workplace. |
| `comparison.hybrid` | Hybrid | Hybrid | Combination of workplace and remote work. |
| `comparison.fully_remote` | Fully remote | Vollständig remote | Avoid legal inference that a Telearbeitsplatz is established. |
| `comparison.home_office_expenses` | Home-office expenses | Homeoffice-Kosten | User-entered expenses, not automatic tax deductions. |
| `comparison.remote_allowance` | Employer home-office allowance | Homeoffice-Zuschuss des Arbeitgebers | Show separately; no automatic net-pay treatment. |
| `comparison.contractual_hours` | Contractual working hours | Vertragliche Arbeitsstunden | Clarify weekly or annual period. |
| `comparison.annual_work_hours` | Annual contractual work hours | Jährliche vertragliche Arbeitsstunden | 52-week/paid-leave assumptions must be visible. |
| `comparison.paid_vacation` | Paid vacation days | Bezahlte Urlaubstage | Counts may not be comparable for different weekly schedules. |
| `comparison.effective_hourly` | Effective net after commuting per hour | Effektives Netto je Stunde nach Pendelkosten | (annual net−entered commute costs)/(work+commute hours), not salary per paid hour. |
| `comparison.net_after_commute` | Annual net after entered commute costs | Jahresnetto nach eingegebenen Pendelkosten | No tax relief or implicit route savings inferred. |
| `comparison.employer_benefits` | Employer-stated annual benefit value | Jahreswert der Zusatzleistungen laut Arbeitgeber | Distinct from personally estimated benefit value. |
| `comparison.personal_benefits` | User-assigned annual benefit value | Selbst geschätzter Jahreswert der Zusatzleistungen | Not guaranteed cash or employer payment. |
| `comparison.benefit_eligibility` | Benefit eligibility | Anspruchsvoraussetzungen der Zusatzleistung | Separate conditions from valuation. |
| `comparison.benefit_certainty` | Benefit certainty | Verlässlichkeit der Zusatzleistung | Qualify uncertain benefit terms. |
| `comparison.vesting` | Vesting | Unverfallbarkeit | Only use in appropriately qualified retirement-benefit context. |
| `comparison.tradeoffs` | Factors behind the comparison | Faktoren hinter dem Vergleich | Describe factors without ranking offers. |
| `comparison.summary` | Offer comparison summary | Zusammenfassung des Angebotsvergleichs | Current inputs; no stored draft or final offer choice. |
| `comparison.share` | Share comparison | Vergleich teilen | Disclose that exported salary amounts are sensitive. |
| `comparison.download` | Download comparison (.txt) | Vergleich herunterladen (.txt) | Local text file, not a generated server resource. |

### States

| Stable ID | English | Deutsch | Meaning / usage |
| --- | --- | --- | --- |
| `states.not_supplied` | Not supplied | Nicht angegeben | Blank field is not numerically zero. |
| `states.unknown` | Unknown | Unbekannt | Not a presumed default or confirmed zero. |
| `states.unavailable` | Unavailable | Nicht verfügbar | A result is missing; preserve the reason when known. |
| `states.unsupported` | Unsupported scenario | Nicht unterstützter Fall | Deliberate calculation-scope restriction, not necessarily a bad input. |
| `states.incomplete` | Incomplete | Unvollständig | Required input is absent or not yet ready. |
| `states.invalid` | Invalid | Ungültig | Provided value fails validation; distinct from unknown. |
| `states.calculated` | Calculated | Berechnet | Valid numeric calculation produced by admitted model. |
| `states.supplied` | Supplied | Angegeben | User-entered information is present and valid. |
| `states.explicit_zero` | Explicit zero | Ausdrücklich angegebener Nullwert | Known amount of 0 EUR, not missing or unavailable. |
| `states.loading` | Calculating… | Berechnung läuft … | Do not imply a result has completed. |
| `states.warning` | Important note | Wichtiger Hinweis | Caution about assumptions or limitations. |

### Privacy

| Stable ID | English | Deutsch | Meaning / usage |
| --- | --- | --- | --- |
| `privacy.browser_only` | Inputs remain in your browser | Eingaben bleiben in Ihrem Browser | No automatic server submission. |
| `privacy.sensitive_export` | This export contains private compensation figures | Dieser Export enthält vertrauliche Vergütungsbeträge | Require user consent before clipboard or download. |
| `privacy.no_upload` | No data is uploaded | Es werden keine Daten hochgeladen | Only claim for a verified local-only data path. |
| `privacy.consent` | I understand this export contains private compensation figures | Mir ist bewusst, dass dieser Export vertrauliche Vergütungsbeträge enthält | Explicit unchecked acknowledgment; not automatic opt-in. |
| `privacy.safe_link` | Link with non-sensitive settings | Link mit nicht vertraulichen Einstellungen | Never include salaries or dates of birth in URLs. |
| `privacy.not_advice` | Educational estimates, not tax or legal advice | Unverbindliche Schätzungen, keine Steuer- oder Rechtsberatung | Do not present numbers as a payslip or legal entitlement. |

## Implementation and review acceptance criteria

- All `112` terms have a stable, unique ID, nonblank EN and DE copy, an allowed domain, and a meaning note.
- Machine source and this table must stay identical; unit tests check important look-alike pairs and status boundaries.
- Stable IDs are independent of literal English labels so later UI copy can change without changing financial inputs.
- The future localization layer may consume the machine source but must not import UI translations into domain/tax/insurance calculation modules.
- Product/legal wording changes require review against the corresponding product scope, source register, and current supported 2026 engine contracts. These translations are editorial, not new legal/rate assumptions.
