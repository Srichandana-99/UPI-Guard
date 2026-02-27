from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    PROJECT_NAME: str = "UPI Fraud Detection API"
    DATABASE_URL: str = ""
    # Comma-separated list, e.g. "http://localhost:5173,https://yourdomain.com"
    CORS_ORIGINS: str = "http://localhost:5173"
    # Comma-separated list of admin emails, e.g. "admin@company.com,secops@company.com"
    ADMIN_EMAILS: str = ""
    # Supabase credentials for Auth (OTP)
    SUPABASE_URL: str = ""
    SUPABASE_KEY: str = ""
    # Email service configuration
    SENDER_EMAIL: str = ""
    SENDER_PASSWORD: str = ""
    # Firebase configuration for real-time
    FIREBASE_DB_URL: str = ""
    FIREBASE_API_KEY: str = ""
    FIREBASE_AUTH_DOMAIN: str = ""
    FIREBASE_PROJECT_ID: str = ""

    class Config:
        env_file = ".env"

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]

    @property
    def admin_emails_set(self) -> set[str]:
        return {e.strip().lower() for e in self.ADMIN_EMAILS.split(",") if e.strip()}

settings = Settings()
