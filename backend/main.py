from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from fraud_engine import check_fraud
import uvicorn
from datetime import datetime
import database
import os

app = FastAPI(root_path=os.environ.get("ROOT_PATH", ""))

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TransactionRequest(BaseModel):
    upiId: str
    amount: float
    latitude: float = 0.0
    longitude: float = 0.0
    deviceId: str = ""
    userId: str = ""  # Added userId

class UserSignup(BaseModel):
    name: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class VerifyRequest(BaseModel):
    email: str
    code: str

@app.post("/signup")
def signup(user: UserSignup):
    try:
        success = database.create_user(user.name, user.email, user.password)
        if success:
            return {"message": "User created! Please verify your email.", "status": "PENDING_VERIFICATION"}
        raise HTTPException(status_code=400, detail="User already exists")
    except ValueError as e:
        # Password validation error
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Internal Server Error")

@app.post("/verify-email")
def verify_email(req: VerifyRequest):
    success, message = database.verify_email_otp(req.email, req.code)
    if success:
        return {"message": message, "status": "VERIFIED"}
    raise HTTPException(status_code=400, detail=message)

@app.post("/login")
def login(user_creds: UserLogin):
    user = database.verify_user(user_creds.email, user_creds.password)
    if user:
        # Check if it was an error dict from database.py
        if isinstance(user, dict) and "error" in user:
             raise HTTPException(status_code=403, detail=user["error"])
             
        return {"message": "Login successful", "user": user}
    raise HTTPException(status_code=401, detail="Invalid credentials")

@app.get("/api/health")
def health_check():
    return {"status": "active", "service": "UPI Payment Backend (Supabase)"}

@app.get("/transactions")
def get_transactions():
    """Returns the list of recent transactions."""
    return database.get_recent_transactions()

@app.get("/history/{user_id}")
def get_user_history(user_id: str):
    """Returns transaction history for a specific user."""
    return database.get_user_transactions(user_id)

@app.post("/pay")
def process_payment(tx: TransactionRequest, request: Request):
    # 1. Check Balance if userId is provided
    if tx.userId:
        current_balance = database.get_user_balance(tx.userId)
        if current_balance < tx.amount:
             return {
                "status": "FAILED",
                "message": f"Insufficient Balance. Current: ₹{current_balance}",
                "amount": tx.amount,
                "isFraud": False
            }
    
    # 2. Context for fraud engine
    context = {
        "latitude": tx.latitude,
        "longitude": tx.longitude,
        "device_id": tx.deviceId
    }
    
    # 3. Check for fraud using Real Data
    is_fraud, risk_score, reason = check_fraud(tx.amount, tx.upiId, context)
    
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    client_ip = request.client.host
    
    # 4. Deduct Balance if NOT fraud and SUCCESS
    # Note: If fraud, we usually Block. If suspicious but allowed, we might deduct.
    # Here, if is_fraud is True, we FAIL the transaction.
    
    if not is_fraud and tx.userId:
        new_balance = current_balance - tx.amount
        database.update_user_balance(tx.userId, new_balance)
        
        # Attempt P2P Credit
        database.process_p2p_transfer(tx.userId, tx.amount, tx.upiId)
    
    tx_data = {
        "status": "FRAUD" if is_fraud else "SUCCESS",
        "message": reason if is_fraud else "Payment Successful",
        "amount": tx.amount,
        "upiId": tx.upiId,
        "txId": None if is_fraud else ("TX" + str(hash(tx.upiId + str(tx.amount)))[-8:]),
        "timestamp": timestamp,
        "isFraud": is_fraud,
        "riskScore": risk_score,
        "latitude": tx.latitude,
        "longitude": tx.longitude,
        "deviceId": tx.deviceId,
        "ipAddress": client_ip,
        "userId": tx.userId # Pass for logging
    }
    
    # Persistent Log
    database.log_transaction(tx_data)
    
    return tx_data

@app.post("/check-risk")
def check_risk(tx: TransactionRequest):
    """
    Analyzes the transaction context and returns a risk score without processing payment.
    Used for real-time UI feedback.
    """
    context = {
        "latitude": tx.latitude,
        "longitude": tx.longitude,
        "device_id": tx.deviceId
    }
    
    is_fraud, risk_score, reason = check_fraud(tx.amount, tx.upiId, context)
    
    return {
        "riskScore": risk_score,
        "isFraud": is_fraud,
        "message": reason
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
