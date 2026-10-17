import json
from typing import Optional, List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.audit import AuditEvent, IngestionJob
from app.services.conflict_engine import ConflictEngine
from app.schemas.generative_ui import ConflictNotice

router = APIRouter(prefix="/audit", tags=["Audit & Conflicts"])

@router.get("/conflicts", response_model=List[ConflictNotice])
def list_conflicts(well_id: Optional[str] = Query(None), db: Session = Depends(get_db)):
    """Surfaces active conflicts, contested corrections, and missing evidence."""
    if well_id:
        return ConflictEngine.detect_conflicts_for_well(db, well_id)
    return ConflictEngine.detect_all_conflicts(db)

@router.get("/events")
def list_audit_events(limit: int = Query(50, ge=1, le=200), db: Session = Depends(get_db)):
    """Retrieves operational audit logs for copilot queries, corrections, and tool traces."""
    events = db.query(AuditEvent).order_by(AuditEvent.created_at.desc()).limit(limit).all()
    results = []
    for e in events:
        details = json.loads(e.details_json) if e.details_json else {}
        results.append({
            "id": e.id,
            "event_type": e.event_type,
            "user_id": e.user_id,
            "details": details,
            "created_at": e.created_at.isoformat() if e.created_at else None
        })
    return results

@router.get("/ingestion-jobs")
def list_ingestion_jobs(db: Session = Depends(get_db)):
    jobs = db.query(IngestionJob).order_by(IngestionJob.created_at.desc()).all()
    results = []
    for j in jobs:
        warnings = json.loads(j.warnings_json) if j.warnings_json else []
        results.append({
            "id": j.id,
            "filename": j.filename,
            "file_type": j.file_type,
            "records_imported": j.records_imported,
            "records_failed": j.records_failed,
            "status": j.status,
            "warnings": warnings,
            "created_at": j.created_at.isoformat() if j.created_at else None
        })
    return results
