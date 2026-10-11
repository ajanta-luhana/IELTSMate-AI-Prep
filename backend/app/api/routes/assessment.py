from fastapi import APIRouter, Depends

from app.core.auth import AuthUser, get_current_user
from app.core.errors import ApiError
from app.schemas.assessment import AssessmentResult, AssessmentStart, AssessmentSubmit, SectionResult
from app.services.assessment_content import public_start, stored_questions
from app.services.scoring import SECTIONS, score_assessment
from app.services.supabase_rest import SupabaseRest
from app.core.deps import get_db

router = APIRouter(prefix="/assessment", tags=["assessment"])


@router.post("/start", response_model=AssessmentStart)
async def start(_: AuthUser = Depends(get_current_user)) -> AssessmentStart:
    return public_start()


@router.post("/submit", response_model=AssessmentResult)
async def submit(
    body: AssessmentSubmit, user: AuthUser = Depends(get_current_user), db: SupabaseRest = Depends(get_db)
) -> AssessmentResult:
    questions = stored_questions()
    by_id = {q.id: q for q in questions}
    for qid, choice in body.answers.items():
        if qid not in by_id:
            raise ApiError(422, "invalid_answers", "Some answers don't match any question.")
        if choice is not None and not 0 <= choice < len(by_id[qid].options):
            raise ApiError(422, "invalid_answers", "Some answers are out of range.")

    result = score_assessment(questions, body.answers)

    saved = await db.insert(
        "assessments",
        {
            "user_id": user.id,
            "overall_score": result.overall_score,
            "grammar_score": result.grammar_score,
            "vocabulary_score": result.vocabulary_score,
            "reading_score": result.reading_score,
        },
    )
    await db.upsert_profile(
        {
            "id": user.id,
            "email": user.email,
            "current_band": result.overall_score,
            "target_band": body.target_band,
            "exam_date": body.exam_date.isoformat() if body.exam_date else None,
            "hardest_skill": body.hardest_skill,
        }
    )
    # Rebuild (not assign) so Pydantic parses the ISO timestamp string from the database.
    return AssessmentResult(**result.model_dump(exclude={"created_at"}), created_at=saved.get("created_at"))


@router.get("/results", response_model=AssessmentResult)
async def results(user: AuthUser = Depends(get_current_user), db: SupabaseRest = Depends(get_db)) -> AssessmentResult:
    row = await db.latest("assessments", user.id)
    if row is None:
        raise ApiError(404, "no_assessment", "You haven't taken the level test yet.")
    totals = {s: sum(1 for q in stored_questions() if q.section == s) for s in SECTIONS}
    sections = [
        SectionResult(section=s, correct=0, total=totals[s], band=row[f"{s}_score"])
        for s in SECTIONS
        if row.get(f"{s}_score") is not None
    ]
    weakest = min(sections, key=lambda s: s.band).section if sections else None
    return AssessmentResult(
        overall_score=row["overall_score"],
        grammar_score=row.get("grammar_score"),
        vocabulary_score=row.get("vocabulary_score"),
        reading_score=row.get("reading_score"),
        sections=sections,
        weakest_section=weakest,
        created_at=row.get("created_at"),
    )
