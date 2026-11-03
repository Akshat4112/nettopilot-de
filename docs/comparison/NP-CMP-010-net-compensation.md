# NP-CMP-010 — Net compensation per offer

## Calculation and admission

`src/components/offer-net-calculation.ts` calculates Offer A and Offer B
independently through the existing `calculateSimpleSalary2026` adapter. It
passes the same explicitly entered tax class, federal state, date of birth,
GKV additional contribution rate and employment confirmation to both offers.
Only base gross salary and its monthly/annual period differ.

The initial shared context leaves tax class, federal state and date of birth
blank and confirmation false. The limited profile fixes childless status,
no church tax and statutory insurance; the interface must disclose these
assumptions before asking the user to confirm them for both offers. Blank
additional GKV rate uses the existing published-average estimate, rather than
an inferred insurer-specific rate.

The existing salary adapter retains ownership of payroll admission:

- calculation year 2026, full-year ordinary employment and 12 equal payroll
  months with compulsory GKV, pension and unemployment insurance;
- no children or church tax, and dates of birth from 1963-01-01 through
  2002-12-31 under the existing age-specific restriction;
- monthly base gross strictly above EUR 2,000 and below EUR 5,800;
- annual base gross must divide exactly into 12 monthly EUR-cent amounts;
- no allowance adjustments, private premiums or special payroll treatment.

The comparison adapter also checks the shared year, comparison currency and
each salary's EUR currency and 12-payment contract at runtime. Missing or
invalid inputs remain incomplete; unsupported payroll cases remain
unsupported. Every unavailable offer retains a stable reason identifier and
a readable explanation. A supported offer remains visible if the other is
blocked, but the pair receives no payroll delta.

The optional per-offer `inputValidity` tuple carries raw form validation into
the adapter before a malformed optional component can be omitted from the
domain draft. An invalid flag blocks only that offer with
`offer_inputs_invalid`, including an incomplete payment month; it does not
hide a separately valid offer's result. The default tuple is `[true, true]`
for callers whose raw input validation is already complete.

## Compensation basis and separation

This task supports **base salary only**. Nonempty recurring additional cash,
expected variable cash or one-off payment arrays block that offer with
`offer_additional_compensation_not_supported`. A known bonus amount or payment
month does not establish its supported payroll treatment. No bonus is spread
across months, assumed tax-free, converted with a flat net ratio or silently
discarded from a purported total-compensation net estimate.

Benefits, employer pension entries, working time, remote work and commuting
remain independent comparison context. They never increase or reduce raw
payroll net. Existing comparison views do not add unsupported compensation
to this base-salary estimate; a future broader payroll integration requires
separate admission and settlement work.

## Values and differences

Successful offer values are the original salary aggregation results:

- monthly recurring net is `recurringMonthlyNetCents`;
- annual payroll net is `annual.netPayrollCents`, obtained from all 12 months;
- signed annual and monthly differences are Offer B minus Offer A;
- monthly difference is unavailable if either recurring monthly net is
  unstable; annual results remain their actual 12-month aggregate;
- equality uses canonical integer EUR cents, before presentation formatting.

The interface labels results as estimates and states the base-salary basis.
An equal comparison is a tie in the displayed measure. No overall score or
offer recommendation follows from a higher net amount.

The adapter is pure and recalculates from current inputs. It does not retain
previous successful results, mutate the draft or fill `payrollMetadata`.
The interface must invalidate a submitted result when either salary,
compensation components or shared payroll assumptions change, including a
change to an invalid value or withdrawal of confirmation. This prevents a
previous valid result from appearing to describe a new incomplete draft.

## Version and sources

The returned provenance identifies adapter profile
`de-offer-base-net-2026-v1`, year 2026, and the existing module assumption IDs:

- `de-pension-insurance-2026-v1`;
- `de-unemployment-insurance-2026-v1`;
- `de-statutory-health-insurance-2026-v1`;
- `de-social-care-insurance-2026-v1`.

The source IDs are the union reported by the existing pension,
unemployment, statutory-health and care modules, plus
`DE-BMF-PAP-2026-A1` from the payroll-tax implementation. The IDs identify
the adapter's bundled engine sources, including assumptions that may remain
unused for a particular unsupported input. They do not describe a newly
approved aggregate manifest or certify an unsupported calculation.

The profile must change when its admitted scope, included compensation,
calculation integration or source versions change. Both offers run the same
profile in one call. The draft's caller-supplied `payrollMetadata` is neither
trusted nor used as evidence of admission.

The partial JSON example under `schemas/assumptions/examples/` remains draft
and production-disabled under NP-RS-013. This task does not activate it or
claim a complete approved annual assumption registry.

## Verification

Adapter tests exercise real salary engines with equivalent monthly/annual
pay, exact ties, differing salaries and reversed offers. They also cover
missing and unconfirmed inputs, runtime year/currency mismatches, additional
cash rejection, the existing salary/cent-allocation boundaries, a changed
or invalid shared rate, pure recomputation, separation of commute costs,
input immutability and source provenance. Interface tests own submitted-result
invalidation and readable per-offer explanations.
