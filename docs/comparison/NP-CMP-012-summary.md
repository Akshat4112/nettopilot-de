# NP-CMP-012 — Offer comparison summary

`OfferComparisonSummary` presents current Offer A and Offer B values in one semantic table, with signed B − A differences where both values are available. It gives no ranking or recommendation.

## Integration

The exported `OfferComparisonSummaryInputs` extends `EffectiveHourlyInputs` (`netResult`, `working`, `commuteCosts`, `commuteTime`) and adds `benefits: readonly [BenefitsEntry, BenefitsEntry]` and `remote: readonly [RemoteWorkEntry, RemoteWorkEntry]`. All rows derive from current props on every render. There is no copied result state or reuse of persisted draft calculations.

## Rows and boundaries

- Monetary: admitted annual base gross and base-pay net, net minus entered annual commute costs, effective net after commute cost per work-plus-commute hour.
- Time and leave: annual contractual work hours, validated paid vacation days, annual commute hours and remote days per week.
- Costs: entered annual commuting costs from all four daily categories.
- Terms and valuations: independent annual employer pension contribution, sum of employer-stated benefit values, and sum of user-assigned benefit values.

The summary calls the existing pure working-time, commute-costs, commute-time, remote-work, benefits and effective-hourly modules. It reads annual monetary payroll results rather than calculating payroll or annualizing a displayed monthly net. Base gross is intentionally unavailable when that side has no admitted payroll result.

Unknown amounts never become zero. An empty benefits list says “Not supplied”; a valuation sum is unknown if any listed benefit lacks that valuation. Validated decimal benefit amounts are converted to integer cents before summation. An explicitly supplied zero remains visible. Invalid current inputs remove their affected values and differences immediately while independently valid rows and the opposite offer remain available. Pension and each valuation source validate independently, because neither determines another's value. An invalid employer-stated amount does not hide a supplied user-assigned value; labels and row identities still need to be valid for either valuation sum. Benefit certainty and eligibility remain in the detailed benefit inputs.

Money display also retains integer cents: `BigInt` splits the grouped EUR integer part and two-digit fraction before formatting. No floating-point division occurs, so the admitted pension limit of 9,007,199,254,740,991 cents remains €90,071,992,547,409.91, distinct from the adjacent .90 value. Negative net amounts and signed differences preserve their signs.

Benefit valuations and pension do not enter net pay or effective hourly compensation, and are never combined with one another. Net after commute costs depends only on admitted net and validated costs; an unavailable time input does not hide that independent amount. Effective hourly values and their difference use the existing calculation, including its exact-ratio difference rounding.

## Visible assumptions and accessibility

The nearby explanation names EUR, 2026, 12 equal base-pay months, 52 weeks adjusted for paid vacation, two commute trips per office day, excluded public holidays/sickness/overtime/unpaid leave, hundredth-hour rounding and independent cent rounding of hourly values/differences. Remote allowances and household costs remain outside net figures. Invalid excluded monetary terms do not hide an otherwise valid remote-day schedule.

The table has a caption, column headers and scoped row headers. Desktop uses intrinsic column sizing and unbroken numeric values. At 760px and below each metric becomes a full-width row with vertically stacked, visibly labelled Offer A, Offer B and B − A values. The single table retains explicit table, row-group, row, header and cell roles when CSS changes the layout. The column headers remain available to assistive technology; additional mobile labels are hidden from the accessibility tree to prevent duplicate announcements. Values, including the accepted pension limit, fit without fragmentation or page overflow at 375px. Unavailable values expose the evaluator's reason in a native disclosure inside the affected cell, operable with a pointer or keyboard without requiring hover. The signed delta remains unavailable when either value is unavailable.

## Verification

The focused component tests cover monetary/time/leave/commute/remote/benefit rows and signed differences; unsupported payroll on one side; empty, unknown and zero amounts; immediate removal of invalid edited values; exact benefit-cent aggregation; independent pension and benefits validation; and exclusion of pension/valuations from net and hourly values. The first test run failed because the component did not yet exist (TDD red), followed by the implemented green run. Additional failing integration tests demonstrated missing form wiring and inaccessible hover-only reasons before those changes were implemented. Current-parent-input integration verifies immediate salary invalidation, preservation of the other offer, absence before calculation, and reset. Browser verification activates the deferred comparison journey at 375px, checks table headers, current cost invalidation, keyboard explanations, safe-integer pension display, and exclusion of offer data from printing and URLs.
