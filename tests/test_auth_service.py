"""
test_auth_service.py – Unit tests for app/services/auth_service.py

Covers
------
* register(): success, duplicate email, duplicate username
* login(): success, wrong password, non-existent user
* verify_otp_and_reset_password(): valid OTP, wrong OTP, expired OTP, unknown email

DNS is suppressed via the session-scoped mock_dns fixture in conftest.py.
"""

import pytest
from unittest.mock import patch, MagicMock
from datetime import datetime, timedelta

from app.services.auth_service import AuthService
from app.core.security import get_password_hash
from app.schemas.user import UserCreate


# ─── Helpers ─────────────────────────────────────────────────────────────────

def _user_create(
    username="alice",
    email="alice@example.com",
    password="Secure123!",
    full_name="Alice Smith",
):
    return UserCreate(username=username, email=email, password=password, full_name=full_name)


def _mock_user(
    *,
    id=1,
    username="alice",
    email="alice@example.com",
    hashed_password=None,
    role="user",
    is_active=True,
    reset_otp=None,
    reset_otp_expires_at=None,
):
    user = MagicMock()
    user.id = id
    user.username = username
    user.email = email
    user.hashed_password = hashed_password or get_password_hash("Secure123!")
    user.role = role
    user.is_active = is_active
    user.full_name = "Alice Smith"
    user.reset_otp = reset_otp
    user.reset_otp_expires_at = reset_otp_expires_at
    user.created_at = datetime.utcnow()
    return user


# ─── register() ──────────────────────────────────────────────────────────────

class TestAuthServiceRegister:

    @patch("app.services.auth_service.UserRepository")
    def test_register_success(self, MockRepo):
        """mock_dns in conftest suppresses the DNS call; validate_email runs normally."""
        mock_repo = MockRepo.return_value
        mock_repo.get_by_email.return_value = None
        mock_repo.get_by_username.return_value = None
        mock_repo.create.return_value = _mock_user()

        service = AuthService.__new__(AuthService)
        service.user_repo = mock_repo

        response = service.register(_user_create())

        assert response.username == "alice"
        assert response.email == "alice@example.com"

    @patch("app.services.auth_service.UserRepository")
    def test_register_duplicate_email_raises(self, MockRepo):
        mock_repo = MockRepo.return_value
        mock_repo.get_by_email.return_value = _mock_user()

        service = AuthService.__new__(AuthService)
        service.user_repo = mock_repo

        with pytest.raises(ValueError, match="Email already registered"):
            service.register(_user_create())

    @patch("app.services.auth_service.UserRepository")
    def test_register_duplicate_username_raises(self, MockRepo):
        mock_repo = MockRepo.return_value
        mock_repo.get_by_email.return_value = None
        mock_repo.get_by_username.return_value = _mock_user()

        service = AuthService.__new__(AuthService)
        service.user_repo = mock_repo

        with pytest.raises(ValueError, match="Username already taken"):
            service.register(_user_create())

    def test_register_invalid_email_rejected_by_pydantic(self):
        """Pydantic EmailStr rejects malformed addresses before the service runs."""
        with pytest.raises(Exception):
            _user_create(email="not-an-email")


# ─── login() ─────────────────────────────────────────────────────────────────

class TestAuthServiceLogin:

    @patch("app.services.auth_service.UserRepository")
    def test_login_success_returns_token(self, MockRepo):
        mock_repo = MockRepo.return_value
        mock_repo.get_by_email.return_value = _mock_user()

        service = AuthService.__new__(AuthService)
        service.user_repo = mock_repo

        result = service.login("alice@example.com", "Secure123!")

        assert "access_token" in result
        assert result["token_type"] == "bearer"
        assert result["username"] == "alice"
        assert result["role"] == "user"

    @patch("app.services.auth_service.UserRepository")
    def test_login_wrong_password_raises(self, MockRepo):
        mock_repo = MockRepo.return_value
        mock_repo.get_by_email.return_value = _mock_user()

        service = AuthService.__new__(AuthService)
        service.user_repo = mock_repo

        with pytest.raises(ValueError, match="Invalid email or password"):
            service.login("alice@example.com", "WrongPassword!")

    @patch("app.services.auth_service.UserRepository")
    def test_login_unknown_email_raises(self, MockRepo):
        mock_repo = MockRepo.return_value
        mock_repo.get_by_email.return_value = None

        service = AuthService.__new__(AuthService)
        service.user_repo = mock_repo

        with pytest.raises(ValueError, match="Invalid email or password"):
            service.login("ghost@example.com", "AnyPass!")


# ─── verify_otp_and_reset_password() ─────────────────────────────────────────

class TestVerifyOtpAndResetPassword:

    def _service_with_user(self, user):
        mock_repo = MagicMock()
        mock_repo.get_by_email.return_value = user
        mock_repo.db = MagicMock()

        service = AuthService.__new__(AuthService)
        service.user_repo = mock_repo
        return service

    def test_valid_otp_resets_password(self):
        user = _mock_user(
            reset_otp="123456",
            reset_otp_expires_at=datetime.utcnow() + timedelta(minutes=5),
        )
        service = self._service_with_user(user)

        result = service.verify_otp_and_reset_password(
            email="alice@example.com",
            otp="123456",
            new_password="NewPass456!",
        )

        assert result is True
        assert user.reset_otp is None
        assert user.reset_otp_expires_at is None

    def test_wrong_otp_raises(self):
        user = _mock_user(
            reset_otp="123456",
            reset_otp_expires_at=datetime.utcnow() + timedelta(minutes=5),
        )
        service = self._service_with_user(user)

        with pytest.raises(ValueError, match="Invalid OTP"):
            service.verify_otp_and_reset_password(
                email="alice@example.com",
                otp="000000",
                new_password="NewPass456!",
            )

    def test_expired_otp_raises(self):
        user = _mock_user(
            reset_otp="123456",
            reset_otp_expires_at=datetime.utcnow() - timedelta(minutes=1),
        )
        service = self._service_with_user(user)

        with pytest.raises(ValueError, match="OTP has expired"):
            service.verify_otp_and_reset_password(
                email="alice@example.com",
                otp="123456",
                new_password="NewPass456!",
            )

    def test_unknown_email_raises(self):
        mock_repo = MagicMock()
        mock_repo.get_by_email.return_value = None

        service = AuthService.__new__(AuthService)
        service.user_repo = mock_repo

        with pytest.raises(ValueError, match="Invalid email or OTP"):
            service.verify_otp_and_reset_password(
                email="ghost@example.com",
                otp="123456",
                new_password="AnyPass!",
            )
