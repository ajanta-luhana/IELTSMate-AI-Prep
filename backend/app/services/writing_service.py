"""Turns validated model output into the final result, adding deterministic checks."""
import re

from app.ai.llm import AIProvider
from app.ai.writing import evaluate_essay
from app.core.errors import ApiError
from app.schemas.writing import MIN_WORDS, WritingRequest, WritingResult
from app.services.scoring import round_half

MIN_TO_EVALUATE = 30  # below this there's nothing meaningful to evaluate
UNDER_LENGTH_CAP = 5.5  # Task Response is capped when the answer is shorter than the required minimum


def _norm(s: str) -> str:
    return re.sub(r"\s+", " ", s).strip().lower()


def count_words(text: str) -> int:
    return len(text.split())


async def evaluate(provider: AIProvider, req: WritingRequest) -> WritingResult:
    words = count_words(req.essay)
    if words < MIN_TO_EVALUATE:
        raise ApiError(422, "essay_too_short", f"Your answer is only {words} words. Write at least {MIN_TO_EVALUATE} so there's something to give feedback on.")

    out = await evaluate_essay(provider, req.task_type, req.prompt, req.essay)
    minimum = MIN_WORDS[req.task_type]
    under = words < minimum

    task_response = min(out.task_response, UNDER_LENGTH_CAP) if under else out.task_response
    overall = round_half((task_response + out.coherence + out.vocabulary + out.grammar) / 4)

    essay_norm = _norm(req.essay)
    fixes = [f for f in out.sentence_fixes if _norm(f.original) in essay_norm]  # drop anything the model made up

    return WritingResult(
        task_type=req.task_type,
        prompt=req.prompt,
        word_count=words,
        min_words=minimum,
        under_length=under,
        overall_score=overall,
        task_response=task_response,
        coherence=out.coherence,
        vocabulary=out.vocabulary,
        grammar=out.grammar,
        summary=out.summary,
        strengths=out.strengths,
        improvements=out.improvements,
        sentence_fixes=fixes,
        vocabulary_upgrades=out.vocabulary_upgrades,
        next_band_steps=out.next_band_steps,
        note=(f"Your answer has {words} words; the task asks for at least {minimum}. Task Response is capped until you reach the minimum." if under else None),
    )
