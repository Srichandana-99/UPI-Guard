import os
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables
load_dotenv()

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")

if not url or not key:
    raise ValueError("Supabase URL and Key must be set in .env file")

supabase: Client = create_client(url, key)

def migrate():
    print("🚀 Starting UPI ID Migration...")

    # 1. Fetch all users
    try:
        users = supabase.table('users').select("*").execute()
        if not users.data:
            print("No users found to migrate.")
            return
        
        print(f"Found {len(users.data)} users. Checking for missing UPI IDs...")

        for user in users.data:
            # Check if upi_id is already present (if column exists and is populated)
            # Note: If column doesn't exist, 'upi_id' key might be missing or None
            current_upi = user.get('upi_id')
            
            if not current_upi:
                # Generate UPI ID: email_prefix@siri
                email_prefix = user['email'].split('@')[0]
                new_upi = f"{email_prefix}@siri"
                
                print(f"  - Updating {user['email']} -> {new_upi}")
                
                # Update user
                try:
                    supabase.table('users').update({"upi_id": new_upi}).eq("id", user['id']).execute()
                    print("    ✅ Updated.")
                except Exception as e:
                    print(f"    ❌ Failed to update: {e}")
            else:
                print(f"  - {user['email']} already has UPI ID: {current_upi}")

    except Exception as e:
        print(f"Error fetching users: {e}")
        # If column doesn't exist, we might get an error here or need to add it via SQL first.
        # Since we can't easily run DDL via 'supabase-py' client directly (usually), 
        # we rely on the user running the SQL or we try to assume the column exists 
        # (which we can't ensure without SQL access).
        # HOWEVER, we can use the 'rpc' call if we had a stored procedure, OR 
        # we just assume the user has applied schema.sql or we use a raw SQL query tool if available.
        # But for this environment, let's assume I need to guide the user or use what I have.
        # Wait, I have 'run_command' tool. I can run python scripts. 
        # I can also try to edit the database.py if it has connection logic.
        pass

    print("🏁 Migration Check Complete.")

if __name__ == "__main__":
    migrate()
