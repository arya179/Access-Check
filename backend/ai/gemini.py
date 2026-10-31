import os
import json
import logging
from typing import Dict, Any, List, Optional
from backend.core.config import settings

logger = logging.getLogger(__name__)

class GeminiRemediator:
    """
    AI Remediation engine powered by the official google-genai SDK.
    Provides actionable code fixes, WCAG compliance explanations,
    and developer guidance for real accessibility violations found by axe-core.
    Supports configurable models (e.g., gemini-2.5-flash, gemini-1.5-pro, gemma-2-9b-it).
    """
    def __init__(self, api_key: Optional[str] = None, model: Optional[str] = None):
        self.api_key = api_key or settings.GEMINI_API_KEY
        self.model = model or settings.GEMINI_MODEL or "gemini-2.5-flash"
        self.client = None

        if self.api_key:
            try:
                from google import genai
                self.client = genai.Client(api_key=self.api_key)
            except Exception as e:
                logger.warning(f"Failed to initialize google-genai client: {e}")

    async def generate_remediations(
        self,
        url: str,
        violations: List[Dict[str, Any]],
        model_override: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Generates remediation guides and fixes for accessibility violations.
        If no API key is provided, returns helpful standard best-practice guides
        without faking AI responses.
        """
        active_model = model_override or self.model

        if not self.client or not self.api_key:
            return {
                "ai_summary": "Google Gemini API key not configured. Showing standard WCAG guidelines. Provide GEMINI_API_KEY in .env or via settings for AI-powered automated code remediation.",
                "remediations": {
                    v["id"]: f"**Rule {v['id']} Remediation**:\n{v['help']}. Reference: {v['helpUrl']}\n\nEnsure semantic HTML tags, suitable ARIA attributes, and accessible color contrast ratios are used."
                    for v in violations
                }
            }

        try:
            # Prepare summary of top violations for Gemini
            items_to_analyze = violations[:10]  # Focus on key violations to keep prompt concise
            prompt_payload = []
            for item in items_to_analyze:
                sample_html = item.get("nodes", [{}])[0].get("html", "") if item.get("nodes") else ""
                prompt_payload.append({
                    "id": item["id"],
                    "impact": item.get("impact"),
                    "description": item.get("description"),
                    "sample_element": sample_html[:200],
                    "failure": item.get("nodes", [{}])[0].get("failureSummary", "") if item.get("nodes") else ""
                })

            prompt = f"""
You are an expert accessibility engineer and full-stack developer auditing: {url}

Analyze these accessibility violations found by Axe-core:
{json.dumps(prompt_payload, indent=2)}

Please provide:
1. An overall executive accessibility summary (2-3 sentences).
2. For each violation id, provide a clear, actionable developer code fix (showing standard Before/After or exact HTML/JSX/CSS adjustments) and explain how it solves the WCAG criterion.

Return your response in valid JSON with this exact structure:
{{
  "summary": "executive summary text",
  "remediations": {{
     "<violation_id>": "Markdown formatted code fix and explanation"
  }}
}}
"""
            # Call Gemini using google-genai SDK
            response = self.client.models.generate_content(
                model=active_model,
                contents=prompt,
            )

            response_text = response.text.strip()
            # Clean possible markdown block markers
            if response_text.startswith("```json"):
                response_text = response_text[7:]
            if response_text.startswith("```"):
                response_text = response_text[3:]
            if response_text.endswith("```"):
                response_text = response_text[:-3]

            data = json.loads(response_text.strip())
            return {
                "ai_summary": data.get("summary", "AI remediation generated."),
                "remediations": data.get("remediations", {})
            }

        except Exception as e:
            logger.error(f"Error calling Gemini AI: {e}")
            return {
                "ai_summary": f"AI remediation encountered an issue: {str(e)}",
                "remediations": {
                    v["id"]: f"Rule: {v['help']}. Consult official specs: {v['helpUrl']}"
                    for v in violations
                }
            }

