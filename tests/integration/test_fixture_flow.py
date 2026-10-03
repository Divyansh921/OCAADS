"""In-process HTTP integration of references-only fixtures, not the real MVP."""

import json
from pathlib import Path

from fastapi.testclient import TestClient

from app.domain.contracts import DiagnosisResult, OrbitalResult, TelemetryResult
from app.main import app

FIXTURES = Path(__file__).resolve().parents[2] / "data" / "fixtures" / "foundation"


def test_reference_only_http_flow():
    def load(name):
        return json.loads((FIXTURES / f"{name}.json").read_text(encoding="utf-8"))

    with TestClient(app) as client:
        orbital = client.post("/api/orbital/screen", json=load("orbital-request"))
        telemetry = client.post("/api/telemetry/analyze", json=load("telemetry-request"))
        assert orbital.status_code == telemetry.status_code == 200
        orbital_result = OrbitalResult.model_validate(orbital.json())
        telemetry_result = TelemetryResult.model_validate(telemetry.json())
        response = client.post("/api/diagnosis/assess", json={
            "request_id": "fixture:integration-request",
            "satellite_id": orbital_result.satellite_id,
            "orbital_result": orbital.json(),
            "telemetry_result": telemetry.json(),
        })
    assert response.status_code == 200
    diagnosis = DiagnosisResult.model_validate(response.json())
    assert diagnosis.status == orbital_result.status == telemetry_result.status == "not_computed"
    record = diagnosis.diagnoses[0]
    assert {item.reference_id for item in record.evidence} == {
        orbital_result.conjunctions[0].id, telemetry_result.anomalies[0].id
    }
    assert record.possible_cause is None
    assert record.related_conjunction_ids == []
    assert record.status == "not_assessed"
