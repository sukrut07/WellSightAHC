import json
import logging
import httpx
from typing import Optional
from sqlalchemy.orm import Session
from app.core.config import settings
from app.providers.base import BaseLLMProvider
from app.providers.deterministic_provider import DeterministicProvider
from app.schemas.copilot import ChatRequest, ChatResponse

logger = logging.getLogger(__name__)

class GeminiProvider(BaseLLMProvider):
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.model = settings.GEMINI_MODEL
        self.fallback = DeterministicProvider()

    async def process_query(self, db: Session, request: ChatRequest) -> ChatResponse:
        # If API key is not configured, gracefully use the deterministic engine
        if not self.api_key:
            return await self.fallback.process_query(db, request)

        try:
            # We first run the deterministic tools to get factual calculation grounding
            grounded_response = await self.fallback.process_query(db, request)

            url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent?key={self.api_key}"
            payload = {
                "contents": [
                    {
                        "parts": [
                            {
                                "text": (
                                    f"System: You are WellSight AI Asset Intelligence Copilot. "
                                    f"Here is the verified tool output and evidence retrieved for the operator's query: '{request.message}'\n\n"
                                    f"Verified Tool Content:\n{grounded_response.content}\n\n"
                                    f"Task: Provide a concise, highly professional operational summary for the operator. "
                                    f"Do NOT change any calculated numbers, record IDs, or dates. Cite the specific record IDs."
                                )
                            }
                        ]
                    }
                ],
                "generationConfig": {
                    "temperature": 0.2,
                    "maxOutputTokens": 800
                }
            }

            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.post(url, json=payload)
                if res.status_code == 200:
                    data = res.json()
                    candidates = data.get("candidates", [])
                    if candidates:
                        text_part = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                        if text_part:
                            grounded_response.content = text_part
                            return grounded_response

            # If Gemini returned non-200 or unexpected format, return grounded response
            return grounded_response

        except Exception as e:
            logger.warning(f"Gemini API request failed, falling back to deterministic engine: {e}")
            return await self.fallback.process_query(db, request)
