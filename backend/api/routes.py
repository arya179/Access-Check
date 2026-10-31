import os
from fastapi import APIRouter, HTTPException, Query, Response
from fastapi.responses import PlainTextResponse
from typing import List, Optional, Dict, Any
from backend.schemas.audit import ScanRequest, AuditResult, AuditSummary
from backend.schemas.ai import (
    ExplainRequest, ExplainResponse,
    AskQuestionRequest, AskQuestionResponse,
    ChecklistRequest, ChecklistResponse,
    CompareReportsRequest, CompareReportsResponse,
    VisualAnalysisRequest, VisualAnalysisResponse
)
from backend.services.audit_service import audit_service
from backend.models.database import db
from backend.reports.generator import ReportGenerator
from backend.reports.exporter import ReportExporter
from backend.analytics.graphify_tracker import GraphifyTracker
from backend.analytics.analytics_service import analytics_service
from backend.scanners.security import SecurityValidationError
from backend.ai.gemma_service import gemma_service
from backend.ai.client import ai_client
from backend.core.config import settings

router = APIRouter(tags=["Audits, Storage, Reports & Analytics"])

@router.post("/api/scan", response_model=AuditResult)
@router.post("/api/audit/scan", response_model=AuditResult)
async def create_scan(request: ScanRequest):
    """
    Initiate a real accessibility audit on the target URL.
    Saves results into persistent SQLite models: Scan, Violation, AIRecommendation.
    """
    try:
        result = await audit_service.run_audit(
            url=request.url,
            tags=request.tags,
            generate_ai=request.generate_ai_remediation,
            model_override=request.model_override,
            capture_screenshot=bool(request.capture_screenshot),
            content_language=request.content_language or "en",
            enable_ai_grammar=bool(request.enable_ai_grammar)
        )
        return result
    except SecurityValidationError as sec_err:
        raise HTTPException(status_code=400, detail=f"Security Policy Rejection: {str(sec_err)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Accessibility audit failed: {str(e)}")

# ================= Professional PDF and CSV Report Endpoints =================

@router.get("/api/reports/{scan_id}/pdf")
async def get_pdf_report(scan_id: str):
    """
    Generates and returns an enterprise-grade accessibility compliance report PDF
    built with ReportLab using actual saved SQLite scan data.
    """
    scan = await db.get_audit(scan_id)
    if not scan:
        raise HTTPException(status_code=404, detail="Scan record not found")
    
    try:
        pdf_bytes = ReportExporter.generate_pdf_report(scan)
        filename = f"AccessCheck_Audit_{scan_id[:8]}.pdf"
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate PDF report: {str(e)}")

