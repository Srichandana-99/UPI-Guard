from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
from app.db.supabase import supabase_client
from app.api.routes.auth import check_db

router = APIRouter()

@router.get("/users")
async def get_all_users():
    check_db()
    
    res = supabase_client.table('users').select('*').execute()
    users_list = []
    
    for user_data in (res.data or []):
        balance = float(user_data.get("balance", 0))
        is_fraud = user_data.get("is_fraud_risk", False)
        
        # Determine risk tier
        risk_tier = "Critical" if is_fraud else "Low"
        if balance > 100000 and not is_fraud:
            risk_tier = "Safe"
            
        status = "Banned" if user_data.get("is_blocked") else "Active"
            
        users_list.append({
            "id": user_data.get("user_id"),
            "name": user_data.get("full_name"),
            "upi": user_data.get("upi_id"),
            "email": user_data.get("email"),
            "status": status,
            "joined": user_data.get("created_at"),
            "riskTier": risk_tier,
            "balance": balance
        })
    return {"success": True, "users": users_list}

@router.get("/transactions")
async def get_all_transactions():
    check_db()
    
    # In a production app, we would join the tables, but we will fetch and map here.
    txns_res = supabase_client.table('transactions').select('*').order('date', desc=True).execute()
    users_res = supabase_client.table('users').select('email, full_name, upi_id').execute()
    
    user_map = {u['email']: u for u in (users_res.data or [])}
    admin_txns = []
    
    for txn in (txns_res.data or []):
        sender_email = txn.get("sender_email")
        sender = user_map.get(sender_email, {})
        sender_name = sender.get("full_name", "Unknown Sender")
        sender_upi = sender.get("upi_id", "unknown@upi")
        
        # Calculate risk based on status
        risk = "Safe" if txn.get("status") == "Completed" else "Critical"
        amount = float(txn.get("amount", 0))
        if amount > 10000 and txn.get("status") != "Blocked":
            risk = "High"
            
        admin_txns.append({
            "id": txn.get("transaction_id"),
            "sender": {
                "name": sender_name,
                "upi": sender_upi,
                "avatar": sender_name[0].upper() if sender_name else "U"
            },
            "receiver": {
                "name": (txn.get("receiver_upi_id") or "unknown@upi").split("@")[0].title(),
                "upi": txn.get("receiver_upi_id") or "unknown@upi",
                "avatar": (txn.get("receiver_upi_id") or "U")[0].upper()
            },
            "amount": amount,
            "date": txn.get("date"),
            "status": txn.get("status"),
            "risk": risk,
            "type": "send"
        })
    return {"success": True, "transactions": admin_txns}

@router.get("/fraud-alerts")
async def get_fraud_alerts():
    check_db()
    
    # Filter transactions for blocked ones
    blocked_res = supabase_client.table('transactions').select('*').eq('status', 'Blocked').execute()
    blocked_txns = blocked_res.data or []
    
    # Watchlist based on fraud risks
    users_res = supabase_client.table('users').select('*').eq('is_fraud_risk', True).execute()
    
    watchlist = []
    for user in (users_res.data or []):
        email = user.get("email")
        # Compute total attempted value from blocked txns for this user
        user_blocked = [t for t in blocked_txns if t.get("sender_email") == email]
        total_attempted = sum([float(t.get("amount", 0)) for t in user_blocked])

        blocked_count = len(user_blocked)
        # Heuristic score derived from real activity (no fixed mock value).
        # Base risk for flagged users + weighted by blocked count and attempted volume.
        score = 30 + (blocked_count * 12) + min(40, int(total_attempted / 5000))
        score = max(0, min(100, score))
        
        watchlist.append({
            "name": user.get("full_name"),
            "upi": user.get("upi_id"),
            "score": str(score),
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
    check_db()
    
    users_res = supabase_client.table('users').select('user_id', count='exact').execute()
    txns_res = supabase_client.table('transactions').select('*').execute()
    fraud_users_res = supabase_client.table('users').select('user_id', count='exact').eq('is_fraud_risk', True).execute()
    
    txns = txns_res.data or []
    total_users = users_res.count if hasattr(users_res, 'count') else len((supabase_client.table('users').select('user_id').execute()).data or [])
    total_txns = len(txns)
    blocked_txns = len([t for t in txns if t.get("status") == "Blocked"])
    total_volume = sum([float(t.get("amount", 0)) for t in txns if t.get("status") == "Completed"])

    fraud_users = fraud_users_res.count if hasattr(fraud_users_res, 'count') else len((fraud_users_res.data or []))
    blocked_rate = (blocked_txns / total_txns) if total_txns else 0.0
    fraud_user_rate = (fraud_users / total_users) if total_users else 0.0
    # Threat level based on real ratios; bounded to 0..100.
    system_threat_level = int(min(100, round((blocked_rate * 85) + (fraud_user_rate * 35))))

    # Risk distribution derived from real transactions
    dist_counts = {"safe": 0, "low": 0, "high": 0, "critical": 0}
    for t in txns:
        status = t.get("status")
        amount = float(t.get("amount", 0) or 0)
        if status == "Blocked":
            dist_counts["critical"] += 1
        elif amount > 10000:
            dist_counts["high"] += 1
        elif amount <= 1000:
            dist_counts["safe"] += 1
        else:
            dist_counts["low"] += 1
    dist_total = max(1, total_txns)
    dist_pct = {k: round((v / dist_total) * 100, 2) for k, v in dist_counts.items()}
    
    return {
        "success": True,
        "metrics": {
            "total_users": total_users,
            "total_transactions": total_txns,
            "blocked_transactions": blocked_txns,
            "total_volume": total_volume,
            "system_threat_level": system_threat_level,
            "risk_distribution": {
                "counts": dist_counts,
                "percentages": dist_pct
            }
        }
    }

class BlockUserRequest(BaseModel):
    action: str # "block" or "unblock"
    
@router.post("/users/{email}/block")
async def toggle_user_block(email: str, req: BlockUserRequest):
    check_db()
    
    is_blocked = req.action.lower() == "block"
    res = supabase_client.table('users').update({"is_blocked": is_blocked}).eq('email', email).execute()
    
    if not res.data:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {
        "success": True,
        "message": f"User {req.action}ed successfully",
        "status": "Banned" if is_blocked else "Active"
    }
