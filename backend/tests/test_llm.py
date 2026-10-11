import asyncio
import unittest

from pydantic import BaseModel, Field

from app.ai.llm import AIInvalidResponseError, AIProvider, extract_json, generate_structured


class Band(BaseModel):
    band: float = Field(ge=0, le=9)
    note: str


class FakeProvider(AIProvider):
    name = "fake"

    def __init__(self, replies):
        self.replies = list(replies)
        self.calls = 0

    async def generate(self, prompt, *, system=None, json_mode=False):
        self.calls += 1
        return self.replies.pop(0)

    async def is_available(self):
        return True


class ExtractJsonTests(unittest.TestCase):
    def test_plain(self):
        self.assertEqual(extract_json('{"a": 1}'), {"a": 1})

    def test_fenced_and_prose(self):
        self.assertEqual(extract_json('```json\n{"a": 1}\n```'), {"a": 1})
        self.assertEqual(extract_json('Sure! {"a": 1} hope it helps'), {"a": 1})

    def test_rejects_non_object(self):
        with self.assertRaises(AIInvalidResponseError):
            extract_json("[1,2]")
        with self.assertRaises(AIInvalidResponseError):
            extract_json("no json here")


class StructuredTests(unittest.TestCase):
    def test_valid(self):
        p = FakeProvider(['{"band": 6.5, "note": "ok"}'])
        r = asyncio.run(generate_structured(p, "x", Band))
        self.assertEqual(r.band, 6.5)

    def test_retry_then_success(self):
        p = FakeProvider(['{"band": 12, "note": "bad"}', '{"band": 7, "note": "fixed"}'])
        r = asyncio.run(generate_structured(p, "x", Band))
        self.assertEqual((r.band, p.calls), (7, 2))

    def test_gives_up(self):
        p = FakeProvider(["nope", "still nope"])
        with self.assertRaises(AIInvalidResponseError):
            asyncio.run(generate_structured(p, "x", Band))


if __name__ == "__main__":
    unittest.main()
