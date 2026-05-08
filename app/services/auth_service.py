from sqlalchemy.orm import Session
from app.repositories.user_repo import UserRepository
from app.core.security import get_password_hash, verify_password, create_access_token
from app.schemas.user import UserCreate, UserResponse


class AuthService:
    def __init__(self, db: Session):
        self.user_repo = UserRepository(db)

    def register(self, user_data: UserCreate) -> UserResponse:
        try:
            from email_validator import validate_email, EmailNotValidError
            try:
                validate_email(user_data.email, check_deliverability=True)
            except EmailNotValidError as e:
                raise ValueError(f"Invalid email address: {str(e)}")
        except ImportError:
            import re
            if not re.match(r'^[^\s@]+@[^\s@]+\.[^\s@]+$', user_data.email):
                raise ValueError("Please enter a valid email address")

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
            role=user.role,
            is_active=user.is_active,
            created_at=user.created_at,
        )

    def login(self, email: str, password: str) -> dict:
        user = self.user_repo.get_by_email(email)

        if not user or not verify_password(password, user.hashed_password):
            raise ValueError("Invalid email or password")

        access_token = create_access_token(
            data={"sub": str(user.id), "email": user.email, "role": user.role, "username": user.username}
        )

        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user_id": user.id,
            "username": user.username,
            "role": user.role,
        }

    def request_password_reset(self, email: str):
        from app.models.user import User
        from app.services.email_service import EmailService
        import random
        from datetime import datetime, timedelta

        user = self.user_repo.get_by_email(email)
        if not user:
            return True

        otp = str(random.randint(100000, 999999))
        
        user.reset_otp = otp
        user.reset_otp_expires_at = datetime.utcnow() + timedelta(minutes=5)
        
        self.user_repo.db.commit()

        EmailService.send_otp_email(user.email, otp)
        return True

    def verify_otp_and_reset_password(self, email: str, otp: str, new_password: str):
        from datetime import datetime

        user = self.user_repo.get_by_email(email)
        if not user:
            raise ValueError("Invalid email or OTP")

        if not user.reset_otp or user.reset_otp != otp:
            raise ValueError("Invalid OTP")

        if not user.reset_otp_expires_at or user.reset_otp_expires_at < datetime.utcnow():
            raise ValueError("OTP has expired")

        user.hashed_password = get_password_hash(new_password)
        
        user.reset_otp = None
        user.reset_otp_expires_at = None
        
        self.user_repo.db.commit()
        return True

