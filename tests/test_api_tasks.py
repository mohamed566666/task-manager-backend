"""
test_api_tasks.py – Integration tests for /api/tasks/* endpoints

External calls (DNS, SMTP) are suppressed globally by conftest.suppress_external_calls.

Covers
------
POST   /api/tasks/              – create task (success, missing fields, unauthenticated)
GET    /api/tasks/              – list own tasks, sort_by variants, invalid sort
GET    /api/tasks/upcoming      – happy path, days boundary (1 and 30)
GET    /api/tasks/all           – admin-only; regular user gets 403
PUT    /api/tasks/{id}          – update own task, update other user's task → 403
DELETE /api/tasks/{id}          – delete own, delete other's → 403, non-existent → 404
PATCH  /api/tasks/{id}/complete – success, wrong owner, non-existent → 404
GET    /api/tasks/{id}/comments – comments list
POST   /api/tasks/{id}/comments – add comment, empty comment → 400
"""

import pytest
from datetime import datetime, timedelta

FUTURE_DEADLINE = (datetime.utcnow() + timedelta(days=7)).isoformat()


# ─── Helpers ─────────────────────────────────────────────────────────────────

def _register_and_login(client, username, email, password="Pass123!"):
    client.post("/api/auth/register", json={
        "username": username, "email": email, "password": password,
    })
    resp = client.post("/api/auth/login", json={"email": email, "password": password})
    assert resp.status_code == 200, resp.text
    return resp.json()["access_token"]


def _auth(token):
    return {"Authorization": f"Bearer {token}"}


def _task_payload(**overrides):
    base = {
        "title": "Sample Task",
        "description": "Some description",
        "deadline": FUTURE_DEADLINE,
        "priority": "Medium",
        "status": "todo",
        "category_label": "Work",
    }
    base.update(overrides)
    return base


# ─── POST /api/tasks/ ────────────────────────────────────────────────────────

class TestCreateTask:

    def test_create_task_success(self, client):
        token = _register_and_login(client, "task_creator", "task_creator@example.com")
        resp = client.post("/api/tasks/", json=_task_payload(), headers=_auth(token))
        assert resp.status_code == 201
        data = resp.json()
        assert data["title"] == "Sample Task"
        assert data["priority"] == "Medium"
        assert data["is_completed"] is False

    def test_create_task_unauthenticated_returns_401(self, client):
        assert client.post("/api/tasks/", json=_task_payload()).status_code == 401

    def test_create_task_missing_title_returns_422(self, client):
        token = _register_and_login(client, "no_title_user", "no_title@example.com")
        payload = _task_payload()
        del payload["title"]
        assert client.post("/api/tasks/", json=payload, headers=_auth(token)).status_code == 422

    def test_create_task_missing_deadline_returns_422(self, client):
        token = _register_and_login(client, "no_dl_user", "no_dl@example.com")
        payload = _task_payload()
        del payload["deadline"]
        assert client.post("/api/tasks/", json=payload, headers=_auth(token)).status_code == 422

    def test_create_task_invalid_priority_returns_422(self, client):
        token = _register_and_login(client, "bad_pri_user", "bad_pri@example.com")
        assert client.post(
            "/api/tasks/", json=_task_payload(priority="URGENT"), headers=_auth(token)
        ).status_code == 422

    def test_create_task_with_high_priority(self, client):
        token = _register_and_login(client, "high_pri_user", "high_pri@example.com")
        resp = client.post("/api/tasks/", json=_task_payload(priority="High"), headers=_auth(token))
        assert resp.status_code == 201
        assert resp.json()["priority"] == "High"


# ─── GET /api/tasks/ ─────────────────────────────────────────────────────────

