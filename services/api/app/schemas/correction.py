from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field

class CreateCorrectionRequest(BaseModel):
    scope: str = Field(..., description="'record', 'well', or 'well_type'")
    target_id: str = Field(..., description="ID of record, well, or well_type")
    target_field: str = Field(..., description="Field name being corrected")
    corrected_value: str = Field(..., description="New corrected value")
    author: str = Field(..., description="Operator or engineer submitting correction")
    reason: str = Field(..., description="Audit reason for change")

class CorrectionResponse(BaseModel):
    id: str
    scope: str
    target_id: str
    target_field: str
    original_value: str
    corrected_value: str
    author: str
    reason: str
    status: str
    created_at: datetime

class CorrectionListResponse(BaseModel):
    corrections: List[CorrectionResponse]
    total_count: int
