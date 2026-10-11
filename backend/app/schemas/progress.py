from datetime import date

from pydantic import BaseModel


class SkillSummary(BaseModel):
    skill: str
    latest: float | None = None  # most recent estimated band
    recent_average: float | None = None  # average of the last 5 attempts
    attempts: int = 0


class SeriesPoint(BaseModel):
    week_start: date
    value: float


class DayCount(BaseModel):
    date: date
    count: int


class ProgressResponse(BaseModel):
    current_band: float | None = None
    target_band: float | None = None
    exam_date: date | None = None
    days_to_exam: int | None = None
    streak_days: int
    practiced_today: bool
    activity_last_7_days: list[DayCount]
    skills: list[SkillSummary]
    vocabulary_accuracy: float | None = None
    grammar_accuracy: float | None = None
    series: dict[str, list[SeriesPoint]]  # overall + each skill, weekly averages
    recommendations: list[str]
