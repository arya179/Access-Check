import json
from typing import Dict, Any

class ReportGenerator:
    """
    Generates structured reports (JSON, Markdown, Summary) for an audit.
    """
    @staticmethod
    def generate_markdown_report(audit_data: Dict[str, Any]) -> str:
        url = audit_data.get("url", "")
        score = audit_data.get("score", 0)
        metrics = audit_data.get("metrics", {})
        violations = audit_data.get("violations", [])
        ai_summary = audit_data.get("ai_summary", "No AI summary available.")

        md = f"""# Accessibility Audit Report: {url}
**Timestamp:** {audit_data.get('timestamp')}  
**Overall Accessibility Score:** {score}/100  
**WCAG Compliance Rate:** {metrics.get('wcag_compliance_rate', 0)}%  
**Scan Duration:** {audit_data.get('duration_seconds', 0)}s  

---

## Executive AI Summary
{ai_summary}

---

## Severity Breakdown
- **Critical:** {metrics.get('critical_count', 0)}
- **Serious:** {metrics.get('serious_count', 0)}
- **Moderate:** {metrics.get('moderate_count', 0)}
- **Minor:** {metrics.get('minor_count', 0)}
- **Total Violations:** {metrics.get('total_violations', 0)}
- **Passed Rules:** {audit_data.get('passes_count', 0)}

---

## Detailed Violations & Actionable Fixes

"""
        for i, v in enumerate(violations, 1):
            remediation = audit_data.get("ai_remediations", {}).get(v["id"], "Review official WCAG guidance.")
            md += f"""### {i}. [{v.get('impact', 'minor').upper()}] {v.get('id')}
- **Description:** {v.get('description')}
- **Help:** {v.get('help')}
- **Reference URL:** [{v.get('helpUrl')}]({v.get('helpUrl')})

#### Remediation Guide:
{remediation}

"""
        return md

