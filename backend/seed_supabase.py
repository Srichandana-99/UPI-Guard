import os
import random
from datetime import datetime, timedelta
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables
load_dotenv()

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")

if not url or not key:
    raise ValueError("Supabase URL and Key must be set in .env file")

supabase: Client = create_client(url, key)

def seed_data():
    print("🌱 Starting Database Seeding...")

    # --- 1. Create Dummy Users ---
    # Function to get random balance between 2L and 8L
    def get_random_balance():
        return float(random.randint(200000, 800000))

    # --- 1. Create Dummy Users ---
    users = [
        {"name": "Alice Sharma", "email": "alice@example.com", "password": "password123", "balance": get_random_balance()},
        {"name": "Bob Gupta", "email": "bob@example.com", "password": "password123", "balance": get_random_balance()},
        {"name": "Charlie Singh", "email": "charlie@example.com", "password": "password123", "balance": get_random_balance()},
        {"name": "David Lee", "email": "david@example.com", "password": "password123", "balance": get_random_balance()},
        {"name": "Eve Pol", "email": "eve@example.com", "password": "password123", "balance": get_random_balance()},
    ]

    created_users = []

    print(f"Creating {len(users)} users...")
    for u in users:
        # Check if exists
        existing = supabase.table('users').select("id").eq('email', u['email']).execute()
        if not existing.data:
            data = {
                "name": u['name'],
                "email": u['email'],
                "password": u['password'],
                "balance": u['balance'],
                "upi_id": u['email'].split('@')[0] + "@siri",
                "created_at": datetime.now().isoformat()
            }
            res = supabase.table('users').insert(data).execute()
            if res.data:
                created_users.append(res.data[0])
                print(f"✅ Created user: {u['name']}")
        else:
            created_users.append(existing.data[0])
            print(f"⚠️ User already exists: {u['name']}")

    # --- 2. Create Dummy Transactions ---
    print("\nCreating Dummy Transactions...")
    
    upi_ids = ["alice@upi", "bob@upi", "merchant@upi", "shop@upi", "unknown@upi"]
    statuses = ["SUCCESS", "SUCCESS", "SUCCESS", "FAILED", "SUCCESS"] # Weighted towards success
    
    # Generate 50 transactions
    for i in range(50):
        # Pick a random user sender
        sender = random.choice(created_users)
        
        is_fraud = random.random() < 0.1 # 10% chance of fraud
        amount = random.randint(100, 5000)
        if is_fraud:
            amount = random.randint(50000, 200000) # outlier
            
        data = {
            "user_id": sender['id'],
            "amount": float(amount),
            "upi_id": random.choice(upi_ids),
            "status": "FRAUD" if is_fraud else random.choice(statuses),
            "latitude": 12.9716 + random.uniform(-0.1, 0.1), # Roughly Bangalore
            "longitude": 77.5946 + random.uniform(-0.1, 0.1),
            "device_id": f"device_{random.randint(100, 999)}",
            "ip_address": f"192.168.1.{random.randint(2, 255)}",
            "is_fraud": is_fraud,
            "message": "Suspicious high value" if is_fraud else "Payment Successful",
            "timestamp": (datetime.now() - timedelta(days=random.randint(0, 30), minutes=random.randint(0, 1440))).isoformat()
        }

        try:
            supabase.table('transactions').insert(data).execute()
        except Exception as e:
            print(f"Error inserting transaction: {e}")

    print("✅ Seeding Complete!")

if __name__ == "__main__":
    seed_data()
