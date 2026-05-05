"""
test_health.py – Smoke tests for app root and health endpoints.

Covers
------
GET /        – returns 200 and a message
GET /health  – returns 200 and status == "healthy"
"""

import pytest


class TestAppSmoke:

    def test_root_endpoint(self, client):
        resp = client.get("/")
        assert resp.status_code == 200
        assert "message" in resp.json()

    def test_health_endpoint(self, client):
        resp = client.get("/health")
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "healthy"

    def test_unknown_route_returns_404(self, client):
        assert client.get("/api/does-not-exist").status_code == 404
