import os
from typing import Optional
from dotenv import load_dotenv

load_dotenv()

class Settings:
    def __init__(self):
        self.PORT: int = int(os.getenv("PORT", "8000"))
        self.HOST: str = os.getenv("HOST", "0.0.0.0")
        self.ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
        self.FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:5173")
        
        # AI Config
        self.GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY") or ""
        self.GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
        self.GEMMA_MODEL: str = os.getenv("GEMMA_MODEL", "gemma-4-26b-a4b-it")
        
        # Database
        self.DATABASE_PATH: str = os.getenv("DATABASE_PATH", "accesscheck.db")

settings = Settings()
