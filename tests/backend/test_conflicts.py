import pytest
from app.models.well import Well
from app.models.inspection import Inspection
from app.models.correction import Correction
from app.models.regulator_event import RegulatorEvent
from app.services.conflict_engine import ConflictEngine

def test_detects_contested_correction_conflict(db_session):
    well = Well(id="WELL-CONF-1", name="Conf Well 1", area="Area A", field="Midland", well_type="Gas Lift", target_formation="Wolfcamp")
    insp = Inspection(
        id="INSP-CONF-1",
        well_id="WELL-CONF-1",
        inspection_date="2026-06-01",
        ambient_temp_f=90.0,
        wellhead_temp_f=96.0,
        observed_production_status="Not Producing",
        is_missed=False
    )
    # Contested correction
    corr = Correction(
        id="CORR-DISP-1",
        scope="record",
        target_id="INSP-CONF-1",
        target_field="observed_production_status",
        original_value="Not Producing",
        corrected_value="Producing",
        author="Contractor",
        reason="Visual flare observation",
        status="Contested"
    )
    db_session.add_all([well, insp, corr])
    db_session.commit()

    conflicts = ConflictEngine.detect_conflicts_for_well(db_session, "WELL-CONF-1")
    assert len(conflicts) >= 1
    contested_conf = next((c for c in conflicts if "Contested Correction" in c.issue), None)
    assert contested_conf is not None
    assert contested_conf.target_id == "INSP-CONF-1"
    assert contested_conf.status == "Unresolved"

def test_detects_missing_spill_evidence_conflict(db_session):
    well = Well(id="WELL-CONF-2", name="Conf Well 2", area="Area A", field="Midland", well_type="Gas Lift", target_formation="Wolfcamp")
    spill = RegulatorEvent(
        id="REG-CONF-1",
        well_id="WELL-CONF-2",
        event_type="Spill",
        occurred_at="2026-06-01T08:00:00",
        volume_barrels=8.0,
        substance="Crude Oil",
        reported_to_regulator=True,
        reported_at=None  # Missing!
    )
    db_session.add_all([well, spill])
    db_session.commit()

    conflicts = ConflictEngine.detect_conflicts_for_well(db_session, "WELL-CONF-2")
    missing_conf = next((c for c in conflicts if "Missing Regulatory Notice" in c.issue), None)
    assert missing_conf is not None
    assert missing_conf.status == "Investigating"
