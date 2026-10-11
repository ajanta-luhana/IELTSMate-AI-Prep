import os

import httpx

from app.ai.llm import AIProvider, AIUnavailableError


class CloudProvider(AIProvider):
    """Hosted provider for any OpenAI-compatible chat API (Groq, OpenRouter, etc.).

    Configured through environment variables:
      CLOUD_API_KEY   (required, keep it secret)
      CLOUD_MODEL     (required, model id from your provider)
      CLOUD_BASE_URL  (optional, defaults to Groq's OpenAI-compatible endpoint)
    """

    name = "cloud"

    def __init__(self, timeout: float = 90) -> None:
        self.api_key = os.getenv("CLOUD_API_KEY", "").strip()
        self.model = os.getenv("CLOUD_MODEL", "").strip()
        self.base_url = os.getenv("CLOUD_BASE_URL", "https://api.groq.com/openai/v1").strip().rstrip("/")
        self.timeout = timeout

    async def generate(self, prompt: str, *, system: str | None = None, json_mode: bool = False) -> str:
        if not self.api_key or not self.model:
            raise AIUnavailableError("CloudProvider is not configured (set CLOUD_API_KEY and CLOUD_MODEL)")

        system_text = system or ""
        if json_mode:
            system_text = (system_text + "\nRespond with valid JSON only.").strip()

        messages = []
        if system_text:
            messages.append({"role": "system", "content": system_text})
        messages.append({"role": "user", "content": prompt})

        payload: dict = {"model": self.model, "messages": messages, "temperature": 0.2}
        if json_mode:
            payload["response_format"] = {"type": "json_object"}

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                resp = await client.post(
                    f"{self.base_url}/chat/completions",
                    json=payload,
                    headers={"Authorization": f"Bearer {self.api_key}"},
                )
                resp.raise_for_status()
                return resp.json()["choices"][0]["message"]["content"] or ""
        except (httpx.HTTPError, KeyError, IndexError, ValueError) as exc:
            raise AIUnavailableError(f"Cloud AI request failed: {exc}") from exc

    async def is_available(self) -> bool:
        return bool(self.api_key and self.model)
