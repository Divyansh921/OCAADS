"""HTTP contract/dependency checks; reference fixtures are not science tests."""

import pytest

from app.api import dependencies
from app.api.dependencies import get_orbital_engine
from app.domain.contracts import DiagnosisResult, ErrorResponse, OrbitalResult, TelemetryResult
from app.main import app


@pytest.mark.parametrize(
    "path,example,model,expected_status",
    [
        ("/api/orbital/screen", "orbital", OrbitalResult, "not_computed"),
        ("/api/telemetry/analyze", "telemetry", TelemetryResult, "not_computed"),
        ("/api/diagnosis/assess", "diagnosis", DiagnosisResult, "not_computed"),
    ],
)
def test_fixture_endpoints_return_the_documented_shapes(
    client, fixture_json, path, example, model, expected_status
):
    response = client.post(path, json=fixture_json(f"{example}-request"))
    assert response.status_code == 200
    assert model.model_validate(response.json()).status == expected_status
    assert response.json() == fixture_json(f"{example}-result")


def test_orbital_endpoint_runs_the_real_first_slice(client, fixture_json):
    response = client.post(
        "/api/orbital/screen", json=fixture_json("orbital-validation-request")
    )
    assert response.status_code == 200
    result = OrbitalResult.model_validate(response.json())
    assert result.status == "completed"
    assert result.metadata is not None
    assert result.metadata.propagator == "sgp4"


def test_dataset_endpoint_returns_verified_six_object_request(client):
    response = client.get("/api/orbital/dataset")
    assert response.status_code == 200
    payload = response.json()
    assert payload["target"]["object_id"] == "norad:25544"
    assert len(payload["comparisons"]) == 5
    assert payload["provenance"]["kind"] == "supplied"


@pytest.mark.parametrize("field", ["epoch", "line1", "selection"])
def test_calculated_api_rejects_records_not_matching_the_snapshot(client, fixture_json, field):
    payload = fixture_json("orbital-validation-request")
    if field == "epoch":
        payload["target"]["epoch"] = "2030-01-01T00:00:00Z"
    elif field == "line1":
        payload["target"]["elements"]["line1"] = "1 invalid"
    else:
        payload["target"], payload["comparisons"][0] = (
            payload["comparisons"][0], payload["target"]
        )
    response = client.post("/api/orbital/screen", json=payload)
    assert response.status_code == 422
    assert ErrorResponse.model_validate(response.json()).code == "invalid_request"


def test_missing_snapshot_has_structured_error_and_never_falls_back_to_fixture(
    client, fixture_json, monkeypatch, tmp_path,
):
    monkeypatch.setattr(dependencies, "SNAPSHOT_MANIFEST", tmp_path / "missing.json")
    dependencies.get_calculated_orbital_engine.cache_clear()
    try:
        response = client.post(
            "/api/orbital/screen", json=fixture_json("orbital-validation-request")
        )
        assert response.status_code == 422
        assert ErrorResponse.model_validate(response.json()).code == "invalid_request"
        fixture_response = client.post(
            "/api/orbital/screen", json=fixture_json("orbital-request")
        )
        assert fixture_response.status_code == 200
        assert fixture_response.json()["status"] == "not_computed"
    finally:
        dependencies.get_calculated_orbital_engine.cache_clear()


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


def test_real_telemetry_computation_request_fails_explicitly(client, fixture_json):
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
