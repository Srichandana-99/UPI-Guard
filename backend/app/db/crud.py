from sqlalchemy.orm import Session
from app.db.models import User, Transaction, LocationLog
from app.core.config import settings
import uuid

def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()

def get_user_by_upi_id(db: Session, upi_id: str):
    return db.query(User).filter(User.upi_id == upi_id).first()

def validate_upi_id(db: Session, upi_id: str):
    """Validate if UPI ID exists and return user info"""
    user = get_user_by_upi_id(db, upi_id)
    if user:
        return {
            "valid": True,
            "name": user.full_name,
            "upi_id": user.upi_id,
            "verified": user.verified
        }
    return {"valid": False, "message": "UPI ID not found"}

def create_user(db: Session, user_data: dict):
    role = "admin" if user_data["email"].strip().lower() in settings.admin_emails_set else "user"
    user_id = str(uuid.uuid4())
    upi_id = user_data["email"].split("@")[0].lower() + "@secureupi"
    # Generate unique QR code: upi://pay?pa=UPI_ID&pn=NAME&mc=0000
    qr_code = f"upi://pay?pa={upi_id}&pn={user_data['full_name'].replace(' ', '%20')}&mc=0000&tid={user_id[:8]}"
    db_user = User(
        id=user_id,
        full_name=user_data["full_name"],
        email=user_data["email"],
        mobile=user_data["mobile"],
        password_hash=user_data.get("password_hash"),
        upi_pin_hash=user_data.get("upi_pin_hash"),
        upi_id=upi_id,
        qr_code=qr_code,
        balance=0.00,
        verified=False,
        role=role,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def verify_user(db: Session, email: str):
    user = get_user_by_email(db, email)
    if user:
        user.verified = True
        db.commit()
        db.refresh(user)
    return user

def create_transaction(db: Session, txn_data: dict):
    db_txn = Transaction(
        id=txn_data["transaction_id"],
        sender_email=txn_data["sender_email"],
        receiver_upi_id=txn_data["receiver_upi_id"],
        amount=txn_data["amount"],
        date=txn_data.get("date"),
        status=txn_data.get("status", "Completed"),
        hour_of_day=txn_data.get("hour_of_day"),
        location_mismatch=txn_data.get("location_mismatch", 0),
        is_new_receiver=txn_data.get("is_new_receiver", 0),
        velocity_1h=txn_data.get("velocity_1h", 1),
    )
    db.add(db_txn)
    db.commit()
    db.refresh(db_txn)
    return db_txn

def update_user_balance(db: Session, email: str, new_balance: float):
    user = get_user_by_email(db, email)
    if user:
        user.balance = new_balance
        db.commit()
        db.refresh(user)
    return user

def get_transactions_by_user(db: Session, email: str):
    return db.query(Transaction).filter(Transaction.sender_email == email).order_by(Transaction.date.desc()).all()

def get_all_users(db: Session):
    return db.query(User).all()

def get_all_transactions(db: Session):
    return db.query(Transaction).order_by(Transaction.date.desc()).all()

def toggle_user_block(db: Session, email: str, is_blocked: bool):
    user = get_user_by_email(db, email)
    if user:
        user.is_blocked = is_blocked
        db.commit()
        db.refresh(user)
    return user

def create_location_log(db: Session, location_data: dict):
    db_location = LocationLog(
        id=str(uuid.uuid4()),
        user_email=location_data["user_email"],
        latitude=location_data.get("latitude"),
        longitude=location_data.get("longitude"),
        accuracy=location_data.get("accuracy"),
        ip_address=location_data.get("ip_address"),
        user_agent=location_data.get("user_agent"),
        action=location_data.get("action", "app_open"),
    )
    db.add(db_location)
    db.commit()
    db.refresh(db_location)
    return db_location

def get_user_location_logs(db: Session, email: str, limit: int = 50):
    return db.query(LocationLog).filter(LocationLog.user_email == email).order_by(LocationLog.timestamp.desc()).limit(limit).all()

def get_all_location_logs(db: Session, limit: int = 100):
    return db.query(LocationLog).order_by(LocationLog.timestamp.desc()).limit(limit).all()
