# OCAADS backend foundation

Python 3.11+ / FastAPI integration with shared Pydantic contracts. The three engine adapters are deterministic, references-only fixtures—not scientific implementations.

## Module boundaries

- `app/domain/contracts.py`, `errors.py`: shared records, invariants, and errors.
- `app/orbital/interface.py`: `OrbitalEngine.screen(OrbitalRequest) -> OrbitalResult` — Person 1.
- `app/telemetry/interface.py`: `TelemetryEngine.analyze(TelemetryRequest) -> TelemetryResult` — Person 2.
- `app/diagnosis/interface.py`: `DiagnosisEngine.diagnose(DiagnosisRequest) -> DiagnosisResult` — Person 3.
- `app/api/dependencies.py`: selects the fixture implementations — Person 4.
- `app/api/`, `app/core/http.py`, `app/main.py`: HTTP integration and error translation — Person 4.
- `tests/{orbital,telemetry,diagnosis,contracts,api}/`: corresponding test areas.

The engine modules import shared records, not one another or FastAPI. Replace an adapter through its interface and the single dependency-wiring file. Do not introduce scientific work into a route.

## Use an engine boundary without a server

With the local environment installed, start its Python from this folder and run:

```python
from pathlib import Path
from app.domain.contracts import OrbitalRequest
from app.orbital.fixture import FixtureOrbitalEngine

request = OrbitalRequest.model_validate_json(
    Path('../data/fixtures/foundation/orbital-request.json').read_text(encoding='utf-8')
)
result = FixtureOrbitalEngine().screen(request)
assert result.status == 'not_computed'
assert result.conjunctions[0].miss_distance_km is None
```

This proves a callable boundary, not propagation or screening. The other two owners can call their adapters similarly using the checked-in request examples.

## API

- `GET /api/health` — reports foundation/fixture-only status.
- `POST /api/orbital/screen` — orbital request/result contract.
- `POST /api/telemetry/analyze` — telemetry request/result contract.
- `POST /api/diagnosis/assess` — combines result references, not inferred causes.
- `/health` remains a compatibility URL; use `/api/health` in new code.

Validation failures return 422; a valid request for non-fixture processing returns 501. The API does not save data or start background jobs.

## Setup and checks

See [`../../docs/development.md`](../../docs/development.md) for local bootstrap, pinned dependency installation, Windows instructions, server commands, and contract generation.

From this folder after setup:

```bash
.venv/bin/python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
# In another terminal:
.venv/bin/python -m pytest
.venv/bin/python -m ruff check app tests ../scripts ../tests/integration
.venv/bin/python ../scripts/export_openapi.py --check
```

`pytest` includes the shared `coding/tests/integration/` fixture flow. Run only `tests/orbital`, `tests/telemetry`, or `tests/diagnosis` for independent owner work.

`requirements-dev.lock` records the checked Python 3.12/Linux dependency set. The `engines` optional group remains declared for future implementation but is not installed or needed now. No credentials, backend `.env`, real dataset, or database are required. See [data contracts](../../docs/data-contracts.md) for remaining decisions.
