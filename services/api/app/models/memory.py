from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from app.core.database import Base

class WellSharedMemory(Base):
    __tablename__ = "well_shared_memory"

    id = Column(String, primary_key=True, index=True)
    well_id = Column(String, ForeignKey("wells.id"), nullable=False, index=True)
    author = Column(String, nullable=False)
    key = Column(String, nullable=False, index=True)
    value = Column(Text, nullable=False)
    status = Column(String, default="active", index=True)  # 'active', 'expired', 'superseded'
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    well = relationship("Well", back_populates="shared_memories")

    __table_args__ = (
        Index("idx_shared_mem_well_key", "well_id", "key"),
    )

class UserPrivateMemory(Base):
    __tablename__ = "user_private_memory"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, nullable=False, index=True)  # Isolated per user (e.g. 'operator_john', 'engineer_sarah')
    conversation_id = Column(String, nullable=True, index=True)
    context_key = Column(String, nullable=False, index=True)  # e.g. 'discussed_wells', 'preferred_format'
    context_value = Column(Text, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    __table_args__ = (
        Index("idx_priv_mem_user_key", "user_id", "context_key"),
    )
