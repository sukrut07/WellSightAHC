from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Boolean, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from app.core.database import Base

class Inspection(Base):
    __tablename__ = "inspections"

    id = Column(String, primary_key=True, index=True)
    well_id = Column(String, ForeignKey("wells.id"), nullable=False, index=True)
    inspection_date = Column(String, nullable=False, index=True)  # YYYY-MM-DD
    inspector = Column(String, nullable=True)
    ambient_temp_f = Column(Float, nullable=False)
    wellhead_temp_f = Column(Float, nullable=False)
    surface_pressure_psi = Column(Float, nullable=True)
    flow_line_pressure_psi = Column(Float, nullable=True)
    observed_production_status = Column(String, nullable=False)  # 'Producing', 'Not Producing', 'Planned Maintenance', 'Missed Inspection'
    is_missed = Column(Boolean, default=False)
    notes = Column(String, nullable=True)
    source_file = Column(String, nullable=True)
    import_batch = Column(String, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    well = relationship("Well", back_populates="inspections")

    __table_args__ = (
        Index("idx_inspection_well_date", "well_id", "inspection_date"),
    )
