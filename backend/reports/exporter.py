import io
import csv
import json
import html
import pandas as pd
from typing import Dict, Any, List
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable, KeepTogether
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch

def xml_escape(text: Any) -> str:
    """Escapes text safely for ReportLab paragraph XML markup."""
    if text is None:
        return ""
    s = str(text)
    return html.escape(s, quote=True)

class ReportExporter:
    """
    Generates professional, branded PDF and CSV accessibility compliance reports
    from actual saved SQLite scan data.
    """

    @staticmethod
    def generate_csv_report(scan_data: Dict[str, Any]) -> str:
        """
        Exports detailed violations and metrics as a CSV string using Pandas.
        """
        violations = scan_data.get("violations", [])
        ai_remediations = scan_data.get("ai_remediations", {})
        
        rows = []
        for v in violations:
            nodes = v.get("nodes", [])
            sample_html = nodes[0].get("html", "") if nodes else ""
            target_selector = " > ".join(nodes[0].get("target", [])) if nodes else ""
            tags_str = "; ".join(v.get("tags", []))
            ai_fix = ai_remediations.get(v.get("id"), "Review standard WCAG criteria.")

            rows.append({
                "Rule ID": v.get("id", ""),
                "Severity": (v.get("impact") or "minor").capitalize(),
                "Help": v.get("help", ""),
                "Description": v.get("description", ""),
                "WCAG Reference": tags_str,
                "Failing CSS Selector": target_selector,
                "Failing HTML Snippet": sample_html,
                "Official Docs": v.get("helpUrl", ""),
                "AI Remediation Guidance": ai_fix
            })

        if not rows:
            rows.append({
                "Rule ID": "NONE",
                "Severity": "Pass",
                "Help": "No accessibility violations detected in automated scan",
                "Description": "Target website satisfies tested WCAG 2.1 rules.",
                "WCAG Reference": "WCAG 2.1 Level AA",
                "Failing CSS Selector": "",
                "Failing HTML Snippet": "",
                "Official Docs": "https://www.w3.org/WAI/WCAG21/quickref/",
                "AI Remediation Guidance": "Maintain semantic HTML structure."
            })

        df = pd.DataFrame(rows)
        return df.to_csv(index=False)

    @staticmethod
    def generate_pdf_report(scan_data: Dict[str, Any]) -> bytes:
        """
        Creates an enterprise-grade accessibility compliance report PDF using ReportLab.
        """
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            rightMargin=36,
            leftMargin=36,
            topMargin=36,
            bottomMargin=36
        )

        styles = getSampleStyleSheet()
        
        title_style = ParagraphStyle(
            "DocTitle",
            parent=styles["Normal"],
            fontName="Helvetica-Bold",
            fontSize=22,
            leading=26,
            textColor=colors.HexColor("#1e1b4b")
        )
        
        subtitle_style = ParagraphStyle(
            "DocSubTitle",
            parent=styles["Normal"],
            fontName="Helvetica",
            fontSize=10,
            leading=14,
            textColor=colors.HexColor("#475569")
        )

        h2_style = ParagraphStyle(
            "Heading2Custom",
            parent=styles["Heading2"],
            fontName="Helvetica-Bold",
            fontSize=13,
            leading=16,
            textColor=colors.HexColor("#312e81"),
            spaceBefore=12,
            spaceAfter=6
        )

        body_style = ParagraphStyle(
            "BodyCustom",
            parent=styles["Normal"],
            fontName="Helvetica",
            fontSize=9,
            leading=13,
            textColor=colors.HexColor("#1e293b")
        )

        code_style = ParagraphStyle(
            "CodeCustom",
            parent=styles["Normal"],
            fontName="Courier",
            fontSize=8,
            leading=10,
            textColor=colors.HexColor("#0f172a")
        )

        disclaimer_style = ParagraphStyle(
            "DisclaimerCustom",
            parent=styles["Normal"],
            fontName="Helvetica-Oblique",
            fontSize=8,
            leading=11,
            textColor=colors.HexColor("#64748b")
        )

        story = []

        # 1. Header & Branding
        story.append(Paragraph("AccessCheck AI", title_style))
        story.append(Paragraph("Enterprise Website Accessibility Audit & Remediation Report", subtitle_style))
        story.append(Spacer(1, 8))
        story.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor("#4f46e5"), spaceAfter=14))

        # 2. Executive Scan Metadata Table
        metrics = scan_data.get("metrics", {})
        score = scan_data.get("score", 100)
        url = scan_data.get("url", "")
        timestamp = scan_data.get("timestamp", "")
        duration = scan_data.get("duration_seconds", 0)

        meta_data = [
            [
                Paragraph("<b>Target URL:</b>", body_style),
                Paragraph(f"<font color='#4f46e5'><b>{xml_escape(url)}</b></font>", body_style),
                Paragraph("<b>Overall Score:</b>", body_style),
                Paragraph(f"<b>{score} / 100</b>", body_style)
            ],
            [
                Paragraph("<b>Audit Date:</b>", body_style),
                Paragraph(f"{xml_escape(timestamp)}", body_style),
                Paragraph("<b>WCAG Pass Rate:</b>", body_style),
                Paragraph(f"{metrics.get('wcag_compliance_rate', 100.0)}%", body_style)
            ],
            [
                Paragraph("<b>Scan Duration:</b>", body_style),
                Paragraph(f"{duration} seconds", body_style),
                Paragraph("<b>Engine:</b>", body_style),
                Paragraph("Google Chrome + Axe-core 4.10", body_style)
            ]
        ]

        meta_table = Table(meta_data, colWidths=[1.1 * inch, 3.2 * inch, 1.2 * inch, 1.5 * inch])
        meta_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#f8fafc")),
            ("BOX", (0, 0), (-1, -1), 1, colors.HexColor("#cbd5e1")),
            ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("TOPPADDING", (0, 0), (-1, -1), 5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ]))
        story.append(meta_table)
        story.append(Spacer(1, 14))

        # 3. Severity Distribution Summary Table
        story.append(Paragraph("Severity Impact Distribution", h2_style))
        sev_data = [
            ["Severity Tier", "Deduction Weight", "Issues Found", "Impact Description"],
            ["Critical", "-15 pts each", str(metrics.get("critical_count", 0)), "Severe assistive technology and screen reader blockers"],
            ["Serious", "-8 pts each", str(metrics.get("serious_count", 0)), "High barrier accessibility friction and navigation hurdles"],
            ["Moderate", "-4 pts each", str(metrics.get("moderate_count", 0)), "Impediments to keyboard, contrast, or structured layout"],
            ["Minor", "-1 pt each", str(metrics.get("minor_count", 0)), "Light enhancements and best-practice compliance"],
            ["Total Violations", "-", str(metrics.get("total_violations", 0)), f"Passed checks: {scan_data.get('passes_count', 0)} rules"]
        ]
        sev_table = Table(sev_data, colWidths=[1.4 * inch, 1.3 * inch, 1.1 * inch, 3.2 * inch])
        sev_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1e1b4b")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 8),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("BOX", (0, 0), (-1, -1), 1, colors.HexColor("#cbd5e1")),
            ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
            ("BACKGROUND", (0, 1), (-1, 1), colors.HexColor("#fef2f2")),
            ("BACKGROUND", (0, 2), (-1, 2), colors.HexColor("#fff7ed")),
            ("BACKGROUND", (0, 3), (-1, 3), colors.HexColor("#fefce8")),
            ("BACKGROUND", (0, 4), (-1, 4), colors.HexColor("#eff6ff")),
            ("BACKGROUND", (0, 5), (-1, 5), colors.HexColor("#f1f5f9")),
        ]))
        story.append(sev_table)
        story.append(Spacer(1, 14))

        # 4. Executive AI Summary
        ai_summary = scan_data.get("ai_summary")
        if ai_summary:
            story.append(Paragraph("Gemma 4 AI Executive Evaluation", h2_style))
            ai_p = Paragraph(f"<i>{xml_escape(ai_summary)}</i>", body_style)
            ai_box = Table([[ai_p]], colWidths=[7.0 * inch])
            ai_box.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#eef2ff")),
                ("BOX", (0, 0), (-1, -1), 1, colors.HexColor("#c7d2fe")),
                ("TOPPADDING", (0, 0), (-1, -1), 8),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
                ("LEFTPADDING", (0, 0), (-1, -1), 10),
                ("RIGHTPADDING", (0, 0), (-1, -1), 10),
            ]))
            story.append(ai_box)
            story.append(Spacer(1, 14))

        # 5. Detailed Violations and Suggested Fixes
        story.append(Paragraph("Accessibility Violations & Code Remediations", h2_style))
        violations = scan_data.get("violations", [])
        ai_remediations = scan_data.get("ai_remediations", {})

        if not violations:
            story.append(Paragraph("<b>No accessibility violations were discovered during this audit.</b>", body_style))
        else:
            for i, v in enumerate(violations, 1):
                rule_id = xml_escape(v.get("id", "rule"))
                impact = xml_escape((v.get("impact") or "minor").upper())
                help_text = xml_escape(v.get("help", ""))
                desc = xml_escape(v.get("description", ""))
                tags = xml_escape(", ".join(v.get("tags", [])))
                ai_fix = xml_escape(ai_remediations.get(v.get("id", ""), "Review standard WCAG criteria."))
                nodes = v.get("nodes", [])
                sample_html = xml_escape(nodes[0].get("html", "")[:280] if nodes else "")
                target_sel = xml_escape(" > ".join(nodes[0].get("target", [])) if nodes else "")

                item_content = [
                    Paragraph(f"<b>{i}. [{impact}] {rule_id}</b>: {help_text}", body_style),
                    Paragraph(f"<b>WCAG Tags:</b> <font color='#475569'>{tags}</font>", body_style),
                    Paragraph(f"<b>Description:</b> {desc}", body_style)
                ]

                if target_sel:
                    item_content.append(Paragraph(f"<b>Target CSS Selector:</b> <code>{target_sel}</code>", body_style))

                if sample_html:
                    item_content.append(Paragraph("<b>Failing HTML Element:</b>", body_style))
                    item_content.append(Paragraph(f"<code>{sample_html}</code>", code_style))

                item_content.append(Paragraph(f"<b>AI Suggested Remediation:</b>", body_style))
                clean_fix_lines = ai_fix.replace("\n", "<br/>")
                item_content.append(Paragraph(f"<font color='#1e1b4b'>{clean_fix_lines}</font>", body_style))

                item_table = Table([[item_content]], colWidths=[7.0 * inch])
                item_table.setStyle(TableStyle([
                    ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#ffffff")),
                    ("BOX", (0, 0), (-1, -1), 1, colors.HexColor("#cbd5e1")),
                    ("LEFTPADDING", (0, 0), (-1, -1), 8),
                    ("RIGHTPADDING", (0, 0), (-1, -1), 8),
                    ("TOPPADDING", (0, 0), (-1, -1), 8),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
                ]))
                story.append(KeepTogether(item_table))
                story.append(Spacer(1, 10))

        # 6. Official Disclaimer
        story.append(Spacer(1, 14))
        story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#cbd5e1"), spaceAfter=8))
        story.append(Paragraph(
            "<b>Disclaimer:</b> This report is generated algorithmically by AccessCheck AI using automated axe-core rules. "
            "Automated testing detects between 30% and 50% of potential accessibility barriers. "
            "Passing automated checks does not constitute official legal WCAG certification. "
            "Comprehensive accessibility compliance requires regular manual evaluation with assistive technology users.",
            disclaimer_style
        ))

        doc.build(story)
        buffer.seek(0)
        return buffer.getvalue()
