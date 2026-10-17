from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from app.schemas.copilot import ChatRequest, ChatResponse

class BaseLLMProvider(ABC):
    @abstractmethod
    async def process_query(
        self,
        db: Session,
        request: ChatRequest
    ) -> ChatResponse:
        """Processes the natural language query, plans tool execution, and returns structured generative response."""
        pass
