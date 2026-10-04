"""Check cached six-object screening over live HTTP, directly or through Vite."""

import argparse
import json
from urllib.request import Request, urlopen

from app.domain.contracts import OrbitalRequest, OrbitalResult


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--base-url", default="http://127.0.0.1:8000")
    args = parser.parse_args()

    def call(path: str, payload: dict | None = None) -> dict:
        request = Request(
            args.base_url.rstrip("/") + path,
            data=None if payload is None else json.dumps(payload).encode("utf-8"),
            headers={"Accept": "application/json", "Content-Type": "application/json"},
        )
        with urlopen(request, timeout=120) as response:
            if response.status != 200:
                raise RuntimeError(f"Unexpected HTTP status: {response.status}")
            return json.load(response)

    dataset = OrbitalRequest.model_validate(call("/api/orbital/dataset"))
    result = OrbitalResult.model_validate(
        call("/api/orbital/screen", dataset.model_dump(mode="json"))
    )
    assert dataset.provenance.kind == "supplied" and len(dataset.comparisons) == 5
    assert result.request_id == dataset.request_id
    assert result.satellite_id == dataset.target.object_id
    assert result.status == "completed" and result.provenance.kind == "calculated"
    assert result.metadata is not None and result.metadata.window == dataset.window
    assert result.metadata.frame == "TEME" and result.metadata.gravity_model == "WGS72"
    assert result.metadata.sample_interval_seconds == 10.0
    assert result.metadata.tca_refinement_seconds == 1.0
    assert result.metadata.screening_threshold_km == 10.0
    selected = {obj.object_id for obj in dataset.comparisons}
    assert all(item.comparison_id in selected for item in result.conjunctions)
    print(f"PASS: calculated orbital flow at {args.base_url}.")
    print(f"Target: {result.satellite_id}; comparisons: {len(dataset.comparisons)}.")
    print(f"Result: {result.screening_status}; candidates: {len(result.conjunctions)}.")
    print(f"Snapshot SHA-256: {result.metadata.snapshot_sha256}")
    print("Cached historical replay, not live prediction or collision probability.")


if __name__ == "__main__":
    main()
