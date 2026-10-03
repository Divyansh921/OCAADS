"""Person 3's public boundary; consumes records, never another engine's internals."""

from typing import Protocol

from app.domain.contracts import DiagnosisRequest, DiagnosisResult


class DiagnosisEngine(Protocol):
    def diagnose(self, request: DiagnosisRequest) -> DiagnosisResult:
        """Assess validated evidence with rules, or raise a shared domain error."""
        ...
