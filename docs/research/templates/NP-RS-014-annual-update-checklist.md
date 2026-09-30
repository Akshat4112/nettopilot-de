# NettoPilot DE annual assumptions update checklist

Copy this file for each calculation year. Replace every placeholder and preserve the completed record with the release pull request.

## 1. Update record

- [ ] Target calculation year: `YYYY`
- [ ] Planned effective date: `YYYY-MM-DD`
- [ ] Maintenance owner:
- [ ] Source researcher:
- [ ] Calculation engineer:
- [ ] Fixture maintainer:
- [ ] Independent calculation reviewer:
- [ ] UX/language reviewer:
- [ ] Release approver:
- [ ] Baseline application release:
- [ ] Baseline assumption-set ID:
- [ ] Proposed assumption-set ID:
- [ ] Schema version:
- [ ] Engine compatibility:
- [ ] Tracking issue:
- [ ] Pull request:

## 2. Baseline and scope

- [ ] Reproduce the prior approved year's fast suite.
- [ ] Archive the baseline result report with engine/set metadata.
- [ ] Confirm supported v1 employment cases.
- [ ] Record every intentionally unsupported case.
- [ ] Record known limitations carried into the target year.
- [ ] Confirm no draft source is active in production.

## 3. Source inventory

Use one status: `changed_verified`, `unchanged_reverified`, `not_applicable`, `pending_final`, `conflict`, or `unsupported`.

| Category | Status | Source IDs | Effective date | Researcher | Reviewer | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| BMF wage-tax procedure |  |  |  |  |  |  |
| Tax allowances/tariff values |  |  |  |  |  |  |
| Pension insurance |  |  |  |  |  |  |
| Unemployment insurance |  |  |  |  |  |  |
| Statutory health insurance |  |  |  |  |  |  |
| Long-term care insurance |  |  |  |  |  |  |
| Solidarity surcharge |  |  |  |  |  |  |
| Church tax by supported state |  |  |  |  |  |  |
| Private-insurance subsidy |  |  |  |  |  |  |
| Bonuses and one-time payments |  |  |  |  |  |  |
| Official reference tables/interfaces |  |  |  |  |  |  |

- [ ] Every category has a non-blank status.
- [ ] Finality and applicability were checked.
- [ ] Canonical and redirected URLs were recorded.
- [ ] Exact locators and content hashes/archive reasons were recorded.
- [ ] Conflicts and missing sources have explicit blocking decisions.
- [ ] Unchanged values were positively re-verified for the target year.

## 4. Assumption-set work

- [ ] Create a new immutable set ID.
- [ ] Set target year and inclusive validity.
- [ ] Add complete source records.
- [ ] Add complete parameter records.
- [ ] Use exact decimal strings and integer money units.
- [ ] Record applicability, derivation and rounding stages.
- [ ] Add effective-date segments without overlaps or gaps.
- [ ] Record supersession and change notes.
- [ ] Set engine compatibility.
- [ ] Keep production activation disabled during review.
- [ ] Validate JSON Schema.
- [ ] Validate unique IDs and local references.
- [ ] Validate rate/basis-point agreement.
- [ ] Validate source-year and parameter-period coverage.
- [ ] Confirm the set is year-complete.
- [ ] Confirm two-person review for production-critical records.

## 5. Calculation implementation

- [ ] Implement the final BMF procedure for the year.
- [ ] Implement every changed rule and rounding stage.
- [ ] Preserve previous-year modules.
- [ ] Reject unknown or incompatible years.
- [ ] Run the uncited-regulated-constant check.
- [ ] Verify result provenance includes year, set, digest, engine and sources.
- [ ] Verify user-entered rates/premiums do not mutate official assumptions.
- [ ] Verify no runtime internet source fetch is required.

## 6. Fixtures

- [ ] Import and verify the official BMF table/interface expectations.
- [ ] Update independent source-derived component fixtures.
- [ ] Add below/at/above cases for every threshold.
- [ ] Add before/after cases for every mid-year change.
- [ ] Cover tax classes I–VI.
- [ ] Cover statutory and private-insurance paths.
- [ ] Cover Saxony and non-Saxony care allocation.
- [ ] Cover parent, childless and multi-child paths.
- [ ] Cover church-tax source gates.
- [ ] Cover bonuses and one-time-payment admission rules.
- [ ] Add incomplete/unsupported cases for every unresolved path.
- [ ] Record fixture provenance and exact tolerances.
- [ ] Confirm engine output did not generate its own expectations.

## 7. Regression gates

- [ ] Schema and cross-record integrity pass.
- [ ] Approval, digest and compatibility gates pass.
- [ ] Unit and component tests pass.
- [ ] Full official BMF conformance passes.
- [ ] Source-derived fixture suite passes.
- [ ] Boundary and effective-date tests pass.
- [ ] Admission/fail-closed tests pass.
- [ ] Historical replay passes for every prior supported year.
- [ ] Result-provenance assertions pass.
- [ ] Representative result diff is reviewed and every change classified.
- [ ] German journey passes.
- [ ] English journey passes.
- [ ] Accessibility checks pass.
- [ ] Privacy and outbound-network checks pass.
- [ ] Static GitHub Pages build and base-path checks pass.

## 8. Interface and warning review

- [ ] Show calculation year and assumption-set version.
- [ ] Show last verification date and citations.
- [ ] Implement `update_pending`.
- [ ] Implement `affected_rule_stale`.
- [ ] Implement `year_unavailable`.
- [ ] Implement `assumptions_invalid`.
- [ ] Implement `historical_supported`.
- [ ] Verify German wording.
- [ ] Verify English wording.
- [ ] Confirm stale components never appear as zero.
- [ ] Confirm incomplete results cannot produce net totals, rates, couple totals or offer rankings.
- [ ] Confirm exports/share links retain warning state and provenance.

## 9. Release

- [ ] Resolve all pending/conflict items required by supported paths.
- [ ] Record named researcher, independent reviewer and approver.
- [ ] Set lifecycle to approved.
- [ ] Enable production activation.
- [ ] Produce canonical JSON and SHA-256 digest.
- [ ] Register set ID, validity and digest atomically.
- [ ] Add release notes and known limitations.
- [ ] Document rollback or affected-path disable procedure.
- [ ] Deploy without activating before the effective date.
- [ ] Smoke-test the public build against a known fixture.
- [ ] Verify production reports the expected year/set/digest/engine.
- [ ] Verify no salary inputs or results leave the browser.

## 10. Post-release

- [ ] Verify both language journeys in production.
- [ ] Verify historical-year selection.
- [ ] Review calculation errors and privacy-safe feedback.
- [ ] Assign every discrepancy or follow-up.
- [ ] Preserve prior set and application release.
- [ ] Link final regression and result-diff reports.
- [ ] Close the update record.

## 11. Sign-off

Researcher:

- Name:
- Date:
- Statement: I verified the listed sources, applicability, locators and extracted values.

Independent reviewer:

- Name:
- Date:
- Statement: I independently reviewed production-critical interpretations, derivations, rounding and fixtures.

Release approver:

- Name:
- Date:
- Statement: I confirm all release gates passed and no prior-year value is used outside its effective period.

## 12. Exceptions

List every waived non-production check or unresolved unsupported case. Production accuracy, source, approval, privacy and fail-closed gates cannot be waived.

| Item | Reason | User impact | Owner | Due date | Release blocking? |
| --- | --- | --- | --- | --- | --- |
|  |  |  |  |  |  |
