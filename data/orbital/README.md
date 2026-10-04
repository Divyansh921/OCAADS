# Orbital snapshots

Local cache for original TLE/OMM files. The first calculated slice reads `validation/stations.tle` and `validation/manifest.json`. The manifest declares the endpoint, SHA-256, save/retrieval timestamps, one target, and five comparison IDs. Downloads here are ignored by version control.

Run `coding/scripts/fetch_orbital_snapshot.py` using the installed backend Python (from `coding/backend/`: `.venv/bin/python ../scripts/fetch_orbital_snapshot.py`) for a deliberate refresh, then restart the backend. The command makes one request and fails if a selected ID is missing. Tests and the API do not refresh data automatically.

The existing local six-record excerpt was captured before this session. Its exact retrieval timestamp is unknown (`retrieved_at: null`); `snapshot_saved_at` is the recorded save time, and the checksum covers the saved excerpt. Preserve that distinction. `GET /api/orbital/dataset` constructs the seven-day replay request from the target epoch; `request.json` is not read by the API.
