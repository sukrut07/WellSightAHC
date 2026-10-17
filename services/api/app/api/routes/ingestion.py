from pathlib import Path
from fastapi import APIRouter, Depends, Query, Body
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.config import settings
from app.ingestion.importer import DataImporter

router = APIRouter(prefix="/ingestion", tags=["Ingestion"])

@router.get("/inspect")
def inspect_dataset(path: str = Query("./data")):
    target = Path(path)
    if not target.is_absolute():
        target = settings.BASE_DIR.parent.parent / path.lstrip("./")
    return DataImporter.inspect_directory(str(target))

@router.post("/load")
def load_dataset(
    path: str = Body("./data", embed=True),
    db: Session = Depends(get_db)
):
    target = Path(path)
    if not target.is_absolute():
        target = settings.BASE_DIR.parent.parent / path.lstrip("./")
    return DataImporter.import_directory(db, str(target))
