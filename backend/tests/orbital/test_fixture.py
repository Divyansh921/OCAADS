"""Interface behavior only; not tests of orbital mechanics."""

import pytest

from app.domain.contracts import OrbitalRequest, OrbitalResult
from app.domain.errors import EngineNotImplementedError
from app.orbital.fixture import FixtureOrbitalEngine
from app.orbital.interface import OrbitalEngine


def test_fixture_matches_contract_without_calculations(orbital_request, fixture_json):
    engine: OrbitalEngine = FixtureOrbitalEngine()
    result = engine.screen(orbital_request)
    assert isinstance(result, OrbitalResult)
    assert result.model_dump(mode="json") == fixture_json("orbital-result")
    assert result == engine.screen(orbital_request)
    assert all(item.tca is None and item.miss_distance_km is None for item in result.conjunctions)


def test_empty_comparisons_are_not_a_safety_assessment(orbital_request):
    payload = orbital_request.model_dump(mode="json")
    payload["comparisons"] = []
    result = FixtureOrbitalEngine().screen(OrbitalRequest.model_validate(payload))
    assert result.conjunctions == []
    assert result.status == "not_computed"


def test_supplied_input_is_rejected_before_parsing(orbital_request):
    payload = orbital_request.model_dump(mode="json")
    payload["provenance"]["kind"] = "supplied"
    for item in [payload["target"], *payload["comparisons"]]:
        item["epoch"] = "2030-01-01T00:00:00Z"
        # Schema-shaped text, NOT a valid or scientifically usable OMM record.
        item["elements"] = {"format": "omm", "fields": {"COMMENT": "contract-only text"}}
    with pytest.raises(EngineNotImplementedError, match="not implemented"):
        FixtureOrbitalEngine().screen(OrbitalRequest.model_validate(payload))


def test_long_request_id_still_produces_valid_bounded_event_id(orbital_request):
    payload = orbital_request.model_dump(mode="json")
    payload["request_id"] = "x" * 128
    result = FixtureOrbitalEngine().screen(OrbitalRequest.model_validate(payload))
    assert len(result.conjunctions[0].id) <= 128
