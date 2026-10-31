import os
import json
import logging
import asyncio
from typing import Dict, Any, Optional, List
from backend.core.config import settings
from backend.schemas.ai import ExplainRequest, ExplainResponse

logger = logging.getLogger(__name__)

class GeminiExplainer:
    """
    AI Remediation and explanation engine powered by google-genai SDK.
    Reads credentials and model strictly from backend environment configuration:
    - GEMINI_API_KEY
    - GEMINI_MODEL
    
    Provides structured accessibility explanations for real axe-core violations
    with fallback to authoritative axe/WCAG documentation.
    """
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.default_model = settings.GEMINI_MODEL or "gemini-2.5-flash"
        self.client = None

        if self.api_key:
            try:
                from google import genai
                self.client = genai.Client(api_key=self.api_key)
            except Exception as e:
                logger.warning(f"Unable to initialize google-genai client: {e}")

    def get_fallback_explanation(self, req: ExplainRequest) -> ExplainResponse:
        """
        Deterministic, authoritative axe-core/WCAG documentation fallback
        when Gemini API key is not configured, exhausted, or timed out.
        """
        wcag_ref = ", ".join([t for t in req.tags if "wcag" in t.lower()]) or "WCAG 2.1 Level A/AA"
        before_snippet = req.sample_html or f"<{req.rule_id} class='invalid'>"
        
        # Build contextual after snippet
        after_snippet = before_snippet
        if req.rule_id == "image-alt":
            after_snippet = before_snippet.replace(">", ' alt="Descriptive textual alternative for assistive devices">')
            disability = "Blind and visually impaired users who rely on screen readers will hear only file names or uninformative placeholders."
            steps = [
                "Inspect the <img> or SVG element in your component.",
                "Add an alt attribute with concise, meaningful description.",
                "If purely decorative, specify alt='' or aria-hidden='true'."
            ]
        elif req.rule_id == "color-contrast":
            after_snippet = f"/* Ensure 4.5:1 ratio */\n.accessible-contrast {{\n  color: #111827;\n  background-color: #ffffff;\n}}"
            disability = "Users with low vision, color blindness, or age-related visual impairments cannot perceive low-contrast text."
            steps = [
                "Measure foreground text color against background container.",
                "Increase contrast ratio to minimum 4.5:1 (3:1 for text >= 18pt/24px).",
                "Update CSS stylesheet or utility classes."
            ]
        elif req.rule_id == "button-name":
            after_snippet = before_snippet.replace("</button>", '<span class="sr-only">Close menu</span></button>')
            if "</button>" not in after_snippet and ">" in after_snippet:
                after_snippet = before_snippet.replace(">", ' aria-label="Action description">')
            disability = "Screen reader users cannot determine the function or intent of unlabelled buttons or icon-only controls."
            steps = [
                "Add discernible text inside the button element.",
                "If using an icon only, provide an aria-label='Action' attribute or screen-reader only <span>."
            ]
        else:
            disability = "Users relying on assistive technologies experience navigation confusion or broken interactions."
            steps = [
                f"Consult axe documentation for rule {req.rule_id}.",
                "Inspect DOM hierarchy around selector: " + (req.css_selector or "target element"),
                "Implement correct HTML5 semantic elements or ARIA attributes."
            ]

        return ExplainResponse(
            rule_id=req.rule_id,
            issue_explanation=f"Axe rule '{req.rule_id}': {req.help}.",
            why_it_matters=f"{req.description}. Ensuring conformance ensures digital content is accessible to all users.",
            disability_impact=disability,
            technical_cause=req.failure_summary or f"The DOM element fails criteria defined by {req.rule_id}.",
            recommended_fix=f"Review official specification at {req.help_url}. Modify markup to satisfy {wcag_ref}.",
            before_html=before_snippet,
            after_html=after_snippet,
            css_fix="/* Ensure sufficient focus rings and contrast ratios */\n:focus-visible {\n  outline: 2px solid #4f46e5;\n  outline-offset: 2px;\n}",
            implementation_steps=steps,
            wcag_reference=wcag_ref,
            is_fallback=True
        )

    async def explain_violation(self, req: ExplainRequest) -> ExplainResponse:
        """
        Asynchronously sends the actual axe-core violation to Google Gemini
        using the configured model and returns a validated ExplainResponse.
        Includes timeout, retry, and structured JSON parsing.
        """
        # Re-check settings in case API key was added
        if not self.client and settings.GEMINI_API_KEY:
            try:
                from google import genai
                self.api_key = settings.GEMINI_API_KEY
                self.client = genai.Client(api_key=self.api_key)
            except Exception as e:
                logger.warning(f"Could not initialize genai: {e}")

        if not self.client or not settings.GEMINI_API_KEY:
            return self.get_fallback_explanation(req)

        model_name = req.model_override or settings.GEMINI_MODEL or self.default_model

        prompt = f"""You are an elite web accessibility engineer (CPACC/WAS certified) and senior full-stack developer.

Analyze this ACTUAL axe-core violation discovered during a Playwright DOM audit:
- Rule ID: {req.rule_id}
- Impact Severity: {req.impact}
- Axe Help: {req.help}
- Axe Description: {req.description}
- Help Documentation: {req.help_url}
- WCAG Tags: {", ".join(req.tags)}
- Failing HTML Element:
{req.sample_html}
- Target CSS Selector:
{req.css_selector}
- Axe Failure Summary:
{req.failure_summary}

Provide a comprehensive, production-grade technical remediation.
You MUST output ONLY a valid JSON object matching this schema exactly (no preamble, no markdown enclosing if possible):
{{
  "issue_explanation": "Clear, concise technical explanation of what went wrong",
  "why_it_matters": "Why this criteria is essential for user experience and compliance",
  "disability_impact": "Specific impact on people with disabilities (screen reader users, motor impaired, low vision)",
  "technical_cause": "The exact DOM/CSS/ARIA defect in the provided element",
  "recommended_fix": "Clear developer instructions on how to correct the defect",
  "before_html": "The failing code snippet",
  "after_html": "The corrected, production-ready HTML/JSX snippet",
  "css_fix": "Any CSS or styling adjustments needed (e.g. contrast, focus states)",
  "implementation_steps": ["Step 1", "Step 2", "Step 3"],
  "wcag_reference": "Specific WCAG 2.1 Success Criteria (e.g., WCAG 2.1 SC 1.1.1 Non-text Content - Level A)"
}}
"""

        # Retry logic with timeout
        max_attempts = 2
        for attempt in range(max_attempts):
            try:
                # Wrap synchronous google-genai call in asyncio executor with timeout
                loop = asyncio.get_event_loop()
                response = await asyncio.wait_for(
                    loop.run_in_executor(
                        None,
                        lambda: self.client.models.generate_content(
                            model=model_name,
                            contents=prompt
                        )
                    ),
                    timeout=20.0 # 20 second timeout per call
                )

                raw_text = response.text.strip()
                if raw_text.startswith("```json"):
                    raw_text = raw_text[7:]
                if raw_text.startswith("```"):
                    raw_text = raw_text[3:]
                if raw_text.endswith("```"):
                    raw_text = raw_text[:-3]

                data = json.loads(raw_text.strip())

                # Validate required fields
                return ExplainResponse(
                    rule_id=req.rule_id,
                    issue_explanation=data.get("issue_explanation", req.help),
                    why_it_matters=data.get("why_it_matters", req.description),
                    disability_impact=data.get("disability_impact", "Impacts users requiring assistive technologies."),
                    technical_cause=data.get("technical_cause", req.failure_summary or "DOM element fails axe-core rule."),
                    recommended_fix=data.get("recommended_fix", "Apply standard WCAG semantic fix."),
                    before_html=data.get("before_html", req.sample_html or ""),
                    after_html=data.get("after_html", req.sample_html or ""),
                    css_fix=data.get("css_fix", ""),
                    implementation_steps=data.get("implementation_steps", ["Inspect DOM", "Apply fix"]),
                    wcag_reference=data.get("wcag_reference", ", ".join(req.tags)),
                    is_fallback=False
                )

            except asyncio.TimeoutError:
                logger.warning(f"Gemini API timed out on attempt {attempt + 1}")
            except Exception as err:
                logger.warning(f"Gemini generate_content error on attempt {attempt + 1}: {err}")

            if attempt < max_attempts - 1:
                await asyncio.sleep(1.0)

        # Fallback if both attempts fail
        return self.get_fallback_explanation(req)

gemini_explainer = GeminiExplainer()

