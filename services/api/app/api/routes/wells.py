from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
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
    if area and isinstance(area, str):
        AREA_ALIASES = {
            "area a": "Southwest Block 23",
            "area-a": "Southwest Block 23",
            "area_a": "Southwest Block 23",
            "area b": "Southwest Block 24",
            "area-b": "Southwest Block 24",
            "area_b": "Southwest Block 24",
            "area c": "Northeast Block 7",
            "area-c": "Northeast Block 7",
            "area_c": "Northeast Block 7",
            "area d": "Northeast Block 8",
            "area-d": "Northeast Block 8",
            "area_d": "Northeast Block 8",
        }
        target_area = AREA_ALIASES.get(area.strip().lower(), area)
        query = query.filter(Well.area.ilike(f"%{target_area}%"))
    if well_type and isinstance(well_type, str):
        query = query.filter(Well.well_type.ilike(f"%{well_type}%"))
    if status and isinstance(status, str):
        query = query.filter(Well.status.ilike(f"%{status}%"))
    if search and isinstance(search, str):
        s = f"%{search}%"
        query = query.filter((Well.name.ilike(s)) | (Well.id.ilike(s)))

    wells = query.order_by(Well.id.asc()).all()
    well_ids = [w.id for w in wells]

    # Ultra-fast batch counts (4 single SQL queries instead of 3,000!)
    insp_counts = dict(db.query(Inspection.well_id, func.count(Inspection.id)).filter(Inspection.well_id.in_(well_ids)).group_by(Inspection.well_id).all()) if well_ids else {}
    repair_counts = dict(db.query(Repair.well_id, func.count(Repair.id)).filter(Repair.well_id.in_(well_ids)).group_by(Repair.well_id).all()) if well_ids else {}
    spill_counts = dict(db.query(RegulatorEvent.well_id, func.count(RegulatorEvent.id)).filter(RegulatorEvent.well_id.in_(well_ids)).group_by(RegulatorEvent.well_id).all()) if well_ids else {}
    corr_counts = dict(db.query(Correction.target_id, func.count(Correction.id)).filter(Correction.target_id.in_(well_ids), Correction.status == 'Accepted').group_by(Correction.target_id).all()) if well_ids else {}

    all_conflicts = ConflictEngine.detect_all_conflicts(db)
    conflict_counts = {}
    for c in all_conflicts:
        wid = getattr(c, 'target_id', None)
        if wid:
            conflict_counts[wid] = conflict_counts.get(wid, 0) + 1

    results = []
    for w in wells:
        dt_res = DowntimeEngine.calculate_well_downtime(db, w.id, "2026-06-01", "2026-08-31")
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
            recent_inspections_count=insp_counts.get(w.id, 0),
            active_repairs_count=repair_counts.get(w.id, 0),
            spills_count=spill_counts.get(w.id, 0),
            active_conflicts_count=conflict_counts.get(w.id, 0),
            accepted_corrections_count=corr_counts.get(w.id, 0)
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
