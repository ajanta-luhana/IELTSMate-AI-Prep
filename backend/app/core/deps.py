from fastapi import Depends

from app.config import Settings, get_settings
from app.services.supabase_rest import SupabaseRest


def get_db(settings: Settings = Depends(get_settings)) -> SupabaseRest:
    return SupabaseRest(settings)
