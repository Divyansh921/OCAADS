"""Thin orbital HTTP adapter; no scientific logic belongs here."""

from typing import Annotated

from fastapi import APIRouter, Depends

from app.api.dependencies import get_orbital_engine
from app.core.http import ERROR_RESPONSES
from app.domain.contracts import OrbitalRequest, OrbitalResult
from app.orbital.interface import OrbitalEngine

router = APIRouter(prefix="/orbital", tags=["orbital"])


@router.post("/screen", response_model=OrbitalResult, responses=ERROR_RESPONSES,
             operation_id="screenOrbital", summary="Connect an orbital fixture (no calculation)")
def screen(
    request: OrbitalRequest,
    engine: Annotated[OrbitalEngine, Depends(get_orbital_engine)],
) -> OrbitalResult:
    return engine.screen(request)
