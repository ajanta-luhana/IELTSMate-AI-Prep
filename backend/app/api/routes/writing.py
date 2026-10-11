from fastapi import APIRouter, Depends

from app.ai.factory import get_ai_provider
from app.ai.llm import AIProvider
from app.core.auth import AuthUser, get_current_user
from app.core.deps import get_db
from app.core.rate_limit import rate_limit
from app.schemas.writing import WritingRequest, WritingResult
from app.services.supabase_rest import SupabaseRest
from app.services.writing_service import evaluate

router = APIRouter(prefix="/writing", tags=["writing"])


@router.post("/evaluate", response_model=WritingResult, dependencies=[Depends(rate_limit("writing", 6, 60))])
async def evaluate_writing(
    body: WritingRequest,
    user: AuthUser = Depends(get_current_user),
    provider: AIProvider = Depends(get_ai_provider),
    db: SupabaseRest = Depends(get_db),
) -> WritingResult:
    result = await evaluate(provider, body)
    saved = await db.insert(
        "writing_submissions",
        {
            "user_id": user.id,
            "task_type": result.task_type,
            "prompt": result.prompt,
            "essay": body.essay,
            "overall_score": result.overall_score,
            "task_response": result.task_response,
            "coherence": result.coherence,
            "vocabulary": result.vocabulary,
            "grammar": result.grammar,
            "feedback": result.model_dump(mode="json", exclude={"id", "created_at"}),
        },
    )
    return result.model_copy(update={"id": saved.get("id"), "created_at": saved.get("created_at")})


@router.get("/history", response_model=list[WritingResult])
async def history(user: AuthUser = Depends(get_current_user), db: SupabaseRest = Depends(get_db)) -> list[WritingResult]:
    out: list[WritingResult] = []
    for row in await db.list_for_user("writing_submissions", user.id, limit=30):
        if not row.get("feedback"):
            continue
        out.append(WritingResult.model_validate({**row["feedback"], "id": row["id"], "created_at": row.get("created_at")}))
    return out
