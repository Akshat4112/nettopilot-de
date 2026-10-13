# NP-CALC-006 — Payroll-tax calculation

**Status:** Implemented  
**Calculation year:** 2026  
**Governing source:** `DE-BMF-PAP-2026-A1`, final BMF Anlage 1 dated 12 November 2025

## Contract

`calculatePayrollTax2026` consumes the validated `PapInput` produced by
NP-CALC-005 and returns integer-cent values for:

- wage tax for the selected wage-payment period;
- solidarity surcharge for that period;
- the church-tax assessment base (not the final church tax);
- the same three values for other remuneration.

The result records the calculation year, governing source ID and named
intermediate checkpoints. It never returns a net salary or social-insurance
contribution; those belong to later calculation modules.

## Implemented BMF procedures

The code preserves the official procedure boundaries in named helpers:

| PAP procedure | Implementation responsibility |
| --- | --- |
| `MRE4JL`, `UPANTEIL` | Annualisation and period allocation |
| `MZTABFB`, `MLSTJAHR` | Fixed allowances and annual wage tax |
| `UPEVP`, `MVSPKVPV`, `MVSPHB` | Vorsorgepauschale |
| `UPMLST`, `UPTAB26` | Class selection and 2026 tariff |
| `MST5_6`, `UP5_6` | Tax classes V and VI |
| `MSOLZ` | Solidarity surcharge and church-tax assessment base |
| `MSONST` | Separate other-remuneration calculation |

All arithmetic remains an exact rational value until the PAP explicitly
requests truncation or upward rounding. No tax path uses JavaScript binary
floating-point arithmetic.

## Adapter corrections

The NP-CALC-005 handoff was corrected while integrating the core:

- `RE4` now contains gross recurring pay before PAP allowances, preventing
  ANP/SAP/EFA from being deducted twice;
- `JRE4` is populated for the other-remuneration path;
- `KVZ` is passed as an official percentage (`2.90`), not basis points (`290`).

## Deliberate fail-closed boundaries

The engine rejects non-zero pension-benefit, age-relief, section 19a,
compensation, death-benefit and ELStAM allowance/addition branches. The
accepted v1 adapter does not expose the complete facts needed by those PAP
paths. Returning a normal estimate would therefore be misleading.

## Verification

Tests cover:

- all six tax-class branches against selected official Annex 2 check-table
  rows, using each row's inclusive step boundary;
- monthly allocation and rounding;
- statutory/private Vorsorgepauschale paths;
- child-allowance effects on Soli/church bases only;
- separate other-remuneration outputs;
- unsupported-branch rejection and trace metadata.

The machine plan and the manual annual check table are distinct interfaces.
Ordinary annual salary remains twelve monthly payroll periods under
NP-CALC-004; the Annex 2 rows are conformance oracles, not product period
semantics.
