import uuid
from datetime import datetime
from typing import Dict, Any, List, Optional
from backend.scanners.axe_scanner import AccessibilityScanner
from backend.ai.gemini import GemmaRemediator
from backend.analytics.visualizer import AccessibilityAnalytics
from backend.analytics.graphify_tracker import GraphifyTracker
from backend.services.spell_checker import ContentQualityScanner
from backend.models.database import db

class AuditService:
    def __init__(self):
        self.scanner = AccessibilityScanner()
        self.remediator = GemmaRemediator()

    async def run_audit(
        self,
        url: str,
        tags: List[str] = None,
        generate_ai: bool = True,
        model_override: Optional[str] = None,
        capture_screenshot: bool = False,
        content_language: str = "en",
        enable_ai_grammar: bool = True
    ) -> Dict[str, Any]:
        """
        Executes complete end-to-end accessibility and content quality evaluation:
        1. Playwright + axe-core real website scan + DOM text extraction
        2. Content quality scanner (spell checking, repeated words, placeholder text, Gemma grammar)
        3. Gemma 4 automated remediation generation
        4. Plotly interactive charts construction
        5. Persistent storage to SQLite
        """
        scan_id = str(uuid.uuid4())
        timestamp = datetime.utcnow().isoformat()

        # 1. Real Axe scan & visible DOM text extraction
        scan_results = await self.scanner.scan_url(
            url=url,
            tags=tags,
            capture_screenshot=capture_screenshot
        )

        # 2. Automated Content Quality & Spell Checking
        extracted_texts = scan_results.get("extracted_text_elements", [])
        spell_scanner = ContentQualityScanner(language=content_language)
        content_quality = await spell_scanner.scan_page_content(
            extracted_content=extracted_texts,
            page_url=url,
            enable_ai_grammar=enable_ai_grammar
        )

        # 3. Design Intelligence & Responsive Analysis
        design_analysis = scan_results.get("design_analysis", {})
        if generate_ai and design_analysis:
            # Augment with Gemma 4 design intelligence if AI is enabled
            from backend.services.design_analyzer import design_analyzer
            try:
                measurements = {
                    "desktop": {
                        "hasHorizontalOverflow": design_analysis.get("measurements_summary", {}).get("has_desktop_overflow", False),
                        "headings": [{"level": 1, "text": "Page Heading"}],
                        "fontFamilies": design_analysis.get("measurements_summary", {}).get("font_families", []),
                        "buttonCount": design_analysis.get("measurements_summary", {}).get("button_count", 0),
                        "smallTargetsCount": design_analysis.get("measurements_summary", {}).get("small_targets_count", 0)
                    },
                    "tablet": {"hasHorizontalOverflow": design_analysis.get("measurements_summary", {}).get("has_tablet_overflow", False)},
                    "mobile": {
                        "hasHorizontalOverflow": design_analysis.get("measurements_summary", {}).get("has_mobile_overflow", False),
                        "subStandardTargets": 0
                    }
                }
                ai_design_findings = await design_analyzer.analyze_with_gemma_ai(measurements, url)
                if ai_design_findings:
                    design_analysis["findings"].extend(ai_design_findings)
                    design_analysis["total_design_findings"] = len(design_analysis["findings"])
            except Exception as e:
                pass

        # 4. Gemma 4 AI remediation
        ai_data = {"ai_summary": None, "remediations": {}}
        if generate_ai and scan_results["violations"]:
            ai_data = await self.remediator.generate_remediations(
                url=url,
                violations=scan_results["violations"],
                model_override=model_override
            )

        # Attach AI remedies to individual violations
        for v in scan_results["violations"]:
            v["ai_remediation"] = ai_data["remediations"].get(v["id"])

        # 3. Interactive visualizations
        impact_chart = AccessibilityAnalytics.generate_impact_distribution_chart(scan_results["metrics"])
        compliance_chart = AccessibilityAnalytics.generate_wcag_compliance_chart(
            passes=scan_results["passes_count"],
            violations=scan_results["metrics"]["total_violations"],
            incomplete=scan_results["incomplete_count"]
        )

        full_audit = {
            "id": scan_id,
            "url": url,
            "timestamp": timestamp,
            "duration_seconds": scan_results["duration_seconds"],
            "score": scan_results["score"],
            "metrics": scan_results["metrics"],
            "violations": scan_results["violations"],
            "passes_count": scan_results["passes_count"],
            "incomplete_count": scan_results["incomplete_count"],
            "inapplicable_count": scan_results["inapplicable_count"],
            "screenshot_b64": scan_results.get("screenshot_b64"),
            "content_quality": content_quality,
            "design_analysis": design_analysis,
            "ai_summary": ai_data.get("ai_summary"),
            "ai_remediations": ai_data.get("remediations", {}),
            "graph_data": {
                "impact_chart": impact_chart,
                "compliance_chart": compliance_chart
            }
        }

        # 4. Save to Database
        await db.save_audit(full_audit)

        return full_audit

audit_service = AuditService()

