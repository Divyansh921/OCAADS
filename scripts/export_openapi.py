"""Export/check the API contract without starting a server or calling engines."""

import argparse
import json
from pathlib import Path

from app.main import app

OUTPUT = Path(__file__).resolve().parents[1] / "contracts" / "openapi.json"


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="Fail on drift; do not rewrite files")
    args = parser.parse_args()
    expected = json.dumps(app.openapi(), indent=2, sort_keys=True) + "\n"
    if args.check:
        if not OUTPUT.exists() or OUTPUT.read_text(encoding="utf-8") != expected:
            raise SystemExit(
                "OpenAPI snapshot is stale. Run export_openapi.py and regenerate TS types."
            )
        print("OpenAPI snapshot matches the backend contracts.")
    else:
        OUTPUT.write_text(expected, encoding="utf-8")
        print(f"Exported {OUTPUT}")


if __name__ == "__main__":
    main()
