"""Shared v0.1 wire contracts, not orbital, ML, or diagnosis implementations.

Nullable result values allow references-only fixtures without invented science.
See docs/data-contracts.md for units, invariants, and OPEN DECISION items.
"""

import re
from datetime import datetime, timezone
from typing import Annotated, Literal, Self

from pydantic import (
    AfterValidator,
    AwareDatetime,
    BaseModel,
    BeforeValidator,
    ConfigDict,
    Field,
    model_validator,
)

Identifier = Annotated[str, Field(pattern=r"^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$")]
Text = Annotated[str, Field(min_length=1, max_length=1000)]
Number = Annotated[float, Field(strict=True, allow_inf_nan=False)]
DistanceKm = Annotated[float, Field(strict=True, ge=0, allow_inf_nan=False)]


def require_timestamp(value: object) -> object:
    if isinstance(value, datetime):
        return value
    if not isinstance(value, str) or not re.fullmatch(
        r"\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,6})?(?:Z|[+-]\d{2}:\d{2})", value
    ):
        raise ValueError("Use an RFC3339 timestamp with seconds and an explicit timezone")
    return value


UtcTimestamp = Annotated[
    AwareDatetime,
    BeforeValidator(require_timestamp),
    AfterValidator(lambda value: value.astimezone(timezone.utc)),
]


class ContractModel(BaseModel):
    model_config = ConfigDict(extra="forbid")


class InputProvenance(ContractModel):
    kind: Literal["fixture", "supplied"]
    source: Text


class ResultProvenance(ContractModel):
    kind: Literal["fixture", "calculated", "model_generated", "rule_generated"]
    source: Text


class TimeWindow(ContractModel):
    start: UtcTimestamp
    end: UtcTimestamp

    @model_validator(mode="after")
    def ordered(self) -> Self:
        if self.end <= self.start:
            raise ValueError("window.end must be later than window.start")
        return self


class TleElements(ContractModel):
    """Raw lines only; validation does NOT establish a valid TLE or checksum."""

    format: Literal["tle"]
    line1: Text
    line2: Text


class OmmElements(ContractModel):
    """Uninterpreted flat OMM fields; required orbital fields remain Person 1's work."""

    format: Literal["omm"]
    fields: Annotated[dict[str, str | Number], Field(min_length=1)]


class OrbitalObject(ContractModel):
    object_id: Identifier
    epoch: UtcTimestamp | None
    elements: Annotated[TleElements | OmmElements, Field(discriminator="format")] | None
    display_name: Text | None = None


class OrbitalRequest(ContractModel):
    request_id: Identifier
    provenance: InputProvenance
    target: OrbitalObject
    comparisons: list[OrbitalObject]
    window: TimeWindow

    @model_validator(mode="after")
    def distinct_objects(self) -> Self:
        ids = [self.target.object_id, *(item.object_id for item in self.comparisons)]
        if len(ids) != len(set(ids)):
            raise ValueError("target and comparison object identifiers must be distinct")
        if self.provenance.kind == "supplied":
            for item in [self.target, *self.comparisons]:
                if item.elements is None or item.epoch is None:
                    raise ValueError("supplied orbital records require epoch and elements")
        return self


class Conjunction(ContractModel):
    id: Identifier
    target_id: Identifier
    comparison_id: Identifier
    tca: UtcTimestamp | None
    miss_distance_km: DistanceKm | None

    @model_validator(mode="after")
    def different_objects(self) -> Self:
        if self.target_id == self.comparison_id:
            raise ValueError("a conjunction must reference two different objects")
        return self


class ResultBase(ContractModel):
    request_id: Identifier
    satellite_id: Identifier
    status: Literal["not_computed", "completed"]
    provenance: ResultProvenance
    notice: Text

    @model_validator(mode="after")
    def truthful_status(self) -> Self:
        if (self.status == "not_computed") != (self.provenance.kind == "fixture"):
            raise ValueError("not_computed results must be fixtures; completed results cannot be")
        return self


class OrbitalResult(ResultBase):
    conjunctions: list[Conjunction]

    @model_validator(mode="after")
    def consistent_results(self) -> Self:
        ids = [item.id for item in self.conjunctions]
        if len(ids) != len(set(ids)):
            raise ValueError("conjunction identifiers must be unique within a result")
        for item in self.conjunctions:
            if item.target_id != self.satellite_id:
                raise ValueError("conjunction target must match result satellite_id")
            if self.status == "not_computed":
                if item.tca is not None or item.miss_distance_km is not None:
                    raise ValueError("references-only orbital fixtures must leave results null")
            elif item.tca is None or item.miss_distance_km is None:
                raise ValueError("completed conjunctions require tca and miss_distance_km")
        if self.status == "completed" and self.provenance.kind != "calculated":
            raise ValueError("completed orbital results must be calculated")
        return self


