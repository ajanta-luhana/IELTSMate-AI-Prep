"""Tiny in-memory sliding-window limiter (no web-framework imports, so it is easy to test).

For several workers or servers, replace the store with a shared one (e.g. Redis); callers stay the same.
"""
import time
from collections import defaultdict, deque


class SlidingWindowLimiter:
    def __init__(self, max_calls: int, window_seconds: float, clock=time.monotonic) -> None:
        self.max_calls, self.window, self._clock = max_calls, window_seconds, clock
        self._hits: dict[str, deque[float]] = defaultdict(deque)

    def check(self, key: str) -> float | None:
        """Record a call. Returns None if allowed, else seconds to wait."""
        now = self._clock()
        hits = self._hits[key]
        while hits and now - hits[0] >= self.window:
            hits.popleft()
        if len(hits) >= self.max_calls:
            return max(1.0, self.window - (now - hits[0]))
        hits.append(now)
        return None