class TestListTasks:

    def test_get_my_tasks_empty(self, client):
        token = _register_and_login(client, "empty_list_user", "empty_list@example.com")
        resp = client.get("/api/tasks/", headers=_auth(token))
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)

    def test_get_my_tasks_returns_own_only(self, client):
        token_a = _register_and_login(client, "owner_a", "owner_a@example.com")
        token_b = _register_and_login(client, "owner_b", "owner_b@example.com")

        client.post("/api/tasks/", json=_task_payload(title="Alice Task"), headers=_auth(token_a))
        client.post("/api/tasks/", json=_task_payload(title="Bob Task"), headers=_auth(token_b))

        titles = [t["title"] for t in client.get("/api/tasks/", headers=_auth(token_a)).json()]
        assert "Alice Task" in titles
        assert "Bob Task" not in titles

    def test_sort_by_deadline(self, client):
        token = _register_and_login(client, "sort_dl_user", "sort_dl@example.com")
        assert client.get("/api/tasks/?sort_by=deadline", headers=_auth(token)).status_code == 200

    def test_sort_by_priority(self, client):
        token = _register_and_login(client, "sort_pri_user", "sort_pri@example.com")
        assert client.get("/api/tasks/?sort_by=priority", headers=_auth(token)).status_code == 200

    def test_invalid_sort_returns_422(self, client):
        token = _register_and_login(client, "inv_sort_user", "inv_sort@example.com")
        assert client.get("/api/tasks/?sort_by=invalid_sort", headers=_auth(token)).status_code == 422

    def test_unauthenticated_returns_401(self, client):
        assert client.get("/api/tasks/").status_code == 401


# ─── GET /api/tasks/upcoming ─────────────────────────────────────────────────

class TestUpcomingTasks:

    def test_upcoming_tasks_default(self, client):
        token = _register_and_login(client, "upcoming_user", "upcoming@example.com")
        assert client.get("/api/tasks/upcoming", headers=_auth(token)).status_code == 200

    def test_upcoming_tasks_days_min(self, client):
        token = _register_and_login(client, "upcoming_min", "upcoming_min@example.com")
        assert client.get("/api/tasks/upcoming?days=1", headers=_auth(token)).status_code == 200

    def test_upcoming_tasks_days_max(self, client):
        token = _register_and_login(client, "upcoming_max", "upcoming_max@example.com")
        assert client.get("/api/tasks/upcoming?days=30", headers=_auth(token)).status_code == 200

    def test_upcoming_tasks_days_zero_returns_422(self, client):
        token = _register_and_login(client, "upcoming_oor", "upcoming_oor@example.com")
        assert client.get("/api/tasks/upcoming?days=0", headers=_auth(token)).status_code == 422

    def test_upcoming_tasks_days_31_returns_422(self, client):
        token = _register_and_login(client, "upcoming_big", "upcoming_big@example.com")
        assert client.get("/api/tasks/upcoming?days=31", headers=_auth(token)).status_code == 422


# ─── GET /api/tasks/all (admin-only) ─────────────────────────────────────────

class TestAdminAllTasks:

    def test_regular_user_gets_403(self, client):
        token = _register_and_login(client, "notadmin_tasks", "notadmin_tasks@example.com")
        assert client.get("/api/tasks/all", headers=_auth(token)).status_code == 403

    def test_unauthenticated_gets_401(self, client):
        assert client.get("/api/tasks/all").status_code == 401


# ─── PUT /api/tasks/{id} ─────────────────────────────────────────────────────

class TestUpdateTask:

    def test_owner_can_update_task(self, client):
        token = _register_and_login(client, "update_owner", "update_owner@example.com")
        task_id = client.post("/api/tasks/", json=_task_payload(), headers=_auth(token)).json()["id"]
        resp = client.put(f"/api/tasks/{task_id}", json={"title": "Updated Title"}, headers=_auth(token))
        assert resp.status_code == 200
        assert resp.json()["title"] == "Updated Title"

    def test_other_user_cannot_update_task(self, client):
        token_owner = _register_and_login(client, "upd_owner2", "upd_owner2@example.com")
        token_other = _register_and_login(client, "upd_other2", "upd_other2@example.com")
        task_id = client.post("/api/tasks/", json=_task_payload(), headers=_auth(token_owner)).json()["id"]
        assert client.put(f"/api/tasks/{task_id}", json={"title": "Hijacked"}, headers=_auth(token_other)).status_code == 403

    def test_update_non_existent_task_returns_404(self, client):
        token = _register_and_login(client, "upd_ghost_user", "upd_ghost@example.com")
        assert client.put("/api/tasks/99999", json={"title": "Ghost"}, headers=_auth(token)).status_code == 404


