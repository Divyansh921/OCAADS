"""Person 1's public boundary. Implement this without importing other engines."""

from typing import Protocol

from app.domain.contracts import OrbitalRequest, OrbitalResult


class OrbitalEngine(Protocol):
    def screen(self, request: OrbitalRequest) -> OrbitalResult:
        """Screen validated input, or raise a shared domain error."""
        ...
