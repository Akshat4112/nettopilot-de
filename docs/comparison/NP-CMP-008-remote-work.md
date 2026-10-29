# NP-CMP-008 — Remote-work offer terms

Each of Offer A and B independently captures a declared arrangement
(unknown / onsite / hybrid / remote), working days per week and office days
per week. Remote days are only derived when **both** day counts are provided,
from working days minus office days. An onsite contract conflicts with
fewer office days than scheduled workdays; a fully remote arrangement
conflicts with nonzero office days.

Employer home-office allowance and actual home-office monthly costs
are **separate user-entered euro amounts**. Both support unknown (blank)
versus explicitly confirmed zero and never infer a default subsidy, utility
bill or tax deduction. Amounts are retained with cent precision and cannot
be automatically netted against each other.

The remote-work evaluation is not a tax engine and intentionally leaves
allowance tax treatment `not_calculated`. Commute cost/time projections stay
separate and must only use office frequency explicitly supplied by users.

The offer-comparison interface captures each arrangement and both monetary
terms, reuses the existing per-offer working-day and office-day fields, and
shows a non-monetized summary. Copy and clear preserve offer independence.
Unit/component and browser tests cover contradictory arrangements, blank versus
zero cash, mobile layout, and copy/clear. Merge only after CI validation.
