# OCAADS data locations

No real satellite or telemetry dataset has been added. The only supplied examples are explicitly non-scientific contract fixtures under `fixtures/foundation/`.

| Folder | Purpose | Version-control policy |
| --- | --- | --- |
| `orbital/` | Raw/downloaded TLE/OMM snapshots, when selected — Person 1 | Local, ignored except README |
| `telemetry/` | Raw telemetry datasets, when selected — Person 2 | Local, ignored except README |
| `space-weather/` | Existing optional-context location, not connected | Local, ignored except README |
| `fixtures/` | Small reviewed contract/test examples and later offline inputs | Tracked after review |
| `processed/` | Rebuildable results/intermediates, none computed yet | Local, ignored except README |

The existing orbital/telemetry folders already serve the raw-data purpose, so a duplicate `raw/` layer was not added. Keep originals separate from generated outputs.

`fixtures/foundation/` contains invented identifiers, arbitrary explicitly zoned timestamps, and null measurements/results. It is not the eventual offline scientific dataset. Those examples are shared; coordinate changes with producers and consumers.

For future real inputs record source, retrieval time (UTC), license, version, checksum, time range, columns, units, frame where applicable, and real/synthetic status. Never commit credentials or private telemetry. Target satellite and scientific conventions remain [open decisions](../../docs/mvp-contract.md).
