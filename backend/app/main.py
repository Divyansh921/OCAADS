"""FastAPI integration boundary. Importing the app performs no scientific work."""

from fastapi import FastAPI

from app.api.diagnosis import router as diagnosis_router
from app.api.health import health
from app.api.health import router as health_router
from app.api.orbital import router as orbital_router
from app.api.telemetry import router as telemetry_router
from app.core.http import register_error_handlers
from app.domain.contracts import HealthResponse

app = FastAPI(
    title="OCAADS Foundation API",
    version="0.1.0",
    description=(
        "Team development foundation. All engine adapters are references-only fixtures. "
        "No orbital calculations, ML, correlation, or diagnosis are implemented."
    ),
    separate_input_output_schemas=False,
)
register_error_handlers(app)
for router in (health_router, orbital_router, telemetry_router, diagnosis_router):
    app.include_router(router, prefix="/api")

# Preserve the previous health URL without advertising two canonical contracts.
app.add_api_route("/health", health, response_model=HealthResponse, include_in_schema=False)
