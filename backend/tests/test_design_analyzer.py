import pytest
from backend.services.design_analyzer import DesignAnalyzer

def test_heading_hierarchy_detection():
    """Verify missing h1 and skipped levels are detected objectively."""
    analyzer = DesignAnalyzer()
    measurements = {
        "desktop": {
            "hasHorizontalOverflow": False,
            "headings": [
                {"level": 2, "text": "Section Two"},
                {"level": 4, "text": "Skipped Subsection"}
            ],
            "fontFamilies": ["Inter"],
            "verySmallTextCount": 0,
            "lowLineHeightCount": 0,
            "smallTargetsCount": 0,
            "overlappingCount": 0
        },
        "tablet": {"hasHorizontalOverflow": False},
        "mobile": {"hasHorizontalOverflow": False, "subStandardTargets": 0}
    }

    findings = analyzer.generate_deterministic_design_findings(measurements, "https://example.com")
    
    categories = [f["category"] for f in findings]
    labels = [f["finding_label"] for f in findings]
    
    assert "Visual Hierarchy" in categories
    assert any("missing an <h1>" in f["description"] for f in findings)
    assert any("Skipped heading level" in f["description"] for f in findings)

def test_responsive_horizontal_overflow_detection():
    """Verify desktop and mobile horizontal overflow are correctly flagged."""
    analyzer = DesignAnalyzer()
    measurements = {
        "desktop": {
            "hasHorizontalOverflow": True,
            "docWidth": 1560,
            "viewWidth": 1440,
            "headings": [{"level": 1, "text": "Title"}],
            "fontFamilies": ["Inter"]
        },
        "tablet": {"hasHorizontalOverflow": False},
        "mobile": {
            "hasHorizontalOverflow": True,
            "docWidth": 480,
            "viewWidth": 375,
            "subStandardTargets": 5
        }
    }

    findings = analyzer.generate_deterministic_design_findings(measurements, "https://example.com")
    
    overflow_findings = [f for f in findings if f["finding_label"] == "Layout overflow"]
    assert len(overflow_findings) == 2
    assert any("desktop" in f["description"].lower() for f in overflow_findings)
    assert any("mobile" in f["description"].lower() for f in overflow_findings)

def test_small_touch_targets_and_typography():
    """Verify small font size and cramped touch targets trigger findings."""
    analyzer = DesignAnalyzer()
    measurements = {
        "desktop": {
            "hasHorizontalOverflow": False,
            "headings": [{"level": 1, "text": "Title"}],
            "fontFamilies": ["Inter", "Roboto", "Open Sans", "Lato", "Poppins"], # 5 fonts
            "verySmallTextCount": 6,
            "lowLineHeightCount": 8,
            "smallTargetsCount": 4,
            "overlappingCount": 1
        },
        "tablet": {"hasHorizontalOverflow": False},
        "mobile": {"hasHorizontalOverflow": False, "subStandardTargets": 4}
    }

    findings = analyzer.generate_deterministic_design_findings(measurements, "https://example.com")
    
    labels = [f["finding_label"] for f in findings]
    assert "Typography inconsistency" in labels
    assert "Text readability deficiency" in labels
    assert "Interactive touch target deficiency" in labels
    assert "Element overlap detected" in labels

