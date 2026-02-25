from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import uuid
from app.db.supabase import supabase_client
from app.core.config import settings
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
    # Password is not used for OTP-based auth, kept optional for UI compatibility.
    password: Optional[str] = None

def check_db():
    if not supabase_client:
        raise HTTPException(status_code=500, detail="Database not configured (SUPABASE_URL and SUPABASE_KEY missing in .env)")

@router.post("/register")
async def register(req: RegisterRequest):
    check_db()
    
    # Check if user exists
    existing_user = supabase_client.table('users').select('*').eq('email', req.email).execute()
    if existing_user.data:
        raise HTTPException(status_code=400, detail="User already registered")

    try:
        role = "admin" if req.email.strip().lower() in settings.admin_emails_set else "user"
        user_data = {
            "full_name": req.fullName,
            "email": req.email,
            "mobile": req.mobile,
            "upi_id": req.email.split("@")[0].lower() + "@secureupi",
            "balance": 0.00,
            "verified": False,
            "role": role
        }
        res = supabase_client.table('users').insert(user_data).execute()
        
        # Trigger the Supabase Email OTP
        supabase_client.auth.sign_in_with_otp({"email": req.email})
        
        return {"success": True, "message": "OTP sent to your email"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/verify-otp")
async def verify_otp(req: VerifyOTPRequest):
    check_db()
    # Verify OTP against Supabase Auth
    try:
        session = supabase_client.auth.verify_otp({"email": req.email, "token": req.otp, "type": "email"})
        if not session.user:
            raise Exception("Invalid OTP Code")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid OTP Code: {str(e)}")

    res = supabase_client.table('users').select('*').eq('email', req.email).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="User not found. Please register first.")
        
    updated = supabase_client.table('users').update({"verified": True}).eq('email', req.email).execute()
    
    if updated.data:
        user_data = updated.data[0]
        access_token = None
        try:
            sess = getattr(session, "session", None)
            access_token = getattr(sess, "access_token", None) if sess else None
            if access_token is None and isinstance(session, dict):
                access_token = (session.get("session") or {}).get("access_token")
        except Exception:
            access_token = None
        return {
            "success": True,
            "token": access_token,
            "user": user_data
        }
    raise HTTPException(status_code=500, detail="Failed to verify user")

@router.post("/login")
async def login(req: LoginRequest):
    check_db()
    
    res = supabase_client.table('users').select('*').eq('email', req.email).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="User not found. Please register first.")

    user_data = res.data[0]
    # Always use OTP for sign-in; do not issue mock tokens.
    try:
        supabase_client.auth.sign_in_with_otp({"email": req.email})
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to send OTP: {str(e)}")

    return {"success": True, "message": "OTP sent to your email", "user": {"email": user_data.get("email")}}
