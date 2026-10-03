# Conjunctions — not implemented / fixture-only

`ConjunctionsSection.tsx` is a placeholder in the application shell, reached through the `#conjunctions` navigation link. It displays limitations only: no requests, propagation, ranking, or result table.

The typed `screenOrbital(request, signal?)` client method is ready for `POST /api/orbital/screen` (`OrbitalRequest` → `OrbitalResult`), with aliases generated from `coding/contracts/openapi.json`. The current backend adapter only connects fixture references; `not_computed` is not a screening result.

Future integration belongs here once the orbital engine and scientific contract are ready. Show source, timestamps, loading/empty/error states, and limitations. Never label miss distance or screening priority as collision probability, and never infer safety from null values or empty fixture output.
