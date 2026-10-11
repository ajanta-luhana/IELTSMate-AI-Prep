"""Deterministic speech statistics and the evaluation orchestration."""
import re

from app.ai.llm import AIProvider
from app.ai.speaking import evaluate_speech
from app.core.errors import ApiError
from app.schemas.speaking import EvaluateRequest, SpeakingResult, SpeakingStats
from app.services.scoring import round_half

MIN_WORDS = 5  # fewer than this and there's nothing to evaluate
SHORT_WORDS = 15  # very short answers can't score highly
SHORT_CAP = 5.0
_FILLER = re.compile(r"\b(um+|uh+|er+|erm|ah+|you know|i mean|like)\b", re.IGNORECASE)


def _norm(s: str) -> str:
    return re.sub(r"[^\w\s]", "", re.sub(r"\s+", " ", s)).strip().lower()


def compute_stats(transcript: str, duration_seconds: float | None) -> SpeakingStats:
    words = transcript.split()
    fillers = [m.group(0).lower() for m in _FILLER.finditer(transcript)]
    wpm = round(len(words) / (duration_seconds / 60), 1) if duration_seconds and duration_seconds >= 5 else None
    return SpeakingStats(word_count=len(words), words_per_minute=wpm, filler_count=len(fillers), fillers=sorted(set(fillers)))


async def evaluate(provider: AIProvider, req: EvaluateRequest) -> SpeakingResult:
    stats = compute_stats(req.transcript, req.duration_seconds)
    if stats.word_count < MIN_WORDS:
        raise ApiError(422, "answer_too_short", "That was very short, so there isn't enough to give feedback on. Try answering in a few full sentences.")

    out = await evaluate_speech(provider, req.part, req.question, req.transcript, stats.words_per_minute)
    short = stats.word_count < SHORT_WORDS
    cap = (lambda x: min(x, SHORT_CAP)) if short else (lambda x: x)
    fluency, vocab, grammar, coherence = cap(out.fluency), cap(out.vocabulary), cap(out.grammar), cap(out.coherence)

    transcript_norm = _norm(req.transcript)
    mistakes = [m for m in out.mistakes if _norm(m.said) and _norm(m.said) in transcript_norm]  # drop anything the model invented

    return SpeakingResult(
        mode=req.mode,
        part=req.part,
        question=req.question,
        transcript=req.transcript,
        overall_score=round_half((fluency + vocab + grammar + coherence) / 4),
        fluency=fluency,
        vocabulary=vocab,
        grammar=grammar,
        coherence=coherence,
        summary=out.summary,
        strengths=out.strengths,
        improvements=out.improvements,
        mistakes=mistakes,
        better_answer=out.better_answer,
        stats=stats,
        note="Short answers can't score highly. Try to give reasons and an example." if short else None,
    )
