from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Body
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.memory_service import MemoryService
from app.schemas.memory import SharedMemoryItem, PrivateMemoryItem

router = APIRouter(prefix="/memory", tags=["Memory"])

@router.get("/shared/{well_id}", response_model=List[SharedMemoryItem])
def get_shared_context(well_id: str, db: Session = Depends(get_db)):
    """Retrieves shared context notes for a well, visible across all users."""
    items = MemoryService.get_shared_well_context(db, well_id)
    return items

@router.post("/shared/{well_id}", response_model=SharedMemoryItem)
def create_shared_context(
    well_id: str,
    author: str = Body(..., embed=True),
    key: str = Body(..., embed=True),
    value: str = Body(..., embed=True),
    db: Session = Depends(get_db)
):
    """Adds a shared operational context note visible to all users."""
    item = MemoryService.add_shared_well_context(db, well_id, author, key, value)
    return item

@router.get("/private/{user_id}", response_model=List[PrivateMemoryItem])
def get_private_context(
    user_id: str,
    requesting_user_id: str = Query("demo_user_alpha", description="Security check to prevent cross-user leakage"),
    context_key: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Retrieves user private memory, strictly isolating access per user."""
    if user_id != requesting_user_id:
        raise HTTPException(status_code=403, detail="Forbidden: Private conversational memory is isolated per user.")
    items = MemoryService.get_user_private_context(db, user_id, context_key)
    return items

@router.post("/private/{user_id}", response_model=PrivateMemoryItem)
def create_private_context(
    user_id: str,
    key: str = Body(..., embed=True),
    value: str = Body(..., embed=True),
    conversation_id: Optional[str] = Body(None, embed=True),
    db: Session = Depends(get_db)
):
    """Saves user-specific private conversational memory."""
    item = MemoryService.save_user_private_context(db, user_id, key, value, conversation_id)
    return item
