"""HTTP-only setup. Engine unit tests do not import the application composition."""

import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture
def client():
    try:
        with TestClient(app) as test_client:
            yield test_client
    finally:
        app.dependency_overrides.clear()
