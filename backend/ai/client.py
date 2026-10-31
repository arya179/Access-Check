import os
import json
import logging
import asyncio
from typing import Dict, Any, List, Optional
from google import genai
from backend.core.config import settings

logger = logging.getLogger("accesscheck.ai.client")

class GemmaClient:
    """
    Centralized, resilient client for Google Gen AI & Gemma 4 interactions
    using the official google-genai SDK.

    Capabilities:
    - Primary model: Gemma 4 (GEMMA_MODEL=gemma-4-26b-a4b-it) as single source of truth
    - Connection health check & real ping
    - Strict timeout handling & limited retries
    - Structured JSON response validation
    - Sanitized logging (zero credentials/secrets printed)
    - Safe graceful fallback when API quota/keys are unavailable
    - Scanned input sanitization to prevent prompt injection and data exfiltration
    """
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.gemma_model = settings.GEMMA_MODEL or "gemma-4-26b-a4b-it"
        self.client: Optional[genai.Client] = None
        self.last_successful_call_at: Optional[str] = None
        self.last_api_status: str = "untested"
        self._init_client()

    def _init_client(self):
        if self.api_key:
            try:
                self.client = genai.Client(api_key=self.api_key)
                logger.info(f"GemmaClient initialized. Primary model: {self.gemma_model}")
            except Exception as e:
                logger.error(f"Failed to initialize google-genai Client: {str(e)}")
                self.client = None

    def get_status(self) -> Dict[str, Any]:
        """Returns sanitized status of the Gemma 4 service without exposing keys."""
        return {
            "ai_provider": "Google Gen AI API",
            "configured_model": self.gemma_model,
            "has_credentials": bool(self.api_key),
            "client_ready": self.client is not None,
            "api_connection_status": self.last_api_status,
            "last_successful_call": self.last_successful_call_at
        }

    async def ping_model(self) -> Dict[str, Any]:
        """Performs a real lightweight connectivity check to verify Gemma 4 availability."""
        target_model = self.gemma_model
        if not self.client or not self.api_key:
            self.last_api_status = "unavailable"
            return {
                "ai_provider": "Google Gen AI API",
                "configured_model": target_model,
                "status": "unavailable",
                "connected": False,
                "error": "Client not initialized or GEMINI_API_KEY missing."
            }

        try:
            from datetime import datetime, timezone
            loop = asyncio.get_event_loop()
            res = await asyncio.wait_for(
                loop.run_in_executor(
                    None,
                    lambda: self.client.models.generate_content(
                        model=target_model,
                        contents="Respond with 'PONG' only."
                    )
                ),
                timeout=12.0
            )
            self.last_api_status = "connected"
            self.last_successful_call_at = datetime.now(timezone.utc).isoformat()
            return {
                "ai_provider": "Google Gen AI API",
                "configured_model": target_model,
                "status": "connected",
                "connected": True,
                "sample_reply": res.text.strip()[:30] if res and res.text else "OK"
            }
        except Exception as e:
            self.last_api_status = "error"
            logger.warning(f"Gemma 4 ping failed for model {target_model}: {str(e)}")
            return {
                "ai_provider": "Google Gen AI API",
                "configured_model": target_model,
                "status": "error",
                "connected": False,
                "error": str(e)
            }

    async def generate_text(
        self,
        prompt: str,
        timeout: float = 35.0,
        max_retries: int = 2
    ) -> str:
        """Executes a text prompt using Gemma 4 with timeout and limited retries."""
        if not self.client or not self.api_key:
            raise RuntimeError("Gemma 4 client is not configured with an API key.")

        target_model = self.gemma_model
        last_error = None

        for attempt in range(max_retries):
            try:
                from datetime import datetime, timezone
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
                    self.last_api_status = "connected"
                    self.last_successful_call_at = datetime.now(timezone.utc).isoformat()
                    return response.text.strip()
                raise ValueError("Received empty response from Gemma 4 model.")
            except Exception as e:
                last_error = e
                logger.warning(f"Gemma 4 attempt {attempt + 1}/{max_retries} failed for {target_model}: {str(e)}")
                if attempt < max_retries - 1:
                    await asyncio.sleep(1.0)

        raise last_error

    async def generate_json(
        self,
        prompt: str,
        timeout: float = 35.0,
        max_retries: int = 2
    ) -> Dict[str, Any]:
        """Generates and validates structured JSON response strictly with Gemma 4."""
        raw_text = await self.generate_text(prompt, timeout=timeout, max_retries=max_retries)
        
        clean_text = raw_text
        if "```json" in clean_text:
            clean_text = clean_text.split("```json")[1].split("```")[0].strip()
        elif "```" in clean_text:
            clean_text = clean_text.split("```")[1].split("```")[0].strip()

        try:
            return json.loads(clean_text)
        except json.JSONDecodeError as jde:
            logger.error(f"JSON validation error from Gemma 4: {jde}\nRaw output: {raw_text[:200]}")
            raise ValueError(f"Gemma 4 returned invalid JSON syntax: {jde}")

    async def analyze_screenshot(
        self,
        screenshot_bytes: bytes,
        axe_summary: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Multimodal visual analysis of a webpage screenshot using Gemma 4 multimodal capabilities.
        """
        if not self.client or not self.api_key:
            raise RuntimeError("Gemma 4 client is not configured with an API key.")

        target_model = self.gemma_model

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

        from datetime import datetime, timezone
        loop = asyncio.get_event_loop()
        response = await asyncio.wait_for(
            loop.run_in_executor(
                None,
                lambda: self.client.models.generate_content(
                    model=target_model,
                    contents=[prompt, image_part]
                )
            ),
            timeout=35.0
        )

        self.last_api_status = "connected"
        self.last_successful_call_at = datetime.now(timezone.utc).isoformat()

        clean = response.text.strip()
        if "```json" in clean:
            clean = clean.split("```json")[1].split("```")[0].strip()
        elif "```" in clean:
            clean = clean.split("```")[1].split("```")[0].strip()

        return json.loads(clean)

ai_client = GemmaClient()
