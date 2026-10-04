# OCAADS coding workspace

This contains the development foundation and the **first six-object orbital validation slice**. Documentation stays in the parent workspace's `docs/`, and dated progress stays in `OCAADS_LOG.md`.

| Area | Current purpose |
| --- | --- |
| `backend/app/orbital/` | Person 1: offline TLE validation, SGP4 propagation, screening, and a separate reference fixture |
| `backend/app/telemetry/` | Person 2: typed interface and unevaluated telemetry fixture |
| `backend/app/diagnosis/` | Person 3: typed interface and input-reference evidence fixture |
| `backend/app/domain/` | Shared Pydantic contracts and framework-independent errors |
| `backend/app/api/`, `core/`, `main.py` | Person 4: thin HTTP integration, errors, and adapter wiring |
| `backend/tests/` | Per-owner, shared-contract, and API tests |
| `frontend/` | Person 4: cached-snapshot screening UI, health, telemetry/diagnosis placeholders, typed client/tests |
| `contracts/` | Generated shared OpenAPI snapshot |
| `data/fixtures/foundation/` | Labelled, reference-only example requests/results |
| `data/fixtures/orbital-validation/` | Frozen local six-object engineering input and provenance |
| `scripts/` | Local bootstrap, schema export, manual snapshot fetch, and live HTTP checks |
| `tests/integration/` | HTTP chain connecting the three fixture adapters |
| `tests/e2e/` | Existing browser-test plan; no executable suite yet |
| `tools/documents/` | Existing PDF/presentation utilities, unchanged by the foundation task |

Start with [ownership](../docs/team-ownership.md), [contracts](../docs/data-contracts.md), and [development commands](../docs/development.md).

Backend tests from `backend/`: `.venv/bin/python -m pytest`. Frontend checks from `frontend/`: `npm run check:api`, `npm test`, and `npm run build`. Installation/run instructions are in the development guide; do not use the legacy document package's placeholder `npm test` as an application check.

The calculated orbital adapter uses seven days, 10-second sampling, a 1-second local TCA refinement bracket, TEME km/km/s, WGS72, and a strict `< 10 km` screening proxy. Use **Load local snapshot**, then **Run orbital screening** in the frontend. No network fetch occurs during screening or tests. See [`../docs/scientific-decisions.md`](../docs/scientific-decisions.md).

Explicit fixture requests still report `not_computed`; telemetry and diagnosis are fixtures. Empty *calculated* orbital output means no candidate passed this method, not proof of safety. Screening rank is not collision probability.
