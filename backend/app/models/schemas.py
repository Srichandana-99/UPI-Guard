from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List

class TransactionPayload(BaseModel):
    user_id: str
    transaction_id: str
    amount: float = Field(gt=0, description="Transaction amount in INR")
    receiver_upi_id: str
    sender_upi_id: str
    hour_of_day: int = Field(ge=0, le=23, description="Hour of the day 0-23")
    location_mismatch: int = Field(ge=0, le=1, description="1 if mismatch, 0 if match")
    is_new_receiver: int = Field(ge=0, le=1, description="1 if new, 0 if historically paid")
    velocity_1h: int = Field(ge=0, description="Number of transactions in last 1 hour")

class FraudResponse(BaseModel):
    transaction_id: str
    risk_score: float
    is_fraudulent: bool
    risk_level: str
    decision: str
    risk_factors: List[str]
