"""Validation and serialization guarantees; not TLE, ML, or physics validation."""

import pytest
from pydantic import ValidationError

from app.domain.contracts import (
    DiagnosisRequest,
    DiagnosisResult,
    OrbitalRequest,
    OrbitalResult,
    TelemetryRequest,
    TelemetryResult,
    TimeWindow,
)


@pytest.mark.parametrize(
    "name,model",
    [
        ("orbital-request", OrbitalRequest), ("orbital-result", OrbitalResult),
        ("telemetry-request", TelemetryRequest), ("telemetry-result", TelemetryResult),
        ("diagnosis-request", DiagnosisRequest), ("diagnosis-result", DiagnosisResult),
    ],
)
def test_checked_in_examples_validate_and_round_trip(fixture_json, name, model):
    record = model.model_validate(fixture_json(name))
    assert model.model_validate_json(record.model_dump_json()) == record


@pytest.mark.parametrize("timestamp", ["2030-01-01T00:00:00", "2030-01-01", 1893456000])
def test_ambiguous_or_numeric_timestamps_are_rejected(timestamp):
    with pytest.raises(ValidationError):
        TimeWindow(start=timestamp, end="2030-01-02T00:00:00Z")


def test_offset_timestamps_normalize_to_utc():
    window = TimeWindow(start="2030-01-01T05:30:00+05:30", end="2030-01-02T00:00:00Z")
    assert window.model_dump(mode="json")["start"] == "2030-01-01T00:00:00Z"


def test_reversed_or_zero_length_window_is_rejected():
    with pytest.raises(ValidationError, match="later than"):
        TimeWindow(start="2030-01-01T00:00:00Z", end="2030-01-01T00:00:00Z")


def test_unknown_fields_and_invalid_identifiers_are_rejected(fixture_json):
    payload = fixture_json("orbital-request")
    payload["unknown_option"] = True
    payload["request_id"] = "identifiers cannot contain spaces"
    with pytest.raises(ValidationError) as exc:
        OrbitalRequest.model_validate(payload)
    assert len(exc.value.errors()) == 2


def test_orbital_input_cannot_compare_a_satellite_to_itself(fixture_json):
    payload = fixture_json("orbital-request")
    payload["comparisons"][0]["object_id"] = payload["target"]["object_id"]
    with pytest.raises(ValidationError, match="distinct"):
        OrbitalRequest.model_validate(payload)


def test_supplied_orbital_input_cannot_omit_elements(fixture_json):
    payload = fixture_json("orbital-request")
    payload["provenance"]["kind"] = "supplied"
    with pytest.raises(ValidationError, match="epoch and elements"):
        OrbitalRequest.model_validate(payload)


def test_undeclared_telemetry_signal_is_rejected(fixture_json):
    payload = fixture_json("telemetry-request")
    payload["samples"][0]["values"]["undeclared_signal"] = None
    with pytest.raises(ValidationError, match="declared signal"):
        TelemetryRequest.model_validate(payload)


@pytest.mark.parametrize("value", [float("nan"), float("inf"), True, "3.14"])
def test_measurements_must_be_finite_numbers_or_null(fixture_json, value):
    payload = fixture_json("telemetry-request")
    payload["samples"][0]["values"]["fixture_signal"] = value
    with pytest.raises(ValidationError):
        TelemetryRequest.model_validate(payload)


@pytest.mark.parametrize("value", [-1.0, float("inf"), "1.0"])
def test_invalid_distances_are_rejected(fixture_json, value):
    payload = fixture_json("orbital-result")
    payload["conjunctions"][0]["miss_distance_km"] = value
    with pytest.raises(ValidationError):
        OrbitalResult.model_validate(payload)


def test_result_null_is_required_not_an_omitted_field(fixture_json):
    payload = fixture_json("orbital-result")
    del payload["conjunctions"][0]["miss_distance_km"]
    with pytest.raises(ValidationError):
        OrbitalResult.model_validate(payload)


def test_fixture_cannot_claim_a_calculated_distance(fixture_json):
    payload = fixture_json("orbital-result")
    payload["conjunctions"][0]["miss_distance_km"] = 0.0
    with pytest.raises(ValidationError, match="leave results null"):
        OrbitalResult.model_validate(payload)


def test_fixture_cannot_claim_an_anomaly_score(fixture_json):
    payload = fixture_json("telemetry-result")
    payload["anomalies"][0]["score"] = 0.0
    with pytest.raises(ValidationError, match="cannot label or score"):
        TelemetryResult.model_validate(payload)


def test_fixture_cannot_claim_a_cause_or_relationship(fixture_json):
    payload = fixture_json("diagnosis-result")
    payload["diagnoses"][0]["possible_cause"] = "unsupported cause"
    with pytest.raises(ValidationError, match="cannot assert"):
        DiagnosisResult.model_validate(payload)


def test_diagnosis_requires_the_same_satellite(fixture_json):
    payload = fixture_json("diagnosis-request")
    payload["satellite_id"] = "fixture:other"
    with pytest.raises(ValidationError, match="different satellite"):
        DiagnosisRequest.model_validate(payload)


def test_completed_cannot_be_attached_to_fixture_provenance(fixture_json):
    payload = fixture_json("orbital-result")
    payload["status"] = "completed"
    with pytest.raises(ValidationError, match="completed results cannot"):
        OrbitalResult.model_validate(payload)


def test_completed_orbital_record_requires_distance_and_tca(fixture_json):
    payload = fixture_json("orbital-result")
    payload["status"] = "completed"
    payload["provenance"]["kind"] = "calculated"
    with pytest.raises(ValidationError, match="require tca and miss_distance"):
        OrbitalResult.model_validate(payload)
