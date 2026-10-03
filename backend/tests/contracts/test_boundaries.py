"""An engine must be importable without importing HTTP, other engines, or ML tools."""

import subprocess
import sys

import pytest


@pytest.mark.parametrize("component", ["orbital", "telemetry", "diagnosis"])
def test_engine_imports_are_independent(component):
    others = {"orbital", "telemetry", "diagnosis"} - {component}
    code = (
        f"import app.{component}.interface, app.{component}.fixture\n"
        "import sys\n"
        "assert 'fastapi' not in sys.modules\n"
        "assert 'sgp4' not in sys.modules and 'sklearn' not in sys.modules\n"
        + "\n".join(f"assert 'app.{other}' not in sys.modules" for other in sorted(others))
    )
    subprocess.run([sys.executable, "-c", code], check=True, timeout=30)
