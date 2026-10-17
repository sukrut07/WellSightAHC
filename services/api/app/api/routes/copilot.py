import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.chat import Conversation, Message
from app.schemas.copilot import ChatRequest, ChatResponse
from app.services.orchestrator import AgentOrchestrator

router = APIRouter(prefix="/copilot", tags=["Copilot"])
orchestrator = AgentOrchestrator()

@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest, db: Session = Depends(get_db)):
    """Primary Copilot endpoint executing agentic reasoning, tools, and Generative UI."""
    return await orchestrator.handle_message(db, request)

@router.get("/conversations")
def list_conversations(
    user_id: str = Query("demo_user_alpha", description="User ID for private conversation isolation"),
    db: Session = Depends(get_db)
):
    """Lists conversations strictly isolated for the requesting user."""
    convs = (
        db.query(Conversation)
        .filter(Conversation.user_id == user_id)
        .order_by(Conversation.updated_at.desc())
        .all()
    )
    return [
        {
            "id": c.id,
            "title": c.title,
            "created_at": c.created_at.isoformat() if c.created_at else None,
            "updated_at": c.updated_at.isoformat() if c.updated_at else None,
            "message_count": len(c.messages)
        }
        for c in convs
    ]

@router.get("/conversations/{conversation_id}")
def get_conversation_history(
    conversation_id: str,
    user_id: str = Query("demo_user_alpha"),
    db: Session = Depends(get_db)
):
    """Retrieves full conversation messages, tool executions, citations, and generative UI specs."""
    conv = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    # Enforce private memory isolation
    if conv.user_id != user_id:
        raise HTTPException(status_code=403, detail="Access denied: Conversation belongs to another user.")

    messages = []
    for m in conv.messages:
        vis = json.loads(m.visualization_spec_json) if m.visualization_spec_json else None
        tools = json.loads(m.tool_calls_json) if m.tool_calls_json else []
        sources = json.loads(m.sources_json) if m.sources_json else []
        conflicts = json.loads(m.conflicts_json) if m.conflicts_json else []
        warnings = json.loads(m.warnings_json) if m.warnings_json else []

        messages.append({
            "id": m.id,
            "role": m.role,
            "content": m.content,
            "visualization": vis,
            "tool_calls": tools,
            "sources": sources,
            "conflicts": conflicts,
            "warnings": warnings,
            "created_at": m.created_at.isoformat() if m.created_at else None
        })

    return {
        "conversation_id": conv.id,
        "title": conv.title,
        "user_id": conv.user_id,
        "messages": messages
    }
