"""Person 2's public boundary. No dependency on orbital or diagnosis code."""

from typing import Protocol

from app.domain.contracts import TelemetryRequest, TelemetryResult


class TelemetryEngine(Protocol):
    def analyze(self, request: TelemetryRequest) -> TelemetryResult:
        """Analyze validated telemetry, or raise a shared domain error."""
        ...
