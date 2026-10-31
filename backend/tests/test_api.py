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
    assert "service" in data

@pytest.mark.asyncio
async def test_graphify_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/audit/system/graphify")
    assert response.status_code == 200
    data = response.json()
    assert "nodes" in data
    assert "links" in data

@pytest.mark.asyncio
async def test_ai_explain_endpoint_fallback():
    """Verify POST /api/ai/explain returns structured remediation format even without API key."""
    payload = {
        "rule_id": "image-alt",
        "impact": "critical",
        "help": "Images must have alternate text",
        "description": "Ensures <img> elements have alternate text or a role of none or presentation",
        "help_url": "https://dequeuniversity.com/rules/axe/4.10/image-alt",
        "tags": ["wcag2a", "wcag111", "section508"],
        "sample_html": '<img src="hero.jpg">',
        "css_selector": "header > img",
        "failure_summary": "Fix any of the following: Element does not have an alt attribute"
    }

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post("/api/ai/explain", json=payload)

    assert response.status_code == 200
    data = response.json()
    assert data["rule_id"] == "image-alt"
    assert "issue_explanation" in data
    assert "why_it_matters" in data
    assert "disability_impact" in data
    assert "technical_cause" in data
    assert "recommended_fix" in data
    assert "before_html" in data
    assert "after_html" in data
    assert "implementation_steps" in data
    assert isinstance(data["implementation_steps"], list)
    assert "wcag_reference" in data
