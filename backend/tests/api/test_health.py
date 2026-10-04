"""API liveness and honest foundation status, not scientific readiness."""


def test_health_reports_active_engine_mode(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {
        "status": "ok",
        "service": "OCAADS",
        "stage": "foundation",
        "engine_mode": "orbital_calculated_telemetry_fixture",
    }


def test_old_health_url_remains_a_compatible_alias(client):
    assert client.get("/health").json() == client.get("/api/health").json()


def test_only_canonical_api_paths_are_documented(client):
    response = client.get("/openapi.json")
    assert response.status_code == 200
    assert set(response.json()["paths"]) == {
        "/api/health", "/api/orbital/dataset", "/api/orbital/screen",
        "/api/telemetry/analyze", "/api/diagnosis/assess"
    }


def test_old_unimplemented_workflow_does_not_return_fake_results(client):
    assert client.post("/screenings", json={}).status_code == 404
