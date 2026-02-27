from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.database import get_db
from app.db.crud import get_all_users, get_all_transactions, toggle_user_block
from app.db.models import User, Transaction
from app.api.routes.auth_db import check_db
from app.core.security import verify_admin_token

router = APIRouter()

class BlockUserRequest(BaseModel):
    action: str  # "block" or "unblock"

@router.get("/users")
async def get_all_users_endpoint(
    db: Session = Depends(get_db),
    admin_auth: dict = Depends(verify_admin_token)
):
    check_db()
    users = get_all_users(db)
    users_list = []
    for u in users:
        balance = float(u.balance or 0)
        is_fraud = u.is_fraud_risk or False
        risk_tier = "Critical" if is_fraud else "Low"
        if balance > 100000 and not is_fraud:
            risk_tier = "Safe"
        status = "Banned" if u.is_blocked else "Active"
        users_list.append({
            "id": u.id,
            "name": u.full_name,
            "upi": u.upi_id,
            "email": u.email,
            "status": status,
            "joined": u.created_at.isoformat() if u.created_at else None,
            "riskTier": risk_tier,
            "balance": balance,
        })
    return {"success": True, "users": users_list}

@router.get("/transactions")
async def get_all_transactions_endpoint(
    db: Session = Depends(get_db),
    admin_auth: dict = Depends(verify_admin_token)
):
    check_db()
    txns = get_all_transactions(db)
    admin_txns = []
    for t in txns:
        risk = "Safe" if t.status == "Completed" else "Critical"
        amount = float(t.amount or 0)
        if amount > 10000 and t.status != "Blocked":
            risk = "High"
        admin_txns.append({
            "id": t.id,
            "sender": {
                "name": "Unknown Sender",
                "upi": "unknown@upi",
                "avatar": "U",
            },
            "receiver": {
                "name": t.receiver_upi_id.split("@")[0].title(),
                "upi": t.receiver_upi_id,
                "avatar": t.receiver_upi_id[0].upper(),
            },
            "amount": amount,
            "date": t.date.isoformat() if t.date else None,
            "status": t.status,
            "risk": risk,
            "type": "send",
        })
    return {"success": True, "transactions": admin_txns}

@router.get("/fraud-alerts")
async def get_fraud_alerts(
    db: Session = Depends(get_db),
    admin_auth: dict = Depends(verify_admin_token)
):
    check_db()
    blocked_txns = db.query(Transaction).filter(Transaction.status == "Blocked").all()
    fraud_users = db.query(User).filter(User.is_fraud_risk == True).all()
    watchlist = []
    for user in fraud_users:
        user_blocked = [t for t in blocked_txns if t.sender_email == user.email]
        total_attempted = sum([float(t.amount or 0) for t in user_blocked])
        blocked_count = len(user_blocked)
        score = 30 + (blocked_count * 12) + min(40, int(total_attempted / 5000))
        score = max(0, min(100, score))
        watchlist.append({
            "name": user.full_name,
            "upi": user.upi_id,
            "score": str(score),
            "total": f"₹{total_attempted / 100000:.1f}L" if total_attempted > 100000 else f"₹{total_attempted}",
            "blocked": blocked_count,
        })
    return {
        "success": True,
        "alerts": [
            {
                "transaction_id": t.id,
                "sender_email": t.sender_email,
                "receiver_upi_id": t.receiver_upi_id,
                "amount": float(t.amount),
                "date": t.date.isoformat() if t.date else None,
                "status": t.status,
            }
            for t in blocked_txns
        ],
        "watchlist": watchlist,
    }

@router.get("/analytics")
async def get_analytics(
    db: Session = Depends(get_db),
    admin_auth: dict = Depends(verify_admin_token)
):
    check_db()
    total_users = db.query(User).count()
    total_txns = db.query(Transaction).count()
    blocked_txns = db.query(Transaction).filter(Transaction.status == "Blocked").count()
    fraud_users = db.query(User).filter(User.is_fraud_risk == True).count()
    total_volume = db.query(func.sum(Transaction.amount)).filter(Transaction.status == "Completed").scalar() or 0
    blocked_rate = (blocked_txns / total_txns) if total_txns else 0.0
    fraud_user_rate = (fraud_users / total_users) if total_users else 0.0
    system_threat_level = int(min(100, round((blocked_rate * 85) + (fraud_user_rate * 35))))
    dist_counts = {"safe": 0, "low": 0, "high": 0, "critical": 0}
    for t in db.query(Transaction).all():
        amount = float(t.amount or 0)
        if t.status == "Blocked":
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
            "total_volume": float(total_volume),
            "system_threat_level": system_threat_level,
            "risk_distribution": {
                "counts": dist_counts,
                "percentages": dist_pct,
            },
        },
    }

@router.post("/users/{email}/block")
async def toggle_user_block_endpoint(
    email: str,
    req: BlockUserRequest,
    db: Session = Depends(get_db),
    admin_auth: dict = Depends(verify_admin_token)
):
    check_db()
    is_blocked = req.action.lower() == "block"
    user = toggle_user_block(db, email, is_blocked)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "success": True,
        "message": f"User {req.action}ed successfully",
        "status": "Banned" if is_blocked else "Active",
    }
