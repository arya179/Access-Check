from pydantic import BaseModel, HttpUrl, Field
from typing import List, Optional, Dict, Any

class ScanRequest(BaseModel):
    url: str = Field(..., description="The full URL of the website to audit")
    tags: Optional[List[str]] = Field(default=["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"], description="WCAG standards tags to run")
    generate_ai_remediation: Optional[bool] = Field(default=True, description="Whether to invoke Gemma 4 for automated fixes")
    model_override: Optional[str] = Field(default=None, description="Optional custom AI model identifier (e.g. gemma-4-26b-a4b-it)")
    capture_screenshot: Optional[bool] = Field(default=False, description="Whether to capture a masked screenshot for multimodal visual accessibility analysis")
    content_language: Optional[str] = Field(default="en", description="Target website content language for spell and grammar checker (default: en)")
    enable_ai_grammar: Optional[bool] = Field(default=True, description="Whether to invoke Gemma 4 for contextual grammar and word-usage audit")

class ViolationNode(BaseModel):
    html: str
    target: List[str]
    failureSummary: Optional[str] = None

class ViolationItem(BaseModel):
    id: str
    impact: Optional[str] = "minor"
    description: str
    help: str
    helpUrl: str
    tags: Optional[List[str]] = []
    nodes: List[ViolationNode] = []
    ai_remediation: Optional[str] = None

class SummaryMetrics(BaseModel):
    total_violations: int = 0
    critical_count: int = 0
    serious_count: int = 0
    moderate_count: int = 0
    minor_count: int = 0
    accessibility_score: int = 100
    wcag_compliance_rate: float = 100.0

class AuditResult(BaseModel):
    id: str
    url: str
    timestamp: str
    duration_seconds: float
    score: int
    metrics: SummaryMetrics
    violations: List[ViolationItem] = []
    passes_count: int = 0
    incomplete_count: int = 0
    inapplicable_count: int = 0
    ai_summary: Optional[str] = None
    ai_remediations: Dict[str, str] = {}
    screenshot_b64: Optional[str] = None
    content_quality: Optional[Dict[str, Any]] = None
    design_analysis: Optional[Dict[str, Any]] = None
    graph_data: Optional[Dict[str, Any]] = None

class AuditSummary(BaseModel):
    id: str
    url: str
    timestamp: str
    score: int
    total_violations: int
