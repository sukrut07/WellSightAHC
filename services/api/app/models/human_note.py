from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from app.core.database import Base

class HumanNote(Base):
    __tablename__ = "human_notes"

    id = Column(String, primary_key=True, index=True)
    well_id = Column(String, ForeignKey("wells.id"), nullable=False, index=True)
    author = Column(String, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    category = Column(String, default="Operational")  # Operational, Equipment, Geological, Logistics
    content = Column(String, nullable=False)

    well = relationship("Well", back_populates="human_notes")

    __table_args__ = (
        Index("idx_note_well", "well_id"),
    )
