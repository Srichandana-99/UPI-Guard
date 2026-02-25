from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.crud import create_location_log, get_user_location_logs
from pydantic import BaseModel
from typing import Optional

router = APIRouter()

class LocationData(BaseModel):
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    accuracy: Optional[float] = None
    action: Optional[str] = "app_open"

@router.post("/location/{email}")
async def log_location(email: str, location: LocationData, request: Request, db: Session = Depends(get_db)):
    """Log user location with IP and user agent"""
    try:
        # Get client IP address
        client_ip = request.client.host
        if 'x-forwarded-for' in request.headers:
            client_ip = request.headers['x-forwarded-for'].split(',')[0]
        
        # Get user agent
        user_agent = request.headers.get('user-agent', 'Unknown')
        
        location_data = {
            "user_email": email,
            "latitude": location.latitude,
            "longitude": location.longitude,
            "accuracy": location.accuracy,
            "ip_address": client_ip,
            "user_agent": user_agent,
            "action": location.action
        }
        
        log_entry = create_location_log(db, location_data)
        
        return {
            "success": True,
            "message": "Location logged successfully",
            "id": log_entry.id
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/location/{email}")
async def get_location_history(email: str, limit: int = 50, db: Session = Depends(get_db)):
    """Get user's location history"""
    try:
        logs = get_user_location_logs(db, email, limit)
        
        return {
            "success": True,
            "logs": [
                {
                    "id": log.id,
                    "latitude": log.latitude,
                    "longitude": log.longitude,
                    "accuracy": log.accuracy,
                    "ip_address": log.ip_address,
                    "action": log.action,
                    "timestamp": log.timestamp.isoformat()
                }
                for log in logs
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
