from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.routes import fraud, auth, transaction, admin

app = FastAPI(title=settings.PROJECT_NAME)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(fraud.router, prefix="/api/v1", tags=["Fraud Detection"])
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(transaction.router, prefix="/api/v1/transaction", tags=["Transactions"])
app.include_router(admin.router, prefix="/api/v1/admin", tags=["Admin Panel"])

@app.get("/health")
def health_check():
    return {"status": "ok", "project": settings.PROJECT_NAME}
