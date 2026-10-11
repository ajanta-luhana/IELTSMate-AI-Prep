import random
import unittest

from pydantic import ValidationError

from app.schemas.practice import TestSubmit
from app.services import practice_items as pi
from app.services import practice_tests as pt


class BankTests(unittest.TestCase):
    def test_all_tests_load_and_are_consistent(self):
        for kind in ("reading", "listening"):
            tests = pt.load_tests(kind)
            self.assertGreaterEqual(len(tests), 3)
            for t in tests.values():
                self.assertTrue(t.passage or t.script)
                ids = [q.id for q in t.questions]
                self.assertEqual(len(ids), len(set(ids)))

    def test_levels_covered(self):
        for kind in ("reading", "listening"):
            self.assertEqual({t.level for t in pt.load_tests(kind).values()}, {"easy", "intermediate", "exam"})

    def test_public_detail_has_no_answers(self):
        dumped = pt.detail(next(iter(pt.load_tests("reading").values()))).model_dump_json()
        for secret in ("answer_index", "accepted", "explanation"):
            self.assertNotIn(secret, dumped)


class GradingTests(unittest.TestCase):
    def setUp(self):
        self.test = pt.load_tests("reading")["reading-easy-1"]

    def perfect(self):
        return {q.id: (q.accepted[0] if q.type == "completion" else q.answer_index) for q in self.test.questions}

    def test_perfect_and_blank(self):
        correct, band, _ = pt.grade(self.test, self.perfect())
        self.assertEqual((correct, band), (len(self.test.questions), 8.0))
        correct, band, results = pt.grade(self.test, {})
        self.assertEqual((correct, band), (0, 2.5))
        self.assertTrue(all(r.your_answer is None for r in results))

    def test_completion_is_forgiving_about_case_space_punctuation(self):
        a = self.perfect()
        a["q5"] = "  Two. "
        self.assertEqual(pt.grade(self.test, a)[0], len(self.test.questions))
        a["q5"] = "three"
        self.assertEqual(pt.grade(self.test, a)[0], len(self.test.questions) - 1)

    def test_bool_and_wrong_types_never_correct(self):
        a = self.perfect()
        a["q2"] = True  # JSON true must not count as option 1/0
        a["q1"] = "1"   # text for an option question is wrong
        self.assertEqual(pt.grade(self.test, a)[0], len(self.test.questions) - 2)

    def test_unknown_question_rejected(self):
        with self.assertRaises(ValueError):
            pt.grade(self.test, {"zzz": 1})

    def test_out_of_range_choice_is_wrong_not_crash(self):
        a = self.perfect()
        a["q1"] = 99
        _, _, results = pt.grade(self.test, a)
        self.assertFalse(results[0].correct)
        self.assertIsNone(results[0].your_answer)


class SchemaTests(unittest.TestCase):
    def test_long_text_answer_rejected(self):
        with self.assertRaises(ValidationError):
            TestSubmit(test_id="x", answers={"q1": "a" * 101})


class ItemTests(unittest.TestCase):
    def test_bank_shape(self):
        for kind in ("vocabulary", "grammar"):
            self.assertEqual(len(pi.topics(kind)), 10)
            for topic in pi.topics(kind):
                self.assertEqual(len(pi.pick(kind, topic, 99)), 3)

    def test_pick_hides_answer_and_limits(self):
        items = pi.pick("grammar", None, 5, random.Random(1))
        self.assertEqual(len(items), 5)
        self.assertNotIn("answer_index", items[0].model_dump())

    def test_progress_and_weak_topics(self):
        ids = [i.id for i in pi.all_items().values() if i.kind == "vocabulary" and i.topic == "Health"]
        attempts = [{"item_id": ids[0], "correct": False}, {"item_id": ids[1], "correct": False}, {"item_id": ids[2], "correct": True}]
        p = pi.build_progress("vocabulary", attempts)
        health = next(t for t in p.topics if t.topic == "Health")
        self.assertEqual((health.attempts, health.correct, health.weak), (3, 1, True))
        self.assertEqual(p.weak_topics, ["Health"])
        work = next(t for t in p.topics if t.topic == "Work")
        self.assertIsNone(work.accuracy)

    def test_few_attempts_not_flagged_weak(self):
        iid = next(iter(pi.all_items()))
        p = pi.build_progress(pi.all_items()[iid].kind, [{"item_id": iid, "correct": False}])
        self.assertEqual(p.weak_topics, [])


if __name__ == "__main__":
    unittest.main()
