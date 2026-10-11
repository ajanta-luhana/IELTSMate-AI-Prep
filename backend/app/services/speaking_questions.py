"""Original IELTS-style speaking questions and session builder (Confidence / Practice / Mock)."""
import json
import random
from functools import lru_cache
from pathlib import Path

from app.schemas.speaking import SpeakingMode, SpeakingQuestion

_FILE = Path(__file__).resolve().parent.parent / "content" / "speaking.json"
SPEAK_SECONDS = {1: 45, 2: 120, 3: 90}
PREP_SECONDS = 60


@lru_cache
def _bank() -> dict:
    return json.loads(_FILE.read_text(encoding="utf-8"))


def _p1(level: str, n: int, rng: random.Random) -> list[SpeakingQuestion]:
    pool = [q for q in _bank()["part1"] if q["level"] == level]
    return [SpeakingQuestion(id=q["id"], part=1, text=q["text"], speak_seconds=SPEAK_SECONDS[1]) for q in rng.sample(pool, min(n, len(pool)))]


def _cue(level: str, rng: random.Random) -> dict:
    cards = _bank()["cue_cards"]
    return rng.choice([c for c in cards if c["level"] == level] or cards)


def _p2(card: dict) -> SpeakingQuestion:
    return SpeakingQuestion(id=card["id"], part=2, text=card["text"], points=card["points"], prep_seconds=PREP_SECONDS, speak_seconds=SPEAK_SECONDS[2])


def _p3(card: dict, n: int, rng: random.Random) -> list[SpeakingQuestion]:
    follow = rng.sample(card["followups"], min(n, len(card["followups"])))
    return [SpeakingQuestion(id=f["id"], part=3, text=f["text"], speak_seconds=SPEAK_SECONDS[3]) for f in follow]


def build_session(mode: SpeakingMode, rng: random.Random | None = None) -> list[SpeakingQuestion]:
    rng = rng or random.Random()
    if mode == "confidence":  # gentle: three easy personal questions, no pressure
        return _p1("easy", 3, rng)
    if mode == "practice":  # a short taste of every part
        card = _cue("intermediate", rng)
        return _p1("intermediate", 2, rng) + [_p2(card)] + _p3(card, 1, rng)
    card = _cue("exam", rng)  # mock: the full shape of the real test
    return _p1("exam", 3, rng) + [_p2(card)] + _p3(card, 2, rng)
