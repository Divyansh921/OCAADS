# OCAADS coding workspace

This contains the **development foundation**, not the implemented scientific MVP. Documentation stays in the parent workspace's `docs/`, and dated progress stays in `OCAADS_LOG.md`.

| Area | Current purpose |
| --- | --- |
| `backend/app/orbital/` | Person 1: typed interface and references-only orbital fixture |
| `backend/app/telemetry/` | Person 2: typed interface and unevaluated telemetry fixture |
| `backend/app/diagnosis/` | Person 3: typed interface and input-reference evidence fixture |
| `backend/app/domain/` | Shared Pydantic contracts and framework-independent errors |
| `backend/app/api/`, `core/`, `main.py` | Person 4: thin HTTP integration, errors, and adapter wiring |
| `backend/tests/` | Per-owner, shared-contract, and API tests |
| `frontend/` | Person 4: shell, navigation, placeholder sections, typed client/tests |
| `contracts/` | Generated shared OpenAPI snapshot |
| `data/fixtures/foundation/` | Labelled, reference-only example requests/results |
| `scripts/` | Local Python bootstrap, schema export, and live HTTP fixture checks |
| `tests/integration/` | HTTP chain connecting the three fixture adapters |
| `tests/e2e/` | Existing browser-test plan; no executable suite yet |
| `tools/documents/` | Existing PDF/presentation utilities, unchanged by the foundation task |

Start with [ownership](../docs/team-ownership.md), [contracts](../docs/data-contracts.md), and [development commands](../docs/development.md).

Backend tests from `backend/`: `.venv/bin/python -m pytest`. Frontend checks from `frontend/`: `npm run check:api`, `npm test`, and `npm run build`. Installation/run instructions are in the development guide; do not use the legacy document package's placeholder `npm test` as an application check.

All engine fixtures report `not_computed`. Null distances/scores/causes and unassessed statuses are intentional. No real science, database, worker, external data service, or deployment is included.
