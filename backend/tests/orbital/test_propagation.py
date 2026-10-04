"""SGP4 wrapper checks for units, frame metadata, UTC, and deterministic state."""

from datetime import datetime, timezone
from pathlib import Path

import pytest

from app.orbital.ingest import parse_tle_file
from app.orbital.propagation import PropagationError, propagate

FIXTURE = (
    Path(__file__).resolve().parents[3]
    / "data" / "fixtures" / "orbital-validation" / "stations.tle"
)


def test_propagation_returns_teme_km_and_km_per_second():
    record = parse_tle_file(FIXTURE)["norad:25544"]
    timestamp = datetime(2026, 10, 3, 12, 0, tzinfo=timezone.utc)

    state = propagate(record.satellite, timestamp)

    assert state.timestamp == timestamp
    assert len(state.position_km) == len(state.velocity_km_s) == 3
    assert 6000 < sum(value * value for value in state.position_km) ** 0.5 < 8000
    assert max(abs(value) for value in state.velocity_km_s) < 10
    assert all(value == other for value, other in zip(
        state.position_km, propagate(record.satellite, timestamp).position_km
    ))


def test_naive_timestamp_is_rejected():
    record = parse_tle_file(FIXTURE)["norad:25544"]

    with pytest.raises(PropagationError, match="timezone"):
        propagate(record.satellite, datetime(2026, 10, 3, 12, 0))


def test_propagation_matches_vallado_reference_state():
    # Published SGP4 verification case 00005 at its epoch (Vallado et al., 2006).
    from sgp4.api import WGS72, Satrec
    from sgp4.conveniences import sat_epoch_datetime

    satellite = Satrec.twoline2rv(
        "1 00005U 58002B   00179.78495062  .00000023  00000-0  28098-4 0  4753",
        "2 00005  34.2682 348.7242 1859667 331.7664  19.3264 10.82419157413667",
        WGS72,
    )
    state = propagate(satellite, sat_epoch_datetime(satellite))
    assert state.position_km == pytest.approx(
        (7022.46529266, -1400.08296755, 0.03995155), abs=1e-5,
    )
    assert state.velocity_km_s == pytest.approx(
        (1.893841015, 6.405893759, 4.534807250), abs=1e-8,
    )


def test_sgp4_failure_is_not_returned_as_a_successful_state():
    class FailingSatellite:
        def sgp4(self, jd, fraction):
            return 6, (float("nan"),) * 3, (float("nan"),) * 3

    with pytest.raises(PropagationError, match="decayed"):
        propagate(FailingSatellite(), datetime(2030, 1, 1, tzinfo=timezone.utc))
