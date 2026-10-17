from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel

class SharedMemoryItem(BaseModel):
    id: str
    well_id: str
    author: str
    key: str
    value: str
    status: str
    created_at: datetime

class PrivateMemoryItem(BaseModel):
    id: str
    user_id: str
    conversation_id: Optional[str]
    context_key: str
    context_value: str
    created_at: datetime
