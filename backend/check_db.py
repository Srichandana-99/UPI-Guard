import asyncio
from app.db.supabase import get_supabase

async def check():
    client = get_supabase()
    # Let's try to query profiles
    res = client.table("profiles").select("*").limit(1).execute()
    print("Profiles:", res)

asyncio.run(check())
