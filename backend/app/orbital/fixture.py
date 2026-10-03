"""References-only fixture. NO parsing, propagation, distance, TCA, or ranking."""

from uuid import NAMESPACE_URL, uuid5

from app.domain.contracts import Conjunction, OrbitalRequest, OrbitalResult, ResultProvenance
from app.domain.errors import EngineNotImplementedError


class FixtureOrbitalEngine:
    def screen(self, request: OrbitalRequest) -> OrbitalResult:
        if request.provenance.kind != "fixture":
            raise EngineNotImplementedError("Orbital calculations are not implemented.")
        # One placeholder connects identifiers only; it is NOT a detected conjunction.
        references = []
        if request.comparisons:
            references.append(
                Conjunction(
                    id=f"fixture:conjunction:{uuid5(NAMESPACE_URL, request.request_id)}",
                    target_id=request.target.object_id,
                    comparison_id=request.comparisons[0].object_id,
                    tca=None,
                    miss_distance_km=None,
                )
            )
        return OrbitalResult(
            request_id=request.request_id,
            satellite_id=request.target.object_id,
            status="not_computed",
            provenance=ResultProvenance(kind="fixture", source="foundation:orbital-reference-only"),
            notice="Fixture only: identifiers connected; no screening or orbital calculation ran.",
            conjunctions=references,
        )
