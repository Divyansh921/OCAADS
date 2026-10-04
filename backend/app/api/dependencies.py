"""Person 4's composition point: select validated adapters here."""

from functools import lru_cache

from app.diagnosis.fixture import FixtureDiagnosisEngine
from app.diagnosis.interface import DiagnosisEngine
from app.domain.contracts import OrbitalRequest, OrbitalResult
from app.domain.errors import OrbitalInputError
from app.orbital.dataset import DEFAULT_MANIFEST, load_dataset
from app.orbital.fixture import FixtureOrbitalEngine
from app.orbital.interface import OrbitalEngine
from app.orbital.real import TleOrbitalEngine, load_snapshot_info
from app.telemetry.fixture import FixtureTelemetryEngine
from app.telemetry.interface import TelemetryEngine

SNAPSHOT_MANIFEST = DEFAULT_MANIFEST


@lru_cache(maxsize=1)
def get_calculated_orbital_engine() -> OrbitalEngine:
    """Return the first real TLE/SGP4 engine; it never fetches the network."""

    try:
        return TleOrbitalEngine(
            load_snapshot_info(SNAPSHOT_MANIFEST),
            snapshot_path=SNAPSHOT_MANIFEST.with_name("stations.tle"),
            selection=load_dataset(SNAPSHOT_MANIFEST),
        )
    except ValueError as exc:
        raise OrbitalInputError(str(exc)) from exc


class SelectedOrbitalEngine:
    """Keep explicitly labelled fixtures callable alongside the real adapter."""

    def screen(self, request: OrbitalRequest) -> OrbitalResult:
        if request.provenance.kind == "fixture":
            return FixtureOrbitalEngine().screen(request)
        return get_calculated_orbital_engine().screen(request)


def get_orbital_engine() -> OrbitalEngine:
    return SelectedOrbitalEngine()


@lru_cache(maxsize=1)
def get_telemetry_engine() -> TelemetryEngine:
    return FixtureTelemetryEngine()


@lru_cache(maxsize=1)
def get_diagnosis_engine() -> DiagnosisEngine:
    return FixtureDiagnosisEngine()
