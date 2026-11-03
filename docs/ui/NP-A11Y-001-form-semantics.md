# NP-A11Y-001 — Form semantics

The salary calculator and offer comparison retain their visible labels, input state, calculation gates, validation rules and browser-only data flow. Existing field and group guidance is now available through `aria-describedby`.

## Audit and changes

| Area | Evidenced gap | Change |
| --- | --- | --- |
| Essential salary | Payroll-confirmation help was adjacent text; birth-date purpose was implicit. | Link the help to the checkbox and add the standard `bday` autocomplete token to the date input. Existing submitted field errors remain associated with their inputs. |
| Advanced salary | Optional guidance was unassociated; validation messages were available only through the essential-form summary. | Associate shared and field guidance. Expose the existing validator's reasons inline and connect affected inputs with `aria-invalid` and the error description. The bonus amount and month form one validation pair. |
| Additional compensation | Annual/one-time guidance and existing validation alerts were not connected to controls. | Connect shared guidance and, after the existing check action, the existing group alert to that group's controls; mark only the named group invalid. |
| Working time and commute costs | Existing dependency-sensitive validation reasons appeared outside the controls without references. | Pass the visible alert ID from the parent and append it to each group's guidance. Controls share the existing group reason; only the named group is marked invalid, without inventing a field-specific diagnosis. |
| Commute duration | Existing validation reason was unassociated. | Connect the visible reason and invalid state to the one-way-duration input. |
| Remote work | Money inputs could be marked invalid without an error reference; arrangement and group guidance lacked associations. | Link all three controls to shared guidance and the existing visible group reason; place the invalid state on the named group. |
| Pension and benefits | Guidance was unassociated; only some controls referenced the existing group error. | Connect guidance and limits to all controls, including certainty and notes. The existing benefits validator reports a group reason, so the same reason describes group controls and only the named group is marked invalid. Valid certainty, notes and descriptions are not declared invalid because another entry fails. |
| Comparison payroll | Scope restrictions and insurer-rate help were unassociated. | Link the existing scope and help to shared assumptions, add `bday` for the date input, and preserve current result admission. No field-invalid states are inferred from an unsupported payroll result. |

The payroll calculation remains restricted to its existing admitted 2026 scenarios. An invalid optional group or unsupported result does not become a fabricated net amount. Optional unknown values retain their existing meaning.

## Verification

`FormSemantics.test.tsx` renders real components and checks accessible names and descriptions, live advanced errors and correction, optional group errors, remote/commute/benefit errors, shared payroll guidance, and application-wide ID uniqueness after benefit creation and offer copying. Every control's `aria-describedby`/`aria-labelledby` reference must resolve exactly once; every control or group marked invalid in these scenarios must reference an explicit alert.

The focused regression run includes the existing essential, advanced, offer-input, benefits and offer-net tests. Type checking and ESLint cover the changed components. No new dependency or external API is introduced.

This DOM-level audit does not establish complete accessibility conformance. Actual assistive-technology announcements and browser autofill behavior require manual browser/screen-reader checks. Keyboard focus management is covered separately by NP-A11Y-002.
