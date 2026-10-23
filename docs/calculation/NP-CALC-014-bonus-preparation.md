# NP-CALC-014 — 2026 bonus and one-time payment calculation

**Status:** Draft implementation (not complete)  
**Dependency:** [NP-RS-011](../research/NP-RS-011-bonuses-one-time-payments.md)

## Implemented foundation

The first stage introduces `BONUS_CLASS_REGISTRY_2026`, distinguishing:

- running wage-tax pay / recurring social-insurance income; and
- other wage-tax remuneration / one-time social-insurance income.

The `prepareBonus2026` domain adapter accepts a dated one-time cash payment and its current-year context, passes `SONSTB` and `JRE4` to the official 2026 PAP implementation, and exposes separately:

- the current payment's PAP wage-tax, solidarity-surcharge and church-tax assessment base;
- proportional KV/PV headroom based on the 2026 EUR 69,750 annual ceiling;
- proportional RV/AV headroom based on the 2026 EUR 101,400 annual ceiling;
- private health path with zero statutory KV/PV on the bonus;
- admission decisions for January–March prior-year allocation, missing history, unknown legal classification and deferred special cases.

Contribution days use a 360-day year. Headroom calculations use integer cents without marginal-rate shortcuts.

## Important boundary

The state `prepared` is **not** a supported final bonus net result. It supplies tax and insurance contribution bases for subsequent combination with accepted 2026 insurance engines. Consumers must not show a final net bonus or employer cost from this state alone.

## Remaining acceptance work

1. Chronological multiple-payment ordering, same-month sequence and updates to `JRE4` after earlier other remuneration.
2. Apply RV, AV, statutory KV and PV contribution modules to one-time contribution bases; produce employee and employer amounts.
3. Complete March-clause evidence handling and official cross-checks for each classification family.
4. Return payment-level gross, taxes, insurance, net and employer cost without counting a bonus as recurring pay.
5. Preserve guarantees vs variable compensation for offer comparison.
6. Add bilingual error copy, privacy tests and roundtrip regression fixtures.
7. Full CI, quality and browser acceptance verification.

No payment source, amount, tax result or insurance status may be sent to analytics, stored on an application server, or placed in a URL.
