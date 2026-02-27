from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from app.core.config import settings
from app.api.routes import auth_db, transaction_db, admin_db, location
from app.db.database import engine
from app.db.models import Base
import os

app = FastAPI(title=settings.PROJECT_NAME)

# Get CORS origins from environment or use defaults
cors_origins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
]

# Add production origins from environment
if settings.CORS_ORIGINS:
    production_origins = [origin.strip() for origin in settings.CORS_ORIGINS.split(",")]
    # Filter out any malformed origins
    production_origins = [origin for origin in production_origins if origin and not origin.startswith("CORS_ORIGINS=")]
    cors_origins.extend(production_origins)

print(f"🌐 CORS Origins: {cors_origins}")

# Add Trusted Host middleware for security
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["localhost", "127.0.0.1", "*.vercel.app", "*.onrender.com"]
)

# Add CORS middleware with restricted headers
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)

# Include all routes with correct prefixes
app.include_router(auth_db.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(transaction_db.router, prefix="/api/v1/transaction", tags=["Transactions"])
app.include_router(admin_db.router, prefix="/api/v1/admin", tags=["Admin Panel"])
app.include_router(location.router, prefix="/api/v1", tags=["Location"])

@app.on_event("startup")
async def startup_event():
    """Create database tables on startup"""
    try:
        Base.metadata.create_all(bind=engine)
        print("✅ Database tables created successfully")
    except Exception as e:
        print(f"❌ Error creating database tables: {e}")

@app.get("/health")
def health_check():
    return {"status": "ok", "project": settings.PROJECT_NAME}

@app.get("/test")
def test_endpoint():
    return {"message": "Test endpoint working", "cors": "enabled"}

@app.post("/api/v1/test")
def test_post_endpoint():
    return {"message": "POST test endpoint working", "cors": "enabled"}

# Print all routes for debugging
if __name__ == "__main__":
    import uvicorn
    print("🔍 Available routes:")
    for route in app.routes:
        if hasattr(route, 'path'):
            print(f"  {route.methods} {route.path}")
    uvicorn.run(app, host="0.0.0.0", port=8000)
