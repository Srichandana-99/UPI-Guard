from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.api.routes.auth import mock_db
from app.services.ml_service import evaluate_fraud_risk
import datetime
import uuid

router = APIRouter()

# Global list so state persists across API calls for the demo
mock_transactions = [
    # Normal user transactions (12)
    {
        "transaction_id": "txn_8h291x",
        "sender_email": "arjun.kumar@example.com",
        "receiver_upi_id": "zomato@okhdfc",
        "amount": 450.00,
        "date": "2023-10-24T12:30:00Z",
        "status": "Completed"
    },
    {
        "transaction_id": "txn_9p412v",
        "sender_email": "arjun.kumar@example.com",
        "receiver_upi_id": "uber@sbi",
        "amount": 280.00,
        "date": "2023-10-24T09:15:00Z",
        "status": "Completed"
    },
    {
        "transaction_id": "txn_1m556z",
        "sender_email": "priya.sharma@example.com",
        "receiver_upi_id": "arjun@secureupi",
        "amount": 5000.00,
        "date": "2023-10-23T18:45:00Z",
        "status": "Completed"
    },
    {
        "transaction_id": "txn_3k881b",
        "sender_email": "priya.sharma@example.com",
        "receiver_upi_id": "swiggy@icici",
        "amount": 320.00,
        "date": "2023-10-23T20:10:00Z",
        "status": "Completed"
    },
    {
        "transaction_id": "txn_7t119q",
        "sender_email": "rahul.verma@example.com",
        "receiver_upi_id": "dmart@ybl",
        "amount": 4200.00,
        "date": "2023-10-22T14:20:00Z",
        "status": "Completed"
    },
    {
        "transaction_id": "txn_4w992r",
        "sender_email": "rahul.verma@example.com",
        "receiver_upi_id": "jiobharat@okaxis",
        "amount": 699.00,
        "date": "2023-10-22T10:05:00Z",
        "status": "Completed"
    },
    {
        "transaction_id": "txn_6c331l",
        "sender_email": "sneha.reddy@example.com",
        "receiver_upi_id": "makemytrip@icici",
        "amount": 12500.00,
        "date": "2023-10-21T08:30:00Z",
        "status": "Completed"
    },
    {
        "transaction_id": "txn_2n664f",
        "sender_email": "sneha.reddy@example.com",
        "receiver_upi_id": "netflix@okaxis",
        "amount": 649.00,
        "date": "2023-10-20T21:15:00Z",
        "status": "Completed"
    },
    {
        "transaction_id": "txn_8v229p",
        "sender_email": "amit.singh@example.com",
        "receiver_upi_id": "amazon@paytm",
        "amount": 8990.00,
        "date": "2023-10-19T16:40:00Z",
        "status": "Completed"
    },
    {
        "transaction_id": "txn_5x883h",
        "sender_email": "amit.singh@example.com",
        "receiver_upi_id": "electricity@bescom",
        "amount": 1450.00,
        "date": "2023-10-19T10:20:00Z",
        "status": "Completed"
    },
    {
        "transaction_id": "txn_1b559m",
        "sender_email": "arjun.kumar@example.com",
        "receiver_upi_id": "amit.s@secureupi",
        "amount": 2500.00,
        "date": "2023-10-18T11:55:00Z",
        "status": "Completed"
    },
    {
        "transaction_id": "txn_9z114j",
        "sender_email": "priya.sharma@example.com",
        "receiver_upi_id": "starbucks@sbi",
        "amount": 850.00,
        "date": "2023-10-18T09:10:00Z",
        "status": "Completed"
    },

    # Fraudulent / Blocked transactions from Fraud users (3)
    {
        "transaction_id": "txn_f1x99m",
        "sender_email": "vikram.rastogi@example.com",
        "receiver_upi_id": "unknown2819@okaxis",
        "amount": 65000.00, # Very high amount for low balance
        "date": "2023-10-24T03:15:00Z", # Late night 3 AM
        "status": "Blocked"
    },
    {
        "transaction_id": "txn_f4c22b",
        "sender_email": "neha.gupta@example.com",
        "receiver_upi_id": "scam.merchant99@ybl",
        "amount": 40000.00,
        "date": "2023-10-23T02:45:00Z",
        "status": "Blocked"
    },
    {
        "transaction_id": "txn_f7v55c",
        "sender_email": "karan.mehta@example.com",
        "receiver_upi_id": "crypto_exchange@okhdfc",
        "amount": 55000.00,
        "date": "2023-10-22T04:20:00Z",
        "status": "Blocked"
    }
]

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
    
    # If blocked, we halt transfer immediately
    if fraud_result.get("decision") == "Block":
        mock_transactions.insert(0, {
            "transaction_id": req.transaction_id,
            "sender_email": req.sender_email,
            "receiver_upi_id": req.receiver_upi_id,
            "amount": req.amount,
            "date": datetime.datetime.now().isoformat(),
            "status": "Blocked"
        })

        return {
            "success": False,
            "message": "Transaction blocked by AI Fraud Shield",
            "fraud_details": fraud_result
        }
        
    # 2. Process Transfer 
    if req.sender_email in mock_db:
        current_balance = mock_db[req.sender_email]["balance"]
        if current_balance < req.amount:
             raise HTTPException(status_code=400, detail="Insufficient funds")
        
        # Deduct balance
        mock_db[req.sender_email]["balance"] = round(current_balance - req.amount, 2)
        
        mock_transactions.insert(0, {
            "transaction_id": req.transaction_id,
            "sender_email": req.sender_email,
            "receiver_upi_id": req.receiver_upi_id,
            "amount": req.amount,
            "date": datetime.datetime.now().isoformat(),
            "status": "Completed"
        })
    
    return {
        "success": True,
        "message": "Transfer successful",
        "fraud_details": fraud_result,
        "new_balance": mock_db.get(req.sender_email, {}).get("balance", 0.0)
    }

@router.get("/history/{email}")
async def get_history(email: str):
    # Return transactions for this user
    user_txns = sorted(
        [t for t in mock_transactions if t["sender_email"] == email],
        key=lambda x: x["date"], 
        reverse=True
    )
    return {
        "success": True,
        "transactions": user_txns
    }
