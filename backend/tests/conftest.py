"""Load independent contract examples; unit fixtures never invoke another engine."""

import json
from pathlib import Path

import pytest

from app.domain.contracts import DiagnosisRequest, OrbitalRequest, TelemetryRequest

FIXTURES = Path(__file__).resolve().parents[2] / "data" / "fixtures" / "foundation"


@pytest.fixture
def fixture_json():
    def load(name: str) -> dict:
        return json.loads((FIXTURES / f"{name}.json").read_text(encoding="utf-8"))
    return load


@pytest.fixture
def orbital_request(fixture_json) -> OrbitalRequest:
    return OrbitalRequest.model_validate(fixture_json("orbital-request"))


@pytest.fixture
def telemetry_request(fixture_json) -> TelemetryRequest:
    return TelemetryRequest.model_validate(fixture_json("telemetry-request"))


@pytest.fixture
def diagnosis_request(fixture_json) -> DiagnosisRequest:
    return DiagnosisRequest.model_validate(fixture_json("diagnosis-request"))

