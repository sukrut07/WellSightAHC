from fastapi import APIRouter
from app.api.routes import (
    health,
    wells,
    copilot,
    corrections,
    memory,
    evidence,
    analytics,
    audit,
    ingestion,
)

api_router = APIRouter()
api_router.include_router(health.router)
api_router.include_router(wells.router)
api_router.include_router(copilot.router)
api_router.include_router(corrections.router)
api_router.include_router(memory.router)
api_router.include_router(evidence.router)
api_router.include_router(analytics.router)
api_router.include_router(audit.router)
api_router.include_router(ingestion.router)
