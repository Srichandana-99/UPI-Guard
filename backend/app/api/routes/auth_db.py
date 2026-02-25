from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.crud import get_user_by_email, create_user, verify_user
from app.core.config import settings
from app.services.email_service import EmailService, OTPService
from typing import Optional

router = APIRouter()

class RegisterRequest(BaseModel):
    fullName: str
    email: str
    mobile: str
    dob: str
    age: int

class VerifyOTPRequest(BaseModel):
    email: str
    otp: str

class LoginRequest(BaseModel):
    email: str
    password: Optional[str] = None

def check_db():
    if not settings.DATABASE_URL:
        raise HTTPException(status_code=500, detail="Database not configured (DATABASE_URL missing in .env)")

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
        otp = OTPService.generate_and_store_otp(req.email, "registration")
        email_service = EmailService()
        
        if email_service.send_otp_email(req.email, otp, "registration"):
            return {"success": True, "message": f"Registration successful. OTP sent to {req.email}"}
        else:
            raise HTTPException(status_code=500, detail="Failed to send OTP email. Please check email configuration.")
            
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/verify-otp")
async def verify_otp(req: VerifyOTPRequest, db: Session = Depends(get_db)):
    check_db()
    
    # Verify OTP using OTP service
    if not OTPService.verify_otp(req.email, req.otp):
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")
    
    user = verify_user(db, req.email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {
        "success": True,
        "token": "mock-jwt-token",
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
    otp = OTPService.generate_and_store_otp(req.email, "login")
    email_service = EmailService()
    
    if email_service.send_otp_email(req.email, otp, "login"):
        return {"success": True, "message": f"OTP sent to {req.email}", "user": {"email": user.email}}
    else:
        raise HTTPException(status_code=500, detail="Failed to send OTP email. Please check email configuration.")
