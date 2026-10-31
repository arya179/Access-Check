from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class ExplainRequest(BaseModel):
    rule_id: str = Field(..., description="Deque axe-core rule identifier (e.g. image-alt, color-contrast)")
    impact: str = Field(default="moderate", description="Violation impact severity: critical, serious, moderate, minor")
    help: str = Field(..., description="Short explanation of rule purpose")
    description: str = Field(..., description="Detailed description of WCAG failure")
    help_url: Optional[str] = Field(default="", description="Deque University reference documentation link")
    tags: List[str] = Field(default_factory=list, description="Associated WCAG tags (e.g. wcag2a, wcag111)")
    sample_html: Optional[str] = Field(default="", description="Offending HTML code snippet extracted from page DOM")
    css_selector: Optional[str] = Field(default="", description="Target CSS selector identifying DOM element")
    failure_summary: Optional[str] = Field(default="", description="Axe-core node check failure summary")
    model_override: Optional[str] = Field(default=None, description="Active Gemma model (gemma-4-26b-a4b-it)")

class ExplainResponse(BaseModel):
    rule_id: str
    issue_explanation: str
    why_it_matters: str
    disability_impact: str
    technical_cause: str
    recommended_fix: str
    before_html: str
    after_html: str
    css_fix: Optional[str] = None
    implementation_steps: List[str]
    wcag_reference: str
    model_used: Optional[str] = None
    is_fallback: bool = False

class AskQuestionRequest(BaseModel):
    question: str = Field(..., description="Developer question about WCAG, axe-core, or remediation")
    context: Optional[str] = Field(default=None, description="Optional code context or violation details")
    model_override: Optional[str] = Field(default=None)

class AskQuestionResponse(BaseModel):
    question: str
    answer: str
    code_snippet: Optional[str] = None
    wcag_reference: Optional[str] = None
    model_used: str

class ChecklistRequest(BaseModel):
    scan_id: Optional[str] = Field(default=None, description="Scan ID to generate checklist from")
    violations: Optional[List[Dict[str, Any]]] = Field(default=None, description="List of axe-core violations")
    model_override: Optional[str] = Field(default=None)

class ChecklistResponse(BaseModel):
    title: str
    summary: str
    checklist_items: List[Dict[str, Any]]
    model_used: str

class CompareReportsRequest(BaseModel):
    scan_id_a: str
    scan_id_b: str
    model_override: Optional[str] = None

class CompareReportsResponse(BaseModel):
    verdict: str
    score_delta: int
    improvements: List[str]
    regressions: List[str]
    action_items: List[str]
    model_used: str

class VisualAnalysisRequest(BaseModel):
    scan_id: str
    confirm_data_sharing: bool = Field(..., description="User explicit consent acknowledging screenshot is sent to Google API")
    model_override: Optional[str] = Field(default=None)

class VisualAnalysisResponse(BaseModel):
    scan_id: str
    visual_quality_score: int
    visual_findings: List[Dict[str, Any]]
    disability_assessment: str
    model_used: str
