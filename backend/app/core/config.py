import os
from typing import List, Optional
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "DAYFLOW HRMS"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = "super-secret-dayflow-jwt-key-change-in-production-2026"
    REFRESH_SECRET_KEY: str = "super-secret-dayflow-refresh-key-change-in-production-2026"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 # 1 day
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./dayflow.db")
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ]
    
    # SMTP / Email
    SMTP_HOST: Optional[str] = None
    SMTP_PORT: int = 587
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    EMAIL_FROM: str = "noreply@dayflow.io"
    
    # AI / LLM
    OPENAI_API_KEY: Optional[str] = os.getenv("OPENAI_API_KEY", None)

    class Config:
        case_sensitive = True

settings = Settings()
