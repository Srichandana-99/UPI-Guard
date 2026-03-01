from supabase import create_client, Client
from app.core.config import settings

def get_supabase() -> Client:
    url: str = settings.SUPABASE_URL
    key: str = settings.SUPABASE_KEY
    if not url or not key:
        return None
    try:
        return create_client(url, key)
    except Exception as e:
        print(f"Warning: Could not initialize Supabase client: {e}")
        return None

supabase_client = get_supabase()
