from fastapi import APIRouter, Depends, File, UploadFile

from app.ai.factory import get_ai_provider
from app.ai.llm import AIProvider
from app.config import Settings, get_settings
from app.core.auth import AuthUser, get_current_user
from app.core.deps import get_db
from app.core.rate_limit import rate_limit
from app.schemas.speaking import EvaluateRequest, SessionResponse, SessionStart, SpeakingResult, TranscribeResponse
from app.services import speaking_questions as sq
from app.services import speaking_service
from app.services.supabase_rest import SupabaseRest
from app.services.transcribe import transcribe_bytes, validate_audio

router = APIRouter(prefix="/speaking", tags=["speaking"])


@router.post("/session", response_model=SessionResponse)
async def start_session(body: SessionStart, _: AuthUser = Depends(get_current_user)) -> SessionResponse:
    return SessionResponse(mode=body.mode, questions=sq.build_session(body.mode))


@router.post("/transcribe", response_model=TranscribeResponse, dependencies=[Depends(rate_limit("transcribe", 20, 60))])
async def transcribe(
    audio: UploadFile = File(...), settings: Settings = Depends(get_settings), _: AuthUser = Depends(get_current_user)
) -> TranscribeResponse:
    limit = settings.max_audio_mb * 1024 * 1024
    data = await audio.read(limit + 1)  # never read more than the limit + 1 byte
    suffix = validate_audio(audio.content_type, len(data), settings.max_audio_mb)
    text, duration = await transcribe_bytes(data, suffix, settings.whisper_model)
    return TranscribeResponse(transcript=text, duration_seconds=duration)


@router.post("/evaluate", response_model=SpeakingResult, dependencies=[Depends(rate_limit("speaking", 8, 60))])
async def evaluate(
    body: EvaluateRequest,
    user: AuthUser = Depends(get_current_user),
    provider: AIProvider = Depends(get_ai_provider),
    db: SupabaseRest = Depends(get_db),
) -> SpeakingResult:
    result = await speaking_service.evaluate(provider, body)
    saved = await db.insert(
        "speaking_sessions",
        {
            "user_id": user.id,
            "mode": result.mode,
            "part": result.part,
            "question": result.question,
            "audio_url": None,  # audio is never stored
            "transcript": result.transcript,
            "fluency_score": result.fluency,
            "vocabulary_score": result.vocabulary,
            "grammar_score": result.grammar,
            "coherence_score": result.coherence,
            "overall_score": result.overall_score,
            "feedback": result.model_dump(mode="json", exclude={"id", "created_at"}),
        },
    )
    return result.model_copy(update={"id": saved.get("id"), "created_at": saved.get("created_at")})


@router.get("/history", response_model=list[SpeakingResult])
async def history(user: AuthUser = Depends(get_current_user), db: SupabaseRest = Depends(get_db)) -> list[SpeakingResult]:
    out: list[SpeakingResult] = []
    for row in await db.list_for_user("speaking_sessions", user.id, limit=40):
        if row.get("feedback"):
            out.append(SpeakingResult.model_validate({**row["feedback"], "id": row["id"], "created_at": row.get("created_at")}))
    return out
