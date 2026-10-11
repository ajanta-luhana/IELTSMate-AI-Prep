"""Loads the original question bank (app/content/assessment.json). No third-party IELTS material."""
import json
from functools import lru_cache
from pathlib import Path

from pydantic import BaseModel

from app.schemas.assessment import AssessmentQuestion, AssessmentStart

_FILE = Path(__file__).resolve().parent.parent / "content" / "assessment.json"


class StoredQuestion(AssessmentQuestion):
    answer_index: int


@lru_cache
def _load() -> tuple[list[StoredQuestion], dict[str, str]]:
    data = json.loads(_FILE.read_text(encoding="utf-8"))
    questions = [StoredQuestion.model_validate(q) for q in data["questions"]]
    for q in questions:
        if not 0 <= q.answer_index < len(q.options):
            raise ValueError(f"Question {q.id}: answer_index out of range")
        if q.passage_id and q.passage_id not in data["passages"]:
            raise ValueError(f"Question {q.id}: unknown passage {q.passage_id}")
    return questions, data["passages"]


def stored_questions() -> list[StoredQuestion]:
    return _load()[0]


def public_start() -> AssessmentStart:
    questions, passages = _load()
    return AssessmentStart(
        questions=[AssessmentQuestion.model_validate(q.model_dump(exclude={"answer_index"})) for q in questions],
        passages=passages,
    )
