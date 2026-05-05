from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    DATABASE_URL: str

    SECRET_KEY: str
    ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080  # 7 days

    HOST: str = "127.0.0.1"
    PORT: int = 8000
    DEBUG: bool = False

    # SMTP Settings for Email
    SMTP_SERVER: Optional[str] = None
    SMTP_PORT: int = 587
    SMTP_USERNAME: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    SMTP_FROM_EMAIL: Optional[str] = None

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()

print(f"Database URL: {settings.DATABASE_URL}")
print(f"HOST: {settings.HOST}")
print(f"PORT: {settings.PORT}")
print(f"DEBUG: {settings.DEBUG}")
