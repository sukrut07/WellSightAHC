import pytest
from app.models.well import Well
from app.models.regulator_event import RegulatorEvent
from app.models.correction import Correction
from app.services.spill_engine import SpillEngine

def test_five_barrel_spill_within_deadline(db_session):
    well = Well(id="WELL-S1", name="Spill Well 1", area="Area A", field="Midland", well_type="Gas Lift", target_formation="Wolfcamp")
    db_session.add(well)

    # 6.0 bbl reported in 12 hours -> Compliant
    ev = RegulatorEvent(
        id="REG-T1",
        well_id="WELL-S1",
        event_type="Spill",
        occurred_at="2026-06-01T08:00:00",
        volume_barrels=6.0,
        substance="Crude Oil",
        reported_to_regulator=True,
        reported_at="2026-06-01T20:00:00"  # 12 hours later
    )
    db_session.add(ev)
    db_session.commit()

    res = SpillEngine.evaluate_spill_compliance(db_session, ev)
    assert res["status"] == "Compliant"
    assert res["is_violation"] is False
    assert res["elapsed_hours"] == 12.0

def test_spill_late_reporting_violation(db_session):
    well = Well(id="WELL-S2", name="Spill Well 2", area="Area A", field="Midland", well_type="Gas Lift", target_formation="Wolfcamp")
    db_session.add(well)

    # 8.0 bbl reported in 30 hours -> Violation (> 24h)
    ev = RegulatorEvent(
        id="REG-T2",
        well_id="WELL-S2",
        event_type="Spill",
        occurred_at="2026-06-01T08:00:00",
        volume_barrels=8.0,
        substance="Crude Oil",
        reported_to_regulator=True,
        reported_at="2026-06-02T14:00:00"  # 30 hours later
    )
    db_session.add(ev)
    db_session.commit()

    res = SpillEngine.evaluate_spill_compliance(db_session, ev)
    assert res["is_violation"] is True
    assert "Violation" in res["status"]
    assert res["elapsed_hours"] == 30.0

def test_missing_evidence_does_not_declare_violation(db_session):
    well = Well(id="WELL-S3", name="Spill Well 3", area="Area A", field="Midland", well_type="Gas Lift", target_formation="Wolfcamp")
    db_session.add(well)

    # 7.0 bbl but reported_at is None/missing -> Must be "Insufficient Data", NOT Violation!
    ev = RegulatorEvent(
        id="REG-T3",
        well_id="WELL-S3",
        event_type="Spill",
        occurred_at="2026-06-01T08:00:00",
        volume_barrels=7.0,
        substance="Crude Oil",
        reported_to_regulator=True,
        reported_at=None
    )
    db_session.add(ev)
    db_session.commit()

    res = SpillEngine.evaluate_spill_compliance(db_session, ev)
    assert res["is_violation"] is False
    assert res["status"] == "Insufficient Data"

def test_spill_under_five_barrels(db_session):
    well = Well(id="WELL-S4", name="Spill Well 4", area="Area A", field="Midland", well_type="Gas Lift", target_formation="Wolfcamp")
    db_session.add(well)

    # 3.5 bbl reported in 48 hours -> Under 5 bbl threshold, so 24h emergency rule does not apply
    ev = RegulatorEvent(
        id="REG-T4",
        well_id="WELL-S4",
        event_type="Spill",
        occurred_at="2026-06-01T08:00:00",
        volume_barrels=3.5,
        substance="Produced Water",
        reported_to_regulator=True,
        reported_at="2026-06-03T08:00:00"
    )
    db_session.add(ev)
    db_session.commit()

    res = SpillEngine.evaluate_spill_compliance(db_session, ev)
    assert res["is_violation"] is False
    assert res["is_reportable"] is False

def test_accepted_correction_changes_spill_interpretation(db_session):
    well = Well(id="WELL-S5", name="Spill Well 5", area="Area A", field="Midland", well_type="Gas Lift", target_formation="Wolfcamp")
    db_session.add(well)

    # Raw: 6.0 bbl reported after 28 hours (would be violation)
    ev = RegulatorEvent(
        id="REG-T5",
        well_id="WELL-S5",
        event_type="Spill",
        occurred_at="2026-06-01T08:00:00",
        volume_barrels=6.0,
        substance="Crude Oil",
        reported_to_regulator=True,
        reported_at="2026-06-02T12:00:00"  # 28 hours
    )
    db_session.add(ev)
    db_session.commit()

    # Pre-correction check: Violation
    res_before = SpillEngine.evaluate_spill_compliance(db_session, ev)
    assert res_before["is_violation"] is True

    # Submit accepted correction reducing volume to 4.0 bbl based on vacuum truck audit
    corr = Correction(
        id="CORR-SP-1",
        scope="record",
        target_id="REG-T5",
        target_field="volume_barrels",
        original_value="6.0",
        corrected_value="4.0",
        author="Lead HSE Engineer",
        reason="Vacuum recovery log calibration",
        status="Accepted"
    )
    db_session.add(corr)
    db_session.commit()

    # Post-correction check: Now Compliant (< 5 bbl)!
    res_after = SpillEngine.evaluate_spill_compliance(db_session, ev)
    assert res_after["is_violation"] is False
    assert res_after["volume_barrels"] == 4.0
    assert "Under 5 bbl" in res_after["status"]
    assert len(res_after["corrections_applied"]) == 1
