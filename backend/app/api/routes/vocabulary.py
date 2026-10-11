from fastapi import APIRouter, Depends, Query

from app.core.auth import AuthUser, get_current_user
from app.core.deps import get_db
from app.core.errors import ApiError
from app.schemas.practice import AnswerResult, AnswerSubmit, Kind, PracticeItem, PracticeProgress
from app.services import practice_items as pi
from app.services.supabase_rest import SupabaseRest

router = APIRouter(prefix="/vocabulary", tags=["vocabulary"])


@router.get("/topics", response_model=list[str])
async def list_topics(kind: Kind = "vocabulary", _: AuthUser = Depends(get_current_user)) -> list[str]:
    return pi.topics(kind)


@router.get("", response_model=list[PracticeItem])
async def get_items(
    kind: Kind = "vocabulary",
    topic: str | None = Query(default=None, max_length=50),
    limit: int = Query(default=10, ge=1, le=30),
    _: AuthUser = Depends(get_current_user),
) -> list[PracticeItem]:
    if topic is not None and topic not in pi.topics(kind):
        raise ApiError(404, "topic_not_found", "That topic doesn't exist.")
    return pi.pick(kind, topic, limit)


@router.post("/answer", response_model=AnswerResult)
async def answer(body: AnswerSubmit, user: AuthUser = Depends(get_current_user), db: SupabaseRest = Depends(get_db)) -> AnswerResult:
    item = pi.all_items().get(body.item_id)
    if item is None:
        raise ApiError(404, "item_not_found", "That question doesn't exist.")
    if body.choice >= len(item.options):
        raise ApiError(422, "invalid_answers", "That answer isn't one of the options.")
    correct = body.choice == item.answer_index
    await db.insert("vocabulary_progress", {"user_id": user.id, "item_id": item.id, "correct": correct})
    return AnswerResult(correct=correct, correct_index=item.answer_index, explanation=item.explanation)


@router.get("/progress", response_model=PracticeProgress)
async def progress(kind: Kind = "vocabulary", user: AuthUser = Depends(get_current_user), db: SupabaseRest = Depends(get_db)) -> PracticeProgress:
    return pi.build_progress(kind, await db.list_for_user("vocabulary_progress", user.id, limit=2000))
