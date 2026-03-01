from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, validator, EmailStr
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.crud import get_user_by_email, create_user, verify_user
from app.core.config import settings
from app.services.email_service import EmailService, OTPService
from typing import Optional
import re

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

class VerifyOTPRequest(BaseModel):
    email: str
    otp: str

class LoginRequest(BaseModel):
    email: str
    password: Optional[str] = None

def check_db():
    if not settings.DATABASE_URL:
        raise HTTPException(status_code=500, detail="Database not configured (DATABASE_URL missing in .env)")
    if not settings.SENDER_EMAIL or not settings.SENDER_PASSWORD:
        raise HTTPException(status_code=500, detail="Email service not configured (SENDER_EMAIL and SENDER_PASSWORD missing in .env)")

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
        
        # Generate and send OTP
        try:
            otp = OTPService.generate_and_store_otp(req.email, purpose="registration")
            success = email_service.send_otp_email(req.email, otp, purpose="registration")
            
            if not success:
                raise Exception("Failed to send OTP email")
                
            return {"success": True, "message": f"Registration successful. OTP sent to {req.email}"}
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to send OTP email: {str(e)}")
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/verify-otp")
async def verify_otp(req: VerifyOTPRequest, db: Session = Depends(get_db)):
    check_db()
    
    # Verify OTP using our email service
    if not OTPService.verify_otp(req.email, req.otp):
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")
    
    user = verify_user(db, req.email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Generate a simple JWT-like token (in production, use proper JWT)
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

    # Generate and send OTP
    try:
        otp = OTPService.generate_and_store_otp(req.email, purpose="login")
        success = email_service.send_otp_email(req.email, otp, purpose="login")
        
        if not success:
            raise Exception("Failed to send OTP email")
            
        return {"success": True, "message": f"OTP sent to {req.email}", "user": {"email": user.email}}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send OTP email: {str(e)}")
