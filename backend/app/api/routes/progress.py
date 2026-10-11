from datetime import datetime, timezone

from fastapi import APIRouter, Depends

from app.core.auth import AuthUser, get_current_user
from app.core.deps import get_db
from app.schemas.progress import ProgressResponse
from app.services import practice_items as pi
from app.services.progress import build_progress
from app.services.supabase_rest import SupabaseRest

router = APIRouter(prefix="/progress", tags=["progress"])


@router.get("", response_model=ProgressResponse)
async def progress(user: AuthUser = Depends(get_current_user), db: SupabaseRest = Depends(get_db)) -> ProgressResponse:
    rows = {t: await db.list_for_user(t, user.id, limit=500) for t in ("assessments", "writing_submissions", "speaking_sessions", "reading_attempts", "listening_attempts")}
    attempts = await db.list_for_user("vocabulary_progress", user.id, limit=2000)
    items = pi.all_items()
    weak = pi.build_progress("vocabulary", attempts).weak_topics + pi.build_progress("grammar", attempts).weak_topics
    return build_progress(
        profile=await db.get_profile(user.id) or {},
        assessments=rows["assessments"],
        writing=rows["writing_submissions"],
        speaking=rows["speaking_sessions"],
        reading=rows["reading_attempts"],
        listening=rows["listening_attempts"],
        vocab_attempts=attempts,
        kind_of={i.id: i.kind for i in items.values()},
        weak_topics=weak,
        today=datetime.now(timezone.utc).date(),
    )
