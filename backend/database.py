import os
import random
import re
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from supabase import create_client, Client
from dotenv import load_dotenv
from datetime import datetime

# Load environment variables
load_dotenv()

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")
smtp_email: str = os.environ.get("SMTP_EMAIL")
smtp_password: str = os.environ.get("SMTP_PASSWORD")

if not url or not key:
    print("⚠️ Supabase URL and Key NOT found in environment. Database operations will fail.")
    supabase = None
else:
    try:
        supabase: Client = create_client(url, key)
    except Exception as e:
         print(f"❌ Error connecting to Supabase: {e}")
         supabase = None
# --- User Management ---

def validate_password(password):
    """
    Validate password strength:
    - At least 8 characters
    - At least one uppercase letter
    - At least one number
    - At least one special character
    """
    if len(password) < 8:
        return False, "Password must be at least 8 characters long"
    if not re.search(r"[A-Z]", password):
        return False, "Password must contain at least one uppercase letter"
    if not re.search(r"\d", password):
        return False, "Password must contain at least one number"
    if not re.search(r"[@$!%*?&]", password):
        return False, "Password must contain at least one special character (@$!%*?&)"
    return True, "Valid"

def send_otp_email(to_email, otp):
    """Send OTP via SMTP."""
    if not smtp_email or not smtp_password:
        print(f"⚠️ SMTP not configured. OTP for {to_email}: {otp}")
        return False
    
    try:
        msg = MIMEMultipart()
        msg['From'] = smtp_email
        msg['To'] = to_email
        msg['Subject'] = "Your PaySecure Verification Code"

        body = f"Hello,\n\nYour verification code is: {otp}\n\nThis code expires in 10 minutes.\n\nBest,\nPaySecure Team"
        msg.attach(MIMEText(body, 'plain'))

        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(smtp_email, smtp_password)
        text = msg.as_string()
        server.sendmail(smtp_email, to_email, text)
        server.quit()
        print(f"✅ Email sent to {to_email}")
        return True
    except Exception as e:
        print(f"❌ Error sending email: {e}")
        # Fallback to console for dev
        print(f"📧 [FALLBACK] To: {to_email} | Code: {otp}")
        return False

def create_user(name, email, password):
    """Create a new user with default balance and OTP."""
    try:
        # 1. Validate Password
        is_valid, msg = validate_password(password)
        if not is_valid:
            print(f"Password validation failed: {msg}")
            # Raise exception or return special error structure? 
            # Ideally return tuple/dict. Existing behaves as Bool.
            # Let's workaround to keep True/False signature or change it?
            # Changing signature requires main.py update. 
            # I'll update main.py to handle exceptions or dict return.
            raise ValueError(msg)

        # Check if user exists
        existing = supabase.table('users').select("*").eq('email', email).execute()
        if existing.data:
            return False

        # Generate OTP
        otp = str(random.randint(100000, 999999))
        
        # Send Email
        send_otp_email(email, otp)

        # Create user
        payload = {
            "name": name,
            "email": email,
            "password": password, 
            "balance": 10000.0, 
            "is_verified": False,
            "verification_code": otp,
            "created_at": datetime.now().isoformat()
        }
        supabase.table('users').insert(payload).execute()
        return True
    except ValueError as ve:
        # Re-raise for main.py to catch
        raise ve
    except Exception as e:
        print(f"Error creating user: {e}")
        return False

def verify_email_otp(email, code):
    """Verify the OTP code."""
    try:
        response = supabase.table('users').select("verification_code, id").eq('email', email).execute()
        if not response.data:
            return False, "User not found"
        
        user = response.data[0]
        if user['verification_code'] == code:
            # Mark as verified
            supabase.table('users').update({"is_verified": True, "verification_code": None}).eq('id', user['id']).execute()
            return True, "Verified successfully"
        else:
            return False, "Invalid code"
    except Exception as e:
        print(f"Error verifying OTP: {e}")
        return False, "Verification error"

def verify_user(email, password):
    """Verify user credentials and return user details."""
    try:
        response = supabase.table('users').select("*").eq('email', email).eq('password', password).execute()
        if response.data:
            user = response.data[0]
            # Check verification status
            if not user.get('is_verified', True): # Default to True if column missing (fallback) or False if strictly needed
                # Ideally we enforce False, but for migration safety if column null...
                # Let's enforce it if the value is explicitly False
                if user.get('is_verified') is False:
                    return {"error": "Email not verified", "code": "NOT_VERIFIED"}
            return user
        return None
    except Exception as e:
        print(f"Error verifying user: {e}")
        return None

