from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import uuid
from app.db.supabase import supabase_client

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
    password: str

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
        user_data = {
            "full_name": req.fullName,
            "email": req.email,
            "mobile": req.mobile,
            "upi_id": req.email.split("@")[0].lower() + "@secureupi",
            "balance": 82450.00,  # Auto-fill high balance per requirements
            "verified": False,
            "role": "admin" if "admin" in req.email.lower() else "user"
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
        return {
            "success": True,
            "token": "mock-session-token",
            "user": user_data
        }
    raise HTTPException(status_code=500, detail="Failed to verify user")

@router.post("/login")
async def login(req: LoginRequest):
    check_db()
    
    res = supabase_client.table('users').select('*').eq('email', req.email).execute()
    if res.data:
        user_data = res.data[0]
        return {
            "success": True,
            "token": "mock-session-token",
            "user": user_data
        }
    
    # Fallback for demo simplicity: auto-register if they login without registering first
    role = "admin" if "admin" in req.email.lower() else "user"
    user_data = {
        "full_name": "Admin User" if role == "admin" else "Demo User",
        "email": req.email,
        "mobile": "0000000000",
        "upi_id": req.email.split('@')[0].lower() + "@secureupi",
        "balance": 82450.00,
        "verified": True,
        "role": role
    }
    
    new_user = supabase_client.table('users').insert(user_data).execute()
    if new_user.data:
        return {
            "success": True,
            "token": "mock-session-token",
            "user": new_user.data[0]
        }
        
    raise HTTPException(status_code=500, detail="Login failed")
