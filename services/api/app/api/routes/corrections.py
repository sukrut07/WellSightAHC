from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.correction import Correction
from app.tools.registry import ToolRegistry
from app.schemas.correction import CreateCorrectionRequest, CorrectionResponse, CorrectionListResponse

router = APIRouter(prefix="/corrections", tags=["Corrections"])

@router.get("", response_model=CorrectionListResponse)
def list_corrections(
    scope: Optional[str] = Query(None, description="Filter by scope: 'record', 'well', 'well_type'"),
    status: Optional[str] = Query(None, description="Filter by status: 'Accepted', 'Pending', 'Contested'"),
    target_id: Optional[str] = Query(None, description="Filter by specific entity ID"),
    db: Session = Depends(get_db)
):
    query = db.query(Correction)
    if scope:
        query = query.filter(Correction.scope == scope)
    if status:
        query = query.filter(Correction.status == status)
    if target_id:
        query = query.filter(Correction.target_id == target_id)

    corrs = query.order_by(Correction.created_at.desc()).all()
    results = [
        CorrectionResponse(
            id=c.id,
            scope=c.scope,
            target_id=c.target_id,
            target_field=c.target_field,
            original_value=c.original_value,
            corrected_value=c.corrected_value,
            author=c.author,
            reason=c.reason,
            status=c.status,
            created_at=c.created_at
        )
        for c in corrs
    ]
    return CorrectionListResponse(corrections=results, total_count=len(results))

@router.post("", response_model=CorrectionResponse)
def create_correction(
    req: CreateCorrectionRequest,
    db: Session = Depends(get_db)
):
    """Submits an explicit user correction preserving the original immutable value."""
    res = ToolRegistry.record_user_correction(
        db,
        scope=req.scope,
        target_id=req.target_id,
        target_field=req.target_field,
        corrected_value=req.corrected_value,
        author=req.author,
        reason=req.reason
    )
    corr = db.query(Correction).filter(Correction.id == res["id"]).first()
    return CorrectionResponse(
        id=corr.id,
        scope=corr.scope,
        target_id=corr.target_id,
        target_field=corr.target_field,
        original_value=corr.original_value,
        corrected_value=corr.corrected_value,
        author=corr.author,
        reason=corr.reason,
        status=corr.status,
        created_at=corr.created_at
    )

@router.patch("/{correction_id}/status")
def update_correction_status(
    correction_id: str,
    status: str = Query(..., description="'Accepted', 'Contested', 'Pending', 'Superseded'"),
    db: Session = Depends(get_db)
):
    corr = db.query(Correction).filter(Correction.id == correction_id).first()
    if not corr:
        raise HTTPException(status_code=404, detail="Correction not found")
    corr.status = status
    db.commit()
    return {"id": corr.id, "new_status": corr.status, "message": f"Correction status updated to {status}"}
