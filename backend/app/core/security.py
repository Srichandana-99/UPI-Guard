from fastapi import HTTPException, Depends, Header
from typing import Optional
from app.core.config import settings
from app.db.database import get_db
from app.db.crud import get_user_by_email
from sqlalchemy.orm import Session

async def verify_admin_token(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
) -> dict:
    """
    Verify that the request is from an admin user.
    Expects Authorization header with format: "Bearer <email>"
    """
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing authorization header")
    
    try:
        scheme, credentials = authorization.split()
        if scheme.lower() != "bearer":
            raise ValueError("Invalid auth scheme")
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid authorization header format")
    
    email = credentials.strip()
    
    # Verify email is in admin list
    if email.lower() not in settings.admin_emails_set:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Verify user exists and is verified
    user = get_user_by_email(db, email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if not user.verified:
        raise HTTPException(status_code=403, detail="User email not verified")
    
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="User does not have admin role")
    
    return {"email": email, "user": user}

async def verify_user_token(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
) -> dict:
    """
    Verify that the request is from an authenticated user.
    Expects Authorization header with format: "Bearer <email>"
    """
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing authorization header")
    
    try:
        scheme, credentials = authorization.split()
        if scheme.lower() != "bearer":
            raise ValueError("Invalid auth scheme")
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid authorization header format")
    
    email = credentials.strip()
    
    # Verify user exists and is verified
    user = get_user_by_email(db, email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if not user.verified:
        raise HTTPException(status_code=403, detail="User email not verified")
    
    return {"email": email, "user": user}
