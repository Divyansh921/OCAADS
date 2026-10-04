# OCAADS backend prototype

Python 3.11+ / FastAPI integration with shared Pydantic contracts. The orbital adapter now calculates a small, cached TLE/SGP4 screening slice. Telemetry and diagnosis remain references-only fixtures.

## Module boundaries

- `app/domain/contracts.py`, `errors.py`: shared records, invariants, and errors.
- `app/orbital/interface.py`: `OrbitalEngine.screen(OrbitalRequest) -> OrbitalResult` — Person 1.
- `app/telemetry/interface.py`: `TelemetryEngine.analyze(TelemetryRequest) -> TelemetryResult` — Person 2.
- `app/diagnosis/interface.py`: `DiagnosisEngine.diagnose(DiagnosisRequest) -> DiagnosisResult` — Person 3.
- `app/orbital/{ingest,propagation,screening,real,dataset}.py`: cached input validation and calculation — Person 1.
- `app/api/dependencies.py`: selects fixture work only for explicit `provenance.kind=fixture`, and the calculated orbital adapter for `supplied` work — Person 4.
- `app/api/`, `app/core/http.py`, `app/main.py`: HTTP integration and error translation — Person 4.
- `tests/{orbital,telemetry,diagnosis,contracts,api}/`: corresponding test areas.

The engine modules import shared records, not one another or FastAPI. Replace an adapter through its interface and the single dependency-wiring file. Do not introduce scientific work into a route.

## Run the calculated orbital boundary without a server

With a prepared snapshot at `../data/orbital/validation/`, run from this folder:

```python
from app.orbital.dataset import DEFAULT_MANIFEST, load_dataset
from app.orbital.real import TleOrbitalEngine, load_snapshot_info

request = load_dataset()
result = TleOrbitalEngine(
    load_snapshot_info(DEFAULT_MANIFEST),
    snapshot_path=DEFAULT_MANIFEST.with_name('stations.tle'),
    selection=request,
).screen(request)
assert result.status == 'completed'
print(result.screening_status, result.conjunctions)
```

The replay window starts at the target's TLE epoch, never an implicit current time. Calculation metadata records the snapshot checksum, source/time, software version, frame/units, and sampling/threshold settings. Missing/changed snapshots and inconsistent source epochs fail explicitly. Restart the backend after deliberately replacing the manifest/snapshot.

## Call the separate reference fixture

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

- `GET /api/health` — liveness; reports `orbital_calculated_telemetry_fixture` configuration.
- `GET /api/orbital/dataset` — validates local checksum/selection and returns the six-object request.
- `POST /api/orbital/screen` — calculates supplied verified local inputs; explicit fixture requests return uncomputed references.
- `POST /api/telemetry/analyze` — telemetry request/result contract.
- `POST /api/diagnosis/assess` — combines result references, not inferred causes.
- `/health` remains a compatibility URL; use `/api/health` in new code.

Contract/orbital-input/propagation failures return structured 422 errors. Non-fixture telemetry or diagnosis still returns 501. The API does not fetch data, save jobs, or start background workers.

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

`requirements-dev.lock` records the checked Python 3.12/Linux dependency set, including runtime `sgp4`. The optional `engines` group contains future ML packages. Cached orbital files are required for calculated screening; fixtures need no dataset. See [scientific decisions](../../docs/scientific-decisions.md) and [development](../../docs/development.md) for snapshot preparation and live checks.
