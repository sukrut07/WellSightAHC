from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, DateTime
from sqlalchemy.orm import relationship
from app.core.database import Base

class Well(Base):
    __tablename__ = "wells"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    area = Column(String, nullable=False, index=True)
    field = Column(String, nullable=False)
    well_type = Column(String, nullable=False, index=True)  # Gas Lift, ESP, Rod Pump, Flowing
    target_formation = Column(String, nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    commissioned_date = Column(String, nullable=True)
    status = Column(String, default="Active")  # Active, Shut-In, Maintenance, Abandoned
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    inspections = relationship("Inspection", back_populates="well", cascade="all, delete-orphan")
    repairs = relationship("Repair", back_populates="well", cascade="all, delete-orphan")
    regulator_events = relationship("RegulatorEvent", back_populates="well", cascade="all, delete-orphan")
    human_notes = relationship("HumanNote", back_populates="well", cascade="all, delete-orphan")
    shared_memories = relationship("WellSharedMemory", back_populates="well", cascade="all, delete-orphan")
