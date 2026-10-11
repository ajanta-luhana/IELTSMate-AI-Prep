from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, Field, field_validator

Skill = Literal["speaking", "writing", "reading", "listening"]
Level = Literal["easy", "intermediate", "exam"]


def _check_band(v: float | None) -> float | None:
    if v is None:
        return v
    if not 0 <= v <= 9 or (v * 2) % 1 != 0:
        raise ValueError("Band must be between 0 and 9 in steps of 0.5")
    return v


class ProfileUpdate(BaseModel):
    """Fields a student may change. Anything omitted is left untouched."""

    name: str | None = Field(default=None, max_length=80)
    target_band: float | None = None
    exam_date: date | None = None
    daily_goal_minutes: int | None = Field(default=None, ge=5, le=480)
    hardest_skill: Skill | None = None
    confidence_level: Level | None = None

    _band = field_validator("target_band")(_check_band)

    @field_validator("name")
    @classmethod
    def _strip_name(cls, v: str | None) -> str | None:
        return v.strip() if v is not None else v

    @field_validator("exam_date")
    @classmethod
    def _future_date(cls, v: date | None) -> date | None:
        if v is not None and v < date.today():
            raise ValueError("Exam date must be today or later")
        return v


class Profile(BaseModel):
    id: str
    name: str = ""
    email: str = ""
    target_band: float | None = None
    current_band: float | None = None
    exam_date: date | None = None
    daily_goal_minutes: int = 30
    hardest_skill: Skill | None = None
    confidence_level: Level = "easy"
    created_at: datetime | None = None
