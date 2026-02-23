from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
import uuid

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

# Mock database for MVP demo
mock_db = {
    "arjun.kumar@example.com": {
        "user_id": str(uuid.uuid4()),
        "full_name": "Arjun Kumar",
        "email": "arjun.kumar@example.com",
        "mobile": "+91 98765 43210",
        "upi_id": "arjun@secureupi",
        "balance": 95000.00,
        "verified": True,
        "is_fraud_risk": False
    },
    "priya.sharma@example.com": {
        "user_id": str(uuid.uuid4()),
        "full_name": "Priya Sharma",
        "email": "priya.sharma@example.com",
        "mobile": "+91 98765 43211",
        "upi_id": "priya.s@secureupi",
        "balance": 120500.00,
        "verified": True,
        "is_fraud_risk": False
    },
    "rahul.verma@example.com": {
        "user_id": str(uuid.uuid4()),
        "full_name": "Rahul Verma",
        "email": "rahul.verma@example.com",
        "mobile": "+91 98765 43212",
        "upi_id": "rahul.v@secureupi",
        "balance": 45000.00,
        "verified": True,
        "is_fraud_risk": False
    },
    "sneha.reddy@example.com": {
        "user_id": str(uuid.uuid4()),
        "full_name": "Sneha Reddy",
        "email": "sneha.reddy@example.com",
        "mobile": "+91 98765 43213",
        "upi_id": "sneha.r@secureupi",
        "balance": 88000.00,
        "verified": True,
        "is_fraud_risk": False
    },
    "amit.singh@example.com": {
        "user_id": str(uuid.uuid4()),
        "full_name": "Amit Singh",
        "email": "amit.singh@example.com",
        "mobile": "+91 98765 43214",
        "upi_id": "amit.s@secureupi",
        "balance": 210000.00,
        "verified": True,
        "is_fraud_risk": False
    },
    # Fraud Risk Users (3)
    "vikram.rastogi@example.com": {
        "user_id": str(uuid.uuid4()),
        "full_name": "Vikram Rastogi",
        "email": "vikram.rastogi@example.com",
        "mobile": "+91 98765 43215",
        "upi_id": "vikram.r@secureupi",
        "balance": 15000.00,
        "verified": True,
        "is_fraud_risk": True
    },
    "neha.gupta@example.com": {
        "user_id": str(uuid.uuid4()),
        "full_name": "Neha Gupta",
        "email": "neha.gupta@example.com",
        "mobile": "+91 98765 43216",
        "upi_id": "neha.g@secureupi",
        "balance": 3500.00,
        "verified": True,
        "is_fraud_risk": True
    },
    "karan.mehta@example.com": {
        "user_id": str(uuid.uuid4()),
        "full_name": "Karan Mehta",
        "email": "karan.mehta@example.com",
        "mobile": "+91 98765 43217",
        "upi_id": "karan.m@secureupi",
        "balance": 8500.00,
        "verified": True,
        "is_fraud_risk": True
    }
}

@router.post("/register")
async def register(req: RegisterRequest):
    try:
        mock_db[req.email] = {
            "user_id": str(uuid.uuid4()),
            "full_name": req.fullName,
            "email": req.email,
            "mobile": req.mobile,
            "upi_id": req.email.split("@")[0].lower() + "@secureupi",
            "balance": 82450.00,  # Auto-fill high balance per requirements
            "verified": False
        }
        return {"success": True, "message": "OTP sent to your email/mobile"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/verify-otp")
async def verify_otp(req: VerifyOTPRequest):
    if req.email not in mock_db:
        # If user tested without hitting register first
        raise HTTPException(status_code=404, detail="User not found. Please register first.")
        
    mock_db[req.email]["verified"] = True
    
    user_data = mock_db[req.email]
    return {
        "success": True,
        "token": "mock_jwt_eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9",
        "user": user_data
    }

@router.post("/login")
async def login(req: LoginRequest):
    role = "admin" if "admin" in req.email.lower() else "user"
    if req.email in mock_db:
        user_data = mock_db[req.email]
        user_data["role"] = role
        return {
            "success": True,
            "token": "mock_jwt_eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9",
            "user": user_data
        }
    
    # Mocking a login fallback if user hasn't registered a session yet during testing
    user_data = {
        "user_id": str(uuid.uuid4()),
        "full_name": "Admin User" if role == "admin" else "Demo User",
        "email": req.email,
        "mobile": req.email,
        "upi_id": req.email.split('@')[0].lower() + "@secureupi",
        "balance": 82450.00,
        "verified": True,
        "role": role
    }
    mock_db[req.email] = user_data
    return {
        "success": True,
        "token": "mock_jwt_eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9",
        "user": user_data
    }
