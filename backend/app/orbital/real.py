"""Public orbital engine implementation for the first TLE validation slice."""

import hashlib
import json
import re
from datetime import datetime, timezone
from pathlib import Path

from app.domain.contracts import OrbitalRequest, OrbitalResult
from app.domain.errors import OrbitalInputError
from app.orbital.ingest import parse_tle_file
from app.orbital.propagation import PropagationError
from app.orbital.screening import ScreeningConfig, SnapshotInfo, screen_request


class TleOrbitalEngine:
    """Run the locked TLE/SGP4 screening method on validated request records."""

    def __init__(self, snapshot: SnapshotInfo, config: ScreeningConfig = ScreeningConfig(),
                 snapshot_path: Path | None = None,
                 selection: OrbitalRequest | None = None) -> None:
        self._snapshot = snapshot
        self._config = config
        self._snapshot_path = snapshot_path
        self._selection = selection

    def screen(self, request: OrbitalRequest) -> OrbitalResult:
        if request.provenance.kind != "supplied":
            raise OrbitalInputError(
                "TLE calculation requires explicitly supplied input provenance."
            )
        if self._selection is not None and (
            request.target.object_id != self._selection.target.object_id
            or {obj.object_id for obj in request.comparisons}
            != {obj.object_id for obj in self._selection.comparisons}
        ):
            raise OrbitalInputError("Request objects must match the local manifest's selection.")
        if self._snapshot_path is not None:
            try:
                digest = hashlib.sha256(self._snapshot_path.read_bytes()).hexdigest()
                if digest != self._snapshot.snapshot_sha256:
                    raise OrbitalInputError(
                        "Configured snapshot checksum has changed; reload its manifest."
                    )
                records = parse_tle_file(self._snapshot_path)
                for obj in [request.target, *request.comparisons]:
                    cached = records.get(obj.object_id)
                    if (cached is None or obj.elements is None or obj.elements.format != "tle"
                            or obj.elements.line1 != cached.line1
                            or obj.elements.line2 != cached.line2 or obj.epoch != cached.epoch):
                        raise OrbitalInputError(
                            "This first-slice API accepts only verified records "
                            "from its local snapshot, including their epochs."
                        )
            except OrbitalInputError:
                raise
            except (OSError, ValueError) as exc:
                raise OrbitalInputError(
                    f"Configured orbital snapshot is unreadable: {exc}"
                ) from exc
        try:
            return screen_request(request, self._snapshot, self._config)
        except PropagationError as exc:
            raise OrbitalInputError(str(exc)) from exc


def load_snapshot_info(manifest_path: Path) -> SnapshotInfo:
    """Load and validate provenance without fetching or modifying the snapshot."""

    try:
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
        source = manifest["source"]
        retrieved_raw = manifest.get("retrieved_at")
        retrieved_at = (
            datetime.fromisoformat(retrieved_raw.replace("Z", "+00:00"))
            if retrieved_raw
            else None
        )
        recorded_at = datetime.fromisoformat(
            manifest["snapshot_saved_at"].replace("Z", "+00:00")
        )
        checksum = manifest["snapshot_sha256"]
    except (OSError, ValueError, KeyError, TypeError, AttributeError) as exc:
        raise ValueError(f"invalid orbital snapshot manifest {manifest_path}: {exc}") from exc
    if retrieved_at is not None and retrieved_at.tzinfo is None:
        raise ValueError("orbital snapshot retrieval timestamp must include a timezone")
    if recorded_at.tzinfo is None:
        raise ValueError("orbital snapshot recorded timestamp must include a timezone")
    if not isinstance(source, str) or not source:
        raise ValueError("orbital snapshot manifest source must be non-empty")
    if not isinstance(checksum, str) or not re.fullmatch(r"[0-9a-f]{64}", checksum):
        raise ValueError("orbital snapshot manifest must contain a lowercase SHA-256 checksum")
    return SnapshotInfo(
        source_endpoint=source,
        retrieved_at=(retrieved_at.astimezone(timezone.utc) if retrieved_at else None),
        recorded_at=recorded_at.astimezone(timezone.utc),
        snapshot_sha256=checksum,
    )
