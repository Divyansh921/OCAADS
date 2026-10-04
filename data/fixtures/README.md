# Versioned fixtures

`foundation/` contains the current **references-only contract examples**, not orbital/telemetry datasets. Its six JSON request/result files allow all four owners to test interfaces without requiring anyone else's real algorithm. See [their README](foundation/README.md).

These examples deliberately contain no real satellite elements, measured telemetry, calculated TCA/distance, anomaly scores, or assessed causes. Do not rebrand them as a working scientific demo.

`orbital-validation/` holds the frozen local six-object orbital engineering input. Its [README](orbital-validation/README.md) explains provenance and sampling limitations. It is independent of the reference fixtures and of any future synthetic integration demonstration. No matched orbital/telemetry incident is claimed.
