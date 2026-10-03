# Foundation wiring fixtures — NOT scientific data

These six JSON files exist only to demonstrate component contracts:

- `orbital-request.json`: hand-authored invented identifiers, an arbitrary explicitly zoned time window, and **no orbital elements or epoch**.
- `telemetry-request.json`: the same invented target, one arbitrary timestamp, a named placeholder signal, and a **null measurement**.
- `orbital-result.json`, `telemetry-result.json`: deterministic references-only outputs saved from the fixture adapters, with computed values null.
- `diagnosis-request.json`: the two reference result envelopes combined for an independent Person 3 input example.
- `diagnosis-result.json`: deterministic input-reference evidence only; no cause or assessed relationship.

Tests load these checked-in examples without regenerating them. Change them only with review of the corresponding contracts; do not rewrite expected results automatically to make a failing test pass.

No source satellite, real TLE/OMM, measured telemetry, model score, distance, TCA, or cause is represented. The one-day window and timestamps are interface examples, not a scientific choice or MVP horizon.

Adapters return `provenance.kind = fixture` and `status = not_computed`. One orbital identifier placeholder and one unevaluated telemetry placeholder allow diagnosis to list both inputs as `input_reference` evidence. Diagnosis asserts no causal or temporal relation. Empty inputs produce empty lists while remaining `not_computed`; empty output is not evidence that a spacecraft is safe or healthy.

These original project-authored examples are versioned with the code and use no external/private data. Their intended usage is tests and `coding/scripts/check_fixture_flow.py`. They are not the eventual offline scientific demo dataset.
