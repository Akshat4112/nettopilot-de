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

Current domain model is intended for separate UI integration and remaining
NP-CMP-008 tests; do not mark the task Done until both are verified.
