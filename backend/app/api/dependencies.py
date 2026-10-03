"""Person 4's composition point: replace adapters here, not in consumers."""

from app.diagnosis.fixture import FixtureDiagnosisEngine
from app.diagnosis.interface import DiagnosisEngine
from app.orbital.fixture import FixtureOrbitalEngine
from app.orbital.interface import OrbitalEngine
from app.telemetry.fixture import FixtureTelemetryEngine
from app.telemetry.interface import TelemetryEngine


def get_orbital_engine() -> OrbitalEngine:
    return FixtureOrbitalEngine()


def get_telemetry_engine() -> TelemetryEngine:
    return FixtureTelemetryEngine()


def get_diagnosis_engine() -> DiagnosisEngine:
    return FixtureDiagnosisEngine()
