"""Speech-to-text with faster-whisper (open-source, runs locally, free).

faster-whisper is an optional dependency (see requirements-stt.txt). When it is missing the
API answers 503 `stt_unavailable` and the app lets the student type their answer instead.
Audio is processed from a temporary file that is always deleted: it is never stored.
"""
import asyncio
import os
import tempfile
from functools import lru_cache

from app.core.errors import ApiError

ALLOWED_TYPES = {
    "audio/webm": ".webm",
    "audio/ogg": ".ogg",
    "audio/wav": ".wav",
    "audio/x-wav": ".wav",
    "audio/mp4": ".mp4",
    "audio/mpeg": ".mp3",
    "audio/x-m4a": ".m4a",
}


def validate_audio(content_type: str | None, size_bytes: int, max_mb: int) -> str:
    """Returns a safe file suffix, or raises ApiError."""
    base = (content_type or "").split(";")[0].strip().lower()
    if base not in ALLOWED_TYPES:
        raise ApiError(415, "unsupported_audio", "That audio format isn't supported. Please record again.")
    if size_bytes <= 0:
        raise ApiError(422, "empty_audio", "The recording was empty. Please try again.")
    if size_bytes > max_mb * 1024 * 1024:
        raise ApiError(413, "audio_too_large", f"That recording is too large (limit {max_mb} MB). Try a shorter answer.")
    return ALLOWED_TYPES[base]


@lru_cache
def _model(name: str):
    try:
        from faster_whisper import WhisperModel  # type: ignore
    except ImportError:
        raise ApiError(503, "stt_unavailable", "Speech-to-text isn't installed on this server. You can type your answer instead.") from None
    return WhisperModel(name, device="cpu", compute_type="int8")


def _run(path: str, model_name: str) -> tuple[str, float | None]:
    segments, info = _model(model_name).transcribe(path, language="en", vad_filter=True, beam_size=1)
    text = " ".join(s.text.strip() for s in segments).strip()
    return text, getattr(info, "duration", None)


async def transcribe_bytes(data: bytes, suffix: str, model_name: str) -> tuple[str, float | None]:
    fd, path = tempfile.mkstemp(suffix=suffix)
    try:
        with os.fdopen(fd, "wb") as f:
            f.write(data)
        return await asyncio.to_thread(_run, path, model_name)
    except ApiError:
        raise
    except Exception:
        raise ApiError(500, "transcribe_failed", "We couldn't read that recording. Please try again, or type your answer.") from None
    finally:
        try:
            os.remove(path)
        except OSError:
            pass
