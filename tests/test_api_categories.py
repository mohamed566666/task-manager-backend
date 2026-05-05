"""
test_api_categories.py – Integration tests for /api/categories/* endpoints

External calls suppressed globally by conftest.suppress_external_calls.
"""

import pytest


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


def _cat_payload(name="Work", description="Work tasks"):
    return {"name": name, "description": description}


# ─── POST /api/categories/ ───────────────────────────────────────────────────

class TestCreateCategory:

    def test_create_category_success(self, client):
        token = _register_and_login(client, "cat_creator", "cat_creator@example.com")
        resp = client.post("/api/categories/", json=_cat_payload("Personal"), headers=_auth(token))
        assert resp.status_code == 201
        assert resp.json()["name"] == "Personal"

    def test_create_category_unauthenticated_returns_401(self, client):
        assert client.post("/api/categories/", json=_cat_payload()).status_code == 401

    def test_create_category_missing_name_returns_422(self, client):
        token = _register_and_login(client, "cat_no_name", "cat_no_name@example.com")
        assert client.post("/api/categories/", json={"description": "No name"}, headers=_auth(token)).status_code == 422

    def test_create_duplicate_category_returns_400(self, client):
        token = _register_and_login(client, "cat_dup_user", "cat_dup@example.com")
        client.post("/api/categories/", json=_cat_payload("DupCat"), headers=_auth(token))
        resp = client.post("/api/categories/", json=_cat_payload("DupCat"), headers=_auth(token))
        assert resp.status_code == 400
        assert "already exists" in resp.json()["detail"].lower()


# ─── GET /api/categories/ ────────────────────────────────────────────────────

class TestListCategories:

    def test_list_categories_includes_created(self, client):
        token = _register_and_login(client, "cat_list_user", "cat_list@example.com")
        client.post("/api/categories/", json=_cat_payload("ListedCat"), headers=_auth(token))
        names = [c["name"] for c in client.get("/api/categories/", headers=_auth(token)).json()]
        assert "ListedCat" in names

    def test_list_categories_unauthenticated_returns_401(self, client):
        assert client.get("/api/categories/").status_code == 401


# ─── PUT /api/categories/{id} ────────────────────────────────────────────────

class TestUpdateCategory:

    def test_owner_can_update_category(self, client):
        token = _register_and_login(client, "cat_upd_owner", "cat_upd_owner@example.com")
        cat_id = client.post("/api/categories/", json=_cat_payload("UpdCat"), headers=_auth(token)).json()["id"]
        resp = client.put(f"/api/categories/{cat_id}", json={"name": "Updated Cat"}, headers=_auth(token))
        assert resp.status_code == 200
        assert resp.json()["name"] == "Updated Cat"

    def test_other_user_cannot_update_category(self, client):
        token_a = _register_and_login(client, "cat_own_a", "cat_own_a@example.com")
        token_b = _register_and_login(client, "cat_own_b", "cat_own_b@example.com")
        cat_id = client.post("/api/categories/", json=_cat_payload("AsCat"), headers=_auth(token_a)).json()["id"]
        assert client.put(f"/api/categories/{cat_id}", json={"name": "Hijacked"}, headers=_auth(token_b)).status_code == 403

    def test_update_non_existent_category_returns_404(self, client):
        token = _register_and_login(client, "cat_ghost_upd", "cat_ghost_upd@example.com")
        assert client.put("/api/categories/99999", json={"name": "Ghost"}, headers=_auth(token)).status_code == 404


# ─── DELETE /api/categories/{id} ─────────────────────────────────────────────

class TestDeleteCategory:

    def test_owner_can_delete_category(self, client):
        token = _register_and_login(client, "cat_del_owner", "cat_del_owner@example.com")
        cat_id = client.post("/api/categories/", json=_cat_payload("DelCat"), headers=_auth(token)).json()["id"]
        assert client.delete(f"/api/categories/{cat_id}", headers=_auth(token)).status_code == 204

    def test_other_user_cannot_delete_category(self, client):
        token_a = _register_and_login(client, "cat_del_a", "cat_del_a@example.com")
        token_b = _register_and_login(client, "cat_del_b", "cat_del_b@example.com")
        cat_id = client.post("/api/categories/", json=_cat_payload("ProtectedCat"), headers=_auth(token_a)).json()["id"]
        assert client.delete(f"/api/categories/{cat_id}", headers=_auth(token_b)).status_code == 403

    def test_delete_non_existent_category_returns_404(self, client):
        token = _register_and_login(client, "cat_ghost_del", "cat_ghost_del@example.com")
        assert client.delete("/api/categories/99999", headers=_auth(token)).status_code == 404
