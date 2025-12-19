import sqlite3
import random
import uuid
from datetime import datetime, timedelta

DB_NAME = "transactions.db"
USER_UPI = "chandana@upi"

# Configuration for seeding
NUM_TRANSACTIONS = 50
MIN_AMOUNT = 50.0
MAX_AMOUNT = 5000.0
BASE_LAT = 12.9716 # Bangalore
BASE_LON = 77.5946

def seed_data():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    
    print(f"Seeding data for {USER_UPI}...")
    
    # Optional: Clear existing data for this user to ensure clean state
    # cursor.execute("DELETE FROM transactions WHERE upi_id = ?", (USER_UPI,))
    
    transactions = []
    
    for _ in range(NUM_TRANSACTIONS):
        tx_id = f"TX{uuid.uuid4().hex[:8].upper()}"
        amount = round(random.uniform(MIN_AMOUNT, MAX_AMOUNT), 2)
        
        # Random time in last 30 days
        days_ago = random.randint(0, 30)
        hours_ago = random.randint(0, 23)
        minutes_ago = random.randint(0, 59)
        timestamp = datetime.now() - timedelta(days=days_ago, hours=hours_ago, minutes=minutes_ago)
        
        # Location with small variance (approx 1-5km radius)
        lat = BASE_LAT + random.uniform(-0.05, 0.05)
        lon = BASE_LON + random.uniform(-0.05, 0.05)
        
        # Mostly success
        status = "SUCCESS" if random.random() > 0.05 else "FAILED"
        
        # Mostly legitimate
        is_fraud = 0
        fraud_reason = None
        
        # Occasional anomaly (high amount)
        if random.random() > 0.95:
             amount = round(random.uniform(10000, 50000), 2)
             # is_fraud = 1 # We can mark it fraud or let the engine detect it. Let's mark legitimate high value for now.
        
        cursor.execute('''
            INSERT INTO transactions (
                transaction_id, upi_id, amount, timestamp, status, 
                latitude, longitude, device_id, ip_address, is_fraud, fraud_reason
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            tx_id, USER_UPI, amount, timestamp, status, 
            lat, lon, "dev_chandana_pixel", "192.168.1.10", is_fraud, fraud_reason
        ))
        
    conn.commit()
    conn.close()
    print(f"Successfully added {NUM_TRANSACTIONS} transactions for {USER_UPI}.")

if __name__ == "__main__":
    seed_data()
