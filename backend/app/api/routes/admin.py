from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
from app.api.routes.auth import mock_db
from app.api.routes.transaction import mock_transactions

router = APIRouter()

@router.get("/users")
async def get_all_users():
    users_list = []
    for email, user_data in mock_db.items():
        # Determine risk tier based on mock flags
        risk_tier = "Critical" if user_data.get("is_fraud_risk") else "Low"
        if user_data.get("balance", 0) > 100000 and not user_data.get("is_fraud_risk"):
            risk_tier = "Safe"
            
        status = "Active"
        if user_data.get("is_blocked"):
            status = "Banned"
            
        users_list.append({
            "id": user_data.get("user_id"),
            "name": user_data.get("full_name"),
            "upi": user_data.get("upi_id"),
            "email": email,
            "status": status,
            "joined": "Oct 24, 2023", # mock date
            "riskTier": risk_tier,
            "balance": user_data.get("balance")
        })
    return {"success": True, "users": users_list}

@router.get("/transactions")
async def get_all_transactions():
    # Convert mock_transactions into format expected by admin UI
    admin_txns = []
    for txn in mock_transactions:
        # Resolve sender details
        sender_email = txn.get("sender_email")
        sender = mock_db.get(sender_email, {})
        sender_name = sender.get("full_name", "Unknown Sender")
        sender_upi = sender.get("upi_id", "unknown@upi")
        
        # Calculate risk based on status
        risk = "Safe" if txn.get("status") == "Completed" else "Critical"
        if txn.get("amount", 0) > 10000 and txn.get("status") != "Blocked":
            risk = "High"
            
        admin_txns.append({
            "id": txn.get("transaction_id"),
            "sender": {
                "name": sender_name,
                "upi": sender_upi,
                "avatar": sender_name[0] if sender_name else "U"
            },
            "receiver": {
                "name": txn.get("receiver_upi_id").split("@")[0].title(),
                "upi": txn.get("receiver_upi_id"),
                "avatar": txn.get("receiver_upi_id")[0].upper()
            },
            "amount": txn.get("amount"),
            "date": txn.get("date"),
            "status": txn.get("status"),
            "risk": risk,
            "type": "send" # Assuming from admin perspective it's a generic transfer
        })
    return {"success": True, "transactions": admin_txns}

@router.get("/fraud-alerts")
async def get_fraud_alerts():
    # Filter transactions for blocked ones
    blocked_txns = [t for t in mock_transactions if t.get("status") == "Blocked"]
    
    # Watchlist based on mock_db fraud risks
    watchlist = []
    for email, user in mock_db.items():
        if user.get("is_fraud_risk"):
            # Compute total attempted value from blocked txns for this user
            user_blocked = [t for t in blocked_txns if t.get("sender_email") == email]
            total_attempted = sum([t.get("amount", 0) for t in user_blocked])
            
            watchlist.append({
                "name": user.get("full_name"),
                "upi": user.get("upi_id"),
                "score": "95", # Mock score
                "total": f"₹{total_attempted / 100000:.1f}L" if total_attempted > 100000 else f"₹{total_attempted}",
                "blocked": len(user_blocked)
            })
            
    return {
        "success": True,
        "alerts": blocked_txns,
        "watchlist": watchlist
    }

@router.get("/analytics")
async def get_analytics():
    total_users = len(mock_db)
    total_txns = len(mock_transactions)
    blocked_txns = len([t for t in mock_transactions if t.get("status") == "Blocked"])
    total_volume = sum([t.get("amount", 0) for t in mock_transactions if t.get("status") == "Completed"])
    
    return {
        "success": True,
        "metrics": {
            "total_users": total_users,
            "total_transactions": total_txns,
            "blocked_transactions": blocked_txns,
            "total_volume": total_volume,
            "system_threat_level": 84 if blocked_txns > 0 else 15
        }
    }

class BlockUserRequest(BaseModel):
    action: str # "block" or "unblock"
    
@router.post("/users/{email}/block")
async def toggle_user_block(email: str, req: BlockUserRequest):
    if email not in mock_db:
        raise HTTPException(status_code=404, detail="User not found")
        
    is_blocked = req.action.lower() == "block"
    mock_db[email]["is_blocked"] = is_blocked
    
    return {
        "success": True,
        "message": f"User {req.action}ed successfully",
        "status": "Banned" if is_blocked else "Active"
    }
