# NP-TRUST-004 — Informational-use disclaimer

**Status:** Proposed for review  
**Task:** NP-TRUST-004  
**Milestone:** M6 Public beta  
**Depends on:** NP-PD-003

## Purpose and publication requirements

NettoPilot DE provides **informational estimates**, not an official payslip, a tax assessment, or individualized tax, legal, financial, or insurance advice. Calculated amounts may differ from an employer's payroll due to the selected tax year, individual circumstances, payroll periods, employer-specific items, rounding, and unsupported cases.

Before relying on an estimate for a job, financial or tax decision, users should check the selected year, input assumptions, supported employment scope and official sources, and confirm important figures with their payroll department or a qualified adviser.

The tool does **not** determine the final annual income-tax liability or refund. Two job offers can have different noncash benefits, contractual conditions and personal trade-offs; the comparison is neutral and is not a recommendation to accept an offer.

If a situation falls outside the [version-one employment scope](../product/NP-PD-003-v1-employment-scope.md), the interface must not silently present it as fully supported. Examples include self-employment, multiple concurrent jobs, cross-border payroll and deferred special cases. Missing, unsupported or stale assumptions must be identified rather than silently replaced.

## Proposed concise public copy

**English:** “Estimates for information only — not an official payslip or personal tax, legal or financial advice. Results depend on your inputs, calculation year and supported German payroll rules. Verify important decisions with official sources or a qualified professional.”

**Deutsch:** „Unverbindliche Schätzwerte zur Information – keine offizielle Gehaltsabrechnung und keine individuelle Steuer-, Rechts- oder Finanzberatung. Ergebnisse hängen von Ihren Angaben, dem Berechnungsjahr und den unterstützten deutschen Lohnabrechnungsregeln ab. Prüfen Sie wichtige Entscheidungen anhand amtlicher Quellen oder mit qualifizierter Beratung.“

## Acceptance checklist

- [ ] Review both language versions for clarity and consistency with the current supported-scope and privacy disclosures.
- [ ] Display concise copy visibly near salary results and offer-comparison results, with an accessible link to the fuller explanation.
- [ ] Confirm it remains understandable on narrow screens and in print, and that assistive technology can access it without duplicate announcements.
- [ ] Add component/browser regression assertions for both language versions and result journeys.
- [ ] Verify current CI, live behavior and print output before marking NP-TRUST-004 Done.

This document records the disclaimer wording and placement contract only. It does **not** claim the interface or tests already satisfy the acceptance checklist.
