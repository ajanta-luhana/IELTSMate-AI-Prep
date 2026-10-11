from fastapi import APIRouter, Depends

from app.ai.factory import get_ai_provider
from app.ai.llm import AIProvider
from app.schemas.common import HealthResponse

router = APIRouter(tags=["health"])


@router.get("/health", response_model=HealthResponse)
async def health(provider: AIProvider = Depends(get_ai_provider)) -> HealthResponse:
    return HealthResponse(status="ok", ai_provider=provider.name, ai_available=await provider.is_available())
