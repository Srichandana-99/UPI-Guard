from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, validator, EmailStr
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.crud import get_user_by_email, create_user, verify_user
from app.core.config import settings
from app.db.supabase import supabase_client
from app.services.email_service import EmailService
from typing import Optional
import re
import bcrypt

router = APIRouter()

# Initialize email service
email_service = EmailService()

class RegisterRequest(BaseModel):
    fullName: str
    email: str
    mobile: str
    dob: str
    age: int
    password: str
    confirmPassword: str
    upiPin: str
    confirmUpiPin: str
    
    @validator('email')
    def validate_email(cls, v):
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_pattern, v):
            raise ValueError('Invalid email format')
        return v.lower()
    
    @validator('mobile')
    def validate_mobile(cls, v):
        cleaned = re.sub(r'[\s\-\+]', '', v)
        if cleaned.startswith('91') and len(cleaned) == 12:
            cleaned = cleaned[2:]
        if not re.match(r'^\d{10}$', cleaned):
            raise ValueError('Mobile number must be 10 digits')
        return cleaned
    
    @validator('age', pre=True)
    def validate_age(cls, v):
        try:
            age_int = int(v)
            if age_int < 18:
                raise ValueError('Must be at least 18 years old')
            return age_int
        except (ValueError, TypeError):
            raise ValueError('Age must be a valid number')
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not re.search(r'[a-z]', v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not re.search(r'\d', v):
            raise ValueError('Password must contain at least one number')
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', v):
            raise ValueError('Password must contain at least one special character')
        return v
    
    @validator('confirmPassword')
    def passwords_match(cls, v, values):
        if 'password' in values and v != values['password']:
            raise ValueError('Passwords do not match')
        return v
    
    @validator('upiPin')
    def validate_upi_pin(cls, v):
        if not re.match(r'^\d{4,6}$', v):
            raise ValueError('UPI PIN must be 4-6 digits')
        return v
    
    @validator('confirmUpiPin')
    def upi_pins_match(cls, v, values):
        if 'upiPin' in values and v != values['upiPin']:
            raise ValueError('UPI PINs do not match')
        return v

class VerifyEmailRequest(BaseModel):
    token: str

class VerifyUpiPinRequest(BaseModel):
    email: str
    upiPin: str

class LoginRequest(BaseModel):
    email: str
    password: str

def check_db():
    if not settings.DATABASE_URL:
        raise HTTPException(status_code=500, detail="Database not configured")
    if not supabase_client:
        raise HTTPException(status_code=500, detail="Supabase not configured for email verification")

@router.post("/register")
async def register(req: RegisterRequest, db: Session = Depends(get_db)):
    check_db()
    
    if get_user_by_email(db, req.email):
        raise HTTPException(status_code=400, detail="User already registered")

    try:
        # Hash password and UPI PIN
        password_hash = bcrypt.hashpw(req.password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        upi_pin_hash = bcrypt.hashpw(req.upiPin.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        user_data = {
            "full_name": req.fullName,
            "email": req.email,
            "mobile": req.mobile,
            "password_hash": password_hash,
            "upi_pin_hash": upi_pin_hash,
        }
        db_user = create_user(db, user_data)
        
        # Auto-verify user (skip email verification for now)
        verify_user(db, req.email)
        
        return {"success": True, "message": f"Registration successful! You can now login with your email and password."}
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/verify-email")
async def verify_email(req: VerifyEmailRequest, db: Session = Depends(get_db)):
    check_db()
    
    try:
        # Verify token with Supabase
        session = supabase_client.auth.verify_otp({
            "token_hash": req.token,
            "type": "email"
        })
        
        if not session or not session.user:
            raise Exception("Invalid verification link")
        
        # Mark user as verified
        user = verify_user(db, session.user.email)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        return {
            "success": True,
            "message": "Email verified successfully! You can now login."
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid or expired verification link: {str(e)}")

@router.post("/login")
async def login(req: LoginRequest, db: Session = Depends(get_db)):
    check_db()
    
    user = get_user_by_email(db, req.email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found. Please register first.")
    
    if not user.password_hash:
        raise HTTPException(status_code=400, detail="Account setup incomplete. Please contact support.")
    
    # Verify password
    if not bcrypt.checkpw(req.password.encode('utf-8'), user.password_hash.encode('utf-8')):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Generate token
    import secrets
    access_token = secrets.token_urlsafe(32)
    
    return {
        "success": True,
        "token": access_token,
        "user": {
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "upi_id": user.upi_id,
            "qr_code": user.qr_code,
            "balance": float(user.balance),
            "role": user.role,
        }
    }

@router.post("/verify-upi-pin")
async def verify_upi_pin(req: VerifyUpiPinRequest, db: Session = Depends(get_db)):
    """Verify UPI PIN before transaction"""
    check_db()
    
    user = get_user_by_email(db, req.email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if not user.upi_pin_hash:
        raise HTTPException(status_code=400, detail="UPI PIN not set")
    
    # Verify UPI PIN
    if not bcrypt.checkpw(req.upiPin.encode('utf-8'), user.upi_pin_hash.encode('utf-8')):
        raise HTTPException(status_code=401, detail="Invalid UPI PIN")
    
    return {"success": True, "message": "UPI PIN verified"}

@router.get("/qr/{email}")
async def get_user_qr(email: str, db: Session = Depends(get_db)):
    check_db()
    user = get_user_by_email(db, email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "success": True,
        "upi_id": user.upi_id,
        "qr_code": user.qr_code,
        "name": user.full_name,
    }
