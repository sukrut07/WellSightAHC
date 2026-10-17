from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.config import settings

router = APIRouter(tags=["Health"])

@router.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "provider": settings.AI_PROVIDER
    }

@router.get("/ready")
def readiness_check(db: Session = Depends(get_db)):
    try:
        # Simple query to verify DB connection
        from app.models.well import Well
        count = db.query(Well).count()
        return {
            "status": "ready",
            "database": "connected",
            "wells_loaded": count
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "database": f"error: {str(e)}"
        }
