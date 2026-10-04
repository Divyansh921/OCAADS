"""Screening tests cover deterministic method behavior, not operational safety."""

from datetime import datetime, timedelta, timezone
from pathlib import Path

import pytest

from app.domain.contracts import OrbitalRequest
from app.orbital.propagation import PropagatedState
from app.orbital.real import TleOrbitalEngine, load_snapshot_info
from app.orbital.screening import (
    OrbitalInputError,
    ScreeningConfig,
    _closest_approach,
    _refine_distance,
)

BASE = Path(__file__).resolve().parents[3] / "data" / "fixtures" / "orbital-validation"


def test_real_slice_returns_explicit_computed_no_conjunction_when_threshold_is_not_met():
    request = OrbitalRequest.model_validate_json((BASE / "request.json").read_text())
    result = TleOrbitalEngine(load_snapshot_info(BASE / "manifest.json")).screen(request)

    assert result.status == "completed"
    assert result.screening_status == "no_conjunction"
    assert result.conjunctions == []
    assert result.metadata is not None
    assert result.metadata.frame == "TEME"
    assert result.metadata.position_unit == "km"
    assert result.metadata.sample_interval_seconds == 10.0
    assert "not collision probability" in result.notice


def test_screening_ranks_candidates_without_calling_them_probability():
    request = OrbitalRequest.model_validate_json((BASE / "request.json").read_text())
    config = ScreeningConfig(
        horizon=timedelta(days=7),
        sample_interval=timedelta(days=1),
        refinement_tolerance=timedelta(seconds=1),
        threshold_km=100_000,
    )
    result = TleOrbitalEngine(load_snapshot_info(BASE / "manifest.json"), config).screen(request)

    assert result.screening_status == "candidates_found"
    assert [item.screening_rank for item in result.conjunctions] == [1, 2, 3, 4, 5]
    assert [item.miss_distance_km for item in result.conjunctions] == sorted(
        item.miss_distance_km for item in result.conjunctions
    )
    assert all(
        item.miss_distance_km is not None and item.miss_distance_km < 100_000
        for item in result.conjunctions
    )


def test_tca_refinement_finds_controlled_quadratic_minimum():
    start = datetime(2030, 1, 1, tzinfo=timezone.utc)
    expected = start + timedelta(seconds=12.3)

    def state(timestamp):
        offset = (timestamp - expected).total_seconds()
        return PropagatedState(timestamp, (offset, 0.0, 0.0), (0.0, 0.0, 0.0))

    actual_time, actual_distance = _refine_distance(
        lambda timestamp: PropagatedState(timestamp, (0.0, 0.0, 0.0), (0.0, 0.0, 0.0)),
        state,
        start,
        start + timedelta(seconds=20),
        timedelta(seconds=1),
    )

    assert abs((actual_time - expected).total_seconds()) <= 0.5
    assert actual_distance < 0.5


def test_first_slice_requires_exactly_seven_days():
    request = OrbitalRequest.model_validate_json((BASE / "request.json").read_text())
    payload = request.model_dump(mode="json")
    payload["window"]["end"] = "2026-10-04T00:00:00Z"

    with pytest.raises(OrbitalInputError, match="exactly seven days"):
        TleOrbitalEngine(load_snapshot_info(BASE / "manifest.json")).screen(
            OrbitalRequest.model_validate(payload)
        )


@pytest.mark.parametrize("minimum_seconds", [0.0, 2.3, 57.7, 60.0])
def test_refinement_covers_window_boundaries_and_preserves_exact_endpoints(minimum_seconds):
    start = datetime(2030, 1, 1, tzinfo=timezone.utc)
    expected = start + timedelta(seconds=minimum_seconds)
    times = [start + timedelta(seconds=seconds) for seconds in range(0, 61, 10)]

    def target(timestamp):
        return PropagatedState(timestamp, (0.0, 0.0, 0.0), (0.0, 0.0, 0.0))

    def comparison(timestamp):
        return PropagatedState(
            timestamp, ((timestamp - expected).total_seconds(), 0.0, 0.0), (1.0, 0.0, 0.0),
        )

    tca, distance = _closest_approach(
        target, comparison, times, [target(timestamp).position_km for timestamp in times],
        timedelta(seconds=1),
    )
    assert abs((tca - expected).total_seconds()) <= 0.5
    assert distance <= 0.5
    if minimum_seconds in (0.0, 60.0):
        assert tca == expected
        assert distance == 0.0


@pytest.mark.parametrize(
    "config",
    [
        ScreeningConfig(refinement_tolerance=timedelta(0)),
        ScreeningConfig(sample_interval=timedelta(0)),
        ScreeningConfig(threshold_km=float("nan")),
    ],
)
def test_invalid_configuration_fails_before_screening(config):
    request = OrbitalRequest.model_validate_json((BASE / "request.json").read_text())
    with pytest.raises(OrbitalInputError, match="configuration requires"):
        TleOrbitalEngine(load_snapshot_info(BASE / "manifest.json"), config).screen(request)
