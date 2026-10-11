"""Deterministic scoring. No AI involved. All bands are ESTIMATES, not official IELTS scores."""
import math
from collections.abc import Mapping, Sequence

from app.schemas.assessment import AssessmentResult, Section, SectionResult
from app.services.assessment_content import StoredQuestion

SECTIONS: tuple[Section, ...] = ("grammar", "vocabulary", "reading")


def round_half(x: float) -> float:
    return math.floor(x * 2 + 0.5) / 2  # half-up (Python's round() is banker's rounding)


def band_from_accuracy(correct: int, total: int) -> float:
    """Map accuracy on a short check to a rough band (2.5–8.0). A short test can't justify more."""
    if total <= 0:
        raise ValueError("total must be positive")
    return min(8.0, round_half(2.5 + 5.5 * (correct / total)))


def score_assessment(questions: Sequence[StoredQuestion], answers: Mapping[str, int | None]) -> AssessmentResult:
    known = {q.id for q in questions}
    unknown = set(answers) - known
    if unknown:
        raise ValueError(f"Unknown question ids: {sorted(unknown)}")

    sections: list[SectionResult] = []
    for name in SECTIONS:
        qs = [q for q in questions if q.section == name]
        if not qs:
            continue
        correct = sum(1 for q in qs if answers.get(q.id) == q.answer_index)  # unanswered counts as wrong
        sections.append(SectionResult(section=name, correct=correct, total=len(qs), band=band_from_accuracy(correct, len(qs))))

    overall = round_half(sum(s.band for s in sections) / len(sections))
    weakest = min(sections, key=lambda s: s.correct / s.total).section
    by = {s.section: s.band for s in sections}
    return AssessmentResult(
        overall_score=overall,
        grammar_score=by.get("grammar"),
        vocabulary_score=by.get("vocabulary"),
        reading_score=by.get("reading"),
        sections=sections,
        weakest_section=weakest,
    )
