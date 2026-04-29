from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    DATABASE_URL: str

    SECRET_KEY: str
    ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int

    HOST: str = "127.0.0.1"
    PORT: int = 8000
    DEBUG: bool = False

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()

print(f"Database URL: {settings.DATABASE_URL}")
print(f"HOST: {settings.HOST}")
print(f"PORT: {settings.PORT}")
print(f"DEBUG: {settings.DEBUG}")
