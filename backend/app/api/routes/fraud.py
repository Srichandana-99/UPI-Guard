from fastapi import APIRouter, HTTPException
from app.models.schemas import TransactionPayload, FraudResponse
from app.services.ml_service import evaluate_fraud_risk
from app.db.supabase import supabase_client
import uuid

router = APIRouter()

@router.post("/predict", response_model=FraudResponse)
async def predict_fraud(transaction: TransactionPayload):
    try:
        # 1. Evaluate Risk using ML Model
        evaluation = evaluate_fraud_risk(transaction.model_dump())
        
        if "error" in evaluation:
            raise HTTPException(status_code=500, detail=evaluation["error"])
        
        # 2. Async save to database if supabase is configured
        if supabase_client:
            try:
                # Save transaction record
                transaction_data = {
                    "user_id": transaction.user_id,
                    "transaction_id": transaction.transaction_id,
                    "amount": transaction.amount,
                    "receiver_upi_id": transaction.receiver_upi_id,
                    "sender_upi_id": transaction.sender_upi_id,
                    "status": "blocked" if evaluation["is_fraudulent"] else "completed"
                }
                # (Optional) handle saving to Supabase
                # supabase_client.table("transactions").insert(transaction_data).execute()
            except Exception as e:
                print(f"Failed to log to DB: {e}")
        
        # 3. Return Response
        return FraudResponse(
            transaction_id=transaction.transaction_id,
            risk_score=evaluation["risk_score"],
            is_fraudulent=evaluation["is_fraudulent"],
            risk_level=evaluation["risk_level"],
            decision=evaluation["decision"],
            risk_factors=evaluation["risk_factors"]
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
