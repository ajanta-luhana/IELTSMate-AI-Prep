from fastapi import APIRouter, Depends

from app.ai.factory import get_ai_provider
from app.ai.llm import AIProvider
from app.ai.study_plan import coach_note
from app.core.auth import AuthUser, get_current_user
from app.core.deps import get_db
from app.core.errors import ApiError
from app.core.rate_limit import rate_limit
from app.schemas.plan import PlanInputs, StudyPlan
from app.services import practice_items as pi
from app.services.study_plan import build_plan
from app.services.supabase_rest import SupabaseRest

router = APIRouter(prefix="/study-plan", tags=["study-plan"])


async def _inputs(user: AuthUser, db: SupabaseRest) -> PlanInputs:
    profile = await db.get_profile(user.id) or {}
    assessment = await db.latest("assessments", user.id) or {}
    attempts = await db.list_for_user("vocabulary_progress", user.id, limit=2000)
    bands = {k: assessment[f"{k}_score"] for k in ("grammar", "vocabulary", "reading") if assessment.get(f"{k}_score") is not None}
    return PlanInputs(
        current_band=profile.get("current_band"),
        target_band=profile.get("target_band"),
        exam_date=profile.get("exam_date"),
        hardest_skill=profile.get("hardest_skill"),
        daily_minutes=profile.get("daily_goal_minutes") or 30,
        section_bands=bands,
        weak_vocabulary=pi.build_progress("vocabulary", attempts).weak_topics,
        weak_grammar=pi.build_progress("grammar", attempts).weak_topics,
    )


def _from_row(row: dict) -> StudyPlan:
    return StudyPlan.model_validate({**row["plan"], "id": row["id"], "created_at": row.get("created_at")})


@router.post("/generate", response_model=StudyPlan, dependencies=[Depends(rate_limit("plan", 5, 60))])
async def generate(
    user: AuthUser = Depends(get_current_user),
    provider: AIProvider = Depends(get_ai_provider),
    db: SupabaseRest = Depends(get_db),
) -> StudyPlan:
    plan = build_plan(await _inputs(user, db))
    plan = plan.model_copy(update={"coach_note": await coach_note(provider, plan)})
    saved = await db.insert("study_plans", {"user_id": user.id, "plan": plan.model_dump(mode="json", exclude={"id", "created_at"})})
    return plan.model_copy(update={"id": saved.get("id"), "created_at": saved.get("created_at")})


@router.get("", response_model=StudyPlan)
async def latest(user: AuthUser = Depends(get_current_user), db: SupabaseRest = Depends(get_db)) -> StudyPlan:
    row = await db.latest("study_plans", user.id)
    if row is None:
        raise ApiError(404, "no_plan", "You don't have a study plan yet.")
    return _from_row(row)
