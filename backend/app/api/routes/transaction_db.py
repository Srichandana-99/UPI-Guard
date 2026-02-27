from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, validator
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.db.database import get_db
from app.db.crud import get_user_by_email, get_user_by_upi_id, validate_upi_id, create_transaction, update_user_balance, get_transactions_by_user
from app.db.models import Transaction
from app.services.ml_service import evaluate_fraud_risk
from app.services.firebase_service import send_transaction_update, send_fraud_alert, send_balance_update
from app.api.routes.auth_db import check_db
from app.core.security import verify_user_token
import datetime
import uuid

router = APIRouter()

class TransferRequest(BaseModel):
    sender_email: str
    receiver_upi_id: str
    amount: float
    transaction_id: str
    hour_of_day: int = None
    location_mismatch: int = 0
    is_new_receiver: int = 0
    velocity_1h: int = 1
    
    @validator('amount')
    def amount_must_be_positive(cls, v):
        if v <= 0:
            raise ValueError('Amount must be greater than 0')
        return v
    
    @validator('receiver_upi_id')
    def validate_upi_format(cls, v):
        if not v or '@' not in v:
            raise ValueError('Invalid UPI ID format')
        return v

class ValidateUPIRequest(BaseModel):
    upi_id: str

@router.post("/validate-upi")
async def validate_upi_endpoint(
    req: ValidateUPIRequest,
    db: Session = Depends(get_db),
    user_auth: dict = Depends(verify_user_token)
):
    check_db()
    result = validate_upi_id(db, req.upi_id)
    if not result["valid"]:
        raise HTTPException(status_code=404, detail=result["message"])
    return result

@router.post("/transfer")
async def transfer_money(
    req: TransferRequest,
    db: Session = Depends(get_db),
    user_auth: dict = Depends(verify_user_token)
):
    check_db()
    
    # Verify sender matches authenticated user
    if req.sender_email != user_auth["email"]:
        raise HTTPException(status_code=403, detail="Cannot transfer from another user's account")
    
    # Validate sender
    sender = get_user_by_email(db, req.sender_email)
    if not sender:
        raise HTTPException(status_code=404, detail="Sender not found")
    
    if sender.is_blocked:
        raise HTTPException(status_code=403, detail="Your account has been blocked")
    
    # Validate recipient exists
    recipient = get_user_by_upi_id(db, req.receiver_upi_id)
    if not recipient:
        raise HTTPException(status_code=404, detail="Recipient UPI ID not found")
    
    # Prevent self-transfer
    if sender.email == recipient.email:
        raise HTTPException(status_code=400, detail="Cannot transfer to your own account")
    
    # Check sufficient funds
    if float(sender.balance) < req.amount:
        raise HTTPException(status_code=400, detail="Insufficient funds")
    
    # Set hour_of_day if not provided
    if req.hour_of_day is None:
        req.hour_of_day = datetime.datetime.now().hour
    
    transaction_data = {
        "amount": req.amount,
        "hour_of_day": req.hour_of_day,
        "location_mismatch": req.location_mismatch,
        "is_new_receiver": req.is_new_receiver,
        "velocity_1h": req.velocity_1h,
    }
    
    fraud_result = evaluate_fraud_risk(transaction_data)
    fraud_result["transaction_id"] = req.transaction_id
    
    if fraud_result.get("decision") == "Block":
        create_transaction(db, {
            "transaction_id": req.transaction_id,
            "sender_email": req.sender_email,
            "receiver_upi_id": req.receiver_upi_id,
            "amount": req.amount,
            "date": datetime.datetime.now(),
            "status": "Blocked",
            **transaction_data,
        })
        
        # Send fraud alert to Firebase
        send_fraud_alert({
            "transaction_id": req.transaction_id,
            "sender_email": req.sender_email,
            "receiver_upi_id": req.receiver_upi_id,
            "amount": float(req.amount),
            "status": "Blocked",
            "risk_score": fraud_result.get("risk_score"),
            "risk_factors": fraud_result.get("risk_factors"),
            "timestamp": datetime.datetime.now().isoformat()
        })
        
        return {
            "success": False,
            "message": "Transaction blocked by AI Fraud Shield",
            "fraud_details": fraud_result,
        }
    
    # Use database transaction to prevent race conditions
    try:
        # Refresh to get latest balance
        db.refresh(sender)
        
        # Final balance check (prevent race condition)
        if float(sender.balance) < req.amount:
            raise HTTPException(status_code=400, detail="Insufficient funds")
        
        # Deduct from sender
        new_sender_balance = round(float(sender.balance) - req.amount, 2)
        update_user_balance(db, req.sender_email, new_sender_balance)
        
        # Credit to recipient
        new_recipient_balance = round(float(recipient.balance) + req.amount, 2)
        update_user_balance(db, recipient.email, new_recipient_balance)
        
        create_transaction(db, {
            "transaction_id": req.transaction_id,
            "sender_email": req.sender_email,
            "receiver_upi_id": req.receiver_upi_id,
            "amount": req.amount,
            "date": datetime.datetime.now(),
            "status": "Completed",
            **transaction_data,
        })
        
        db.commit()
        
        # Send real-time updates to Firebase
        send_transaction_update({
            "transaction_id": req.transaction_id,
            "sender_email": req.sender_email,
            "receiver_upi_id": req.receiver_upi_id,
            "amount": float(req.amount),
            "status": "Completed",
            "timestamp": datetime.datetime.now().isoformat(),
            "fraud_risk": fraud_result.get("risk_level")
        })
        
        # Update balances in real-time
        send_balance_update(req.sender_email, new_sender_balance)
        send_balance_update(recipient.email, new_recipient_balance)
        
        return {
            "success": True,
            "message": "Transfer successful",
            "fraud_details": fraud_result,
            "new_balance": new_sender_balance,
            "recipient_name": recipient.full_name,
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Transaction failed: {str(e)}")

@router.get("/history/{email}")
async def get_history(
    email: str,
    db: Session = Depends(get_db),
    user_auth: dict = Depends(verify_user_token)
):
    check_db()
    
    # Verify user can only access their own history
    if email != user_auth["email"]:
        raise HTTPException(status_code=403, detail="Cannot access another user's transaction history")
    
    # Get user to find their UPI ID
    user = get_user_by_email(db, email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get transactions where user is sender OR recipient
    sent_transactions = db.query(Transaction).filter(Transaction.sender_email == email).all()
    received_transactions = db.query(Transaction).filter(Transaction.receiver_upi_id == user.upi_id).all()
    
    # Combine and format
    all_transactions = []
    
    for t in sent_transactions:
        all_transactions.append({
            "transaction_id": t.id,
            "receiver_upi_id": t.receiver_upi_id,
            "amount": float(t.amount),
            "date": t.date.isoformat() if t.date else None,
            "status": t.status,
            "type": "sent",
        })
    
    for t in received_transactions:
        all_transactions.append({
            "transaction_id": t.id,
            "sender_upi_id": t.sender_email.split('@')[0] + "@secureupi" if t.sender_email else "unknown",
            "amount": float(t.amount),
            "date": t.date.isoformat() if t.date else None,
            "status": t.status,
            "type": "received",
        })
    
    # Sort by date descending
    all_transactions.sort(key=lambda x: x["date"] or "", reverse=True)
    
    return {
        "success": True,
        "transactions": all_transactions,
    }
