import sys
from pathlib import Path
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Add services/api to python path
API_DIR = Path(__file__).resolve().parent.parent.parent / "services" / "api"
sys.path.insert(0, str(API_DIR))

from app.core.database import Base
from app.models.well import Well
from app.models.inspection import Inspection
from app.models.repair import Repair
from app.models.regulator_event import RegulatorEvent
from app.models.correction import Correction
from app.models.memory import WellSharedMemory, UserPrivateMemory
from app.models.document import Document, DocumentChunk

@pytest.fixture(scope="function")
def db_session():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)