class Signal(ContractModel):
    name: Identifier
    unit: Text


class TelemetrySample(ContractModel):
    timestamp: UtcTimestamp
    values: Annotated[dict[Identifier, Number | None], Field(min_length=1)]


class TelemetryRequest(ContractModel):
    request_id: Identifier
    satellite_id: Identifier
    provenance: InputProvenance
    signals: Annotated[list[Signal], Field(min_length=1)]
    samples: list[TelemetrySample]

    @model_validator(mode="after")
    def declared_signals(self) -> Self:
        names = [item.name for item in self.signals]
        if len(names) != len(set(names)):
            raise ValueError("signal names must be unique")
        for sample in self.samples:
            if set(sample.values) - set(names):
                raise ValueError("all sample values must reference a declared signal")
        return self


class Anomaly(ContractModel):
    id: Identifier
    satellite_id: Identifier
    timestamp: UtcTimestamp
    score: Number | None
    signals: Annotated[list[Identifier], Field(min_length=1)]
    status: Literal["not_evaluated", "anomaly", "normal"]


class TelemetryResult(ResultBase):
    anomalies: list[Anomaly]

    @model_validator(mode="after")
    def consistent_results(self) -> Self:
        ids = [item.id for item in self.anomalies]
        if len(ids) != len(set(ids)):
            raise ValueError("anomaly identifiers must be unique within a result")
        for item in self.anomalies:
            if item.satellite_id != self.satellite_id:
                raise ValueError("anomaly satellite must match result satellite_id")
            if self.status == "not_computed":
                if item.status != "not_evaluated" or item.score is not None:
                    raise ValueError(
                        "references-only telemetry fixtures cannot label or score data"
                    )
            elif item.status == "not_evaluated" or item.score is None:
                raise ValueError("completed anomaly events require an evaluated status and score")
        if self.status == "completed" and self.provenance.kind != "model_generated":
            raise ValueError("completed telemetry results must be model_generated")
        return self


class DiagnosisRequest(ContractModel):
    request_id: Identifier
    satellite_id: Identifier
    orbital_result: OrbitalResult
    telemetry_result: TelemetryResult

    @model_validator(mode="after")
    def same_satellite(self) -> Self:
        if self.orbital_result.satellite_id != self.satellite_id:
            raise ValueError("orbital_result belongs to a different satellite")
        if self.telemetry_result.satellite_id != self.satellite_id:
            raise ValueError("telemetry_result belongs to a different satellite")
        return self


class Evidence(ContractModel):
    kind: Literal["input_reference", "rule"]
    reference_type: Literal["anomaly", "conjunction"]
    reference_id: Identifier
    description: Text


class Diagnosis(ContractModel):
    id: Identifier
    anomaly_id: Identifier
    related_conjunction_ids: list[Identifier]
    status: Literal["not_assessed", "insufficient_evidence", "hypothesis"]
    possible_cause: Text | None
    evidence: list[Evidence]
    explanation: Text


class DiagnosisResult(ResultBase):
    diagnoses: list[Diagnosis]

    @model_validator(mode="after")
    def truthful_diagnosis(self) -> Self:
        ids = [item.id for item in self.diagnoses]
        if len(ids) != len(set(ids)):
            raise ValueError("diagnosis identifiers must be unique within a result")
        for item in self.diagnoses:
            if self.status == "not_computed" and (
                item.status != "not_assessed"
                or item.possible_cause is not None
                or item.related_conjunction_ids
                or any(evidence.kind != "input_reference" for evidence in item.evidence)
            ):
                raise ValueError("diagnosis fixtures cannot assert causes, relations, or rules")
            if self.status == "completed" and item.status == "not_assessed":
                raise ValueError("completed diagnoses require an assessed status")
        if self.status == "completed" and self.provenance.kind != "rule_generated":
            raise ValueError("completed diagnosis results must be rule_generated")
        return self


class HealthResponse(ContractModel):
    status: Literal["ok"] = "ok"
    service: Literal["OCAADS"] = "OCAADS"
    stage: Literal["foundation"] = "foundation"
    engine_mode: Literal["fixture_only"] = "fixture_only"


class ValidationIssue(ContractModel):
    location: list[str | int]
    message: str


class ErrorResponse(ContractModel):
    code: Literal["invalid_request", "not_implemented"]
    message: str
    issues: list[ValidationIssue]
