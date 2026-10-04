"""Fetch one cached CelesTrak TLE snapshot for the first orbital slice.

This command is deliberately manual and bounded. It makes one request, stops on
non-200 responses, validates the six selected IDs, and writes a checksum manifest.
It does not run during tests and does not silently substitute objects.
"""

import hashlib
import json
import tempfile
from datetime import datetime, timezone
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from app.orbital.ingest import parse_tle_text

SOURCE = "https://celestrak.org/NORAD/elements/gp.php?GROUP=stations&FORMAT=TLE"
OUTPUT_DIR = Path(__file__).resolve().parents[1] / "data" / "orbital" / "validation"
SNAPSHOT = OUTPUT_DIR / "stations.tle"
MANIFEST = OUTPUT_DIR / "manifest.json"
SELECTED = [
    "norad:25544",
    "norad:49271",
    "norad:66052",
    "norad:66906",
    "norad:67683",
    "norad:67685",
]


def main() -> None:
    request = Request(SOURCE, headers={"User-Agent": "OCAADS-orbital-validation/0.1"})
    try:
        with urlopen(request, timeout=30) as response:
            if response.status != 200:
                raise SystemExit(f"CelesTrak returned HTTP {response.status}; no snapshot written.")
            payload = response.read()
    except HTTPError as exc:
        raise SystemExit(f"CelesTrak returned HTTP {exc.code}; no snapshot written.") from exc
    except (URLError, TimeoutError) as exc:
        raise SystemExit(f"CelesTrak fetch failed; no snapshot written: {exc}") from exc
    digest = hashlib.sha256(payload).hexdigest()
    try:
        records = parse_tle_text(payload.decode("ascii"))
    except (UnicodeError, ValueError) as exc:
        raise SystemExit(
            f"Downloaded snapshot failed TLE validation; no snapshot written: {exc}"
        ) from exc
    missing = [object_id for object_id in SELECTED if object_id not in records]
    if missing:
        raise SystemExit(f"Selected IDs missing from snapshot; no substitution allowed: {missing}")

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile("wb", dir=OUTPUT_DIR, delete=False) as temporary:
        temporary.write(payload)
        temporary_path = Path(temporary.name)
    temporary_path.replace(SNAPSHOT)
    timestamp = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
    manifest = {
        "source": SOURCE,
        "format": "TLE",
        "retrieved_at": timestamp,
        "snapshot_saved_at": timestamp,
        "snapshot_sha256": digest,
        "target": SELECTED[0],
        "comparisons": SELECTED[1:],
        "record_count": len(records),
        "status": "cached_source_snapshot_not_operational_data",
    }
    MANIFEST.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    print(f"Saved {SNAPSHOT} ({len(payload)} bytes, {len(records)} records).")
    print(f"SHA-256: {digest}")
    print(f"Manifest: {MANIFEST}")
    print("Tests must use a cached snapshot and must not call CelesTrak.")


if __name__ == "__main__":
    main()
