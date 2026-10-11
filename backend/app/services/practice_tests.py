"""Question bank + deterministic grading for Reading and Listening. No AI involved."""
import json
import re
from functools import lru_cache
from pathlib import Path
from typing import Literal

from pydantic import BaseModel, model_validator

from app.schemas.practice import Level, PublicQuestion, QuestionResult, QuestionType, ScriptLine, TestDetail, TestSummary
from app.services.scoring import band_from_accuracy

_DIR = Path(__file__).resolve().parent.parent / "content"
_FIXED_OPTIONS = {"tfng": ["True", "False", "Not Given"], "ynng": ["Yes", "No", "Not Given"]}

Kind = Literal["reading", "listening"]


class StoredQuestion(BaseModel):
    id: str
    type: QuestionType
    prompt: str
    options: list[str] = []
    answer_index: int | None = None
    accepted: list[str] = []
    hint: str | None = None
    explanation: str = ""

    @model_validator(mode="after")
    def _check(self) -> "StoredQuestion":
        if self.type in _FIXED_OPTIONS and not self.options:
            self.options = list(_FIXED_OPTIONS[self.type])
        if self.type == "completion":
            if not self.accepted:
                raise ValueError(f"{self.id}: completion needs accepted answers")
        elif self.answer_index is None or not 0 <= self.answer_index < len(self.options):
            raise ValueError(f"{self.id}: bad answer_index")
        return self


class StoredTest(BaseModel):
    id: str
    title: str
    level: Level
    minutes: int
    passage: str | None = None
    script: list[ScriptLine] | None = None
    questions: list[StoredQuestion]


@lru_cache
def load_tests(kind: Kind) -> dict[str, StoredTest]:
    data = json.loads((_DIR / f"{kind}.json").read_text(encoding="utf-8"))
    tests = [StoredTest.model_validate(t) for t in data["tests"]]
    return {t.id: t for t in tests}


def summaries(kind: Kind, best: dict[str, float] | None = None) -> list[TestSummary]:
    best = best or {}
    return [
        TestSummary(id=t.id, title=t.title, level=t.level, minutes=t.minutes, question_count=len(t.questions), best_band=best.get(t.id))
        for t in load_tests(kind).values()
    ]


def detail(test: StoredTest) -> TestDetail:
    return TestDetail(
        id=test.id, title=test.title, level=test.level, minutes=test.minutes, passage=test.passage, script=test.script,
        questions=[PublicQuestion(id=q.id, type=q.type, prompt=q.prompt, options=q.options, hint=q.hint) for q in test.questions],
    )


def normalize(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r"[^\w\s-]", "", text)  # drop punctuation, keep hyphens
    return re.sub(r"\s+", " ", text).strip()


def is_correct(q: StoredQuestion, response: int | str | None) -> bool:
    if q.type == "completion":
        return isinstance(response, str) and normalize(response) in {normalize(a) for a in q.accepted}
    return isinstance(response, int) and not isinstance(response, bool) and response == q.answer_index


def _shown(q: StoredQuestion, response: int | str | None) -> str | None:
    if response is None or response == "":
        return None
    if isinstance(response, int) and not isinstance(response, bool):
        return q.options[response] if 0 <= response < len(q.options) else None
    return str(response)


def grade(test: StoredTest, answers: dict[str, int | str | None]) -> tuple[int, float, list[QuestionResult]]:
    unknown = set(answers) - {q.id for q in test.questions}
    if unknown:
        raise ValueError("Answers don't match this test.")
    results: list[QuestionResult] = []
    for q in test.questions:
        resp = answers.get(q.id)
        ok = is_correct(q, resp)
        correct_text = q.accepted[0] if q.type == "completion" else q.options[q.answer_index or 0]
        results.append(QuestionResult(id=q.id, prompt=q.prompt, correct=ok, your_answer=_shown(q, resp), correct_answer=correct_text, explanation=q.explanation))
    correct = sum(r.correct for r in results)
    return correct, band_from_accuracy(correct, len(results)), results
