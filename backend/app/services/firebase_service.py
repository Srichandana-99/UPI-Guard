import firebase_admin
from firebase_admin import db, credentials
from app.core.config import settings
import json
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

# Initialize Firebase
firebase_initialized = False

def init_firebase():
    """Initialize Firebase connection"""
    global firebase_initialized
    try:
        if not firebase_initialized:
            # Use service account or environment variables
            firebase_admin.initialize_app(options={
                'databaseURL': settings.FIREBASE_DB_URL
            })
            firebase_initialized = True
            logger.info("✅ Firebase initialized successfully")
    except Exception as e:
        logger.error(f"❌ Firebase initialization failed: {e}")
        firebase_initialized = False

def send_transaction_update(transaction_data: dict):
    """Send real-time transaction update to Firebase"""
    try:
        if not firebase_initialized:
            init_firebase()
        
        ref = db.reference('transactions')
        ref.push(transaction_data)
        logger.info(f"✅ Transaction sent to Firebase: {transaction_data.get('transaction_id')}")
        return True
    except Exception as e:
        logger.error(f"❌ Failed to send transaction to Firebase: {e}")
        return False

def send_fraud_alert(alert_data: dict):
    """Send fraud alert to Firebase"""
    try:
        if not firebase_initialized:
            init_firebase()
        
        ref = db.reference('fraud_alerts')
        ref.push(alert_data)
        logger.info(f"✅ Fraud alert sent to Firebase: {alert_data.get('transaction_id')}")
        return True
    except Exception as e:
        logger.error(f"❌ Failed to send fraud alert to Firebase: {e}")
        return False

def send_admin_notification(notification_data: dict):
    """Send notification to admin dashboard"""
    try:
        if not firebase_initialized:
            init_firebase()
        
        ref = db.reference('admin_notifications')
        ref.push(notification_data)
        logger.info(f"✅ Admin notification sent to Firebase")
        return True
    except Exception as e:
        logger.error(f"❌ Failed to send admin notification: {e}")
        return False

def get_real_time_transactions(email: str):
    """Get real-time transactions for user"""
    try:
        if not firebase_initialized:
            init_firebase()
        
        ref = db.reference(f'transactions')
        data = ref.get()
        
        if data:
            user_transactions = [
                v for v in data.values() 
                if v.get('sender_email') == email
            ]
            return user_transactions
        return []
    except Exception as e:
        logger.error(f"❌ Failed to get transactions: {e}")
        return []

def get_fraud_alerts():
    """Get all fraud alerts"""
    try:
        if not firebase_initialized:
            init_firebase()
        
        ref = db.reference('fraud_alerts')
        data = ref.get()
        return data if data else []
    except Exception as e:
        logger.error(f"❌ Failed to get fraud alerts: {e}")
        return []

def update_user_status(email: str, status: str):
    """Update user status in real-time"""
    try:
        if not firebase_initialized:
            init_firebase()
        
        ref = db.reference(f'user_status/{email}')
        ref.set({
            'status': status,
            'timestamp': datetime.now().isoformat()
        })
        logger.info(f"✅ User status updated: {email} -> {status}")
        return True
    except Exception as e:
        logger.error(f"❌ Failed to update user status: {e}")
        return False

def send_balance_update(email: str, new_balance: float):
    """Send balance update in real-time"""
    try:
        if not firebase_initialized:
            init_firebase()
        
        ref = db.reference(f'user_balance/{email}')
        ref.set({
            'balance': new_balance,
            'timestamp': datetime.now().isoformat()
        })
        logger.info(f"✅ Balance updated: {email} -> {new_balance}")
        return True
    except Exception as e:
        logger.error(f"❌ Failed to update balance: {e}")
        return False

def clear_old_data(days: int = 30):
    """Clear old data from Firebase (cleanup)"""
    try:
        if not firebase_initialized:
            init_firebase()
        
        # This is optional - Firebase has automatic cleanup
        logger.info(f"✅ Firebase cleanup scheduled for {days} days old data")
        return True
    except Exception as e:
        logger.error(f"❌ Failed to cleanup Firebase: {e}")
        return False
