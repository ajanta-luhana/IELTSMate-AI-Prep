from fastapi import APIRouter, Depends

from app.core.deps import get_db
from app.core.auth import AuthUser, get_current_user
from app.schemas.profile import Profile, ProfileUpdate
from app.services.supabase_rest import SupabaseRest

router = APIRouter(prefix="/auth", tags=["auth"])


@router.get("/profile", response_model=Profile)
async def read_profile(user: AuthUser = Depends(get_current_user), db: SupabaseRest = Depends(get_db)) -> Profile:
    row = await db.get_profile(user.id)
    if row is None:  # signup trigger missed (e.g. account created before the schema was applied)
        row = await db.upsert_profile({"id": user.id, "email": user.email})
    return Profile.model_validate(row)


@router.post("/profile", response_model=Profile)
async def save_profile(
    body: ProfileUpdate, user: AuthUser = Depends(get_current_user), db: SupabaseRest = Depends(get_db)
) -> Profile:
    row = {"id": user.id, "email": user.email, **body.model_dump(mode="json", exclude_unset=True)}
    return Profile.model_validate(await db.upsert_profile(row))
