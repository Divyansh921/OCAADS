"""SGP4 state evaluation in the locked first-slice units/frame."""

from dataclasses import dataclass
from datetime import datetime, timezone
from math import isfinite

from sgp4.api import SGP4_ERRORS, Satrec, jday


class PropagationError(RuntimeError):
    """SGP4 could not produce a state at the requested time."""


@dataclass(frozen=True)
class PropagatedState:
    timestamp: datetime
    position_km: tuple[float, float, float]
    velocity_km_s: tuple[float, float, float]


def propagate(satellite: Satrec, timestamp: datetime) -> PropagatedState:
    """Return an Earth-centered TEME state in km and km/s."""

    if timestamp.tzinfo is None or timestamp.utcoffset() is None:
        raise PropagationError("propagation timestamps must include a timezone")
    timestamp = timestamp.astimezone(timezone.utc)
    jd, fraction = jday(
        timestamp.year,
        timestamp.month,
        timestamp.day,
        timestamp.hour,
        timestamp.minute,
        timestamp.second + timestamp.microsecond / 1_000_000,
    )
    error, position, velocity = satellite.sgp4(jd, fraction)
    if error:
        message = SGP4_ERRORS.get(error, f"unknown SGP4 error {error}")
        raise PropagationError(f"SGP4 failed at {timestamp.isoformat()}: {message}")
    if not all(isfinite(value) for value in (*position, *velocity)):
        raise PropagationError(f"SGP4 returned a non-finite state at {timestamp.isoformat()}")
    return PropagatedState(
        timestamp=timestamp,
        position_km=tuple(float(value) for value in position),
        velocity_km_s=tuple(float(value) for value in velocity),
    )
