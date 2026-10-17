from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, DateTime, Index
from app.core.database import Base

class Correction(Base):
    __tablename__ = "corrections"

    id = Column(String, primary_key=True, index=True)
    scope = Column(String, nullable=False, index=True)  # 'record', 'well', 'well_type'
    target_id = Column(String, nullable=False, index=True)  # ID of record (e.g. INSP-..., REG-...), well (e.g. WELL-0007), or well_type (e.g. 'Gas Lift')
    target_field = Column(String, nullable=False)  # Field being corrected (e.g. 'observed_production_status', 'volume_barrels')
    original_value = Column(String, nullable=False)  # Original raw immutable value
    corrected_value = Column(String, nullable=False)  # Corrected value
    author = Column(String, nullable=False)
    reason = Column(Text, nullable=False)
    status = Column(String, default="Accepted", index=True)  # 'Accepted', 'Pending', 'Contested', 'Superseded'
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)

    __table_args__ = (
        Index("idx_correction_scope_target", "scope", "target_id"),
    )