@router.get("/api/reports/{scan_id}/csv")
async def get_csv_report(scan_id: str):
    """
    Exports scan violations and metrics as a CSV dataset using Pandas.
    """
    scan = await db.get_audit(scan_id)
    if not scan:
        raise HTTPException(status_code=404, detail="Scan record not found")
    
    try:
        csv_content = ReportExporter.generate_csv_report(scan)
        filename = f"AccessCheck_Violations_{scan_id[:8]}.csv"
        return Response(
            content=csv_content,
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate CSV report: {str(e)}")

# ================= Persistent Storage & History Endpoints =================

@router.get("/api/audit/history")
async def get_history(
    search: Optional[str] = Query(default=None, description="Search by website URL or domain"),
    start_date: Optional[str] = Query(default=None, description="Filter by start date (ISO string)"),
    end_date: Optional[str] = Query(default=None, description="Filter by end date (ISO string)"),
    limit: int = Query(default=100, le=200)
):
    return await db.list_audits(search=search, start_date=start_date, end_date=end_date, limit=limit)

@router.delete("/api/audit/history/clear")
async def clear_all_history_endpoint():
    count = await db.clear_all_history()
    return {"status": "success", "cleared_records": count}

@router.get("/api/audit/compare")
async def compare_scans_endpoint(
    scan_id_a: str = Query(..., description="First scan ID to compare"),
    scan_id_b: str = Query(..., description="Second scan ID to compare")
):
    comparison = await db.compare_scans(scan_id_a, scan_id_b)
    if not comparison:
        raise HTTPException(status_code=404, detail="One or both scans not found for comparison")
    return comparison

@router.delete("/api/audit/{audit_id}")
async def delete_audit_endpoint(audit_id: str):
    success = await db.delete_audit(audit_id)
    if not success:
        raise HTTPException(status_code=404, detail="Audit not found")
    return {"status": "success", "id": audit_id}

@router.get("/api/audit/{audit_id}", response_model=AuditResult)
async def get_audit_details(audit_id: str):
    audit = await db.get_audit(audit_id)
    if not audit:
        raise HTTPException(status_code=404, detail="Audit not found")
    return audit

@router.get("/api/audit/{audit_id}/report/markdown")
async def get_markdown_report(audit_id: str):
    audit = await db.get_audit(audit_id)
    if not audit:
        raise HTTPException(status_code=404, detail="Audit not found")
    
    markdown_content = ReportGenerator.generate_markdown_report(audit)
    return {"markdown": markdown_content}

# ================= AI & Analytics Endpoints =================

@router.get("/api/ai/status")
async def get_ai_status():
    """Phase 7: Returns verified operational status of Gemma 4 without exposing secrets."""
    return ai_client.get_status()

@router.post("/api/ai/ping")
async def ping_ai_endpoint():
    """Phase 7: Pings Gemma 4 with a real API request; only marks connected on genuine success."""
    return await ai_client.ping_model()

@router.post("/api/ai/explain", response_model=ExplainResponse)
async def explain_violation_endpoint(request: ExplainRequest):
    """Features A, B, C: Generates structured explanation, HTML fix, and CSS fix using Gemma 4."""
    try:
        return await gemma_service.explain_violation(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI explanation service error: {str(e)}")

@router.post("/api/ai/ask", response_model=AskQuestionResponse)
async def ask_ai_question_endpoint(request: AskQuestionRequest):
    """Features D, E: Answers developer questions regarding WCAG guidelines and implementation."""
    try:
        return await gemma_service.answer_question(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Q&A service error: {str(e)}")

@router.post("/api/ai/checklist", response_model=ChecklistResponse)
async def generate_checklist_endpoint(request: ChecklistRequest):
    """Feature G: Generates an actionable remediation checklist from real axe-core scan findings."""
    violations = request.violations or []
    if request.scan_id and not violations:
        scan = await db.get_audit(request.scan_id)
        if scan:
            violations = scan.get("violations", [])
    
    return await gemma_service.generate_checklist(violations, model_override=request.model_override)

@router.post("/api/ai/compare", response_model=CompareReportsResponse)
async def compare_reports_endpoint(request: CompareReportsRequest):
    """Feature F: Compares two accessibility reports with delta analysis using Gemma 4."""
    scan_a = await db.get_audit(request.scan_id_a)
    scan_b = await db.get_audit(request.scan_id_b)
    if not scan_a or not scan_b:
        raise HTTPException(status_code=404, detail="One or both scans not found in database")
    
    return await gemma_service.compare_reports(scan_a, scan_b, model_override=request.model_override)

@router.post("/api/ai/visual-analysis", response_model=VisualAnalysisResponse)
async def visual_analysis_endpoint(request: VisualAnalysisRequest):
    """
    Feature H: Multimodal screenshot analysis for visual accessibility issues.
    Requires explicit user consent acknowledging screenshot is sent to Google API.
    """
    if not request.confirm_data_sharing:
        raise HTTPException(
            status_code=400,
            detail="User confirmation required: You must explicitly acknowledge that this screenshot is sent to Google GenAI."
        )

    scan = await db.get_audit(request.scan_id)
    if not scan:
        raise HTTPException(status_code=404, detail="Scan record not found")

    screenshot_b64 = scan.get("screenshot_b64")
    if not screenshot_b64:
        raise HTTPException(status_code=400, detail="No screenshot was captured for this scan. Run a new scan with screenshot enabled.")

    import base64
    screenshot_bytes = base64.b64decode(screenshot_b64)

    try:
        result = await ai_client.analyze_screenshot(
            screenshot_bytes=screenshot_bytes,
            axe_summary={
                "total_violations": scan.get("metrics", {}).get("total_violations", 0),
                "critical_issues": scan.get("metrics", {}).get("critical_count", 0),
                "serious_issues": scan.get("metrics", {}).get("serious_count", 0)
            },
            model=request.model_override
        )
        return VisualAnalysisResponse(
            scan_id=request.scan_id,
            visual_quality_score=result.get("visual_quality_score", 85),
            visual_findings=result.get("visual_findings", []),
            disability_assessment=result.get("disability_assessment", "Visual layout conforms to standard criteria."),
            model_used=settings.GEMMA_MODEL
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Visual AI analysis failed: {str(e)}")

@router.get("/api/analytics/overview")
async def get_analytics_overview():
    return await analytics_service.get_overview()

@router.get("/api/analytics/severity")
async def get_analytics_severity():
    return await analytics_service.get_severity_analytics()

@router.get("/api/analytics/history")
async def get_analytics_history():
    return await analytics_service.get_history_analytics()

@router.get("/api/analytics/wcag")
async def get_analytics_wcag():
    return await analytics_service.get_wcag_analytics()

@router.get("/api/analytics/comparison")
async def get_analytics_comparison():
    return await analytics_service.get_comparison_analytics()

@router.get("/api/audit/analytics/summary")
async def get_analytics_summary():
    return await db.get_analytics_summary()

@router.get("/api/audit/system/graphify")
async def get_system_graph():
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
    out_dir = os.path.join(base_dir, "graphify-out")
    tracker = GraphifyTracker(root_dir=base_dir, output_dir=out_dir)
    return tracker.generate_graph_data()
