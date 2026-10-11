from app.ai.llm import AIProvider, AIUnavailableError


class CloudProvider(AIProvider):
    """Future hosted provider. Intentionally unimplemented: no paid API is required."""

    name = "cloud"

    async def generate(self, prompt: str, *, system: str | None = None, json_mode: bool = False) -> str:
        raise AIUnavailableError("CloudProvider is not configured")

    async def is_available(self) -> bool:
        return False
