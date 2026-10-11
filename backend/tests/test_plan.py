import asyncio
import json
import unittest
from datetime import date, timedelta
from collections import Counter

from app.ai.llm import AIProvider, AIUnavailableError
from app.ai.study_plan import coach_note
from app.schemas.plan import PlanInputs
from app.services.study_plan import build_plan, level_for_week, weeks_until

TODAY = date(2026, 10, 10)


def plan(**kw):
    return build_plan(PlanInputs(**kw), today=TODAY)


class PlanTests(unittest.TestCase):
    def test_weeks_from_exam_date(self):
        self.assertEqual(weeks_until(None, TODAY), 8)
        self.assertEqual(weeks_until(TODAY + timedelta(days=60), TODAY), 9)
        self.assertEqual(weeks_until(TODAY + timedelta(days=3), TODAY), 2)  # minimum
        self.assertEqual(weeks_until(TODAY + timedelta(days=400), TODAY), 12)  # maximum

    def test_confidence_progression(self):
        self.assertEqual([level_for_week(w, 9) for w in (1, 3, 4, 6, 7, 9)], ["easy", "easy", "intermediate", "intermediate", "exam", "exam"])
        p = plan(exam_date=TODAY + timedelta(days=63))
        self.assertEqual(p.weeks[0].level, "easy")
        self.assertEqual(p.weeks[-1].level, "exam")

    def test_structure_and_no_duplicate_skill_in_a_day(self):
        p = plan(daily_minutes=90, current_band=5.5, target_band=7.0)
        self.assertEqual(len(p.weeks), 8)
        for wk in p.weeks:
            self.assertEqual([d.day for d in wk.days], ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"])
            for d in wk.days[:6]:
                skills = [t.skill for t in d.tasks]
                self.assertEqual(len(skills), len(set(skills)))
                self.assertEqual(len(skills), 3)  # 90 min -> 3 tasks

    def test_minutes_scale_task_count(self):
        counts = {m: len(plan(daily_minutes=m).weeks[0].days[0].tasks) for m in (15, 30, 60, 120)}
        self.assertEqual(counts, {15: 1, 30: 2, 60: 2, 120: 3})

    def test_hardest_skill_gets_more_time(self):
        p = plan(hardest_skill="speaking", daily_minutes=45)
        c = Counter(t.skill for wk in p.weeks for d in wk.days[:6] for t in d.tasks)
        self.assertEqual(c.most_common(1)[0][0], "speaking")
        self.assertIn("speaking", p.focus_skills)

    def test_weak_topics_named(self):
        p = plan(weak_vocabulary=["Health"], weak_grammar=["Articles"], daily_minutes=120)
        titles = " ".join(t.title for wk in p.weeks for d in wk.days for t in d.tasks)
        self.assertIn("focus: Health", titles)
        self.assertIn("focus: Articles", titles)

    def test_defaults_when_profile_empty(self):
        p = plan()
        self.assertEqual((p.current_band, p.target_band), (5.0, 7.0))
        self.assertTrue(p.summary)

    def test_links_point_to_real_pages(self):
        ok = {"/reading", "/listening", "/speaking", "/writing", "/vocabulary", "/grammar"}
        self.assertTrue(all(t.href in ok for wk in plan().weeks for d in wk.days for t in d.tasks))


class Fake(AIProvider):
    name = "fake"

    def __init__(self, reply=None, error=False):
        self.reply, self.error = reply, error

    async def generate(self, prompt, *, system=None, json_mode=False):
        if self.error:
            raise AIUnavailableError("down")
        return self.reply

    async def is_available(self):
        return True


class CoachNoteTests(unittest.TestCase):
    def test_note_ok(self):
        note = "You are making a great start. Focus on speaking this month and practise a little every day."
        self.assertEqual(asyncio.run(coach_note(Fake(json.dumps({"note": note})), plan())), note)

    def test_ai_down_or_invalid_gives_none(self):
        self.assertIsNone(asyncio.run(coach_note(Fake(error=True), plan())))
        self.assertIsNone(asyncio.run(coach_note(Fake("garbage"), plan())))


if __name__ == "__main__":
    unittest.main()
