"""Validate a cached six-object dataset and build its request without a network call."""

import hashlib
import json
from datetime import timedelta
from pathlib import Path

from app.domain.contracts import InputProvenance, OrbitalRequest, TimeWindow
from app.domain.errors import OrbitalInputError
from app.orbital.ingest import TleParseError, parse_tle_file
from app.orbital.real import load_snapshot_info

DEFAULT_MANIFEST = (
    Path(__file__).resolve().parents[3]
    / "data" / "orbital" / "validation" / "manifest.json"
)


def load_dataset(manifest_path: Path = DEFAULT_MANIFEST) -> OrbitalRequest:
    try:
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
        snapshot = manifest_path.with_name("stations.tle")
        digest = hashlib.sha256(snapshot.read_bytes()).hexdigest()
        if digest != manifest["snapshot_sha256"]:
            raise OrbitalInputError("Cached orbital snapshot checksum does not match the manifest.")
        records = parse_tle_file(snapshot)
        target_id = manifest["target"]
        comparisons = manifest["comparisons"]
        if (not isinstance(target_id, str) or not isinstance(comparisons, list)
                or not all(isinstance(identifier, str) for identifier in comparisons)):
            raise OrbitalInputError(
                "Snapshot selection must contain a target ID and a list of IDs."
            )
        if len(comparisons) != 5 or len(set([target_id, *comparisons])) != 6:
            raise OrbitalInputError(
                "The validation dataset requires one target and five distinct objects."
            )
        missing = [
            identifier for identifier in [target_id, *comparisons] if identifier not in records
        ]
        if missing:
            raise OrbitalInputError(f"Selected records missing from cached snapshot: {missing}")
        load_snapshot_info(manifest_path)
        # Snapshot-relative replay, never a hidden 'now'. This is not a live prediction.
        start = records[target_id].epoch
        return OrbitalRequest(
            request_id=f"orbital:snapshot:{digest[:16]}",
            provenance=InputProvenance(
                kind="supplied", source=f"{manifest['source']}; SHA256 {digest}"
            ),
            target=records[target_id].as_contract_object(),
            comparisons=[records[identifier].as_contract_object() for identifier in comparisons],
            window=TimeWindow(start=start, end=start + timedelta(days=7)),
        )
    except OrbitalInputError:
        raise
    except (OSError, KeyError, ValueError, TypeError, TleParseError) as exc:
        raise OrbitalInputError(
            "Orbital dataset unavailable or invalid. Prepare the local snapshot with "
            "coding/scripts/fetch_orbital_snapshot.py and inspect its manifest. "
            f"Details: {exc}"
        ) from exc
