# Foundation integration test

`test_fixture_flow.py` calls the three API routes through FastAPI's in-process test client. It passes the orbital and telemetry fixture responses to diagnosis and checks that their identifiers appear as input-reference evidence, with no asserted cause or relationship.

Run from `coding/backend/`:

```bash
.venv/bin/python -m pytest ../tests/integration
```

The default backend `pytest` command also includes this test. No real satellite data, SGP4 propagation, model, rule evaluation, or browser is involved. Future scientific integration tests will be separate work after the data contract decisions are agreed.
