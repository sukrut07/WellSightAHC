from pathlib import Path
import pytest
from app.core.config import settings
from app.ingestion.importer import DataImporter
from app.models.well import Well
from app.models.inspection import Inspection

def test_ingestion_idempotency_and_test_dataset(db_session):
    data_dir = settings.DATA_DIR
    assert data_dir.exists()

    # 1. Ingest base data
    res1 = DataImporter.import_directory(db_session, str(data_dir))
    assert res1["status"] == "completed"
    assert res1["total_records_imported"] > 0

    wells_count_1 = db_session.query(Well).count()
    assert wells_count_1 >= 12

    # 2. Re-importing same directory must be idempotent (no duplicate key crashes)
    res2 = DataImporter.import_directory(db_session, str(data_dir))
    wells_count_2 = db_session.query(Well).count()
    assert wells_count_1 == wells_count_2  # No duplicate wells created

    # 3. Load unseen test dataset fixture from data/test_dataset
    test_dir = data_dir / "test_dataset"
    if test_dir.exists():
        res_test = DataImporter.import_directory(db_session, str(test_dir))
        assert res_test["status"] == "completed"
        # Test well TEST-WELL-0101 must exist now
        test_well = db_session.query(Well).filter(Well.id == "TEST-WELL-0101").first()
        assert test_well is not None
        assert test_well.area == "Area Delta"
