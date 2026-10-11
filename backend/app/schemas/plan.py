from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, Field

PlanSkill = Literal["reading", "listening", "speaking", "writing", "vocabulary", "grammar"]


class PlanTask(BaseModel):
    skill: PlanSkill
    title: str
    minutes: int
    href: str


class PlanDay(BaseModel):
    day: str
    tasks: list[PlanTask]


class PlanWeek(BaseModel):
    week: int
    focus: str
    level: Literal["easy", "intermediate", "exam"]
    days: list[PlanDay]


class PlanInputs(BaseModel):
    current_band: float | None = None
    target_band: float | None = None
    exam_date: date | None = None
    hardest_skill: PlanSkill | None = None
    daily_minutes: int = Field(default=30, ge=5, le=480)
    section_bands: dict[str, float] = {}  # e.g. {"grammar": 5.5, "reading": 6.0}
    weak_vocabulary: list[str] = []
    weak_grammar: list[str] = []


class StudyPlan(BaseModel):
    id: str | None = None
    summary: str
    weeks_total: int
    daily_minutes: int
    current_band: float
    target_band: float
    exam_date: date | None = None
    focus_skills: list[PlanSkill]
    weeks: list[PlanWeek]
    coach_note: str | None = None
    created_at: datetime | None = None
