from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Text, DateTime, Index
from app.core.database import Base

class AuditEvent(Base):
    __tablename__ = "audit_events"

    id = Column(String, primary_key=True, index=True)
    event_type = Column(String, nullable=False, index=True)  # query, tool_execution, correction_applied, conflict_detected, ingestion
    user_id = Column(String, nullable=True, index=True)
    details_json = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)

class IngestionJob(Base):
    __tablename__ = "ingestion_jobs"

    id = Column(String, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    file_type = Column(String, nullable=False)  # csv, json, markdown
    records_imported = Column(Integer, default=0)
    records_failed = Column(Integer, default=0)
    status = Column(String, default="completed")  # completed, failed, partial
    warnings_json = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