# ─── DELETE /api/tasks/{id} ──────────────────────────────────────────────────

class TestDeleteTask:

    def test_owner_can_delete_task(self, client):
        token = _register_and_login(client, "del_owner", "del_owner@example.com")
        task_id = client.post("/api/tasks/", json=_task_payload(), headers=_auth(token)).json()["id"]
        assert client.delete(f"/api/tasks/{task_id}", headers=_auth(token)).status_code == 204

    def test_other_user_cannot_delete_task(self, client):
        token_a = _register_and_login(client, "del_a", "del_a@example.com")
        token_b = _register_and_login(client, "del_b", "del_b@example.com")
        task_id = client.post("/api/tasks/", json=_task_payload(), headers=_auth(token_a)).json()["id"]
        assert client.delete(f"/api/tasks/{task_id}", headers=_auth(token_b)).status_code == 403

    def test_delete_non_existent_task_returns_404(self, client):
        token = _register_and_login(client, "del_ghost", "del_ghost@example.com")
        assert client.delete("/api/tasks/99999", headers=_auth(token)).status_code == 404


# ─── PATCH /api/tasks/{id}/complete ──────────────────────────────────────────

class TestCompleteTask:

    def test_complete_own_task(self, client):
        token = _register_and_login(client, "completer", "completer@example.com")
        task_id = client.post("/api/tasks/", json=_task_payload(), headers=_auth(token)).json()["id"]
        resp = client.patch(f"/api/tasks/{task_id}/complete", headers=_auth(token))
        assert resp.status_code == 200
        assert resp.json()["is_completed"] is True

    def test_complete_other_user_task_returns_403(self, client):
        token_a = _register_and_login(client, "comp_a", "comp_a@example.com")
        token_b = _register_and_login(client, "comp_b", "comp_b@example.com")
        task_id = client.post("/api/tasks/", json=_task_payload(), headers=_auth(token_a)).json()["id"]
        assert client.patch(f"/api/tasks/{task_id}/complete", headers=_auth(token_b)).status_code == 403

    def test_complete_non_existent_task_returns_403(self, client):
        """
        The service raises ValueError('Task not found or unauthorized') for non-existent tasks,
        which the route maps to HTTP 403. This is a documented production behaviour.
        """
        token = _register_and_login(client, "comp_ghost", "comp_ghost@example.com")
        assert client.patch("/api/tasks/99999/complete", headers=_auth(token)).status_code == 403


# ─── Comments ────────────────────────────────────────────────────────────────

class TestTaskComments:

    def test_add_and_list_comments(self, client):
        token = _register_and_login(client, "comment_user", "comment_user@example.com")
        task_id = client.post("/api/tasks/", json=_task_payload(), headers=_auth(token)).json()["id"]

        add_resp = client.post(
            f"/api/tasks/{task_id}/comments",
            json={"content": "This is my comment"},
            headers=_auth(token),
        )
        assert add_resp.status_code == 201
        assert add_resp.json()["content"] == "This is my comment"

        comments = client.get(f"/api/tasks/{task_id}/comments", headers=_auth(token)).json()
        assert any(c["content"] == "This is my comment" for c in comments)

    def test_add_empty_comment_returns_400(self, client):
        token = _register_and_login(client, "empty_comment_user", "empty_comment@example.com")
        task_id = client.post("/api/tasks/", json=_task_payload(), headers=_auth(token)).json()["id"]
        assert client.post(
            f"/api/tasks/{task_id}/comments", json={"content": "   "}, headers=_auth(token)
        ).status_code == 400

    def test_get_comments_non_existent_task_returns_404(self, client):
        token = _register_and_login(client, "ghost_comment_user", "ghost_comment@example.com")
        assert client.get("/api/tasks/99999/comments", headers=_auth(token)).status_code == 404

    def test_add_comment_non_existent_task_returns_404(self, client):
        token = _register_and_login(client, "ghost_add_comment", "ghost_add_comment@example.com")
        assert client.post("/api/tasks/99999/comments", json={"content": "Hello"}, headers=_auth(token)).status_code == 404

    def test_unauthenticated_comment_returns_401(self, client):
        assert client.get("/api/tasks/1/comments").status_code == 401
