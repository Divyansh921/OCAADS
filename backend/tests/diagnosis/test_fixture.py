"""Combines reference-shaped inputs only; no correlation or rules are tested."""

import pytest

from app.diagnosis.fixture import FixtureDiagnosisEngine
from app.diagnosis.interface import DiagnosisEngine
from app.domain.contracts import DiagnosisRequest, DiagnosisResult
from app.domain.errors import EngineNotImplementedError


def test_fixture_combines_references_without_inferring_relations(diagnosis_request, fixture_json):
    engine: DiagnosisEngine = FixtureDiagnosisEngine()
    result = engine.diagnose(diagnosis_request)
    assert isinstance(result, DiagnosisResult)
    assert result.model_dump(mode="json") == fixture_json("diagnosis-result")
    assert result == engine.diagnose(diagnosis_request)
    item = result.diagnoses[0]
    assert item.possible_cause is None
    assert item.related_conjunction_ids == []
    assert item.status == "not_assessed"
    assert {e.reference_id for e in item.evidence} == {
        diagnosis_request.telemetry_result.anomalies[0].id,
        diagnosis_request.orbital_result.conjunctions[0].id,
    }
    assert all(e.kind == "input_reference" for e in item.evidence)


def test_empty_anomalies_produce_no_assessment(diagnosis_request):
    payload = diagnosis_request.model_dump(mode="json")
    payload["telemetry_result"]["anomalies"] = []
    result = FixtureDiagnosisEngine().diagnose(DiagnosisRequest.model_validate(payload))
    assert result.diagnoses == []
    assert result.status == "not_computed"


def test_non_fixture_results_cannot_be_silently_diagnosed(diagnosis_request):
    payload = diagnosis_request.model_dump(mode="json")
    # An empty, schema-valid completed envelope tests rejection, not scientific correctness.
    payload["telemetry_result"].update(status="completed", anomalies=[])
    payload["telemetry_result"]["provenance"]["kind"] = "model_generated"
    with pytest.raises(EngineNotImplementedError, match="not implemented"):
        FixtureDiagnosisEngine().diagnose(DiagnosisRequest.model_validate(payload))
