import pytest
from httpx import AsyncClient, ASGITransport
from backend.main import app
from backend.models.database import db

@pytest.mark.asyncio
async def test_sqlite_scan_lifecycle():
    """Verify storing, retrieving, querying, comparing, and deleting persistent scans."""
    sample_scan_1 = {
        "id": "scan-test-1",
        "url": "https://example.com/page1",
        "timestamp": "2026-10-31T10:00:00Z",
        "duration_seconds": 3.2,
        "score": 85,
        "metrics": {
            "total_violations": 1,
            "critical_count": 1,
            "serious_count": 0,
            "moderate_count": 0,
            "minor_count": 0,
            "wcag_compliance_rate": 90.0
        },
        "violations": [
            {
                "id": "image-alt",
                "impact": "critical",
                "help": "Images must have alt text",
                "description": "Image description",
                "helpUrl": "https://example.com",
                "nodes": [{"html": "<img>", "target": ["img"]}]
            }
        ],
        "passes_count": 10,
        "incomplete_count": 1,
        "inapplicable_count": 5,
        "ai_remediations": {"image-alt": "Add alt='hero' attribute"}
    }

    sample_scan_2 = {
        "id": "scan-test-2",
        "url": "https://example.com/page1",
        "timestamp": "2026-10-31T11:00:00Z",
        "duration_seconds": 2.8,
        "score": 100,
        "metrics": {
            "total_violations": 0,
            "critical_count": 0,
            "serious_count": 0,
            "moderate_count": 0,
            "minor_count": 0,
            "wcag_compliance_rate": 100.0
        },
        "violations": [],
        "passes_count": 11,
        "incomplete_count": 0,
        "inapplicable_count": 5,
        "ai_remediations": {}
    }

    # 1. Save scans
    await db.save_audit(sample_scan_1)
    await db.save_audit(sample_scan_2)

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # 2. Query history with search
        res = await ac.get("/api/audit/history?search=example.com")
        assert res.status_code == 200
        history_list = res.json()
        assert len(history_list) >= 2

        # 3. Retrieve single scan details
        res_single = await ac.get("/api/audit/scan-test-1")
        assert res_single.status_code == 200
        data_1 = res_single.json()
        assert data_1["id"] == "scan-test-1"
        assert len(data_1["violations"]) == 1

        # 4. Compare scans
        res_comp = await ac.get("/api/audit/compare?scan_id_a=scan-test-1&scan_id_b=scan-test-2")
        assert res_comp.status_code == 200
        comp_data = res_comp.json()
        assert comp_data["comparison"]["score_diff"] == 15
        assert "image-alt" in comp_data["comparison"]["fixed_rules"]

        # 5. Delete individual scan
        res_del = await ac.delete("/api/audit/scan-test-1")
        assert res_del.status_code == 200

        # Clean up second scan
        await ac.delete("/api/audit/scan-test-2")

