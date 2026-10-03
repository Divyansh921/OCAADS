"""Liveness only; the response explicitly identifies fixture-only engine mode."""

from fastapi import APIRouter

from app.domain.contracts import HealthResponse

router = APIRouter()


@router.get("/health", response_model=HealthResponse, tags=["health"], operation_id="health")
def health() -> HealthResponse:
    return HealthResponse()
