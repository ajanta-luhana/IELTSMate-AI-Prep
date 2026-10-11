import unittest
from datetime import date, timedelta

from pydantic import ValidationError

from app.schemas.assessment import AssessmentSubmit
from app.services.assessment_content import public_start, stored_questions
from app.services.scoring import band_from_accuracy, score_assessment


class ContentTests(unittest.TestCase):
    def test_bank_is_valid_and_hides_answers(self):
        qs = stored_questions()
        self.assertEqual(len({q.id for q in qs}), len(qs))
        for q in public_start().questions:
            self.assertNotIn("answer_index", q.model_dump())


class ScoringTests(unittest.TestCase):
    def test_band_mapping(self):
        self.assertEqual(band_from_accuracy(0, 10), 2.5)
        self.assertEqual(band_from_accuracy(10, 10), 8.0)
        self.assertEqual(band_from_accuracy(5, 10), 5.5)

    def test_perfect_blank_and_partial(self):
        qs = stored_questions()
        perfect = score_assessment(qs, {q.id: q.answer_index for q in qs})
        self.assertEqual(perfect.overall_score, 8.0)
        blank = score_assessment(qs, {})
        self.assertEqual(blank.overall_score, 2.5)
        half = {q.id: q.answer_index for q in qs if q.section == "grammar"}
        r = score_assessment(qs, half)
        self.assertEqual(r.grammar_score, 8.0)
        self.assertIn(r.weakest_section, ("vocabulary", "reading"))

    def test_unknown_id_rejected(self):
        with self.assertRaises(ValueError):
            score_assessment(stored_questions(), {"nope": 0})


class SubmitSchemaTests(unittest.TestCase):
    def _ok(self, **kw):
        base = dict(target_band=7.0, hardest_skill="writing", answers={"g1": 1})
        return AssessmentSubmit(**{**base, **kw})

    def test_valid(self):
        self.assertEqual(self._ok(exam_date=date.today() + timedelta(days=30)).target_band, 7.0)

    def test_rejects_bad_input(self):
        for kw in ({"target_band": 3.0}, {"target_band": 7.3}, {"hardest_skill": "math"}, {"exam_date": date.today() - timedelta(days=1)}):
            with self.assertRaises(ValidationError):
                self._ok(**kw)


if __name__ == "__main__":
    unittest.main()
