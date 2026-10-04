"""Thin orbital HTTP adapter; no scientific logic belongs here."""

from typing import Annotated

from fastapi import APIRouter, Depends

from app.api.dependencies import get_orbital_engine
from app.core.http import ERROR_RESPONSES
from app.domain.contracts import OrbitalRequest, OrbitalResult
from app.orbital.dataset import load_dataset
from app.orbital.interface import OrbitalEngine

router = APIRouter(prefix="/orbital", tags=["orbital"])


@router.get("/dataset", response_model=OrbitalRequest, responses=ERROR_RESPONSES,
            operation_id="getOrbitalDataset", summary="Load verified local six-object TLE input")
def dataset() -> OrbitalRequest:
    return load_dataset()


@router.post(
    "/screen", response_model=OrbitalResult, responses=ERROR_RESPONSES,
    operation_id="screenOrbital", summary="Screen TLE inputs with SGP4; not collision probability",
)
def screen(
    request: OrbitalRequest,
    engine: Annotated[OrbitalEngine, Depends(get_orbital_engine)],
) -> OrbitalResult:
    return engine.screen(request)
