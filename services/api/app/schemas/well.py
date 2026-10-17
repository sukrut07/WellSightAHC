from typing import List, Optional
from pydantic import BaseModel

class WellBase(BaseModel):
    id: str
    name: str
    area: str
    field: str
    well_type: str
    target_formation: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    commissioned_date: Optional[str] = None
    status: str = "Active"

class WellDetailResponse(WellBase):
    measured_downtime_days: float = 0.0
    recent_inspections_count: int = 0
    active_repairs_count: int = 0
    spills_count: int = 0
    active_conflicts_count: int = 0
    accepted_corrections_count: int = 0

class WellListResponse(BaseModel):
    wells: List[WellDetailResponse]
    total_count: int
