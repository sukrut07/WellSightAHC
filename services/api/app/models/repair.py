from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from app.core.database import Base

class Repair(Base):
    __tablename__ = "repairs"

    id = Column(String, primary_key=True, index=True)
    well_id = Column(String, ForeignKey("wells.id"), nullable=False, index=True)
    start_date = Column(String, nullable=False, index=True)  # YYYY-MM-DD
    end_date = Column(String, nullable=True)  # YYYY-MM-DD
    repair_type = Column(String, nullable=False)
    cause_category = Column(String, nullable=False)  # Mechanical Failure, Electrical Fault, Paraffin / Scale, etc.
    documented_cause = Column(String, nullable=False)
    cost_usd = Column(Float, default=0.0)
    technician = Column(String, nullable=True)
    status = Column(String, default="Completed")  # Completed, In Progress, Scheduled
    source_file = Column(String, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    well = relationship("Well", back_populates="repairs")

    __table_args__ = (
        Index("idx_repair_well_date", "well_id", "start_date"),
    )
