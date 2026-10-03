"""HTTP translation of shared errors; engine packages do not depend on FastAPI."""

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from app.domain.contracts import ErrorResponse, ValidationIssue
from app.domain.errors import EngineNotImplementedError

ERROR_RESPONSES = {
    422: {"model": ErrorResponse, "description": "Invalid request or inconsistent references."},
    501: {"model": ErrorResponse, "description": "Real engines are not implemented."},
}


def register_error_handlers(app: FastAPI) -> None:
    @app.exception_handler(RequestValidationError)
    async def validation_error(request: Request, exc: RequestValidationError) -> JSONResponse:
        # Do not echo submitted raw records or telemetry values in error responses.
        payload = ErrorResponse(
            code="invalid_request",
            message="Request does not match the OCAADS contract.",
            issues=[
                ValidationIssue(location=list(error["loc"]), message=error["msg"])
                for error in exc.errors()
            ],
        )
        return JSONResponse(status_code=422, content=payload.model_dump(mode="json"))

    @app.exception_handler(EngineNotImplementedError)
    async def not_implemented(request: Request, exc: EngineNotImplementedError) -> JSONResponse:
        payload = ErrorResponse(code="not_implemented", message=str(exc), issues=[])
        return JSONResponse(status_code=501, content=payload.model_dump(mode="json"))
