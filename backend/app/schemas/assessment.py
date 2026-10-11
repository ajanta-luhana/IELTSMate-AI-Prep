from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, Field, field_validator

from app.schemas.profile import Skill, _check_band

Section = Literal["grammar", "vocabulary", "reading"]


class AssessmentQuestion(BaseModel):
    """What the student sees. The correct answer is never included."""

    id: str
    section: Section
    prompt: str
    options: list[str]
    passage_id: str | None = None


class AssessmentStart(BaseModel):
    questions: list[AssessmentQuestion]
    passages: dict[str, str]


class AssessmentSubmit(BaseModel):
    target_band: float
    exam_date: date | None = None
    hardest_skill: Skill
    answers: dict[str, int | None] = Field(max_length=100)  # question id -> chosen option index

    @field_validator("target_band")
    @classmethod
    def _target(cls, v: float) -> float:
        _check_band(v)
        if v < 4:
            raise ValueError("Target band must be between 4.0 and 9.0")
        return v

    @field_validator("exam_date")
    @classmethod
    def _future(cls, v: date | None) -> date | None:
        if v is not None and v < date.today():
            raise ValueError("Exam date must be today or later")
        return v


class SectionResult(BaseModel):
    section: Section
    correct: int
    total: int
    band: float


class AssessmentResult(BaseModel):
    overall_score: float
    grammar_score: float | None = None
    vocabulary_score: float | None = None
    reading_score: float | None = None
    speaking_score: float | None = None
    sections: list[SectionResult]
    weakest_section: Section | None = None
    speaking_note: str = "Speaking isn't part of this check yet. Try the Speaking Coach for an estimate."
    created_at: datetime | None = None
