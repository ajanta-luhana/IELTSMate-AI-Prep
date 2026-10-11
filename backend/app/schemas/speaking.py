from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, Field, field_validator

SpeakingMode = Literal["confidence", "practice", "mock"]


class SessionStart(BaseModel):
    mode: SpeakingMode


class SpeakingQuestion(BaseModel):
    id: str
    part: Literal[1, 2, 3]
    text: str
    points: list[str] = []
    prep_seconds: int = 0
    speak_seconds: int


class SessionResponse(BaseModel):
    mode: SpeakingMode
    questions: list[SpeakingQuestion]


class TranscribeResponse(BaseModel):
    transcript: str
    duration_seconds: float | None = None


class EvaluateRequest(BaseModel):
    mode: SpeakingMode
    part: Literal[1, 2, 3]
    question: str = Field(min_length=3, max_length=600)
    transcript: str = Field(max_length=6000)
    duration_seconds: float | None = Field(default=None, ge=0, le=900)

    @field_validator("transcript")
    @classmethod
    def _t(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("We didn't catch any speech. Please try recording again, or type your answer.")
        return v


class Mistake(BaseModel):
    said: str = Field(min_length=2, max_length=300)
    better: str = Field(min_length=2, max_length=300)
    explanation: str = Field(max_length=400)


def _trim(limit: int):
    def inner(v: Any) -> Any:
        return v[:limit] if isinstance(v, list) else v

    return inner


def _half(v: float) -> float:
    return int(v * 2 + 0.5) / 2


class SpeakingAIOutput(BaseModel):
    """What the model must return. Validated before it reaches the student."""

    fluency: float = Field(ge=0, le=9)
    vocabulary: float = Field(ge=0, le=9)
    grammar: float = Field(ge=0, le=9)
    coherence: float = Field(ge=0, le=9)
    summary: str = Field(min_length=1, max_length=700)
    strengths: list[str] = Field(min_length=1)
    improvements: list[str] = Field(min_length=1)
    mistakes: list[Mistake] = []
    better_answer: str = Field(default="", max_length=900)

    _a = field_validator("strengths", "improvements", mode="before")(_trim(4))
    _b = field_validator("mistakes", mode="before")(_trim(4))

    @field_validator("fluency", "vocabulary", "grammar", "coherence")
    @classmethod
    def _round(cls, v: float) -> float:
        return _half(v)

    @field_validator("strengths", "improvements")
    @classmethod
    def _clean(cls, v: list[str]) -> list[str]:
        out = [s.strip()[:350] for s in v if isinstance(s, str) and s.strip()]
        if not out:
            raise ValueError("list must contain text")
        return out


class SpeakingStats(BaseModel):
    word_count: int
    words_per_minute: float | None = None
    filler_count: int
    fillers: list[str] = []


class SpeakingResult(BaseModel):
    id: str | None = None
    mode: SpeakingMode
    part: Literal[1, 2, 3]
    question: str
    transcript: str
    overall_score: float
    fluency: float
    vocabulary: float
    grammar: float
    coherence: float
    summary: str
    strengths: list[str]
    improvements: list[str]
    mistakes: list[Mistake] = []
    better_answer: str = ""
    stats: SpeakingStats
    pronunciation_note: str = (
        "Pronunciation isn't scored. Fluency and coherence are estimated from the transcript, so pauses and accent aren't heard."
    )
    note: str | None = None
    created_at: datetime | None = None
