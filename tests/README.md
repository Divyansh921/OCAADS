# Cross-application checks

- `integration/test_fixture_flow.py`: executable test passing orbital/telemetry reference responses through the diagnosis API. It validates contracts and reference wiring, **not science**.
- `e2e/`: retained plan for future browser tests. No executable browser suite exists yet.

From `coding/backend/`, `.venv/bin/python -m pytest` discovers the backend suite and this integration test through `pyproject.toml`. Owner-specific tests stay in `backend/tests/{orbital,telemetry,diagnosis}/`; HTTP-specific tests stay in `backend/tests/api/`.

For a real local HTTP/proxy check, run `coding/scripts/check_fixture_flow.py` as described in [`../../docs/development.md`](../../docs/development.md). Frontend API-client tests live alongside that client. Neither mocks nor a successful bundle proves scientific accuracy or browser interaction behavior.
