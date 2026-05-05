"""
test_security.py – Unit tests for app/core/security.py

Covers
------
* Password hashing and verification (correct + wrong password)
* JWT token creation and decoding (valid + expired + tampered)
* decode_token returns None on bad input
"""

import pytest
from datetime import timedelta

from app.core.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    decode_token,
)


# ─── Password hashing ────────────────────────────────────────────────────────

class TestPasswordHashing:
    def test_hash_is_not_plaintext(self):
        hashed = get_password_hash("MySecret123!")
        assert hashed != "MySecret123!"

    def test_correct_password_verifies(self):
        hashed = get_password_hash("CorrectHorse!")
        assert verify_password("CorrectHorse!", hashed) is True

    def test_wrong_password_fails(self):
        hashed = get_password_hash("CorrectHorse!")
        assert verify_password("WrongPony!", hashed) is False

    def test_empty_string_password_hashes(self):
        """Edge case: empty string should still hash without crashing."""
        hashed = get_password_hash("")
        assert verify_password("", hashed) is True

    def test_different_hashes_for_same_input(self):
        """Hashing is salted – two calls produce different digests."""
        h1 = get_password_hash("SamePassword!")
        h2 = get_password_hash("SamePassword!")
        assert h1 != h2


# ─── JWT token creation & decoding ──────────────────────────────────────────

class TestJWT:
    PAYLOAD = {"sub": "42", "email": "alice@example.com", "role": "user", "username": "alice"}

    def test_create_and_decode_valid_token(self):
        token = create_access_token(data=self.PAYLOAD)
        decoded = decode_token(token)
        assert decoded is not None
        assert decoded["sub"] == "42"
        assert decoded["email"] == "alice@example.com"
        assert decoded["role"] == "user"

    def test_expired_token_returns_none(self):
        token = create_access_token(data=self.PAYLOAD, expires_delta=timedelta(seconds=-1))
        result = decode_token(token)
        assert result is None

    def test_tampered_token_returns_none(self):
        token = create_access_token(data=self.PAYLOAD)
        tampered = token[:-5] + "XXXXX"
        result = decode_token(tampered)
        assert result is None

    def test_totally_invalid_token_returns_none(self):
        result = decode_token("not.a.token")
        assert result is None

    def test_empty_string_token_returns_none(self):
        result = decode_token("")
        assert result is None

    def test_custom_expiry_is_respected(self):
        """A token with a long TTL should decode successfully."""
        token = create_access_token(data=self.PAYLOAD, expires_delta=timedelta(hours=1))
        decoded = decode_token(token)
        assert decoded is not None
        assert "exp" in decoded
