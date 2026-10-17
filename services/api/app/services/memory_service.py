import uuid
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.memory import WellSharedMemory, UserPrivateMemory
from app.models.chat import Conversation, Message

class MemoryService:
    @staticmethod
    def get_shared_well_context(db: Session, well_id: str) -> List[Dict[str, Any]]:
        """Retrieves shared context notes for a well, visible to all users."""
        records = (
            db.query(WellSharedMemory)
            .filter(WellSharedMemory.well_id == well_id, WellSharedMemory.status == "active")
            .order_by(WellSharedMemory.created_at.desc())
            .all()
        )
        return [
            {
                "id": r.id,
                "well_id": r.well_id,
                "author": r.author,
                "key": r.key,
                "value": r.value,
                "created_at": r.created_at.isoformat() if r.created_at else None
            }
            for r in records
        ]

    @staticmethod
    def add_shared_well_context(
        db: Session,
        well_id: str,
        author: str,
        key: str,
        value: str
    ) -> Dict[str, Any]:
        """Saves verified context about a well that is accessible to all users."""
        item = WellSharedMemory(
            id=f"MEM-SHARED-{uuid.uuid4().hex[:8].upper()}",
            well_id=well_id,
            author=author,
            key=key,
            value=value,
            status="active",
            created_at=datetime.now(timezone.utc)
        )
        db.add(item)
        db.commit()
        db.refresh(item)
        return {
            "id": item.id,
            "well_id": item.well_id,
            "author": item.author,
            "key": item.key,
            "value": item.value
        }

    @staticmethod
    def get_user_private_context(
        db: Session,
        user_id: str,
        context_key: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Retrieves private conversational memory strictly isolated for the specific user."""
        query = db.query(UserPrivateMemory).filter(UserPrivateMemory.user_id == user_id)
        if context_key:
            query = query.filter(UserPrivateMemory.context_key == context_key)
        records = query.order_by(UserPrivateMemory.created_at.desc()).all()
        return [
            {
                "id": r.id,
                "user_id": r.user_id,
                "conversation_id": r.conversation_id,
                "key": r.context_key,
                "value": r.context_value,
                "created_at": r.created_at.isoformat() if r.created_at else None
            }
            for r in records
        ]

    @staticmethod
    def save_user_private_context(
        db: Session,
        user_id: str,
        context_key: str,
        context_value: str,
        conversation_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """Saves user-specific private memory (isolated per user)."""
        item = UserPrivateMemory(
            id=f"MEM-PRIV-{uuid.uuid4().hex[:8].upper()}",
            user_id=user_id,
            conversation_id=conversation_id,
            context_key=context_key,
            context_value=context_value,
            created_at=datetime.now(timezone.utc)
        )
        db.add(item)
        db.commit()
        db.refresh(item)
        return {
            "id": item.id,
            "user_id": item.user_id,
            "key": item.context_key,
            "value": item.context_value
        }

    @staticmethod
    def get_recent_private_conversations(
        db: Session,
        user_id: str,
        limit: int = 5
    ) -> List[Dict[str, Any]]:
        """Gets recent conversation threads belonging strictly to this user."""
        convs = (
            db.query(Conversation)
            .filter(Conversation.user_id == user_id)
            .order_by(Conversation.updated_at.desc())
            .limit(limit)
            .all()
        )
        results = []
        for c in convs:
            recent_msgs = [
                {"role": m.role, "content": m.content[:100]}
                for m in c.messages[-3:]
            ]
            results.append({
                "conversation_id": c.id,
                "title": c.title,
                "updated_at": c.updated_at.isoformat() if c.updated_at else None,
                "recent_messages": recent_msgs
            })
        return results
