import unittest
from datetime import date, timedelta

from pydantic import ValidationError

from app.schemas.profile import ProfileUpdate


class ProfileUpdateTests(unittest.TestCase):
    def test_valid(self):
        p = ProfileUpdate(name="  Ayesha ", target_band=7.5, daily_goal_minutes=45, hardest_skill="speaking")
        self.assertEqual((p.name, p.target_band), ("Ayesha", 7.5))

    def test_bad_band(self):
        for b in (9.5, -1, 6.3):
            with self.assertRaises(ValidationError):
                ProfileUpdate(target_band=b)

    def test_bad_goal_skill_date(self):
        with self.assertRaises(ValidationError):
            ProfileUpdate(daily_goal_minutes=1)
        with self.assertRaises(ValidationError):
            ProfileUpdate(hardest_skill="maths")
        with self.assertRaises(ValidationError):
            ProfileUpdate(exam_date=date.today() - timedelta(days=1))

    def test_unset_fields_excluded(self):
        self.assertEqual(ProfileUpdate(name="A").model_dump(exclude_unset=True), {"name": "A"})


if __name__ == "__main__":
    unittest.main()
