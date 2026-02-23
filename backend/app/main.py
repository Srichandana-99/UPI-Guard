from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import fraud
from app.core.config import settings

app = FastAPI(title=settings.PROJECT_NAME)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(fraud.router, prefix="/api/v1", tags=["fraud"])

@app.get("/health")
def health_check():
    return {"status": "ok", "project": settings.PROJECT_NAME}
