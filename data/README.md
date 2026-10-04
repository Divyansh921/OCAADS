# OCAADS data locations

The orbital validation slice uses a local six-object CelesTrak TLE excerpt and checksum/time manifest. No telemetry dataset is selected. The examples under `fixtures/foundation/` remain explicitly non-scientific references.

| Folder | Purpose | Version-control policy |
| --- | --- | --- |
| `orbital/` | Cached TLE snapshot used by calculated screening — Person 1 | Local, ignored except README |
| `telemetry/` | Raw telemetry datasets, when selected — Person 2 | Local, ignored except README |
| `space-weather/` | Existing optional-context location, not connected | Local, ignored except README |
| `fixtures/` | Small reviewed contract/test examples and later offline inputs | Tracked after review |
| `processed/` | Rebuildable results/intermediates, none computed yet | Local, ignored except README |

The existing orbital/telemetry folders already serve the raw-data purpose, so a duplicate `raw/` layer was not added. Keep originals separate from generated outputs.

`fixtures/foundation/` contains invented identifiers, arbitrary explicitly zoned timestamps, and null measurements/results. It is not the eventual offline scientific dataset. Those examples are shared; coordinate changes with producers and consumers.

For real inputs record source, retrieval time (UTC), license, version, checksum, time range, columns, units, frame where applicable, and real/synthetic status. Never commit credentials or private telemetry. The first orbital choices are locked in [scientific decisions](../../docs/scientific-decisions.md); telemetry and larger-scale choices remain [open](../../docs/mvp-contract.md).
