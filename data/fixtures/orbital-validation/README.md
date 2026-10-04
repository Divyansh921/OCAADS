# Orbital validation snapshot — local engineering fixture

This folder contains the six-record TLE snapshot used by the first orbital engineering slice:

- target: ISS (ZARYA), NORAD 25544;
- comparisons: 49271, 66052, 66906, 67683, 67685.

The records were observed from the CelesTrak GP `stations` TLE endpoint during the decision phase on 2026-10-03 UTC. This is a **time-specific validation fixture**, not a live feed and not an operational catalog. TLE epochs appear in the source lines and `request.json`. The manifest records the saved excerpt's checksum and save time; its retrieval time is unknown (`null`). Tests read this frozen input without calling the network.

Before publishing or redistributing this raw snapshot, review the provider's current usage policy and any applicable data terms. The reproducible fetch command is `coding/scripts/fetch_orbital_snapshot.py`; it stops on non-200 responses and records a checksum. Do not silently replace records or use a newer snapshot while claiming the same test input.

The engine's scientific output remains a screening estimate: TLE/SGP4 elements age, the first grid is sampled every 10 seconds, and local TCA refinement is limited to a one-second bracket. A candidate below 10 km is not collision probability or an operational warning.
