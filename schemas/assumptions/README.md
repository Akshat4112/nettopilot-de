# Versioned assumptions data

This directory contains the JSON Schema defined by NP-RS-013.

- `assumption-set.schema.json` is the normative Draft 2020-12 contract.
- `examples/de-payroll-2026-example.json` is deliberately partial and non-production.

## Numeric rules

- Money is integer minor units with an explicit currency and scale.
- Exact decimal values and rates are strings; JavaScript binary floating-point values are not accepted.
- Derived rules reference a stable `procedureId`; executable source code is not embedded in data.
- Every parameter has at least one exact source reference, an effective period, derivation, rounding stage, verification record and change note.

## Release gate

A loader must reject a set when any of these checks fails:

1. JSON Schema validation;
2. unique source and parameter identifiers;
3. every `sourceRefs[].sourceId` resolves locally;
4. calculation year and requested date fall inside the set and parameter periods;
5. applicable records overlap or leave an unexplained gap;
6. lifecycle status is not `approved` or production activation is false;
7. the content digest, engine compatibility or required two-person approval does not match;
8. a parameter is conflicted, superseded, withdrawn or unsupported for the case.

The JSON Schema covers document shape. Cross-record checks are mandatory loader invariants and are specified in the NP-RS-013 research note.
