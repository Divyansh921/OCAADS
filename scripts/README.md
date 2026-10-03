# Active development scripts

These commands serve the foundation now; they do not download orbital data or implement scientific work.

| Script | Purpose |
| --- | --- |
| `bootstrap_backend.py` | Uses system Python's standard library to create only `backend/.venv`; if necessary, installs pinned pip from a checksum-verified PyPI wheel into that venv. No system installation. |
| `export_openapi.py` | Exports FastAPI's schema to `../contracts/openapi.json`; `--check` fails on drift without rewriting the file. Run with the installed backend environment. |
| `check_fixture_flow.py` | Calls health and all three reference-only HTTP adapters, then checks schema/reference wiring. `--base-url` can target the Vite proxy. Requires running local server(s). |

Commands and prerequisites: [`../../docs/development.md`](../../docs/development.md).

The frontend owns its TS generator in `../frontend/scripts/generate-api.mjs`. Future ingestion/training/demo scripts must not be added as success-only placeholders. Existing PDF/presentation tools remain separate under `../tools/documents/` and are not application checks.
