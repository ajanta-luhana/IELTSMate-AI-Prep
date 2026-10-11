"""Progress analytics: pure functions over database rows. Dates use UTC."""
from collections import defaultdict
from datetime import date, datetime, timedelta, timezone

from app.schemas.progress import DayCount, ProgressResponse, SeriesPoint, SkillSummary
from app.services.scoring import round_half

BAND_SKILLS = ("speaking", "writing", "reading", "listening")
WEEKS_SHOWN = 12


def to_date(value: str | None) -> date | None:
    if not value:
        return None
    try:
        return datetime.fromisoformat(value.replace("Z", "+00:00")).astimezone(timezone.utc).date()
    except ValueError:
        return None


def streak(days: set[date], today: date) -> int:
    """Consecutive practice days ending today (or yesterday, so the streak isn't lost before you practise)."""
    cursor = today if today in days else today - timedelta(days=1)
    n = 0
    while cursor in days:
        n += 1
        cursor -= timedelta(days=1)
    return n


def _monday(d: date) -> date:
    return d - timedelta(days=d.weekday())


def weekly_series(points: list[tuple[date, float]], today: date) -> list[SeriesPoint]:
    """Average per week for the last WEEKS_SHOWN weeks, skipping empty weeks."""
    oldest = _monday(today) - timedelta(weeks=WEEKS_SHOWN - 1)
    buckets: dict[date, list[float]] = defaultdict(list)
    for d, v in points:
        if d >= oldest:
            buckets[_monday(d)].append(v)
    return [SeriesPoint(week_start=w, value=round_half(sum(vs) / len(vs))) for w, vs in sorted(buckets.items())]


def _summary(skill: str, rows: list[tuple[date, float]]) -> SkillSummary:
    if not rows:
        return SkillSummary(skill=skill)
    newest_first = sorted(rows, key=lambda r: r[0], reverse=True)
    recent = [v for _, v in newest_first[:5]]
    return SkillSummary(skill=skill, latest=newest_first[0][1], recent_average=round_half(sum(recent) / len(recent)), attempts=len(rows))


def _scores(rows: list[dict], key: str) -> list[tuple[date, float]]:
    out = []
    for r in rows:
        d, v = to_date(r.get("created_at")), r.get(key)
        if d is not None and v is not None:
            out.append((d, float(v)))
    return out


def _accuracy(attempts: list[dict], kind_of: dict[str, str], kind: str) -> float | None:
    rel = [a for a in attempts if kind_of.get(a["item_id"]) == kind]
    return sum(1 for a in rel if a["correct"]) / len(rel) if rel else None


def recommendations(p: ProgressResponse, weak_topics: list[str]) -> list[str]:
    tips: list[str] = []
    if p.current_band is None:
        tips.append("Take the level test to get your starting band and a personal plan.")
    attempted = [s for s in p.skills if s.recent_average is not None]
    if len(attempted) >= 2:
        low = min(attempted, key=lambda s: s.recent_average or 0)
        tips.append(f"Your {low.skill} is your lowest skill right now ({low.recent_average:.1f}). Give it extra time this week.")
    never = [s.skill for s in p.skills if s.attempts == 0]
    if never:
        tips.append(f"You haven't tried {', '.join(never)} yet. A short Easy session is a gentle way to start.")
    if weak_topics:
        tips.append(f"Review these topics: {', '.join(weak_topics[:3])}. They're below 60% so far.")
    if not p.practiced_today:
        tips.append("A 10-minute session today keeps your streak going." if p.streak_days else "Start a streak: even 10 minutes today counts.")
    if p.days_to_exam is not None and 0 <= p.days_to_exam <= 14:
        tips.append("Your exam is close. Switch to Exam mode and practise with the timer.")
    if p.current_band is not None and p.target_band is not None and p.target_band - p.current_band >= 1.5:
        tips.append("Your target is a few bands away. Steady daily practice beats long, rare sessions.")
    return tips[:4]


def build_progress(
    *,
    profile: dict,
    assessments: list[dict],
    writing: list[dict],
    speaking: list[dict],
    reading: list[dict],
    listening: list[dict],
    vocab_attempts: list[dict],
    kind_of: dict[str, str],
    weak_topics: list[str],
    today: date,
) -> ProgressResponse:
    by_skill = {
        "speaking": _scores(speaking, "overall_score"),
        "writing": _scores(writing, "overall_score"),
        "reading": _scores(reading, "estimated_band"),
        "listening": _scores(listening, "estimated_band"),
    }
    overall_points = _scores(assessments, "overall_score") + [pt for s in BAND_SKILLS for pt in by_skill[s]]

    activity: set[date] = set()
    counts: dict[date, int] = defaultdict(int)
    for rows in (assessments, writing, speaking, reading, listening, vocab_attempts):
        for r in rows:
            d = to_date(r.get("created_at"))
            if d is not None:
                activity.add(d)
                counts[d] += 1

    exam = profile.get("exam_date")
    exam_date = date.fromisoformat(exam) if isinstance(exam, str) else exam
    resp = ProgressResponse(
        current_band=profile.get("current_band"),
        target_band=profile.get("target_band"),
        exam_date=exam_date,
        days_to_exam=(exam_date - today).days if exam_date else None,
        streak_days=streak(activity, today),
        practiced_today=today in activity,
        activity_last_7_days=[DayCount(date=today - timedelta(days=i), count=counts.get(today - timedelta(days=i), 0)) for i in range(6, -1, -1)],
        skills=[_summary(s, by_skill[s]) for s in BAND_SKILLS],
        vocabulary_accuracy=_accuracy(vocab_attempts, kind_of, "vocabulary"),
        grammar_accuracy=_accuracy(vocab_attempts, kind_of, "grammar"),
        series={"overall": weekly_series(overall_points, today), **{s: weekly_series(by_skill[s], today) for s in BAND_SKILLS}},
        recommendations=[],
    )
    resp.recommendations = recommendations(resp, weak_topics)
    return resp
