"""HTTP contract/dependency checks; reference fixtures are not science tests."""

import pytest

from app.api.dependencies import get_orbital_engine
from app.domain.contracts import DiagnosisResult, ErrorResponse, OrbitalResult, TelemetryResult
from app.main import app


@pytest.mark.parametrize(
    "path,example,model",
    [
        ("/api/orbital/screen", "orbital", OrbitalResult),
        ("/api/telemetry/analyze", "telemetry", TelemetryResult),
        ("/api/diagnosis/assess", "diagnosis", DiagnosisResult),
    ],
)
def test_fixture_endpoints_return_the_documented_shapes(client, fixture_json, path, example, model):
    response = client.post(path, json=fixture_json(f"{example}-request"))
    assert response.status_code == 200
    assert model.model_validate(response.json()).status == "not_computed"
    assert response.json() == fixture_json(f"{example}-result")


@pytest.mark.parametrize(
    "path", ["/api/orbital/screen", "/api/telemetry/analyze", "/api/diagnosis/assess"]
)
def test_invalid_requests_use_the_shared_error_shape(client, path):
    response = client.post(path, json={"unrecognized": "do-not-echo-this-payload"})
    assert response.status_code == 422
    error = ErrorResponse.model_validate(response.json())
    assert error.code == "invalid_request"
    assert error.issues
    assert "do-not-echo-this-payload" not in response.text


def test_malformed_json_uses_the_same_validation_error(client):
    response = client.post(
        "/api/orbital/screen", content="{", headers={"Content-Type": "application/json"}
    )
    assert response.status_code == 422
    assert ErrorResponse.model_validate(response.json()).code == "invalid_request"


def test_real_computation_request_fails_explicitly(client, fixture_json):
    payload = fixture_json("telemetry-request")
    payload["provenance"]["kind"] = "supplied"
    response = client.post("/api/telemetry/analyze", json=payload)
    assert response.status_code == 501
    error = ErrorResponse.model_validate(response.json())
    assert error.code == "not_implemented"
    assert error.issues == []


def test_diagnosis_rejects_a_different_satellite(client, fixture_json):
    payload = fixture_json("diagnosis-request")
    payload["satellite_id"] = "fixture:other-target"
    response = client.post("/api/diagnosis/assess", json=payload)
    assert response.status_code == 422
    assert response.json()["code"] == "invalid_request"


def test_adapter_can_be_replaced_without_changing_the_route(client, fixture_json):
    class ReplacementOrbitalEngine:
        def screen(self, request):
            result = fixture_json("orbital-result")
            result["request_id"] = request.request_id
            result["notice"] = "Replacement fixture adapter was used."
            return OrbitalResult.model_validate(result)

    app.dependency_overrides[get_orbital_engine] = ReplacementOrbitalEngine
    response = client.post("/api/orbital/screen", json=fixture_json("orbital-request"))
    assert response.status_code == 200
    assert response.json()["notice"] == "Replacement fixture adapter was used."
