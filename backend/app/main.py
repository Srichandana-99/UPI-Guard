from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.routes import auth_db, transaction_db, admin_db, location
from app.db.database import engine
from app.db.models import Base

app = FastAPI(title=settings.PROJECT_NAME)

# Initialize DB tables
Base.metadata.create_all(bind=engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://localhost:3000",
        "http://localhost:8000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:5175",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_db.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(transaction_db.router, prefix="/api/v1/transaction", tags=["Transactions"])
app.include_router(admin_db.router, prefix="/api/v1/admin", tags=["Admin Panel"])
app.include_router(location.router, prefix="/api/v1", tags=["Location"])

@app.get("/health")
def health_check():
    return {"status": "ok", "project": settings.PROJECT_NAME}
