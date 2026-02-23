from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "UPI Fraud Detection API"
    SUPABASE_URL: str = ""
    SUPABASE_KEY: str = ""

    class Config:
        env_file = ".env"

settings = Settings()
