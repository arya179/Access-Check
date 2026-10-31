import pytest
import os
import time
from backend.core.config import settings

def test_live_gemma_4_api_call():
    """
    Optional live integration test that verifies an actual network request to Google GenAI API
    with model=settings.GEMMA_MODEL (gemma-4-26b-a4b-it).
    Only runs when GEMINI_API_KEY is configured. Never prints secret keys.
    Retries once if remote server experiences transient 500 error.
    """
    if not settings.GEMINI_API_KEY:
        pytest.skip("GEMINI_API_KEY is not set in environment. Skipping live integration test.")

    from google import genai
    client = genai.Client(api_key=settings.GEMINI_API_KEY)
    
    response = None
    for attempt in range(2):
        try:
            response = client.models.generate_content(
                model=settings.GEMMA_MODEL,
                contents="Hello, reply with OK"
            )
            if response and response.text:
                break
        except Exception:
            if attempt == 0:
                time.sleep(2)
            else:
                raise
    
    assert response is not None
    assert response.text is not None
    reply = response.text.strip()
    assert len(reply) > 0

