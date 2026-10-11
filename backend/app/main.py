from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.ai.llm import AIInvalidResponseError, AIUnavailableError
from app.api.routes import assessment, auth, health, practice_tests, progress, speaking, study_plan, vocabulary, writing
from app.config import get_settings
from app.core.errors import ApiError


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(title="IELTSMate API", version="0.1.0")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.exception_handler(AIUnavailableError)
    async def _ai_unavailable(_: Request, __: AIUnavailableError) -> JSONResponse:
        return JSONResponse(
            status_code=503,
            content={"code": "ai_unavailable", "message": "The AI coach is offline right now. Please try again shortly."},
        )

    @app.exception_handler(AIInvalidResponseError)
    async def _ai_invalid(_: Request, __: AIInvalidResponseError) -> JSONResponse:
        return JSONResponse(
            status_code=502,
            content={"code": "ai_invalid_response", "message": "The AI coach gave an unusable answer. Please retry."},
        )

    @app.exception_handler(ApiError)
    async def _api_error(_: Request, exc: ApiError) -> JSONResponse:
        return JSONResponse(status_code=exc.status, content={"code": exc.code, "message": exc.message})

    @app.exception_handler(RequestValidationError)
    async def _validation(_: Request, exc: RequestValidationError) -> JSONResponse:
        first = exc.errors()[0] if exc.errors() else {}
        detail = str(first.get("msg", "")).removeprefix("Value error, ")
        return JSONResponse(
            status_code=422,
            content={"code": "validation_error", "message": detail or "Please check what you entered and try again."},
        )

    app.include_router(health.router)
    app.include_router(auth.router)
    app.include_router(assessment.router)
    app.include_router(practice_tests.make_router("reading"))
    app.include_router(practice_tests.make_router("listening"))
    app.include_router(vocabulary.router)
    app.include_router(writing.router)
    app.include_router(speaking.router)
    app.include_router(study_plan.router)
    app.include_router(progress.router)
    return app


app = create_app()
