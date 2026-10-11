from fastapi import APIRouter, Depends

from app.core.auth import AuthUser, get_current_user
from app.core.deps import get_db
from app.core.errors import ApiError
from app.schemas.practice import AttemptSummary, TestDetail, TestResult, TestSubmit, TestSummary
from app.services import practice_tests as pt
from app.services.supabase_rest import SupabaseRest


def make_router(kind: pt.Kind) -> APIRouter:
    """Reading and Listening share one deterministic engine; only the content file and table differ."""
    router = APIRouter(prefix=f"/{kind}", tags=[kind])
    table = f"{kind}_attempts"

    def find(test_id: str) -> pt.StoredTest:
        test = pt.load_tests(kind).get(test_id)
        if test is None:
            raise ApiError(404, "test_not_found", "That test doesn't exist.")
        return test

    @router.get("/tests", response_model=list[TestSummary])
    async def list_tests(user: AuthUser = Depends(get_current_user), db: SupabaseRest = Depends(get_db)) -> list[TestSummary]:
        best: dict[str, float] = {}
        for row in await db.list_for_user(table, user.id):
            band = row.get("estimated_band")
            if band is not None and band > best.get(row["test_id"], -1):
                best[row["test_id"]] = band
        return pt.summaries(kind, best)

    @router.get("/tests/{test_id}", response_model=TestDetail)
    async def get_test(test_id: str, _: AuthUser = Depends(get_current_user)) -> TestDetail:
        return pt.detail(find(test_id))

    @router.post("/submit", response_model=TestResult)
    async def submit(body: TestSubmit, user: AuthUser = Depends(get_current_user), db: SupabaseRest = Depends(get_db)) -> TestResult:
        test = find(body.test_id)
        try:
            correct, band, results = pt.grade(test, body.answers)
        except ValueError as exc:
            raise ApiError(422, "invalid_answers", str(exc)) from None
        saved = await db.insert(
            table,
            {"user_id": user.id, "test_id": test.id, "answers": body.answers, "correct": correct, "total": len(results), "estimated_band": band},
        )
        return TestResult(test_id=test.id, title=test.title, correct=correct, total=len(results), estimated_band=band, results=results, created_at=saved.get("created_at"))

    @router.get("/attempts", response_model=list[AttemptSummary])
    async def attempts(user: AuthUser = Depends(get_current_user), db: SupabaseRest = Depends(get_db)) -> list[AttemptSummary]:
        tests = pt.load_tests(kind)
        return [
            AttemptSummary(
                id=r["id"], test_id=r["test_id"], title=tests[r["test_id"]].title if r["test_id"] in tests else r["test_id"],
                correct=r["correct"], total=r["total"], estimated_band=r.get("estimated_band"), created_at=r.get("created_at"),
            )
            for r in await db.list_for_user(table, user.id, limit=50)
        ]

    return router
