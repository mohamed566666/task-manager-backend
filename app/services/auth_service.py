from sqlalchemy.orm import Session
from app.repositories.user_repo import UserRepository
from app.core.security import get_password_hash, verify_password, create_access_token
from app.schemas.user import UserCreate, UserResponse


class AuthService:
    def __init__(self, db: Session):
        self.user_repo = UserRepository(db)

    def register(self, user_data: UserCreate) -> UserResponse:
        if self.user_repo.get_by_email(user_data.email):
            raise ValueError("Email already registered")

        if self.user_repo.get_by_username(user_data.username):
            raise ValueError("Username already taken")

        hashed_password = get_password_hash(user_data.password)

        user = self.user_repo.create(
            username=user_data.username,
            email=user_data.email,
            hashed_password=hashed_password,
            full_name=user_data.full_name,
        )

        return UserResponse(
            id=user.id,
            username=user.username,
            email=user.email,
            full_name=user.full_name,
            is_active=user.is_active,
            created_at=user.created_at,
        )

    def login(self, email: str, password: str) -> dict:
        user = self.user_repo.get_by_email(email)

        if not user or not verify_password(password, user.hashed_password):
            raise ValueError("Invalid email or password")

        access_token = create_access_token(
            data={"sub": str(user.id), "email": user.email}
        )

        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user_id": user.id,
            "username": user.username,
        }
