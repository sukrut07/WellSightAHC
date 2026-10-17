import json
import logging
import os
import httpx
from typing import Optional, List
from sqlalchemy.orm import Session
from app.core.config import settings
from app.providers.base import BaseLLMProvider
from app.providers.deterministic_provider import DeterministicProvider
from app.schemas.copilot import ChatRequest, ChatResponse

logger = logging.getLogger(__name__)

class GeminiProvider(BaseLLMProvider):
    def __init__(self):
        self.fallback = DeterministicProvider()

    def get_api_key(self) -> str:
        return (
            os.getenv("GEMINI_API_KEY") 
            or os.getenv("GOOGLE_API_KEY") 
            or os.getenv("GEMMA_API_KEY") 
            or settings.GEMINI_API_KEY 
            or ""
        )

    def get_preferred_models(self) -> List[str]:
        configured = (
            os.getenv("GEMINI_MODEL") 
            or os.getenv("GEMMA_MODEL") 
            or settings.GEMINI_MODEL 
            or "gemini-2.5-flash"
        )
        candidates = [configured, "gemini-2.0-flash", "gemini-1.5-flash"]
        # Deduplicate while preserving order
        seen = set()
        deduped = []
        for m in candidates:
            if m and m not in seen:
                seen.add(m)
                deduped.append(m)
        return deduped

    async def process_query(self, db: Session, request: ChatRequest) -> ChatResponse:
        api_key = self.get_api_key()

        # If API key is not configured, gracefully use the deterministic engine
        if not api_key:
            return await self.fallback.process_query(db, request)

        try:
            # Run deterministic calculation tools first to ensure grounded factual basis
            grounded_response = await self.fallback.process_query(db, request)

            payload = {
                "contents": [
                    {
                        "parts": [
                            {
                                "text": (
                                    f"System: You are WellSight AI Asset Intelligence Copilot for Permian Basin wellheads. "
                                    f"Here is the verified tool output and evidence retrieved for the operator's query: '{request.message}'\n\n"
                                    f"Verified Tool Content:\n{grounded_response.content}\n\n"
                                    f"Task: Provide a concise, highly professional operational summary for the operator. "
                                    f"Do NOT alter any calculated numbers, record IDs, or dates. Explicitly cite the specific record IDs."
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

            models_to_try = self.get_preferred_models()
            async with httpx.AsyncClient(timeout=12.0) as client:
                for model in models_to_try:
                    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
                    try:
                        res = await client.post(url, json=payload)
                        if res.status_code == 200:
                            data = res.json()
                            candidates = data.get("candidates", [])
                            if candidates:
                                text_part = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                                if text_part:
                                    grounded_response.content = text_part
                                    logger.info(f"Generated operational response via Google Gemini model {model}")
                                    return grounded_response
                        else:
                            logger.warning(f"Google Gemini model {model} returned status {res.status_code}: {res.text[:120]}")
                    except Exception as req_err:
                        logger.warning(f"Failed request to {model}: {req_err}")

            # If all model attempts failed, return deterministic grounded response
            return grounded_response

        except Exception as e:
            logger.warning(f"Gemini API request failed, falling back to deterministic engine: {e}")
            return await self.fallback.process_query(db, request)
