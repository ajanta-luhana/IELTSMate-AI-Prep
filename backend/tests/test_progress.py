import unittest
from datetime import date, timedelta

from app.services.progress import build_progress, streak, to_date, weekly_series

TODAY = date(2026, 10, 10)  # a Saturday


def iso(d, hour=10):
    return f"{d.isoformat()}T{hour:02d}:00:00+00:00"


def build(**kw):
    base = dict(profile={}, assessments=[], writing=[], speaking=[], reading=[], listening=[], vocab_attempts=[], kind_of={}, weak_topics=[], today=TODAY)
    return build_progress(**{**base, **kw})


class HelperTests(unittest.TestCase):
    def test_to_date(self):
        self.assertEqual(to_date("2026-10-09T23:30:00Z"), date(2026, 10, 9))
        self.assertEqual(to_date("2026-10-09T23:30:00-05:00"), date(2026, 10, 10))  # converted to UTC
        self.assertIsNone(to_date(None))
        self.assertIsNone(to_date("nonsense"))

    def test_streak(self):
        d = lambda n: TODAY - timedelta(days=n)
        self.assertEqual(streak({d(0), d(1), d(2)}, TODAY), 3)
        self.assertEqual(streak({d(1), d(2)}, TODAY), 2)  # not lost until a full day is missed
        self.assertEqual(streak({d(2), d(3)}, TODAY), 0)
        self.assertEqual(streak({d(0), d(2)}, TODAY), 1)
        self.assertEqual(streak(set(), TODAY), 0)

    def test_weekly_series_averages_and_window(self):
        pts = [(date(2026, 10, 5), 5.0), (date(2026, 10, 7), 6.0), (date(2026, 9, 28), 5.0), (date(2025, 1, 1), 9.0)]
        s = weekly_series(pts, TODAY)
        self.assertEqual([(p.week_start, p.value) for p in s], [(date(2026, 9, 28), 5.0), (date(2026, 10, 5), 5.5)])  # old point dropped


class BuildTests(unittest.TestCase):
    def test_empty_user(self):
        p = build()
        self.assertEqual((p.streak_days, p.practiced_today), (0, False))
        self.assertEqual(len(p.activity_last_7_days), 7)
        self.assertTrue(any("level test" in r for r in p.recommendations))
        self.assertTrue(all(s.attempts == 0 for s in p.skills))

    def test_skills_and_series(self):
        p = build(
            profile={"current_band": 5.5, "target_band": 7.0, "exam_date": (TODAY + timedelta(days=10)).isoformat()},
            speaking=[{"created_at": iso(TODAY), "overall_score": 6.0}],
            writing=[{"created_at": iso(TODAY - timedelta(days=1)), "overall_score": 5.0}],
            reading=[{"created_at": iso(TODAY), "estimated_band": 6.5}],
        )
        by = {s.skill: s for s in p.skills}
        self.assertEqual((by["speaking"].latest, by["writing"].latest, by["listening"].attempts), (6.0, 5.0, 0))
        self.assertEqual(p.days_to_exam, 10)
        self.assertEqual(p.streak_days, 2)
        self.assertTrue(p.practiced_today)
        self.assertTrue(p.series["overall"] and p.series["speaking"] and not p.series["listening"])
        text = " ".join(p.recommendations)
        self.assertIn("lowest skill", text)
        self.assertIn("writing", text)

    def test_accuracy_by_kind(self):
        att = [{"item_id": "v1", "correct": True, "created_at": iso(TODAY)}, {"item_id": "v1", "correct": False, "created_at": iso(TODAY)},
               {"item_id": "g1", "correct": True, "created_at": iso(TODAY)}]
        p = build(vocab_attempts=att, kind_of={"v1": "vocabulary", "g1": "grammar"}, weak_topics=["Health"])
        self.assertEqual((p.vocabulary_accuracy, p.grammar_accuracy), (0.5, 1.0))
        self.assertIn("Health", " ".join(p.recommendations))

    def test_recommendations_capped_at_four(self):
        self.assertLessEqual(len(build(profile={"target_band": 8.0, "current_band": 5.0}).recommendations), 4)


if __name__ == "__main__":
    unittest.main()
