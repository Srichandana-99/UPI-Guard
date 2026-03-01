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
    
    @validator('email')
    def validate_email(cls, v):
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_pattern, v):
            raise ValueError('Invalid email format')
        return v.lower()
    
    @validator('mobile')
    def validate_mobile(cls, v):
        # Remove spaces, dashes, and country code
        cleaned = re.sub(r'[\s\-\+]', '', v)
        # Remove country code if present
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

class SetPasswordRequest(BaseModel):
    email: str
    password: str
    
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

class VerifyMagicLinkRequest(BaseModel):
    token: str

class LoginRequest(BaseModel):
    email: str
    password: str

def check_db():
    if not settings.DATABASE_URL:
        raise HTTPException(status_code=500, detail="Database not configured")
    if not supabase_client:
        raise HTTPException(status_code=500, detail="Supabase not configured for magic link authentication")

@router.post("/register")
async def register(req: RegisterRequest, db: Session = Depends(get_db)):
    check_db()
    
    if get_user_by_email(db, req.email):
        raise HTTPException(status_code=400, detail="User already registered")

    try:
        user_data = {
            "full_name": req.fullName,
            "email": req.email,
            "mobile": req.mobile,
        }
        db_user = create_user(db, user_data)
        
        # Send magic link via Supabase
        try:
            supabase_client.auth.sign_in_with_otp({
                "email": req.email,
                "options": {
                    "email_redirect_to": f"{settings.CORS_ORIGINS.split(',')[0]}/set-password"
                }
            })
            return {"success": True, "message": f"Magic link sent to {req.email}. Check your email to verify and set password."}
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to send magic link: {str(e)}")
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/set-password")
async def set_password(req: SetPasswordRequest, db: Session = Depends(get_db)):
    check_db()
    
    user = get_user_by_email(db, req.email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if not user.is_verified:
        raise HTTPException(status_code=400, detail="Please verify your email first")
    
    # Hash password
    hashed = bcrypt.hashpw(req.password.encode('utf-8'), bcrypt.gensalt())
    
    # Update user password in database
    user.password_hash = hashed.decode('utf-8')
    db.commit()
    
    return {"success": True, "message": "Password set successfully. You can now login."}

@router.post("/verify-magic-link")
async def verify_magic_link(req: VerifyMagicLinkRequest, db: Session = Depends(get_db)):
    check_db()
    
    try:
        # Verify token with Supabase
        session = supabase_client.auth.verify_otp({
            "token_hash": req.token,
            "type": "magiclink"
        })
        
        if not session or not session.user:
            raise Exception("Invalid magic link")
        
        # Mark user as verified
        user = verify_user(db, session.user.email)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        return {
            "success": True,
            "email": user.email,
            "message": "Email verified! Please set your password."
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid or expired magic link: {str(e)}")

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

@router.post("/login")
async def login(req: LoginRequest, db: Session = Depends(get_db)):
    check_db()
    
    user = get_user_by_email(db, req.email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found. Please register first.")
    
    if not user.is_verified:
        raise HTTPException(status_code=400, detail="Please verify your email first")
    
    if not user.password_hash:
        raise HTTPException(status_code=400, detail="Please set your password first")
    
    # Verify password
    if not bcrypt.checkpw(req.password.encode('utf-8'), user.password_hash.encode('utf-8')):
        raise HTTPException(status_code=401, detail="Invalid password")
    
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
