from app.ai.llm import AIProvider, AIUnavailableError


class LocalModelProvider(AIProvider):
    """Placeholder for in-process models (e.g. llama.cpp / transformers). Not implemented in MVP."""

    name = "local"

    async def generate(self, prompt: str, *, system: str | None = None, json_mode: bool = False) -> str:
        raise AIUnavailableError("LocalModelProvider is not implemented yet; use AI_PROVIDER=ollama")

    async def is_available(self) -> bool:
        return False
