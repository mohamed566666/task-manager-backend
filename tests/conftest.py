"""
conftest.py – shared fixtures for the entire test suite.

Strategy
--------
* Use an on-disk SQLite test DB (test_task_manager.db) isolated from the
  real task_manager.db.
* Override the `get_db` FastAPI dependency to point at the test DB.
* Patch `email_validator.deliverability.validate_email_deliverability` for the
  entire session so `validate_email(..., check_deliverability=True)` never
  makes a real DNS call.
* Patch `app.services.email_service.EmailService.send_otp_email` globally
  so no SMTP connections are made.
"""

import pytest
from unittest.mock import patch, MagicMock
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient

from app.main import app
from app.core.database import Base, get_db
from app.core.security import get_password_hash, create_access_token

# ─── In-memory SQLite engine ─────────────────────────────────────────────────

TEST_DATABASE_URL = "sqlite:///./test_task_manager.db"

engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


# ─── DB dependency override ──────────────────────────────────────────────────

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


# ─── Global external-call suppressors (session-scoped) ───────────────────────

@pytest.fixture(scope="session", autouse=True)
def suppress_external_calls():
    """
    Prevent ANY real network I/O during the test session:
    1. email_validator deliverability check (DNS/MX lookup)
    2. EmailService SMTP send
    """
    fake_deliverability = {"mx": [MagicMock()], "mx_fallback_type": None}
    with patch(
        "email_validator.deliverability.validate_email_deliverability",
        return_value=fake_deliverability,
    ), patch(
        "app.services.email_service.EmailService.send_otp_email",
        return_value=None,
    ):
        yield


# ─── Session-scoped fixtures ─────────────────────────────────────────────────

@pytest.fixture(scope="session", autouse=True)
def create_tables(suppress_external_calls):
    """Create all tables once, drop them after the session."""
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="session")
def client(create_tables):
    """FastAPI TestClient shared across the session."""
    with TestClient(app) as c:
        yield c


# ─── Task factory helper ─────────────────────────────────────────────────────

def create_test_task(db_session, owner_id: int, **overrides):
    """Insert a minimal Task row and return the ORM object."""
    from app.models.task import Task, PriorityEnum
    from datetime import datetime, timedelta

    defaults = dict(
        title="Test Task",
        description="A sample task",
        deadline=datetime.utcnow() + timedelta(days=3),
        priority=PriorityEnum.MEDIUM,
        is_completed=False,
        status="todo",
        category_label="Work",
        owner_id=owner_id,
    )
    defaults.update(overrides)
    task = Task(**defaults)
    db_session.add(task)
    db_session.commit()
    db_session.refresh(task)
    return task
