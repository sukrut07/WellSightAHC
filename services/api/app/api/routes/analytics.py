from typing import Optional, List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.tools.registry import ToolRegistry
from app.services.downtime_engine import DowntimeEngine

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/downtime")
def get_downtime_analytics(
    area: Optional[str] = Query("Area A"),
    well_id: Optional[str] = Query(None),
    start_date: Optional[str] = Query("2026-06-01"),
    end_date: Optional[str] = Query("2026-08-31"),
    db: Session = Depends(get_db)
):
    if well_id:
        return DowntimeEngine.calculate_well_downtime(db, well_id, start_date, end_date)
    return DowntimeEngine.calculate_area_downtime(db, area, start_date, end_date)

@router.get("/repairs")
def get_repairs_analytics(
    area: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    return ToolRegistry.calculate_repair_costs(db, area)

@router.get("/spills")
def get_spills_analytics(
    db: Session = Depends(get_db)
):
    return ToolRegistry.find_spill_reporting_violations(db)

@router.get("/heatmap")
def get_heatmap_analytics(db: Session = Depends(get_db)):
    areas = ["Area A", "Area B", "Area C", "Area D"]
    months = [("June 2026", "2026-06-01", "2026-06-30"), ("July 2026", "2026-07-01", "2026-07-31"), ("August 2026", "2026-08-01", "2026-08-31")]
    cells = []
    for a in areas:
        for m_label, s_dt, e_dt in months:
            res = DowntimeEngine.calculate_area_downtime(db, a, s_dt, e_dt)
            cells.append({
                "x": m_label,
                "y": a,
                "value": res["total_area_downtime_days"],
                "annotation": f"{res['total_area_downtime_days']:.0f} days"
            })
    return {"cells": cells, "areas": areas, "months": [m[0] for m in months]}
