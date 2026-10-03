"""Thin telemetry HTTP adapter; no model or preprocessing is installed here."""

from typing import Annotated

from fastapi import APIRouter, Depends

from app.api.dependencies import get_telemetry_engine
from app.core.http import ERROR_RESPONSES
from app.domain.contracts import TelemetryRequest, TelemetryResult
from app.telemetry.interface import TelemetryEngine

router = APIRouter(prefix="/telemetry", tags=["telemetry"])


@router.post("/analyze", response_model=TelemetryResult, responses=ERROR_RESPONSES,
             operation_id="analyzeTelemetry", summary="Connect a telemetry fixture (no ML)")
def analyze(
    request: TelemetryRequest,
    engine: Annotated[TelemetryEngine, Depends(get_telemetry_engine)],
) -> TelemetryResult:
    return engine.analyze(request)
