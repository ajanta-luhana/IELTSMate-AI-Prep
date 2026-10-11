"""Optional AI coach note for the study plan. The plan never depends on this succeeding."""
from pydantic import BaseModel, Field

from app.ai.llm import AIError, AIProvider, generate_structured
from app.ai.prompts import SYSTEM_COACH
from app.schemas.plan import StudyPlan


class CoachNote(BaseModel):
    note: str = Field(min_length=20, max_length=600)


def build_prompt(plan: StudyPlan) -> str:
    return (
        "Write a short, warm, motivating note (2-4 sentences) for an IELTS student about their study plan. "
        "Mention their biggest focus areas and one practical habit. Do not promise a particular score.\n"
        f"Plan summary: {plan.summary}\n"
        'Return ONE JSON object: {"note": "your note"}'
    )


async def coach_note(provider: AIProvider, plan: StudyPlan) -> str | None:
    try:
        return (await generate_structured(provider, build_prompt(plan), CoachNote, system=SYSTEM_COACH, retries=0)).note.strip()
    except AIError:
        return None  # AI offline or unusable: the plan is still complete without it
