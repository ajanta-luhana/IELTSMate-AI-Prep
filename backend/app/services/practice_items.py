"""Vocabulary & grammar item bank (original content) + progress aggregation."""
import json
import random
from functools import lru_cache
from pathlib import Path

from pydantic import BaseModel

from app.schemas.practice import Kind, PracticeItem, PracticeProgress, TopicProgress

_FILE = Path(__file__).resolve().parent.parent / "content" / "practice.json"
WEAK_ACCURACY = 0.6
MIN_ATTEMPTS = 3


class StoredItem(PracticeItem):
    answer_index: int
    explanation: str


@lru_cache
def all_items() -> dict[str, StoredItem]:
    data = json.loads(_FILE.read_text(encoding="utf-8"))
    items = [StoredItem.model_validate(i) for i in data["items"]]
    for i in items:
        if not 0 <= i.answer_index < len(i.options):
            raise ValueError(f"{i.id}: bad answer_index")
    return {i.id: i for i in items}


def topics(kind: Kind) -> list[str]:
    seen: list[str] = []
    for i in all_items().values():
        if i.kind == kind and i.topic not in seen:
            seen.append(i.topic)
    return seen


def pick(kind: Kind, topic: str | None, limit: int, rng: random.Random | None = None) -> list[PracticeItem]:
    pool = [i for i in all_items().values() if i.kind == kind and (topic is None or i.topic == topic)]
    (rng or random).shuffle(pool)
    return [PracticeItem(id=i.id, kind=i.kind, topic=i.topic, prompt=i.prompt, options=i.options) for i in pool[:limit]]


def build_progress(kind: Kind, attempts: list[dict]) -> PracticeProgress:
    """attempts: rows of vocabulary_progress ({item_id, correct})."""
    items = all_items()
    stats: dict[str, list[int]] = {t: [0, 0] for t in topics(kind)}  # topic -> [attempts, correct]
    for a in attempts:
        item = items.get(a["item_id"])
        if item and item.kind == kind:
            stats[item.topic][0] += 1
            stats[item.topic][1] += 1 if a["correct"] else 0
    rows: list[TopicProgress] = []
    for topic, (n, c) in stats.items():
        acc = c / n if n else None
        rows.append(TopicProgress(topic=topic, attempts=n, correct=c, accuracy=acc, weak=n >= MIN_ATTEMPTS and acc is not None and acc < WEAK_ACCURACY))
    weak = [r.topic for r in sorted((r for r in rows if r.weak), key=lambda r: r.accuracy or 0)]
    return PracticeProgress(kind=kind, topics=rows, weak_topics=weak)
