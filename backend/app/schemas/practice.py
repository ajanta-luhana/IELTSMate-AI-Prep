from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field, field_validator

Level = Literal["easy", "intermediate", "exam"]
QuestionType = Literal["mcq", "tfng", "ynng", "completion", "matching"]


class PublicQuestion(BaseModel):
    """A question as the student sees it (no answers)."""

    id: str
    type: QuestionType
    prompt: str
    options: list[str] = []
    hint: str | None = None


class ScriptLine(BaseModel):
    speaker: str
    text: str


class TestSummary(BaseModel):
    id: str
    title: str
    level: Level
    minutes: int
    question_count: int
    best_band: float | None = None


class TestDetail(BaseModel):
    id: str
    title: str
    level: Level
    minutes: int
    passage: str | None = None  # reading
    script: list[ScriptLine] | None = None  # listening (played via browser speech; hidden until results)
    questions: list[PublicQuestion]


class TestSubmit(BaseModel):
    test_id: str = Field(max_length=100)
    answers: dict[str, int | str | None] = Field(max_length=100)  # option index, or typed text

    @field_validator("answers")
    @classmethod
    def _short_text(cls, v: dict[str, int | str | None]) -> dict[str, int | str | None]:
        for value in v.values():
            if isinstance(value, str) and len(value) > 100:
                raise ValueError("Answers must be 100 characters or fewer")
        return v


class QuestionResult(BaseModel):
    id: str
    prompt: str
    correct: bool
    your_answer: str | None
    correct_answer: str
    explanation: str


class TestResult(BaseModel):
    test_id: str
    title: str
    correct: int
    total: int
    estimated_band: float
    results: list[QuestionResult]
    created_at: datetime | None = None


class AttemptSummary(BaseModel):
    id: str
    test_id: str
    title: str
    correct: int
    total: int
    estimated_band: float | None = None
    created_at: datetime | None = None


# ───── vocabulary & grammar ─────
Kind = Literal["vocabulary", "grammar"]


class PracticeItem(BaseModel):
    id: str
    kind: Kind
    topic: str
    prompt: str
    options: list[str]


class AnswerSubmit(BaseModel):
    item_id: str = Field(max_length=100)
    choice: int = Field(ge=0, le=10)


class AnswerResult(BaseModel):
    correct: bool
    correct_index: int
    explanation: str


class TopicProgress(BaseModel):
    topic: str
    attempts: int
    correct: int
    accuracy: float | None = None  # 0..1, None if not practised yet
    weak: bool = False


class PracticeProgress(BaseModel):
    kind: Kind
    topics: list[TopicProgress]
    weak_topics: list[str]
