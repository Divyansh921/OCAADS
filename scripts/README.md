# Active development scripts

These commands serve local setup, contracts, and the first orbital validation slice.

| Script | Purpose |
| --- | --- |
| `bootstrap_backend.py` | Uses system Python's standard library to create only `backend/.venv`; if necessary, installs pinned pip from a checksum-verified PyPI wheel into that venv. No system installation. |
| `export_openapi.py` | Exports FastAPI's schema to `../contracts/openapi.json`; `--check` fails on drift without rewriting the file. Run with the installed backend environment. |
| `check_fixture_flow.py` | Calls health and all three reference-only HTTP adapters, then checks schema/reference wiring. `--base-url` can target the Vite proxy. Requires running local server(s). |
| `fetch_orbital_snapshot.py` | Makes one deliberate CelesTrak request, validates selected IDs, saves the raw TLE snapshot and checksum/time manifest under `data/orbital/validation/`. Stops on failures; never called automatically. |
| `check_orbital_flow.py` | Loads the verified local dataset over HTTP, runs calculated screening, and checks result/metadata consistency. `--base-url` can target Vite. No external data fetch. |

Commands and prerequisites: [`../../docs/development.md`](../../docs/development.md).

The frontend owns its TS generator in `../frontend/scripts/generate-api.mjs`. Future ingestion/training/demo scripts must not be added as success-only placeholders. Existing PDF/presentation tools remain separate under `../tools/documents/` and are not application checks.
