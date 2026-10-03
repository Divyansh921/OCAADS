"""Shared engine errors, independent of FastAPI and HTTP."""


class EngineNotImplementedError(Exception):
    """The installed fixture adapter cannot execute a real computation."""
