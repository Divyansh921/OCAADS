"""Shared engine errors, independent of FastAPI and HTTP."""


class EngineNotImplementedError(Exception):
    """The installed fixture adapter cannot execute a real computation."""


class OrbitalInputError(ValueError):
    """An orbital request cannot be processed under the selected rules."""
