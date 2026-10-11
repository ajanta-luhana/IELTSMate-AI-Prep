"""Authentication: validates the user's Supabase access token by asking Supabase Auth.

Asking Supabase (instead of verifying the JWT locally) works for every signing-key
type, so no JWT secret has to be configured.
"""
import httpx
from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel

from app.config import Settings, get_settings
from app.core.errors import ApiError

_bearer = HTTPBearer(auto_error=False)


class AuthUser(BaseModel):
    id: str
    email: str = ""


async def get_current_user(
    creds: HTTPAuthorizationCredentials | None = Depends(_bearer),
    settings: Settings = Depends(get_settings),
) -> AuthUser:
    if creds is None:
        raise ApiError(401, "not_authenticated", "Please sign in to continue.")
    if not settings.supabase_url or not settings.supabase_service_key:
        raise ApiError(503, "auth_not_configured", "The server is not connected to Supabase yet.")
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(
                f"{settings.supabase_url.rstrip('/')}/auth/v1/user",
                headers={"Authorization": f"Bearer {creds.credentials}", "apikey": settings.supabase_service_key},
            )
    except httpx.HTTPError:
        raise ApiError(503, "auth_unavailable", "Can't reach the sign-in service. Try again shortly.") from None
    if resp.status_code != 200:
        raise ApiError(401, "invalid_token", "Your session has expired. Please sign in again.")
    data = resp.json()
    return AuthUser(id=data["id"], email=data.get("email") or "")
