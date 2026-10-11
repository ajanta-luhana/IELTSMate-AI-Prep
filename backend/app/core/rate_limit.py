"""FastAPI dependency that rate-limits expensive endpoints per signed-in user."""
from fastapi import Depends

from app.core.auth import AuthUser, get_current_user
from app.core.errors import ApiError
from app.core.limiter import SlidingWindowLimiter


def rate_limit(bucket: str, max_calls: int, window_seconds: float):
    limiter = SlidingWindowLimiter(max_calls, window_seconds)

    async def dependency(user: AuthUser = Depends(get_current_user)) -> None:
        wait = limiter.check(f"{bucket}:{user.id}")
        if wait is not None:
            raise ApiError(429, "rate_limited", f"You're going a bit fast. Please wait {int(wait)} seconds and try again.")

    return dependency
