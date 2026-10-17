from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Boolean, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from app.core.database import Base

class RegulatorEvent(Base):
    __tablename__ = "regulator_events"

    id = Column(String, primary_key=True, index=True)
    well_id = Column(String, ForeignKey("wells.id"), nullable=False, index=True)
    event_type = Column(String, nullable=False, index=True)  # Spill, Emissions Event
    occurred_at = Column(String, nullable=False, index=True)  # ISO string YYYY-MM-DDTHH:MM:SS
    volume_barrels = Column(Float, nullable=False)
    substance = Column(String, default="Crude Oil")
    reported_to_regulator = Column(Boolean, default=False)
    reported_at = Column(String, nullable=True)  # ISO string YYYY-MM-DDTHH:MM:SS
    regulator_agency = Column(String, nullable=True)
    investigation_notes = Column(String, nullable=True)
    source_file = Column(String, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    well = relationship("Well", back_populates="regulator_events")

    __table_args__ = (
        Index("idx_event_well_type", "well_id", "event_type"),
    )
