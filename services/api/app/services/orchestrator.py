import json
import uuid
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.core.config import settings
from app.providers.gemini_provider import GeminiProvider
from app.providers.deterministic_provider import DeterministicProvider
from app.models.chat import Conversation, Message
from app.models.audit import AuditEvent
from app.schemas.copilot import ChatRequest, ChatResponse

import os

class AgentOrchestrator:
    def __init__(self):
        self.gemini_provider = GeminiProvider()
        self.deterministic_provider = DeterministicProvider()

    def get_provider(self):
        mode = os.getenv("AI_PROVIDER", getattr(settings, "AI_PROVIDER", "auto"))
        if mode == "deterministic":
            return self.deterministic_provider
        return self.gemini_provider

    async def handle_message(self, db: Session, request: ChatRequest) -> ChatResponse:
        # 1. Resolve or create conversation
        conv_id = request.conversation_id
        if not conv_id:
            conv_id = f"CONV-{uuid.uuid4().hex[:8].upper()}"
            conv = Conversation(
                id=conv_id,
                user_id=request.user_id,
                title=request.message[:40] + ("..." if len(request.message) > 40 else ""),
                created_at=datetime.now(timezone.utc),
                updated_at=datetime.now(timezone.utc)
            )
            db.add(conv)
            db.commit()
        else:
            conv = db.query(Conversation).filter(Conversation.id == conv_id).first()
            if not conv:
                conv = Conversation(
                    id=conv_id,
                    user_id=request.user_id,
                    title=request.message[:40],
                    created_at=datetime.now(timezone.utc),
                    updated_at=datetime.now(timezone.utc)
                )
                db.add(conv)
                db.commit()

        # 2. Record user message
        user_msg = Message(
            id=f"MSG-{uuid.uuid4().hex[:8].upper()}",
            conversation_id=conv_id,
            role="user",
            content=request.message,
            created_at=datetime.now(timezone.utc)
        )
        db.add(user_msg)
        db.commit()

        # 3. Process via provider with tools & generative UI
        request.conversation_id = conv_id
        provider = self.get_provider()
        response = await provider.process_query(db, request)

        # 4. Record assistant message in database
        vis_json = response.visualization.model_dump_json() if response.visualization else None
        tools_json = json.dumps([t.model_dump() for t in response.tool_traces]) if response.tool_traces else None
        sources_json = json.dumps([s.model_dump() for s in response.sources]) if response.sources else None
        conflicts_json = json.dumps([c.model_dump() for c in response.conflicts]) if response.conflicts else None

        asst_msg = Message(
            id=response.message_id,
            conversation_id=conv_id,
            role="assistant",
            content=response.content,
            tool_calls_json=tools_json,
            visualization_spec_json=vis_json,
            sources_json=sources_json,
            conflicts_json=conflicts_json,
            warnings_json=json.dumps(response.warnings),
            created_at=datetime.now(timezone.utc)
        )
        db.add(asst_msg)

        # 5. Record audit trace
        audit = AuditEvent(
            id=f"AUD-{uuid.uuid4().hex[:8].upper()}",
            event_type="copilot_query",
            user_id=request.user_id,
            details_json=json.dumps({
                "query": request.message,
                "conversation_id": conv_id,
                "tools_executed": [t.tool_name for t in response.tool_traces],
                "visual_type": response.visualization.type if response.visualization else None
            }),
            created_at=datetime.now(timezone.utc)
        )
        db.add(audit)
        db.commit()

        return response
