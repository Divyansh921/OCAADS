"""References-only fixture. NO preprocessing, model training, scoring, or labels."""

from uuid import NAMESPACE_URL, uuid5

from app.domain.contracts import Anomaly, ResultProvenance, TelemetryRequest, TelemetryResult
from app.domain.errors import EngineNotImplementedError


class FixtureTelemetryEngine:
    def analyze(self, request: TelemetryRequest) -> TelemetryResult:
        if request.provenance.kind != "fixture":
            raise EngineNotImplementedError("Telemetry anomaly detection is not implemented.")
        references = []
        if request.samples:
            sample = request.samples[0]
            references.append(
                Anomaly(
                    id=f"fixture:anomaly:{uuid5(NAMESPACE_URL, request.request_id)}",
                    satellite_id=request.satellite_id,
                    timestamp=sample.timestamp,
                    score=None,
                    signals=list(sample.values),
                    status="not_evaluated",
                )
            )
        return TelemetryResult(
            request_id=request.request_id,
            satellite_id=request.satellite_id,
            status="not_computed",
            provenance=ResultProvenance(
                kind="fixture", source="foundation:telemetry-reference-only"
            ),
            notice="Fixture only: first sample referenced; no anomaly detection or scoring ran.",
            anomalies=references,
        )
