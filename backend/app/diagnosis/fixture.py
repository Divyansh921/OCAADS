"""References-only fixture. NO correlation window, rules, causes, or confidence."""

from uuid import NAMESPACE_URL, uuid5

from app.domain.contracts import (
    Diagnosis,
    DiagnosisRequest,
    DiagnosisResult,
    Evidence,
    ResultProvenance,
)
from app.domain.errors import EngineNotImplementedError


class FixtureDiagnosisEngine:
    def diagnose(self, request: DiagnosisRequest) -> DiagnosisResult:
        if any(
            result.provenance.kind != "fixture"
            for result in (request.orbital_result, request.telemetry_result)
        ):
            raise EngineNotImplementedError("Rule-based diagnosis is not implemented.")
        diagnoses = []
        for anomaly in request.telemetry_result.anomalies:
            evidence = [
                Evidence(
                    kind="input_reference",
                    reference_type="anomaly",
                    reference_id=anomaly.id,
                    description="Received placeholder anomaly; not a detected event.",
                ),
                *[
                    Evidence(
                        kind="input_reference",
                        reference_type="conjunction",
                        reference_id=conjunction.id,
                        description="Received placeholder conjunction; no relationship assessed.",
                    )
                    for conjunction in request.orbital_result.conjunctions
                ],
            ]
            diagnoses.append(
                Diagnosis(
                    id=f"fixture:diagnosis:{uuid5(NAMESPACE_URL, request.request_id + anomaly.id)}",
                    anomaly_id=anomaly.id,
                    related_conjunction_ids=[],
                    status="not_assessed",
                    possible_cause=None,
                    evidence=evidence,
                    explanation="Inputs connected by reference only. No correlation or rule ran.",
                )
            )
        return DiagnosisResult(
            request_id=request.request_id,
            satellite_id=request.satellite_id,
            status="not_computed",
            provenance=ResultProvenance(
                kind="fixture", source="foundation:diagnosis-reference-only"
            ),
            notice="Fixture only: inputs received together; no scientific relationship inferred.",
            diagnoses=diagnoses,
        )
