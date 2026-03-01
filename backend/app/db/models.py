from sqlalchemy import Column, String, Numeric, Boolean, DateTime, Integer, Float
from sqlalchemy.sql import func
from app.db.database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, index=True)
    full_name = Column(String)
    email = Column(String, unique=True, index=True, nullable=False)
    mobile = Column(String)
    password_hash = Column(String, nullable=True)
    upi_pin_hash = Column(String, nullable=True)
    upi_id = Column(String, unique=True, index=True)
    qr_code = Column(String, unique=True, index=True)
    balance = Column(Numeric(10, 2), default=0.00)
    verified = Column(Boolean, default=False)
    role = Column(String, default="user")
    is_fraud_risk = Column(Boolean, default=False)
    is_blocked = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Transaction(Base):
    __tablename__ = "transactions"
    id = Column(String, primary_key=True, index=True)
    sender_email = Column(String, nullable=False, index=True)
    receiver_upi_id = Column(String, nullable=False)
    amount = Column(Numeric(10, 2), nullable=False)
    date = Column(DateTime(timezone=True), server_default=func.now())
    status = Column(String, default="Completed")
    hour_of_day = Column(Integer)
    location_mismatch = Column(Integer, default=0)
    is_new_receiver = Column(Integer, default=0)
    velocity_1h = Column(Integer, default=1)

class LocationLog(Base):
    __tablename__ = "location_logs"
    id = Column(String, primary_key=True, index=True)
    user_email = Column(String, nullable=False, index=True)
    latitude = Column(Float)
    longitude = Column(Float)
    accuracy = Column(Float)
    ip_address = Column(String)
    user_agent = Column(String)
    action = Column(String, default="app_open")  # app_open, login, transaction, etc.
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
