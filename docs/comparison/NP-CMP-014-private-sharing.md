# NP-CMP-014 — Private comparison sharing

Users can explicitly **copy** or **download** a self-contained UTF-8 plain-text report of *current validated comparison projections*. Both actions require a separate unchecked privacy acknowledgement each time the report changes. There is no automatic sharing, upload or use of persistent storage.

## Data contract

- Reuses the same twelve summary rows and shared pure `offer-comparison-metrics` projection used for the current A/B comparison. Shows both available values and signed B − A differences, or explicit Not supplied/Unavailable. The effective-hour difference uses its canonical exact-ratio result, not a subtraction of already rounded labels.
- Includes derived gross and net compensation, effective-hour, commute, vacation, remote-days and pension/benefit figures, which may be private. It **does not** include raw user entries, date of birth, tax class, state, insurance settings, individual benefit names, notes or employer identity.
- Does not produce shareable URLs. No salary or comparison data is put into query parameters, fragments, storage, telemetry or outbound network requests.
- Clipboard copy and a local browser-created `.txt` download happen **only** after the user acknowledges the warning. Clipboard denial is reported without silently switching to a different channel.
- A changed numeric comparison projection invalidates prior consent. Reset unmounts the sharing controls with the calculated result. The content is re-derived from current inputs on each render; no stale saved result is exported.
- The source report names its supported 2026 assumptions, exclusions and informational nature. Unsupported inputs remain unavailable, not zero or fabricated amounts. It contains no recommendation or composite score.

## Verification plan

Pure formatter tests check row parity, signed amounts, exact large cents, unavailable versus zero, canonical hourly delta and exclusion of hidden payroll fields. Component tests enforce gated actions and consent invalidation. Chromium tests check local download, current-value updates, mobile viewport, print exclusion and no personal values entering the URL.
