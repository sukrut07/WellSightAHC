from typing import List, Dict, Any, Optional
from pydantic import BaseModel

class WellDowntimeSummary(BaseModel):
    well_id: str
    well_name: str
    area: str
    well_type: str
    downtime_days: float
    non_producing_inspections: int
    consecutive_pairs: int
    missed_inspections: int
    documented_causes: List[str]
    supporting_inspection_ids: List[str]

class AreaDowntimeResponse(BaseModel):
    area: str
    date_range: str
    total_downtime_days: float
    wells_summary: List[WellDowntimeSummary]
    methodology_citation: str
