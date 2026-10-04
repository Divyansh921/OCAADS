# Cross-application checks

- `integration/test_fixture_flow.py`: executable test passing orbital/telemetry reference responses through the diagnosis API. It validates contracts and reference wiring, **not science**.
- `e2e/`: retained plan for future browser tests. No executable browser suite exists yet.

From `coding/backend/`, `.venv/bin/python -m pytest` discovers the backend suite and this integration test through `pyproject.toml`. Owner-specific tests stay in `backend/tests/{orbital,telemetry,diagnosis}/`; HTTP-specific tests stay in `backend/tests/api/`.

For live HTTP/proxy checks, run `coding/scripts/check_fixture_flow.py` for explicit reference-only wiring and `coding/scripts/check_orbital_flow.py` for the calculated six-object slice. See [`../../docs/development.md`](../../docs/development.md). Frontend API-client tests live alongside that client; mocks/builds do not prove browser interaction or operational accuracy.
