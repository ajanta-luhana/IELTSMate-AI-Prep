from functools import lru_cache

from app.ai.llm import AIProvider
from app.ai.providers.cloud import CloudProvider
from app.ai.providers.local import LocalModelProvider
from app.ai.providers.ollama import OllamaProvider
from app.config import get_settings


@lru_cache
def get_ai_provider() -> AIProvider:
    s = get_settings()
    if s.ai_provider == "ollama":
        return OllamaProvider(s.ollama_base_url, s.model_name, s.ai_timeout_seconds)
    if s.ai_provider == "local":
        return LocalModelProvider()
    if s.ai_provider == "cloud":
        return CloudProvider(s.ai_timeout_seconds)
    raise ValueError(f"Unknown AI_PROVIDER: {s.ai_provider!r}")
