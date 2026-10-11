from pydantic import BaseModel


class ErrorResponse(BaseModel):
    code: str
    message: str


class HealthResponse(BaseModel):
    status: str
    ai_provider: str
    ai_available: bool
