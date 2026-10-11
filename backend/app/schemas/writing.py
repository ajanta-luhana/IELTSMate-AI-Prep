from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, Field, field_validator

WritingTask = Literal["academic_task1", "general_task1", "task2"]
MIN_WORDS: dict[str, int] = {"academic_task1": 150, "general_task1": 150, "task2": 250}


def _half(v: float) -> float:
    return int(v * 2 + 0.5) / 2  # nearest half band, half-up


class WritingRequest(BaseModel):
    task_type: WritingTask
    prompt: str | None = Field(default=None, max_length=800)
    essay: str = Field(max_length=10000)

    @field_validator("essay")
    @classmethod
    def _essay(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Please write or paste your essay first.")
        return v

    @field_validator("prompt")
    @classmethod
    def _prompt(cls, v: str | None) -> str | None:
        v = (v or "").strip()
        return v or None


class SentenceFix(BaseModel):
    original: str = Field(min_length=3, max_length=500)
    improved: str = Field(min_length=3, max_length=500)
    explanation: str = Field(max_length=500)


class VocabUpgrade(BaseModel):
    original: str = Field(min_length=1, max_length=80)
    better: str = Field(min_length=1, max_length=120)


def _trim(limit: int):
    """Be lenient about list length (small models over-produce) but strict about content."""

    def inner(v: Any) -> Any:
        return v[:limit] if isinstance(v, list) else v

    return inner


class WritingAIOutput(BaseModel):
    """What the model must return. Validated before anything reaches the student."""

    task_response: float = Field(ge=0, le=9)
    coherence: float = Field(ge=0, le=9)
    vocabulary: float = Field(ge=0, le=9)
    grammar: float = Field(ge=0, le=9)
    summary: str = Field(min_length=1, max_length=800)
    strengths: list[str] = Field(min_length=1)
    improvements: list[str] = Field(min_length=1)
    sentence_fixes: list[SentenceFix] = []
    vocabulary_upgrades: list[VocabUpgrade] = []
    next_band_steps: list[str] = Field(min_length=1)

    _t1 = field_validator("strengths", "improvements", "next_band_steps", mode="before")(_trim(5))
    _t2 = field_validator("sentence_fixes", mode="before")(_trim(5))
    _t3 = field_validator("vocabulary_upgrades", mode="before")(_trim(6))

    @field_validator("task_response", "coherence", "vocabulary", "grammar")
    @classmethod
    def _round(cls, v: float) -> float:
        return _half(v)

    @field_validator("strengths", "improvements", "next_band_steps")
    @classmethod
    def _clean_text(cls, v: list[str]) -> list[str]:
        out = [s.strip()[:400] for s in v if isinstance(s, str) and s.strip()]
        if not out:
            raise ValueError("list must contain text")
        return out


class WritingResult(BaseModel):
    id: str | None = None
    task_type: WritingTask
    prompt: str | None = None
    word_count: int
    min_words: int
    under_length: bool
    overall_score: float
    task_response: float
    coherence: float
    vocabulary: float
    grammar: float
    summary: str
    strengths: list[str]
    improvements: list[str]
    sentence_fixes: list[SentenceFix] = []
    vocabulary_upgrades: list[VocabUpgrade] = []
    next_band_steps: list[str]
    note: str | None = None
    created_at: datetime | None = None
