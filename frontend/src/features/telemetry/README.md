# Telemetry / anomalies — not implemented / fixture-only

`TelemetrySection.tsx` is a placeholder in the application shell, reached through the `#telemetry` navigation link. It makes no requests and shows no measurements, model scores, anomalies, or charts.

The typed `analyzeTelemetry(request, signal?)` client method is ready for `POST /api/telemetry/analyze` (`TelemetryRequest` → `TelemetryResult`), with aliases generated from `coding/contracts/openapi.json`. The current adapter references a fixture sample only; it does not run Isolation Forest. `not_computed`, `not_evaluated`, and null scores do not indicate spacecraft health.

Future integration belongs here after dataset/feature choices and the telemetry engine are ready. Include loading, empty, cancellation, and error states, and show the data source, units, and time range. Do not turn fixture values into a scientific demonstration.
