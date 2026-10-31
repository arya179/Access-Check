import pytest
import os
import tempfile
from pathlib import Path
from backend.scanners.axe_scanner import AccessibilityScanner
from backend.scanners.security import validate_and_resolve_url, SecurityValidationError

@pytest.mark.asyncio
async def test_security_validation_blocks_localhost():
    """Verify SSRF protection blocks localhost, 127.0.0.1, and private IPs."""
    with pytest.raises(SecurityValidationError):
        validate_and_resolve_url("http://localhost:8000")

    with pytest.raises(SecurityValidationError):
        validate_and_resolve_url("http://127.0.0.1:3000")

    with pytest.raises(SecurityValidationError):
        validate_and_resolve_url("http://192.168.1.1/admin")

    with pytest.raises(SecurityValidationError):
        validate_and_resolve_url("ftp://example.com")

def test_security_validation_allows_public_domain():
    """Verify safe public domains pass validation."""
    clean_url, resolved_ip = validate_and_resolve_url("https://example.com")
    assert clean_url.startswith("https://example.com")
    assert resolved_ip is not None

@pytest.mark.asyncio
async def test_real_scan_with_controlled_violations():
    """
    Spins up a controlled HTML page containing known real accessibility violations:
    1. Image missing alt tag ('image-alt')
    2. Button without accessible text ('button-name')
    3. Low color contrast ('color-contrast')
    4. Missing html lang attribute ('html-has-lang')
    Verifies that AccessibilityScanner detects genuine violations using Chrome + axe-core.
    """
    html_content = """<!DOCTYPE html>
<html>
<head>
  <title>Controlled Accessibility Test</title>
  <style>
    .bad-contrast {
      color: #999999;
      background-color: #ffffff;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <h1>Accessibility Test Suite</h1>
  <!-- Violation 1: Image without alt -->
  <img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7">
  
  <!-- Violation 2: Button with no accessible label -->
  <button id="mystery-btn"></button>
  
  <!-- Violation 3: Poor color contrast -->
  <p class="bad-contrast">This text fails minimum WCAG 2.1 AA color contrast ratio.</p>
</body>
</html>"""

    with tempfile.NamedTemporaryFile(suffix=".html", delete=False, mode="w", encoding="utf-8") as tf:
        tf.write(html_content)
        temp_path = tf.name

    try:
        file_url = Path(temp_path).as_uri()
        scanner = AccessibilityScanner()
        # Bypass network SSRF for local test file URL
        result = await scanner.scan_url(url=file_url, bypass_security_check_for_testing=True)

        assert result is not None
        assert result["score"] < 100
        assert result["metrics"]["total_violations"] >= 2

        violation_ids = [v["id"] for v in result["violations"]]
        # Verify genuine Axe rules fired
        assert any(rule in violation_ids for rule in ["image-alt", "button-name", "color-contrast", "html-has-lang"])
        
        # Verify node structure and data collection
        first_violation = result["violations"][0]
        assert "id" in first_violation
        assert "impact" in first_violation
        assert "help" in first_violation
        assert "description" in first_violation
        assert "nodes" in first_violation
        assert len(first_violation["nodes"]) > 0

    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