def process_p2p_transfer(sender_id, amount, recipient_upi_id):
    """
    Handles P2P transfer: Credit to recipient.
    recipient_upi_id is treated as email for this demo simplifying lookup.
    """
    try:
        # 1. Find Recipient by UPI ID
        recipient_upi_id = recipient_upi_id
        
        # Strategy: Search for user with this UPI ID
        res = supabase.table('users').select("*").eq('upi_id', recipient_upi_id).execute()
        recipient = res.data[0] if res.data else None
        
        if not recipient:
            print(f"Recipient not found: {recipient_email}")
            return False

        # 2. Credit Recipient
        new_balance = recipient['balance'] + amount
        update_user_balance(recipient['id'], new_balance)
        print(f"Credited {amount} to {recipient['email']}")
        return True

    except Exception as e:
        print(f"Error in P2P transfer: {e}")
        return False

# --- Fraud Engine Helpers ---

def get_user_stats(upi_id):
    """Calculate real stats for a user from history (Supabase)."""
    try:
        # Fetch all transactions for this user to calculate stats
        response = supabase.table('transactions').select("amount, is_fraud").eq('upi_id', upi_id).execute()
        txs = response.data
        
        if not txs:
             return {
                "AvgTransactionAmount": 0.0,
                "TransactionFrequency": 0,
                "FailedAttempts": 0
            }
        
        total_amount = sum(t['amount'] for t in txs)
        count = len(txs)
        # Check if is_fraud is boolean or int in DB. Assuming boolean from previous code or 0/1. 
        # API returns what is in DB.
        failed = sum(1 for t in txs if t['is_fraud'])
        
        return {
            "AvgTransactionAmount": total_amount / count if count > 0 else 0.0,
            "TransactionFrequency": count,
            "FailedAttempts": failed
        }
    except Exception as e:
        print(f"Error getting user stats: {e}")
        return {
            "AvgTransactionAmount": 0.0,
            "TransactionFrequency": 0,
            "FailedAttempts": 0
        }

def get_last_transaction(upi_id):
    """Get the last successful transaction for a user."""
    try:
        response = supabase.table('transactions').select("latitude, longitude, timestamp")\
            .eq('upi_id', upi_id).eq('status', 'SUCCESS')\
            .order('timestamp', desc=True).limit(1).execute()
        
        if response.data:
            return response.data[0]
        return None
    except Exception as e:
        print(f"Error getting last transaction: {e}")
        return None

def get_user_balance(user_id):
    """Fetch current balance for a user."""
    try:
        response = supabase.table('users').select("balance").eq('id', user_id).execute()
        if response.data:
            return response.data[0]['balance']
        return 0.0
    except Exception as e:
        print(f"Error fetching balance: {e}")
        return 0.0

def update_user_balance(user_id, new_balance):
    """Update user balance after transaction."""
    try:
        supabase.table('users').update({"balance": new_balance}).eq('id', user_id).execute()
        return True
    except Exception as e:
        print(f"Error updating balance: {e}")
        return False

def get_recent_transactions():
    """Fetch recent transactions for the public monitor."""
    try:
        response = supabase.table('transactions').select("*").order('timestamp', desc=True).limit(20).execute()
        return response.data if response.data else []
    except Exception as e:
        print(f"Error fetching transactions: {e}")
        return []

def get_user_transactions(user_id):
    """Fetch transaction history for a specific user (Sent and Received)."""
    try:
        # 1. Get User's UPI ID
        user_res = supabase.table('users').select("upi_id").eq('id', user_id).execute()
        user_upi_id = user_res.data[0]['upi_id'] if user_res.data else None

        # 2. Fetch Sent (user_id) OR Received (upi_id)
        # Supabase 'or' syntax: .or_(f"user_id.eq.{user_id},upi_id.eq.{user_upi_id}")
        query = f"user_id.eq.{user_id}"
        if user_upi_id:
            query += f",upi_id.eq.{user_upi_id}"
            
        response = supabase.table('transactions').select("*, users:user_id(name)").or_(query).order('timestamp', desc=True).limit(50).execute()
        return response.data if response.data else []
    except Exception as e:
        print(f"Error fetching user history: {e}")
        return []

def log_transaction(tx_data):
    """Log a transaction to the database."""
    try:
        record = {
            "user_id": tx_data.get("userId"),
            "amount": tx_data.get("amount"),
            "upi_id": tx_data.get("upiId"),
            "status": tx_data.get("status"),
            "latitude": tx_data.get("latitude"),
            "longitude": tx_data.get("longitude"),
            "device_id": tx_data.get("deviceId"),
            "ip_address": tx_data.get("ipAddress"),
            "is_fraud": tx_data.get("isFraud"),
            "message": tx_data.get("message"),
            "timestamp": tx_data.get("timestamp")
        }
        supabase.table('transactions').insert(record).execute()
    except Exception as e:
        # Intentionally swallow log errors to not break txn flow, but print
        print(f"Error logging transaction: {e}")
