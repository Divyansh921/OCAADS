"""The committed API snapshot must match what FastAPI actually advertises."""

import json
from pathlib import Path


def test_openapi_snapshot_has_no_drift(client):
    snapshot = Path(__file__).resolve().parents[3] / "contracts" / "openapi.json"
    assert client.get("/openapi.json").json() == json.loads(snapshot.read_text(encoding="utf-8"))


def test_all_engine_routes_advertise_shared_errors(client):
    schema = client.get("/openapi.json").json()
    for path in ["/api/orbital/screen", "/api/telemetry/analyze", "/api/diagnosis/assess"]:
        for status in ["422", "501"]:
            response = schema["paths"][path]["post"]["responses"][status]
            assert response["content"]["application/json"]["schema"] == {
                "$ref": "#/components/schemas/ErrorResponse"
            }
