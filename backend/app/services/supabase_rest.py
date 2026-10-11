"""Minimal PostgREST client. Uses the service key, so it must only run on the server."""
from typing import Any

import httpx

from app.config import Settings
from app.core.errors import ApiError


class SupabaseRest:
    def __init__(self, settings: Settings) -> None:
        if not settings.supabase_url or not settings.supabase_service_key:
            raise ApiError(503, "db_not_configured", "The server is not connected to Supabase yet.")
        self._base = f"{settings.supabase_url.rstrip('/')}/rest/v1"
        self._headers = {
            "apikey": settings.supabase_service_key,
            "Authorization": f"Bearer {settings.supabase_service_key}",
            "Content-Type": "application/json",
        }

    async def _request(self, method: str, path: str, *, prefer: str | None = None, **kw: Any) -> list[dict]:
        headers = dict(self._headers)
        if prefer:
            headers["Prefer"] = prefer
        try:
            async with httpx.AsyncClient(timeout=15) as client:
                resp = await client.request(method, f"{self._base}{path}", headers=headers, **kw)
        except httpx.HTTPError:
            raise ApiError(503, "db_unavailable", "Can't reach the database. Try again shortly.") from None
        if resp.status_code >= 400:
            raise ApiError(500, "db_error", "The database rejected the request.")
        return resp.json() if resp.content else []

    async def get_profile(self, user_id: str) -> dict | None:
        rows = await self._request("GET", "/profiles", params={"id": f"eq.{user_id}", "select": "*"})
        return rows[0] if rows else None

    async def upsert_profile(self, row: dict) -> dict:
        rows = await self._request(
            "POST",
            "/profiles",
            params={"on_conflict": "id"},
            prefer="resolution=merge-duplicates,return=representation",
            json=row,
        )
        return rows[0]

    async def insert(self, table: str, row: dict) -> dict:
        rows = await self._request("POST", f"/{table}", prefer="return=representation", json=row)
        return rows[0]

    async def latest(self, table: str, user_id: str) -> dict | None:
        rows = await self._request(
            "GET", f"/{table}", params={"user_id": f"eq.{user_id}", "select": "*", "order": "created_at.desc", "limit": "1"}
        )
        return rows[0] if rows else None

    async def list_for_user(self, table: str, user_id: str, *, limit: int = 500, newest_first: bool = True) -> list[dict]:
        order = "created_at.desc" if newest_first else "created_at.asc"
        return await self._request(
            "GET", f"/{table}", params={"user_id": f"eq.{user_id}", "select": "*", "order": order, "limit": str(limit)}
        )

    async def get_for_user(self, table: str, user_id: str, row_id: str) -> dict | None:
        rows = await self._request("GET", f"/{table}", params={"user_id": f"eq.{user_id}", "id": f"eq.{row_id}", "select": "*"})
        return rows[0] if rows else None
