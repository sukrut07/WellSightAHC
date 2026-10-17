from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base, SessionLocal
from app.api.api import api_router
from app.ingestion.importer import DataImporter

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure database schema is created on startup
    Base.metadata.create_all(bind=engine)
    
    # Auto-seed sample data if database is fresh
    db = SessionLocal()
    try:
        from app.models.well import Well
        count = db.query(Well).count()
        if count == 0 and settings.DATA_DIR.exists():
            print(f"📦 [WellSight AI] Fresh database detected. Ingesting initial datasets from {settings.DATA_DIR}...")
            DataImporter.import_directory(db, str(settings.DATA_DIR))
    except Exception as e:
        print(f"⚠️ [WellSight AI] Note during startup ingestion: {e}")
    finally:
        db.close()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Asset Intelligence Copilot for Hacktoberfest 2026 Hack Day Pune × AI Hackers Collective",
    lifespan=lifespan
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_PREFIX)

@app.get("/")
def root():
    return {
        "product": "WellSight AI",
        "subtitle": "Asset Intelligence Copilot",
        "tagline": "Every well has a story. Ask the data.",
        "api_docs": "/docs",
        "health": f"{settings.API_PREFIX}/health"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
