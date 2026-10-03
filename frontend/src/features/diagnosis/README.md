# Diagnosis — not implemented / fixture-only

`DiagnosisSection.tsx` is a placeholder in the application shell, reached through the `#diagnosis` navigation link. It makes no requests and shows no inferred cause, confidence, or scientific relationship.

The typed `assessDiagnosis(request, signal?)` client method is ready for `POST /api/diagnosis/assess` (`DiagnosisRequest` → `DiagnosisResult`), with aliases generated from `coding/contracts/openapi.json`. A request carries orbital and telemetry results. The current backend connects fixture references only, without a correlation window or diagnostic rule.

Future integration belongs here once reviewed evidence and diagnosis rules exist. Display evidence, timestamps, uncertainty, and loading/empty/error states. Distinguish measured, calculated, model-generated, and rule-generated information. `not_assessed` is not a diagnosis; correlation is not proof of causation.
