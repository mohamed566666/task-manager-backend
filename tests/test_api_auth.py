"""
test_api_auth.py – Integration tests for /api/auth/* endpoints

External calls (DNS, SMTP) are suppressed globally by conftest.suppress_external_calls.

Covers
------
GET  /api/auth/check-email                 – exists / missing / no param
POST /api/auth/register                    – success, duplicate email/username, invalid
POST /api/auth/login                       – success, bad creds, missing field
POST /api/auth/forgot-password             – always 200 (anti-enumeration)
POST /api/auth/reset-password              – wrong OTP → 400, missing → 422
GET  /api/auth/users                       – admin-only; regular user → 403
"""

import pytest


# ─── Helpers ─────────────────────────────────────────────────────────────────

def _register(client, username, email, password="Pass123!"):
    return client.post("/api/auth/register", json={
        "username": username, "email": email, "password": password,
    })


def _login(client, email, password="Pass123!"):
    return client.post("/api/auth/login", json={"email": email, "password": password})


def _register_and_login(client, username, email, password="Pass123!"):
    _register(client, username, email, password)
    resp = _login(client, email, password)
    assert resp.status_code == 200, resp.text
    return resp.json()["access_token"]


def _auth(token):
    return {"Authorization": f"Bearer {token}"}


# ─── POST /api/auth/register ─────────────────────────────────────────────────

class TestRegisterEndpoint:

    def test_register_success(self, client):
        resp = _register(client, "reg_ok", "reg_ok@example.com")
        assert resp.status_code == 201
        data = resp.json()
        assert data["username"] == "reg_ok"
        assert data["role"] == "user"

    def test_register_missing_required_fields_returns_422(self, client):
        assert client.post("/api/auth/register", json={"username": "only_username"}).status_code == 422

    def test_register_invalid_email_format_returns_422(self, client):
        assert client.post("/api/auth/register", json={
            "username": "baduser", "email": "not-an-email", "password": "Pass123!",
        }).status_code == 422

    def test_register_duplicate_email_returns_400(self, client):
        _register(client, "dup1_user", "dup1@example.com")
        resp = _register(client, "dup1_user2", "dup1@example.com")
        assert resp.status_code == 400
        assert "Email already registered" in resp.json()["detail"]

    def test_register_duplicate_username_returns_400(self, client):
        _register(client, "dup2_user", "dup2_first@example.com")
        resp = _register(client, "dup2_user", "dup2_second@example.com")
        assert resp.status_code == 400
        assert "Username already taken" in resp.json()["detail"]


# ─── POST /api/auth/login ────────────────────────────────────────────────────

class TestLoginEndpoint:

    def test_login_success_returns_token(self, client):
        _register(client, "login_ok", "login_ok@example.com")
        resp = _login(client, "login_ok@example.com")
        assert resp.status_code == 200
        assert "access_token" in resp.json()
        assert resp.json()["token_type"] == "bearer"

    def test_login_wrong_password_returns_401(self, client):
        _register(client, "login_bad", "login_bad@example.com")
        resp = client.post("/api/auth/login", json={
            "email": "login_bad@example.com", "password": "WrongPassword!",
        })
        assert resp.status_code == 401

    def test_login_non_existent_user_returns_401(self, client):
        assert _login(client, "ghost@example.com").status_code == 401

    def test_login_missing_password_returns_422(self, client):
        assert client.post("/api/auth/login", json={"email": "someone@example.com"}).status_code == 422


# ─── GET /api/auth/check-email ───────────────────────────────────────────────

class TestCheckEmailEndpoint:

    def test_check_existing_email(self, client):
        _register(client, "checkme", "checkme@example.com")
        resp = client.get("/api/auth/check-email", params={"email": "checkme@example.com"})
        assert resp.status_code == 200
        assert resp.json()["exists"] is True

    def test_check_non_existing_email(self, client):
        resp = client.get("/api/auth/check-email", params={"email": "nobody@example.com"})
        assert resp.status_code == 200
        assert resp.json()["exists"] is False

    def test_check_email_missing_param_returns_422(self, client):
        assert client.get("/api/auth/check-email").status_code == 422


# ─── POST /api/auth/forgot-password ──────────────────────────────────────────

class TestForgotPasswordEndpoint:

    def test_always_returns_200_existing(self, client):
        resp = client.post("/api/auth/forgot-password", json={"email": "anyone@example.com"})
        assert resp.status_code == 200

    def test_always_returns_200_unknown(self, client):
        assert client.post("/api/auth/forgot-password", json={"email": "nobody99@example.com"}).status_code == 200

    def test_missing_email_returns_422(self, client):
        assert client.post("/api/auth/forgot-password", json={}).status_code == 422


# ─── POST /api/auth/reset-password ───────────────────────────────────────────

class TestResetPasswordEndpoint:

    def test_wrong_otp_returns_400(self, client):
        resp = client.post("/api/auth/reset-password", json={
            "email": "someone@example.com", "otp": "000000", "new_password": "NewPass456!",
        })
        assert resp.status_code == 400

    def test_missing_fields_returns_422(self, client):
        assert client.post("/api/auth/reset-password", json={"email": "x@example.com"}).status_code == 422


# ─── GET /api/auth/users (admin-only) ────────────────────────────────────────

class TestAdminUsersEndpoint:

    def test_unauthenticated_request_returns_401(self, client):
        assert client.get("/api/auth/users").status_code == 401

    def test_regular_user_returns_403(self, client):
        token = _register_and_login(client, "plain_user_a", "plain_user_a@example.com")
        assert client.get("/api/auth/users", headers=_auth(token)).status_code == 403
