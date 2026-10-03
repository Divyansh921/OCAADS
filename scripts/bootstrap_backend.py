"""Create only a local backend venv, including pip when system ensurepip is absent.

Uses a pinned pip wheel from PyPI and verifies its published SHA-256. No sudo,
system packages, global Python changes, or application dependencies are installed.
"""

import hashlib
import json
import os
import subprocess
import tempfile
import venv
from pathlib import Path
from urllib.request import urlopen

BACKEND = Path(__file__).resolve().parents[1] / "backend"
ENVIRONMENT = BACKEND / ".venv"
PIP_VERSION = "25.3"


def main() -> None:
    if not (ENVIRONMENT / "pyvenv.cfg").exists():
        if ENVIRONMENT.exists():
            raise SystemExit("Refusing to replace an existing non-venv .venv directory.")
        venv.EnvBuilder(with_pip=False).create(ENVIRONMENT)

    python = ENVIRONMENT / ("Scripts/python.exe" if os.name == "nt" else "bin/python")
    subprocess.run(
        [str(python), "-c", "import sys; assert sys.prefix != sys.base_prefix"], check=True
    )
    if subprocess.run([str(python), "-m", "pip", "--version"], capture_output=True).returncode:
        with urlopen(f"https://pypi.org/pypi/pip/{PIP_VERSION}/json", timeout=30) as response:
            metadata = json.load(response)
        filename = f"pip-{PIP_VERSION}-py3-none-any.whl"
        wheel = next(item for item in metadata["urls"] if item["filename"] == filename)
        if not wheel["url"].startswith("https://files.pythonhosted.org/"):
            raise SystemExit("Unexpected package download host.")
        with urlopen(wheel["url"], timeout=30) as response:
            payload = response.read()
        if hashlib.sha256(payload).hexdigest() != wheel["digests"]["sha256"]:
            raise SystemExit("pip wheel checksum mismatch; nothing was installed.")
        with tempfile.TemporaryDirectory(prefix="ocaads-pip-") as temporary:
            archive = Path(temporary) / filename
            archive.write_bytes(payload)
            env = {**os.environ, "PYTHONPATH": str(archive), "PIP_REQUIRE_VIRTUALENV": "true"}
            subprocess.run(
                [str(python), "-m", "pip", "install", "--no-deps", str(archive)],
                env=env,
                check=True,
            )
    print(f"Local environment ready: {ENVIRONMENT}")
    print("Next: follow docs/development.md to install backend development dependencies.")


if __name__ == "__main__":
    main()
