"""Interface behavior only; no preprocessing/model evaluation is tested."""

import pytest

from app.domain.contracts import TelemetryRequest, TelemetryResult
from app.domain.errors import EngineNotImplementedError
from app.telemetry.fixture import FixtureTelemetryEngine
from app.telemetry.interface import TelemetryEngine


def test_fixture_matches_contract_without_scores(telemetry_request, fixture_json):
    engine: TelemetryEngine = FixtureTelemetryEngine()
    result = engine.analyze(telemetry_request)
    assert isinstance(result, TelemetryResult)
    assert result.model_dump(mode="json") == fixture_json("telemetry-result")
    assert result == engine.analyze(telemetry_request)
    assert result.anomalies[0].score is None
    assert result.anomalies[0].status == "not_evaluated"
    assert telemetry_request.samples[0].values["fixture_signal"] is None


def test_empty_samples_do_not_mean_healthy(telemetry_request):
    payload = telemetry_request.model_dump(mode="json")
    payload["samples"] = []
    result = FixtureTelemetryEngine().analyze(TelemetryRequest.model_validate(payload))
    assert result.anomalies == []
    assert result.status == "not_computed"


def test_supplied_telemetry_is_not_processed(telemetry_request):
    payload = telemetry_request.model_dump(mode="json")
    payload["provenance"]["kind"] = "supplied"
    with pytest.raises(EngineNotImplementedError, match="not implemented"):
        FixtureTelemetryEngine().analyze(TelemetryRequest.model_validate(payload))
