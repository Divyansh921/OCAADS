"""Thin diagnosis HTTP adapter; no correlation or diagnosis rules run here."""

from typing import Annotated

from fastapi import APIRouter, Depends

from app.api.dependencies import get_diagnosis_engine
from app.core.http import ERROR_RESPONSES
from app.diagnosis.interface import DiagnosisEngine
from app.domain.contracts import DiagnosisRequest, DiagnosisResult

router = APIRouter(prefix="/diagnosis", tags=["diagnosis"])


@router.post("/assess", response_model=DiagnosisResult, responses=ERROR_RESPONSES,
             operation_id="assessDiagnosis", summary="Connect fixture evidence (no diagnosis)")
def assess(
    request: DiagnosisRequest,
    engine: Annotated[DiagnosisEngine, Depends(get_diagnosis_engine)],
) -> DiagnosisResult:
    return engine.diagnose(request)
