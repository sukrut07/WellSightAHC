import pytest
from app.models.well import Well
from app.models.inspection import Inspection
from app.models.correction import Correction
from app.services.downtime_engine import DowntimeEngine

def test_record_scoped_correction_only_affects_targeted_record(db_session):
    well = Well(id="WELL-C1", name="Well C1", area="Area A", field="Midland", well_type="Gas Lift", target_formation="Wolfcamp")
    db_session.add(well)

    insp1 = Inspection(
        id="INSP-C1-1",
        well_id="WELL-C1",
        inspection_date="2026-06-01",
        ambient_temp_f=90.0,
        wellhead_temp_f=98.0,
        observed_production_status="Not Producing",
        is_missed=False
    )
    insp2 = Inspection(
        id="INSP-C1-2",
        well_id="WELL-C1",
        inspection_date="2026-06-08",
        ambient_temp_f=90.0,
        wellhead_temp_f=98.0,
        observed_production_status="Not Producing",
        is_missed=False
    )
    db_session.add_all([insp1, insp2])
    db_session.commit()

    # Pre-correction: 2 inspections = 14 days consecutive downtime
    res_pre = DowntimeEngine.calculate_well_downtime(db_session, "WELL-C1")
    assert res_pre["downtime_days"] == 14.0

    # Add correction ONLY to INSP-C1-1 to mark as Producing
    corr = Correction(
        id="CORR-REC-1",
        scope="record",
        target_id="INSP-C1-1",
        target_field="observed_production_status",
        original_value="Not Producing",
        corrected_value="Producing",
        author="Senior Pumper",
        reason="Field gauge recalibration",
        status="Accepted"
    )
    db_session.add(corr)
    db_session.commit()

    # Post-correction: INSP-C1-1 is Producing (0 days), INSP-C1-2 is Not Producing (7 days, not consecutive)
    res_post = DowntimeEngine.calculate_well_downtime(db_session, "WELL-C1")
    assert res_post["downtime_days"] == 7.0
    assert res_post["consecutive_pairs_count"] == 0

def test_well_specific_correction_does_not_affect_other_wells(db_session):
    w1 = Well(id="WELL-A1", name="A1", area="Area A", field="Midland", well_type="Gas Lift", target_formation="Wolfcamp A")
    w2 = Well(id="WELL-A2", name="A2", area="Area A", field="Midland", well_type="Gas Lift", target_formation="Wolfcamp A")
    db_session.add_all([w1, w2])
    db_session.commit()

    corr = Correction(
        id="CORR-W-1",
        scope="well",
        target_id="WELL-A1",
        target_field="target_formation",
        original_value="Wolfcamp A",
        corrected_value="Wolfcamp Lower B",
        author="Geologist",
        reason="Gamma log review",
        status="Accepted"
    )
    db_session.add(corr)
    db_session.commit()

    # Check that correction targets only WELL-A1
    w1_corr = db_session.query(Correction).filter(Correction.target_id == "WELL-A1").first()
    w2_corr = db_session.query(Correction).filter(Correction.target_id == "WELL-A2").first()
    assert w1_corr is not None
    assert w2_corr is None

def test_well_type_scoped_correction_applies_only_to_matching_type(db_session):
    # Base Gas Lift threshold is 15.0F
    thresh_base = DowntimeEngine.get_effective_threshold(db_session, "Gas Lift")
    assert thresh_base == 15.0

    # Submit accepted well_type correction changing Gas Lift threshold to 16.5F
    corr_type = Correction(
        id="CORR-TYPE-1",
        scope="well_type",
        target_id="Gas Lift",
        target_field="standard_temperature_threshold_f",
        original_value="15.0",
        corrected_value="16.5",
        author="Operations Committee",
        reason="Seasonal ambient variance adjustment",
        status="Accepted"
    )
    db_session.add(corr_type)
    db_session.commit()

    # Gas Lift now returns 16.5F
    thresh_updated = DowntimeEngine.get_effective_threshold(db_session, "Gas Lift")
    assert thresh_updated == 16.5

    # ESP threshold remains untouched at 25.0F
    thresh_esp = DowntimeEngine.get_effective_threshold(db_session, "Electric Submersible Pump")
    assert thresh_esp == 25.0
