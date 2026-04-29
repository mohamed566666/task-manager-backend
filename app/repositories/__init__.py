# app/repositories/__init__.py
from app.repositories.base_repo import BaseRepository
from app.repositories.user_repo import UserRepository

__all__ = ["BaseRepository", "UserRepository"]
