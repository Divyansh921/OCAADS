"""Deterministic sampled close-approach screening for the first MVP slice."""

from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from math import dist, isfinite
from typing import Callable

from app.domain.contracts import (
    Conjunction,
    OrbitalCalculationMetadata,
    OrbitalObject,
    OrbitalRequest,
    OrbitalResult,
    ResultProvenance,
)
from app.domain.errors import OrbitalInputError
from app.orbital.ingest import TleParseError, parse_tle_text
from app.orbital.propagation import PropagatedState, propagate


@dataclass(frozen=True)
class ScreeningConfig:
    horizon: timedelta = timedelta(days=7)
    sample_interval: timedelta = timedelta(seconds=10)
    refinement_tolerance: timedelta = timedelta(seconds=1)
    threshold_km: float = 10.0


@dataclass(frozen=True)
class SnapshotInfo:
    source_endpoint: str
    retrieved_at: datetime | None
    recorded_at: datetime
    snapshot_sha256: str


StateFunction = Callable[[datetime], PropagatedState]


def _utc(value: datetime) -> datetime:
    if value.tzinfo is None or value.utcoffset() is None:
        raise OrbitalInputError("orbital timestamps must include a timezone")
    return value.astimezone(timezone.utc)


def _sample_times(start: datetime, end: datetime, interval: timedelta) -> list[datetime]:
    times: list[datetime] = []
    current = start
    while current <= end:
        times.append(current)
        current += interval
    if times[-1] != end:
        times.append(end)
    return times


def _distance(target: StateFunction, comparison: StateFunction, timestamp: datetime) -> float:
    return dist(target(timestamp).position_km, comparison(timestamp).position_km)


def _refine_distance(
    target: StateFunction,
    comparison: StateFunction,
    left: datetime,
    right: datetime,
    tolerance: timedelta,
) -> tuple[datetime, float]:
    """Refine a scalar pair-distance function without introducing SciPy."""

    golden_ratio = (5**0.5 - 1) / 2
    left_seconds = left.timestamp()
    right_seconds = right.timestamp()

    def at(seconds: float) -> tuple[datetime, float]:
        timestamp = datetime.fromtimestamp(seconds, tz=timezone.utc)
        return timestamp, _distance(target, comparison, timestamp)

    c_seconds = right_seconds - golden_ratio * (right_seconds - left_seconds)
    d_seconds = left_seconds + golden_ratio * (right_seconds - left_seconds)
    c_time, c_value = at(c_seconds)
    d_time, d_value = at(d_seconds)
    while right_seconds - left_seconds > tolerance.total_seconds():
        if c_value < d_value:
            right_seconds, d_seconds, d_time, d_value = d_seconds, c_seconds, c_time, c_value
            c_seconds = right_seconds - golden_ratio * (right_seconds - left_seconds)
            c_time, c_value = at(c_seconds)
        else:
            left_seconds, c_seconds, c_time, c_value = c_seconds, d_seconds, d_time, d_value
            d_seconds = left_seconds + golden_ratio * (right_seconds - left_seconds)
            d_time, d_value = at(d_seconds)
    midpoint = (left_seconds + right_seconds) / 2
    midpoint_time, midpoint_value = at(midpoint)
    return min(
        [(midpoint_time, midpoint_value), (c_time, c_value), (d_time, d_value)],
        key=lambda item: item[1],
    )


def _state_function(obj: OrbitalObject) -> StateFunction:
    if obj.elements is None or obj.elements.format != "tle":
        raise OrbitalInputError(f"{obj.object_id} requires TLE elements for this slice")
    try:
        records = parse_tle_text(
            f"{obj.object_id}\n{obj.elements.line1}\n{obj.elements.line2}\n"
        )
        record = next(iter(records.values()))
    except TleParseError as exc:
        raise OrbitalInputError(f"invalid TLE for {obj.object_id}: {exc}") from exc
    parsed_id = record.object_id
    if parsed_id != obj.object_id:
        raise OrbitalInputError(
            f"TLE identifier {parsed_id} does not match request identifier {obj.object_id}"
        )
    if obj.epoch != record.epoch:
        raise OrbitalInputError(f"TLE epoch does not match request epoch for {obj.object_id}")
    return lambda timestamp: propagate(record.satellite, timestamp)


