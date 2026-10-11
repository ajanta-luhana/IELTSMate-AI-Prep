"""Application settings, loaded from environment variables (see .env.example)."""
from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_env: str = "development"
    cors_origins: str = "http://localhost:3000"

    supabase_url: str = ""
    supabase_service_key: str = ""

    ai_provider: str = "ollama"  # ollama | local | cloud
    ollama_base_url: str = "http://localhost:11434"
    model_name: str = "qwen2.5:3b-instruct"
    ai_timeout_seconds: float = 90

    whisper_model: str = "base.en"
    max_audio_mb: int = 10

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
