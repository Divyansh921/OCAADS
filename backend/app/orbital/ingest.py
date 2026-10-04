"""Small offline TLE ingestion boundary for the first orbital slice.

This module parses transport records and creates SGP4-ready records. It does
not fetch the network, select comparison objects, or decide screening policy.
"""

from dataclasses import dataclass
from datetime import datetime, timezone
from math import isfinite
from pathlib import Path

from sgp4.api import WGS72, Satrec
from sgp4.conveniences import check_satrec, sat_epoch_datetime
from sgp4.earth_gravity import wgs72
from sgp4.io import twoline2rv, verify_checksum

from app.domain.contracts import OrbitalObject, TleElements


class TleParseError(ValueError):
    """The local TLE text is malformed or cannot be parsed by SGP4."""


@dataclass(frozen=True)
class TleRecord:
    object_id: str
    display_name: str
    line1: str
    line2: str
    epoch: datetime
    satellite: Satrec

    def as_contract_object(self) -> OrbitalObject:
        return OrbitalObject(
            object_id=self.object_id,
            display_name=self.display_name,
            epoch=self.epoch.astimezone(timezone.utc),
            elements=TleElements(format="tle", line1=self.line1, line2=self.line2),
        )


def _object_id(satellite: Satrec) -> str:
    return f"norad:{satellite.satnum}"


def parse_tle_text(text: str) -> dict[str, TleRecord]:
    """Parse three-line records and return them by opaque NORAD ID.

    Fixed-width TLE validation and orbital parameter validation are delegated to
    the selected SGP4 library. Names are kept as source labels.
    """

    lines = [line.rstrip("\r") for line in text.splitlines() if line.strip()]
    if not lines or len(lines) % 3:
        raise TleParseError("TLE input must contain complete name/line1/line2 records")

    records: dict[str, TleRecord] = {}
    for offset in range(0, len(lines), 3):
        name = lines[offset].strip()
        line1 = lines[offset + 1].rstrip()
        line2 = lines[offset + 2].rstrip()
        if not name or not line1.startswith("1 ") or not line2.startswith("2 "):
            raise TleParseError(f"Malformed TLE record at line {offset + 1}")
        try:
            if len(line1) != 69 or len(line2) != 69:
                raise ValueError("TLE element lines must be exactly 69 ASCII characters")
            line1.encode("ascii")
            line2.encode("ascii")
            if not line1[-1].isdigit() or not line2[-1].isdigit():
                raise ValueError("TLE checksum digits are required")
            verify_checksum(line1, line2)
            # The fast C++ parser alone does not enforce all fixed-width fields.
            twoline2rv(line1, line2, wgs72)
            satellite = Satrec.twoline2rv(line1, line2, WGS72)
            check_satrec(satellite)
            values = (satellite.ecco, satellite.no_kozai, satellite.bstar)
            if not all(isfinite(value) for value in values):
                raise ValueError("TLE parameters must be finite")
            if not 0 <= satellite.ecco < 1 or satellite.no_kozai <= 0:
                raise ValueError("TLE requires elliptic eccentricity and positive mean motion")
            epoch = sat_epoch_datetime(satellite).astimezone(timezone.utc)
        except (TypeError, ValueError) as exc:
            raise TleParseError(f"SGP4 could not parse TLE record {name!r}: {exc}") from exc
        record = TleRecord(
            object_id=_object_id(satellite),
            display_name=name,
            line1=line1,
            line2=line2,
            epoch=epoch,
            satellite=satellite,
        )
        if record.object_id in records:
            raise TleParseError(f"duplicate TLE catalog identifier: {record.object_id}")
        records[record.object_id] = record
    return records


def parse_tle_file(path: Path) -> dict[str, TleRecord]:
    try:
        text = path.read_text(encoding="ascii")
    except (OSError, UnicodeError) as exc:
        raise TleParseError(f"could not read TLE file {path}: {exc}") from exc
    return parse_tle_text(text)
