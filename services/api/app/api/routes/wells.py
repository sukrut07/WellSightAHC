from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.well import Well
from app.models.inspection import Inspection
from app.models.repair import Repair
from app.models.regulator_event import RegulatorEvent
from app.models.correction import Correction
from app.services.downtime_engine import DowntimeEngine
from app.services.conflict_engine import ConflictEngine
from app.schemas.well import WellListResponse, WellDetailResponse

router = APIRouter(prefix="/wells", tags=["Wells"])

@router.get("", response_model=WellListResponse)
def list_wells(
    area: Optional[str] = Query(None, description="Filter by operational area e.g. 'Area A'"),
    well_type: Optional[str] = Query(None, description="Filter by lift mechanism"),
    status: Optional[str] = Query(None, description="Filter by status"),
    search: Optional[str] = Query(None, description="Search by name or ID"),
    db: Session = Depends(get_db)
):
    query = db.query(Well)
    if area:
        query = query.filter(Well.area == area)
    if well_type:
        query = query.filter(Well.well_type == well_type)
    if status:
        query = query.filter(Well.status == status)
    if search:
        s = f"%{search}%"
        query = query.filter((Well.name.ilike(s)) | (Well.id.ilike(s)))

    wells = query.order_by(Well.id.asc()).all()
    results = []

    for w in wells:
        # Calculate downtime for summer
        dt_res = DowntimeEngine.calculate_well_downtime(db, w.id, "2026-06-01", "2026-08-31")
        conflicts = ConflictEngine.detect_conflicts_for_well(db, w.id)
        corrs = db.query(Correction).filter(Correction.target_id == w.id, Correction.status == "Accepted").count()

        results.append(WellDetailResponse(
            id=w.id,
            name=w.name,
            area=w.area,
            field=w.field,
            well_type=w.well_type,
            target_formation=w.target_formation,
            latitude=w.latitude,
            longitude=w.longitude,
            commissioned_date=w.commissioned_date,
            status=w.status,
            measured_downtime_days=dt_res["downtime_days"],
            recent_inspections_count=len(w.inspections),
            active_repairs_count=len(w.repairs),
            spills_count=len(w.regulator_events),
            active_conflicts_count=len(conflicts),
            accepted_corrections_count=corrs
        ))

    return WellListResponse(wells=results, total_count=len(results))

@router.get("/{well_id}", response_model=WellDetailResponse)
def get_well(well_id: str, db: Session = Depends(get_db)):
    w = db.query(Well).filter(Well.id == well_id).first()
    if not w:
        raise HTTPException(status_code=404, detail=f"Well {well_id} not found")

    dt_res = DowntimeEngine.calculate_well_downtime(db, w.id, "2026-06-01", "2026-08-31")
    conflicts = ConflictEngine.detect_conflicts_for_well(db, w.id)
    corrs = db.query(Correction).filter(Correction.target_id == w.id, Correction.status == "Accepted").count()

    return WellDetailResponse(
        id=w.id,
        name=w.name,
        area=w.area,
        field=w.field,
        well_type=w.well_type,
        target_formation=w.target_formation,
        latitude=w.latitude,
        longitude=w.longitude,
        commissioned_date=w.commissioned_date,
        status=w.status,
        measured_downtime_days=dt_res["downtime_days"],
        recent_inspections_count=len(w.inspections),
        active_repairs_count=len(w.repairs),
        spills_count=len(w.regulator_events),
        active_conflicts_count=len(conflicts),
        accepted_corrections_count=corrs
    )

@router.get("/{well_id}/inspections")
def get_well_inspections(well_id: str, db: Session = Depends(get_db)):
    inspections = db.query(Inspection).filter(Inspection.well_id == well_id).order_by(Inspection.inspection_date.desc()).all()
    return [
        {
            "id": i.id,
            "date": i.inspection_date,
            "inspector": i.inspector,
            "ambient_temp_f": i.ambient_temp_f,
            "wellhead_temp_f": i.wellhead_temp_f,
            "delta_t_f": round(i.wellhead_temp_f - i.ambient_temp_f, 1),
            "surface_pressure_psi": i.surface_pressure_psi,
            "observed_status": i.observed_production_status,
            "is_missed": i.is_missed,
            "notes": i.notes
        }
        for i in inspections
    ]

@router.get("/{well_id}/repairs")
def get_well_repairs(well_id: str, db: Session = Depends(get_db)):
    repairs = db.query(Repair).filter(Repair.well_id == well_id).order_by(Repair.start_date.desc()).all()
    return [
        {
            "id": r.id,
            "start_date": r.start_date,
            "end_date": r.end_date,
            "repair_type": r.repair_type,
            "cause_category": r.cause_category,
            "documented_cause": r.documented_cause,
            "cost_usd": r.cost_usd,
            "technician": r.technician,
            "status": r.status
        }
        for r in repairs
    ]
