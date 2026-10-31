import pytest
from httpx import AsyncClient, ASGITransport
from backend.main import app
from backend.models.database import db

@pytest.mark.asyncio
async def test_pdf_and_csv_report_generation():
    """Verify generating PDF and CSV downloads using saved scan data."""
    sample_scan = {
        "id": "scan-report-test",
        "url": "https://example.com/accessibility-test",
        "timestamp": "2026-10-31T12:00:00Z",
        "duration_seconds": 4.1,
        "score": 85,
        "metrics": {
            "total_violations": 1,
            "critical_count": 1,
            "serious_count": 0,
            "moderate_count": 0,
            "minor_count": 0,
            "wcag_compliance_rate": 92.5
        },
        "violations": [
            {
                "id": "image-alt",
                "impact": "critical",
                "help": "Images must have alternate text",
                "description": "Ensures <img> elements have alternate text",
                "helpUrl": "https://dequeuniversity.com/rules/axe/4.10/image-alt",
                "tags": ["wcag2a", "wcag111"],
                "nodes": [{"html": "<img src='logo.png'>", "target": ["header > img"]}]
            }
        ],
        "passes_count": 12,
        "incomplete_count": 0,
        "inapplicable_count": 4,
        "ai_summary": "Overall good structure with a single missing image alt attribute.",
        "ai_remediations": {"image-alt": "Add alt='Company Logo' to the header image."}
    }

    # Save to SQLite
    await db.save_audit(sample_scan)

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Test PDF endpoint
        pdf_res = await ac.get("/api/reports/scan-report-test/pdf")
        assert pdf_res.status_code == 200
        assert pdf_res.headers["content-type"] == "application/pdf"
        assert len(pdf_res.content) > 1000 # Valid binary PDF
        assert pdf_res.content.startswith(b"%PDF")

        # Test CSV endpoint
        csv_res = await ac.get("/api/reports/scan-report-test/csv")
        assert csv_res.status_code == 200
        assert "text/csv" in csv_res.headers["content-type"]
        csv_text = csv_res.text
        assert "Rule ID" in csv_text
        assert "image-alt" in csv_text
        assert "Company Logo" in csv_text

    # Cleanup
    await db.delete_audit("scan-report-test")

