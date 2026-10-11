"""AI provider abstraction.

The rest of the app depends only on `AIProvider` / `generate_structured`, never on a
specific model or vendor. Swap providers via the AI_PROVIDER environment variable.
"""
from __future__ import annotations

import json
import re
from abc import ABC, abstractmethod
from typing import TypeVar

from pydantic import BaseModel, ValidationError

T = TypeVar("T", bound=BaseModel)


class AIError(Exception):
    """Base class for AI-layer failures."""


class AIUnavailableError(AIError):
    """The model/provider cannot be reached or timed out."""


class AIInvalidResponseError(AIError):
    """The model answered, but not with valid structured output."""


class AIProvider(ABC):
    name: str = "base"

    @abstractmethod
    async def generate(self, prompt: str, *, system: str | None = None, json_mode: bool = False) -> str:
        """Return the raw model text. Raise AIUnavailableError on connectivity/timeouts."""

    @abstractmethod
    async def is_available(self) -> bool:
        """Cheap health check; must never raise."""


_FENCE = re.compile(r"^```(?:json)?\s*|\s*```$", re.IGNORECASE)
_THINK = re.compile(r"<think>.*?</think>", re.DOTALL | re.IGNORECASE)  # reasoning models (e.g. qwen3) may emit this


def extract_json(text: str) -> dict:
    """Parse a JSON object from model text, tolerating code fences and surrounding prose."""
    cleaned = _FENCE.sub("", _THINK.sub("", text).strip())
    try:
        value = json.loads(cleaned)
    except json.JSONDecodeError:
        start, end = cleaned.find("{"), cleaned.rfind("}")
        if start == -1 or end <= start:
            raise AIInvalidResponseError("Model response contained no JSON object") from None
        try:
            value = json.loads(cleaned[start : end + 1])
        except json.JSONDecodeError as exc:
            raise AIInvalidResponseError(f"Model response was not valid JSON: {exc}") from exc
    if not isinstance(value, dict):
        raise AIInvalidResponseError("Model JSON must be an object")
    return value


async def generate_structured(
    provider: AIProvider,
    prompt: str,
    schema: type[T],
    *,
    system: str | None = None,
    retries: int = 1,
) -> T:
    """Call the model and validate its output against a Pydantic schema.

    On invalid output, retry (up to `retries`) with the validation error appended.
    """
    attempt_prompt = prompt
    last_error: Exception | None = None
    for _ in range(retries + 1):
        raw = await provider.generate(attempt_prompt, system=system, json_mode=True)
        try:
            return schema.model_validate(extract_json(raw))
        except (AIInvalidResponseError, ValidationError) as exc:
            last_error = exc
            attempt_prompt = (
                f"{prompt}\n\nYour previous reply was invalid ({exc}). "
                "Reply again with ONLY a JSON object matching the required schema."
            )
    raise AIInvalidResponseError(f"Model output failed validation: {last_error}")
