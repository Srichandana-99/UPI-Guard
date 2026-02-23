from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.db.supabase import supabase_client
from app.api.routes.auth import check_db
from app.services.ml_service import evaluate_fraud_risk
import datetime

router = APIRouter()

class TransferRequest(BaseModel):
    sender_email: str
    receiver_upi_id: str
    amount: float
    transaction_id: str
    # Features required over time
    hour_of_day: int = datetime.datetime.now().hour
    location_mismatch: int = 0
    is_new_receiver: int = 0
    velocity_1h: int = 1

@router.post("/transfer")
async def transfer_money(req: TransferRequest):
    check_db()
    
    transaction_data = {
        "amount": req.amount,
        "hour_of_day": req.hour_of_day,
        "location_mismatch": req.location_mismatch,
        "is_new_receiver": req.is_new_receiver,
        "velocity_1h": req.velocity_1h
    }
    
    # 1. Run inference fraud check locally before processing
    fraud_result = evaluate_fraud_risk(transaction_data)
    fraud_result["transaction_id"] = req.transaction_id
    
    # 2. Fetch sender from DB
    sender_res = supabase_client.table('users').select('*').eq('email', req.sender_email).execute()
    if not sender_res.data:
        raise HTTPException(status_code=404, detail="Sender not found")
        
    sender = sender_res.data[0]
    
    # If blocked by AI
    if fraud_result.get("decision") == "Block":
        supabase_client.table('transactions').insert({
            "transaction_id": req.transaction_id,
            "sender_email": req.sender_email,
            "receiver_upi_id": req.receiver_upi_id,
            "amount": req.amount,
            "date": datetime.datetime.now().isoformat(),
            "status": "Blocked"
        }).execute()

        return {
            "success": False,
            "message": "Transaction blocked by AI Fraud Shield",
            "fraud_details": fraud_result
        }
        
    # Process Transfer 
    current_balance = float(sender["balance"])
    if current_balance < req.amount:
         raise HTTPException(status_code=400, detail="Insufficient funds")
    
    new_balance = round(current_balance - req.amount, 2)
    
    # Deduct balance
    supabase_client.table('users').update({"balance": new_balance}).eq('email', req.sender_email).execute()
    
    # Record transaction
    supabase_client.table('transactions').insert({
        "transaction_id": req.transaction_id,
        "sender_email": req.sender_email,
        "receiver_upi_id": req.receiver_upi_id,
        "amount": req.amount,
        "date": datetime.datetime.now().isoformat(),
        "status": "Completed"
    }).execute()
    
    return {
        "success": True,
        "message": "Transfer successful",
        "fraud_details": fraud_result,
        "new_balance": new_balance
    }

@router.get("/history/{email}")
async def get_history(email: str):
    check_db()
    
    res = supabase_client.table('transactions').select('*').eq('sender_email', email).order('date', desc=True).execute()
    
    return {
        "success": True,
        "transactions": res.data if res.data else []
    }
