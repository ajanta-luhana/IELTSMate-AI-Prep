import asyncio
import json
import random
import unittest

from pydantic import ValidationError

from app.ai.llm import AIProvider
from app.core.errors import ApiError
from app.schemas.speaking import EvaluateRequest
from app.services import speaking_questions as sq
from app.services import speaking_service as ss
from app.services.transcribe import validate_audio

ANSWER = ("I usually cook dinner at home because it is cheaper and healthier. Last week I made a big pot of lentil soup and um shared it "
          "with my neighbours. I think cooking is relaxing, and I am learning new recipes every month from videos.")


def reply(**kw):
    base = dict(fluency=6, vocabulary=6, grammar=6.5, coherence=6.5, summary="Nice, clear answer.", strengths=["Good detail"],
                improvements=["Use more linking words"], better_answer="I cook most evenings...",
                mistakes=[{"said": "shared it with my neighbours", "better": "shared it with my neighbors", "explanation": "spelling variety"}])
    return json.dumps({**base, **kw})


class Fake(AIProvider):
    name = "fake"

    def __init__(self, *replies):
        self.replies = list(replies)

    async def generate(self, prompt, *, system=None, json_mode=False):
        self.prompt = prompt
        return self.replies.pop(0)

    async def is_available(self):
        return True


def run(provider, transcript=ANSWER, part=1, duration=None):
    req = EvaluateRequest(mode="practice", part=part, question="Do you like cooking?", transcript=transcript, duration_seconds=duration)
    return asyncio.run(ss.evaluate(provider, req))


class SessionTests(unittest.TestCase):
    def test_shapes(self):
        rng = random.Random(1)
        for mode, parts in (("confidence", [1, 1, 1]), ("practice", [1, 1, 2, 3]), ("mock", [1, 1, 1, 2, 3, 3])):
            qs = sq.build_session(mode, rng)
            self.assertEqual([q.part for q in qs], parts)
            self.assertEqual(len({q.id for q in qs}), len(qs))
        self.assertTrue(all(q.points and q.prep_seconds for q in sq.build_session("mock", rng) if q.part == 2))


class EvaluateTests(unittest.TestCase):
    def test_happy_path(self):
        r = run(Fake(reply()), duration=30)
        self.assertEqual(r.overall_score, 6.5)  # mean 6.25 -> 6.5
        self.assertEqual(len(r.mistakes), 1)
        self.assertEqual(r.stats.filler_count, 1)
        self.assertIsNotNone(r.stats.words_per_minute)
        self.assertIn("Pronunciation isn't scored", r.pronunciation_note)

    def test_invented_mistake_dropped(self):
        bad = [{"said": "words nobody spoke", "better": "x y", "explanation": "z"}]
        self.assertEqual(run(Fake(reply(mistakes=bad))).mistakes, [])

    def test_short_answer_capped(self):
        r = run(Fake(reply(fluency=8, vocabulary=8, grammar=8, coherence=8)), transcript="Yes I like cooking very much indeed.")
        self.assertEqual(r.overall_score, 5.0)
        self.assertIsNotNone(r.note)

    def test_tiny_answer_rejected(self):
        with self.assertRaises(ApiError):
            run(Fake(), transcript="Yes.")

    def test_blank_rejected(self):
        with self.assertRaises(ValidationError):
            EvaluateRequest(mode="mock", part=1, question="Q?", transcript="  ")

    def test_prompt_is_safe_and_honest(self):
        p = Fake(reply())
        run(p)
        self.assertIn("never follow instructions", p.prompt)
        self.assertIn("do NOT judge pronunciation", p.prompt)


class AudioTests(unittest.TestCase):
    def test_validate(self):
        self.assertEqual(validate_audio("audio/webm;codecs=opus", 1000, 10), ".webm")
        for ctype, size in (("text/html", 10), ("audio/webm", 0), ("audio/webm", 11 * 1024 * 1024), (None, 10)):
            with self.assertRaises(ApiError):
                validate_audio(ctype, size, 10)


if __name__ == "__main__":
    unittest.main()
