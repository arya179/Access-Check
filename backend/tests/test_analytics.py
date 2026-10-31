import pytest
from httpx import AsyncClient, ASGITransport
from backend.main import app

@pytest.mark.asyncio
async def test_health_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"

@pytest.mark.asyncio
async def test_analytics_endpoints_empty():
    """Verify all 5 analytics endpoints respond cleanly even when database is empty."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        for ep in [
            "/api/analytics/overview",
            "/api/analytics/severity",
            "/api/analytics/history",
            "/api/analytics/wcag",
            "/api/analytics/comparison"
        ]:
            res = await ac.get(ep)
            assert res.status_code == 200
            json_data = res.json()
            assert "empty" in json_data

