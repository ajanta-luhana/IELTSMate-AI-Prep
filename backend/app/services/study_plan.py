"""Rule-based personalised study plan. Works fully offline; AI only adds an optional coach note."""
import math
from datetime import date

from app.schemas.plan import PlanDay, PlanInputs, PlanSkill, PlanTask, PlanWeek, StudyPlan

SKILLS: tuple[PlanSkill, ...] = ("reading", "listening", "speaking", "writing", "vocabulary", "grammar")
DAYS = ("Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun")
DEFAULT_CURRENT, DEFAULT_TARGET, DEFAULT_WEEKS = 5.0, 7.0, 8
MIN_WEEKS, MAX_WEEKS = 2, 12
LEVEL_NAME = {"easy": "Easy", "intermediate": "Intermediate", "exam": "Exam mode"}
SPEAKING_MODE = {"easy": "Confidence Mode", "intermediate": "Practice Mode", "exam": "Mock Test"}


def weeks_until(exam: date | None, today: date) -> int:
    if exam is None:
        return DEFAULT_WEEKS
    days = max(0, (exam - today).days)
    return max(MIN_WEEKS, min(MAX_WEEKS, math.ceil(days / 7)))


def level_for_week(week: int, total: int) -> str:
    """Confidence Mode: Easy first, then Intermediate, finishing in Exam mode."""
    third = week / total
    return "easy" if third <= 1 / 3 else "intermediate" if third <= 2 / 3 else "exam"


def skill_weights(inp: PlanInputs) -> dict[PlanSkill, float]:
    w: dict[PlanSkill, float] = {s: 1.0 for s in SKILLS}
    if inp.hardest_skill:
        w[inp.hardest_skill] += 1.0
    scored = {k: v for k, v in inp.section_bands.items() if k in w}
    if len(scored) >= 2:
        weakest = min(scored, key=lambda k: scored[k])
        if scored[weakest] < max(scored.values()):
            w[weakest] += 0.75  # type: ignore[index]
    if inp.weak_vocabulary:
        w["vocabulary"] += 0.5
    if inp.weak_grammar:
        w["grammar"] += 0.5
    return w


def _task(skill: PlanSkill, level: str, week: int, minutes: int, inp: PlanInputs) -> PlanTask:
    lvl = LEVEL_NAME[level]
    if skill == "reading":
        return PlanTask(skill=skill, title=f"Reading: one {lvl} passage", minutes=minutes, href="/reading")
    if skill == "listening":
        return PlanTask(skill=skill, title=f"Listening: one {lvl} test", minutes=minutes, href="/listening")
    if skill == "speaking":
        return PlanTask(skill=skill, title=f"Speaking: {SPEAKING_MODE[level]}", minutes=minutes, href="/speaking")
    if skill == "writing":
        kind = "a Task 2 essay" if week % 2 == 1 else "a Task 1 answer"
        return PlanTask(skill=skill, title=f"Writing: {kind}, then read your feedback", minutes=minutes, href="/writing")
    if skill == "vocabulary":
        extra = f" (focus: {inp.weak_vocabulary[0]})" if inp.weak_vocabulary else ""
        return PlanTask(skill=skill, title=f"Vocabulary: a topic round{extra}", minutes=minutes, href="/vocabulary")
    extra = f" (focus: {inp.weak_grammar[0]})" if inp.weak_grammar else ""
    return PlanTask(skill=skill, title=f"Grammar: a topic round{extra}", minutes=minutes, href="/grammar")


def _tasks_per_day(minutes: int) -> int:
    return 1 if minutes < 25 else 2 if minutes < 75 else 3


def _split(minutes: int, n: int) -> list[int]:
    each = max(5, int(round(minutes / n / 5)) * 5)
    return [each] * n


def build_plan(inp: PlanInputs, today: date | None = None) -> StudyPlan:
    today = today or date.today()
    current = inp.current_band if inp.current_band is not None else DEFAULT_CURRENT
    target = inp.target_band if inp.target_band is not None else max(DEFAULT_TARGET, current)
    total_weeks = weeks_until(inp.exam_date, today)
    weights = skill_weights(inp)
    n = _tasks_per_day(inp.daily_minutes)

    credit: dict[PlanSkill, float] = {s: 0.0 for s in SKILLS}
    total_w = sum(weights.values())

    def pick(exclude: set[PlanSkill]) -> PlanSkill:
        for s in SKILLS:
            credit[s] += weights[s]
        choice = max((s for s in SKILLS if s not in exclude), key=lambda s: (credit[s], -SKILLS.index(s)))
        credit[choice] -= total_w
        return choice

    weeks: list[PlanWeek] = []
    for w in range(1, total_weeks + 1):
        level = level_for_week(w, total_weeks)
        days: list[PlanDay] = []
        for d, name in enumerate(DAYS):
            if d == 6:  # light review day
                mins = min(inp.daily_minutes, 20)
                tasks = [_task("vocabulary", level, w, max(5, mins // 2 // 5 * 5), inp), _task("grammar", level, w, max(5, mins // 2 // 5 * 5), inp)]
                days.append(PlanDay(day=name, tasks=tasks if inp.daily_minutes >= 15 else tasks[:1]))
                continue
            used: set[PlanSkill] = set()
            tasks = []
            for m in _split(inp.daily_minutes, n):
                skill = pick(used)
                used.add(skill)
                tasks.append(_task(skill, level, w, m, inp))
            days.append(PlanDay(day=name, tasks=tasks))
        label = {"easy": "Build confidence", "intermediate": "Stretch yourself", "exam": "Exam practice"}[level]
        weeks.append(PlanWeek(week=w, focus=f"{label} ({LEVEL_NAME[level]})", level=level, days=days))  # type: ignore[arg-type]

    ranked = sorted(SKILLS, key=lambda s: -weights[s])
    focus = [s for s in ranked if weights[s] > 1.0][:3] or list(ranked[:2])
    gap = max(0.0, target - current)
    when = f"until your exam on {inp.exam_date:%d %b %Y}" if inp.exam_date else "over the next 8 weeks"
    summary = (
        f"{total_weeks} weeks, about {inp.daily_minutes} minutes a day, from an estimated {current:.1f} towards {target:.1f}"
        f"{'' if gap > 0 else ' (keep your level steady)'}. Extra time goes to {', '.join(focus)} {when}."
    )
    return StudyPlan(
        summary=summary,
        weeks_total=total_weeks,
        daily_minutes=inp.daily_minutes,
        current_band=current,
        target_band=target,
        exam_date=inp.exam_date,
        focus_skills=focus,
        weeks=weeks,
    )
