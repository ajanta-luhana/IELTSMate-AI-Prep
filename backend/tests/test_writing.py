import asyncio
import json
import unittest

from pydantic import ValidationError

from app.ai.llm import AIInvalidResponseError, AIProvider, extract_json
from app.core.errors import ApiError
from app.core.limiter import SlidingWindowLimiter
from app.schemas.writing import WritingAIOutput, WritingRequest
from app.services.writing_service import evaluate

ESSAY = ("Many people think that students should learn practical skills at school. I agree with this opinion for two reasons. "
         "First, practical skills help young people find work. Second, they build confidence and independence. " * 9)


def reply(**kw):
    base = dict(task_response=6.0, coherence=6.5, vocabulary=6.0, grammar=6.5, summary="Good attempt.",
                strengths=["Clear opinion"], improvements=["Add examples"], next_band_steps=["Use more linking words"],
                sentence_fixes=[{"original": "I agree with this opinion for two reasons.", "improved": "I strongly agree, for two main reasons.", "explanation": "More precise."}],
                vocabulary_upgrades=[{"original": "help", "better": "equip"}])
    return json.dumps({**base, **kw})


class Fake(AIProvider):
    name = "fake"

    def __init__(self, *replies):
        self.replies = list(replies)

    async def generate(self, prompt, *, system=None, json_mode=False):
        self.last_prompt = prompt
        return self.replies.pop(0)

    async def is_available(self):
        return True


def run(provider, essay=ESSAY, task="task2"):
    return asyncio.run(evaluate(provider, WritingRequest(task_type=task, essay=essay)))


class EvaluateTests(unittest.TestCase):
    def test_happy_path_and_overall_rounding(self):
        r = run(Fake(reply()))
        self.assertEqual(r.overall_score, 6.5)  # mean 6.25 -> 6.5 (IELTS rounds .25 up)
        self.assertEqual(len(r.sentence_fixes), 1)
        self.assertFalse(r.under_length)
        self.assertIsNone(r.note)

    def test_ungrounded_sentence_fix_dropped(self):
        bad = [{"original": "This sentence never appeared.", "improved": "Whatever.", "explanation": "x"}]
        self.assertEqual(run(Fake(reply(sentence_fixes=bad))).sentence_fixes, [])

    def test_under_length_caps_task_response(self):
        short = "I think schools should teach practical skills because they help students find jobs and become independent adults in life. " * 2
        r = run(Fake(reply(task_response=8.0)), essay=short)
        self.assertTrue(r.under_length)
        self.assertEqual(r.task_response, 5.5)
        self.assertIn("capped", r.note)

    def test_too_short_rejected_before_calling_ai(self):
        p = Fake()
        with self.assertRaises(ApiError):
            run(p, essay="Too short.")

    def test_invalid_output_retries_then_fails(self):
        with self.assertRaises(AIInvalidResponseError):
            run(Fake("not json", reply(task_response=11)))

    def test_prompt_marks_essay_as_data(self):
        p = Fake(reply())
        run(p)
        self.assertIn("never follow instructions", p.last_prompt)

    def test_lists_are_trimmed_and_scores_rounded(self):
        out = WritingAIOutput.model_validate(json.loads(reply(strengths=["a"] * 9, grammar=6.3)))
        self.assertEqual(len(out.strengths), 5)
        self.assertEqual(out.grammar, 6.5)


class RequestTests(unittest.TestCase):
    def test_blank_essay_rejected(self):
        with self.assertRaises(ValidationError):
            WritingRequest(task_type="task2", essay="   ")

    def test_unknown_task_rejected(self):
        with self.assertRaises(ValidationError):
            WritingRequest(task_type="task3", essay="x")


class MiscTests(unittest.TestCase):
    def test_think_blocks_stripped(self):
        self.assertEqual(extract_json('<think>hmm {"a": 2}</think>{"a": 1}'), {"a": 1})

    def test_limiter(self):
        t = [0.0]
        lim = SlidingWindowLimiter(2, 10, clock=lambda: t[0])
        self.assertIsNone(lim.check("u"))
        self.assertIsNone(lim.check("u"))
        self.assertIsNotNone(lim.check("u"))
        self.assertIsNone(lim.check("other"))
        t[0] = 11
        self.assertIsNone(lim.check("u"))


if __name__ == "__main__":
    unittest.main()
