import os
import json
import logging
import asyncio
from typing import Dict, Any, List, Optional
from google import genai
from backend.core.config import settings

logger = logging.getLogger("accesscheck.ai.client")

class GenAIClient:
    """
    Centralized, resilient client for Google Gemini and Gemma 4 AI interactions
    using the official google-genai SDK.

    Capabilities:
    - Configurable Gemma 4 model (GEMMA_MODEL=gemma-4-26b-a4b-it)
    - Configurable Gemini model (GEMINI_MODEL=gemini-2.5-flash)
    - Connection health check & real ping
    - Timeout handling & limited retries
    - Strict response validation
    - Sanitized logging (zero secrets exposed)
    - Safe graceful fallback when API quota/keys are unavailable
    """
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.gemma_model = settings.GEMMA_MODEL or "gemma-4-26b-a4b-it"
        self.gemini_model = settings.GEMINI_MODEL or "gemini-2.5-flash"
        self.client: Optional[genai.Client] = None
        self._init_client()

    def _init_client(self):
        if self.api_key:
            try:
                self.client = genai.Client(api_key=self.api_key)
                logger.info(f"GenAIClient initialized. Default Gemma model: {self.gemma_model}, Gemini: {self.gemini_model}")
            except Exception as e:
                logger.error(f"Failed to initialize google-genai Client: {str(e)}")
                self.client = None

    def get_status(self) -> Dict[str, Any]:
        """Returns sanitized status of the AI service."""
        return {
            "enabled": bool(self.client and self.api_key),
            "gemma_model": self.gemma_model,
            "gemini_model": self.gemini_model,
            "client_ready": self.client is not None,
            "has_credentials": bool(self.api_key)
        }

    async def ping_model(self, model: Optional[str] = None) -> Dict[str, Any]:
        """Performs a real lightweight connectivity check to verify model availability."""
        target_model = model or self.gemma_model
        if not self.client:
            return {"status": "unavailable", "model": target_model, "error": "Client not initialized or API key missing."}

        try:
            loop = asyncio.get_event_loop()
            res = await asyncio.wait_for(
                loop.run_in_executor(
                    None,
                    lambda: self.client.models.generate_content(
                        model=target_model,
                        contents="Respond with 'PONG' only."
                    )
                ),
                timeout=10.0
            )
            return {"status": "available", "model": target_model, "sample_reply": res.text.strip()[:30]}
        except Exception as e:
            logger.warning(f"AI ping failed for model {target_model}: {str(e)}")
            return {"status": "error", "model": target_model, "error": str(e)}

    async def generate_text(
        self,
        prompt: str,
        model: Optional[str] = None,
        timeout: float = 35.0,
        max_retries: int = 2
    ) -> str:
        """Executes a text prompt with timeout and limited retries."""
        if not self.client:
            raise RuntimeError("GenAI client is not configured with an API key.")

        target_model = model or self.gemma_model
        last_error = None

        for attempt in range(max_retries):
            try:
                loop = asyncio.get_event_loop()
                response = await asyncio.wait_for(
                    loop.run_in_executor(
                        None,
                        lambda: self.client.models.generate_content(
                            model=target_model,
                            contents=prompt
                        )
                    ),
                    timeout=timeout
                )
                if response and response.text:
                    return response.text.strip()
                raise ValueError("Received empty response from AI model.")
            except Exception as e:
                last_error = e
                logger.warning(f"AI generation attempt {attempt + 1}/{max_retries} failed for {target_model}: {str(e)}")
                if attempt < max_retries - 1:
                    await asyncio.sleep(1.0)

        raise last_error

    async def generate_json(
        self,
        prompt: str,
        model: Optional[str] = None,
        timeout: float = 35.0,
        max_retries: int = 2
    ) -> Dict[str, Any]:
        """Generates and validates structured JSON response."""
        raw_text = await self.generate_text(prompt, model=model, timeout=timeout, max_retries=max_retries)
        
        # Clean markdown code block wraps if model wraps in ```json ... ```
        clean_text = raw_text
        if "```json" in clean_text:
            clean_text = clean_text.split("```json")[1].split("```")[0].strip()
        elif "```" in clean_text:
            clean_text = clean_text.split("```")[1].split("```")[0].strip()

        try:
            return json.loads(clean_text)
        except json.JSONDecodeError as jde:
            logger.error(f"JSON validation error from AI: {jde}\nRaw output: {raw_text[:200]}")
            raise ValueError(f"AI returned invalid JSON syntax: {jde}")

    async def analyze_screenshot(
        self,
        screenshot_bytes: bytes,
        axe_summary: Dict[str, Any],
        model: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Multimodal visual analysis of a webpage screenshot using Gemini/Gemma multimodal models.
        User must have explicitly enabled visual AI analysis.
        """
        if not self.client:
            raise RuntimeError("GenAI client is not configured with an API key.")

        target_model = model or self.gemini_model or "gemini-2.5-flash"

        prompt = f"""You are a certified accessibility specialist (CPACC/WAS).
Analyze this webpage screenshot along with actual axe-core scanner findings:
- Total Violations Found: {axe_summary.get('total_violations', 0)}
- Critical Issues: {axe_summary.get('critical_issues', 0)}
- Serious Issues: {axe_summary.get('serious_issues', 0)}

Inspect visible UI elements for:
1. Color contrast issues in graphic text or hero banners.
2. Missing visual focus rings or interactive target size deficiencies (< 24x24px / 44x44px).
3. Visual layout reflow issues or cramped text hierarchy.

Return a structured JSON object:
{{
  "visual_quality_score": 0-100 integer,
  "visual_findings": [
    {{
      "issue": "Brief description of visual defect",
      "severity": "critical" | "serious" | "moderate" | "minor",
      "visual_area": "Header / Hero / Form / Footer",
      "recommendation": "Concrete fix for developer"
    }}
  ],
  "disability_assessment": "How this visual design impacts low-vision, color-blind, or motor-impaired users."
}}
"""
        from google.genai import types
        image_part = types.Part.from_bytes(
            data=screenshot_bytes,
            mime_type="image/png"
        )

        loop = asyncio.get_event_loop()
        response = await asyncio.wait_for(
            loop.run_in_executor(
                None,
                lambda: self.client.models.generate_content(
                    model=target_model,
                    contents=[prompt, image_part]
                )
            ),
            timeout=30.0
        )

        clean = response.text.strip()
        if "```json" in clean:
            clean = clean.split("```json")[1].split("```")[0].strip()
        elif "```" in clean:
            clean = clean.split("```")[1].split("```")[0].strip()

        return json.loads(clean)

ai_client = GenAIClient()
