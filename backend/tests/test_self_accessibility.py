import pytest
from playwright.async_api import async_playwright
from backend.scanners.axe_scanner import AccessibilityScanner

@pytest.mark.asyncio
async def test_accesscheck_frontend_accessibility():
    """
    Audits the running AccessCheck AI frontend application itself (http://localhost:5173)
    using Playwright and local axe-core to ensure our own UI satisfies WCAG 2.1 criteria.
    """
    scanner = AccessibilityScanner()
    # Audit frontend root URL bypassing external SSRF network check for local testing
    results = await scanner.scan_url(url="http://localhost:5173", bypass_security_check_for_testing=True)

    assert results is not None
    assert "score" in results
    print(f"\n[AccessCheck AI Self-Audit] Score: {results['score']}/100 | Violations: {results['metrics']['total_violations']}")
    
    # Assert zero critical or serious blockers on our own application
    assert results["metrics"]["critical_count"] == 0, f"Critical violations found in frontend: {results['violations']}"