def _closest_approach(
    target: StateFunction, comparison: StateFunction,
    times: list[datetime], target_positions: list[tuple[float, float, float]],
    tolerance: timedelta,
) -> tuple[datetime, float]:
    sampled = [
        dist(position, comparison(timestamp).position_km)
        for timestamp, position in zip(times, target_positions)
    ]
    index = min(range(len(sampled)), key=sampled.__getitem__)
    refined = _refine_distance(
        target, comparison, times[max(0, index - 1)], times[min(len(times) - 1, index + 1)],
        tolerance,
    )
    # Retain exact sampled endpoints and never replace a better sampled distance.
    return min([(times[index], sampled[index]), refined], key=lambda item: item[1])


def screen_request(
    request: OrbitalRequest,
    snapshot: SnapshotInfo,
    config: ScreeningConfig = ScreeningConfig(),
) -> OrbitalResult:
    """Screen one target against request comparisons; no collision probability is calculated."""

    start = _utc(request.window.start)
    end = _utc(request.window.end)
    if end - start != config.horizon:
        raise OrbitalInputError("first-slice orbital window must be exactly seven days")
    if len(request.comparisons) != 5:
        raise OrbitalInputError("first-slice orbital screening requires exactly five comparisons")
    if (config.sample_interval.total_seconds() <= 0
            or config.refinement_tolerance.total_seconds() <= 0
            or not isfinite(config.threshold_km) or config.threshold_km < 0):
        raise OrbitalInputError(
            "screening configuration requires positive sampling/refinement intervals "
            "and a finite non-negative threshold"
        )
    target = _state_function(request.target)
    times = _sample_times(start, end, config.sample_interval)
    target_positions = [target(timestamp).position_km for timestamp in times]
    candidates: list[tuple[str, datetime, float]] = []
    for comparison_object in request.comparisons:
        comparison = _state_function(comparison_object)
        tca, minimum = _closest_approach(
            target, comparison, times, target_positions, config.refinement_tolerance,
        )
        if minimum < config.threshold_km:
            candidates.append((comparison_object.object_id, tca, minimum))

    candidates.sort(key=lambda item: (item[2], item[0]))
    conjunctions = [
        Conjunction(
            id=f"orbital:conjunction:{request.target.object_id}:{comparison_id}",
            target_id=request.target.object_id,
            comparison_id=comparison_id,
            tca=tca,
            miss_distance_km=minimum,
            screening_rank=rank,
        )
        for rank, (comparison_id, tca, minimum) in enumerate(candidates, start=1)
    ]
    metadata = OrbitalCalculationMetadata(
        source_endpoint=snapshot.source_endpoint,
        snapshot_retrieved_at=(
            _utc(snapshot.retrieved_at) if snapshot.retrieved_at is not None else None
        ),
        snapshot_recorded_at=_utc(snapshot.recorded_at),
        snapshot_sha256=snapshot.snapshot_sha256,
        propagator="sgp4",
        propagator_version=_sgp4_version(),
        gravity_model="WGS72",
        frame="TEME",
        position_unit="km",
        velocity_unit="km/s",
        window=request.window,
        sample_interval_seconds=config.sample_interval.total_seconds(),
        tca_refinement_seconds=config.refinement_tolerance.total_seconds(),
        screening_threshold_km=config.threshold_km,
    )
    if conjunctions:
        screening_status = "candidates_found"
        notice = (
            f"Computed screening candidates below the {config.threshold_km:g} km attention proxy; "
            "not collision probability."
        )
    else:
        screening_status = "no_conjunction"
        notice = (
            f"Computed screening found no candidates below the {config.threshold_km:g} km "
            "attention proxy; not collision probability."
        )
    return OrbitalResult(
        request_id=request.request_id,
        satellite_id=request.target.object_id,
        status="completed",
        provenance=ResultProvenance(
            kind="calculated", source=f"CelesTrak cached snapshot {snapshot.snapshot_sha256}"
        ),
        notice=notice,
        screening_status=screening_status,
        metadata=metadata,
        conjunctions=conjunctions,
    )


def _sgp4_version() -> str:
    from sgp4 import __version__

    return __version__
