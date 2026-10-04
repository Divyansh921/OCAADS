"""Check live HTTP fixture wiring against backend or Vite; never runs real science."""

import argparse
import json
from pathlib import Path
from urllib.request import Request, urlopen

from app.domain.contracts import DiagnosisResult, HealthResponse, OrbitalResult, TelemetryResult

FIXTURES = Path(__file__).resolve().parents[1] / "data" / "fixtures" / "foundation"


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--base-url", default="http://127.0.0.1:8000")
    args = parser.parse_args()

    def call(path: str, payload: dict | None = None) -> dict:
        data = None if payload is None else json.dumps(payload).encode("utf-8")
        request = Request(
            args.base_url.rstrip("/") + path,
            data=data,
            headers={"Content-Type": "application/json"},
        )
        with urlopen(request, timeout=10) as response:
            if response.status != 200:
                raise RuntimeError(f"Unexpected HTTP status: {response.status}")
            return json.load(response)

    def load(name: str) -> dict:
        return json.loads((FIXTURES / f"{name}.json").read_text(encoding="utf-8"))

    health = HealthResponse.model_validate(call("/api/health"))
    orbital = OrbitalResult.model_validate(call("/api/orbital/screen", load("orbital-request")))
    telemetry = TelemetryResult.model_validate(
        call("/api/telemetry/analyze", load("telemetry-request"))
    )
    diagnosis = DiagnosisResult.model_validate(call("/api/diagnosis/assess", {
        "request_id": "fixture:live-check",
        "satellite_id": orbital.satellite_id,
        "orbital_result": orbital.model_dump(mode="json"),
        "telemetry_result": telemetry.model_dump(mode="json"),
    }))
    assert health.engine_mode == "orbital_calculated_telemetry_fixture"
    assert orbital.status == telemetry.status == diagnosis.status == "not_computed"
    assert len(orbital.conjunctions) == len(telemetry.anomalies) == len(diagnosis.diagnoses) == 1
    references = {item.reference_id for item in diagnosis.diagnoses[0].evidence}
    assert references == {orbital.conjunctions[0].id, telemetry.anomalies[0].id}
    print(f"PASS: health and three fixture endpoints at {args.base_url}; references connect.")
    print("No propagation, screening, anomaly scoring, correlation, or diagnosis was performed.")


if __name__ == "__main__":
    main()
