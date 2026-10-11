import httpx

from app.ai.llm import AIProvider, AIUnavailableError


class OllamaProvider(AIProvider):
    name = "ollama"

    def __init__(self, base_url: str, model: str, timeout: float = 90) -> None:
        self.base_url = base_url.rstrip("/")
        self.model = model
        self.timeout = timeout

    async def generate(self, prompt: str, *, system: str | None = None, json_mode: bool = False) -> str:
        payload: dict = {
            "model": self.model,
            "prompt": prompt,
            "stream": False,
            "options": {"temperature": 0.2},
        }
        if system:
            payload["system"] = system
        if json_mode:
            payload["format"] = "json"
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                resp = await client.post(f"{self.base_url}/api/generate", json=payload)
                resp.raise_for_status()
                return resp.json().get("response", "")
        except (httpx.HTTPError, ValueError) as exc:
            raise AIUnavailableError(f"Ollama request failed: {exc}") from exc

    async def is_available(self) -> bool:
        try:
            async with httpx.AsyncClient(timeout=3) as client:
                return (await client.get(f"{self.base_url}/api/tags")).status_code == 200
        except httpx.HTTPError:
            return False
