import pytest
from app.models.well import Well
from app.models.inspection import Inspection
from app.services.downtime_engine import DowntimeEngine

def test_seven_days_for_one_non_producing_inspection(db_session):
    # Setup Gas Lift well (threshold 15F)
    well = Well(
        id="WELL-TEST-01",
        name="Test Well 01",
        area="Area A",
        field="Midland",
        well_type="Gas Lift",
        target_formation="Wolfcamp",
        status="Active"
    )
    db_session.add(well)
    
    # 1 non-producing inspection: Ambient 90, Wellhead 98 (Delta 8F < 15F threshold)
    insp = Inspection(
        id="INSP-T1",
        well_id="WELL-TEST-01",
        inspection_date="2026-06-01",
        ambient_temp_f=90.0,
        wellhead_temp_f=98.0,
        observed_production_status="Not Producing",
        is_missed=False
    )
    db_session.add(insp)
    db_session.commit()

    res = DowntimeEngine.calculate_well_downtime(db_session, "WELL-TEST-01")
    assert res["downtime_days"] == 7.0
    assert res["non_producing_inspections_count"] == 1
    assert res["consecutive_pairs_count"] == 0

def test_fourteen_days_for_two_consecutive_inspections(db_session):
    well = Well(
        id="WELL-TEST-02",
        name="Test Well 02",
        area="Area A",
        field="Midland",
        well_type="Gas Lift",
        target_formation="Wolfcamp",
        status="Active"
    )
    db_session.add(well)

    # Inspection 1 (Delta 6F < 15F)
    insp1 = Inspection(
        id="INSP-T2-1",
        well_id="WELL-TEST-02",
        inspection_date="2026-06-01",
        ambient_temp_f=90.0,
        wellhead_temp_f=96.0,
        observed_production_status="Not Producing",
        is_missed=False
    )
    # Inspection 2 (consecutive week, Delta 7F < 15F)
    insp2 = Inspection(
        id="INSP-T2-2",
        well_id="WELL-TEST-02",
        inspection_date="2026-06-08",
        ambient_temp_f=91.0,
        wellhead_temp_f=98.0,
        observed_production_status="Not Producing",
        is_missed=False
    )
    db_session.add_all([insp1, insp2])
    db_session.commit()

    res = DowntimeEngine.calculate_well_downtime(db_session, "WELL-TEST-02")
    assert res["downtime_days"] == 14.0
    assert res["non_producing_inspections_count"] == 2
    assert res["consecutive_pairs_count"] == 1

def test_missed_inspection_adds_zero_downtime(db_session):
    well = Well(
        id="WELL-TEST-03",
        name="Test Well 03",
        area="Area A",
        field="Midland",
        well_type="Gas Lift",
        target_formation="Wolfcamp",
        status="Active"
    )
    db_session.add(well)

    # Missed inspection
    insp_missed = Inspection(
        id="INSP-T3-1",
        well_id="WELL-TEST-03",
        inspection_date="2026-06-01",
        ambient_temp_f=90.0,
        wellhead_temp_f=90.0,
        observed_production_status="Missed Inspection",
        is_missed=True
    )
    db_session.add(insp_missed)
    db_session.commit()

    res = DowntimeEngine.calculate_well_downtime(db_session, "WELL-TEST-03")
    assert res["downtime_days"] == 0.0
    assert res["missed_inspections_count"] == 1

def test_temperature_threshold_by_well_type(db_session):
    # ESP well requires 25F threshold
    esp_well = Well(
        id="WELL-ESP",
        name="ESP Unit",
        area="Area A",
        field="Midland",
        well_type="Electric Submersible Pump",
        target_formation="Wolfcamp",
        status="Active"
    )
    db_session.add(esp_well)

    # Delta is 20F (90 to 110). 20F would be producing for Gas Lift (15F) but NOT producing for ESP (25F)!
    insp_esp = Inspection(
        id="INSP-ESP-1",
        well_id="WELL-ESP",
        inspection_date="2026-06-01",
        ambient_temp_f=90.0,
        wellhead_temp_f=110.0,  # Delta = 20F < 25F threshold
        observed_production_status="Observed Flowing",
        is_missed=False
    )
    db_session.add(insp_esp)
    db_session.commit()

    res = DowntimeEngine.calculate_well_downtime(db_session, "WELL-ESP")
    assert res["effective_threshold_f"] == 25.0
    assert res["downtime_days"] == 7.0  # Classified as Not Producing because 20F < 25F threshold

def test_planned_maintenance_exempt_from_downtime(db_session):
    well = Well(
        id="WELL-PM",
        name="PM Unit",
        area="Area A",
        field="Midland",
        well_type="Gas Lift",
        target_formation="Wolfcamp",
        status="Active"
    )
    db_session.add(well)

    insp_pm = Inspection(
        id="INSP-PM-1",
        well_id="WELL-PM",
        inspection_date="2026-06-01",
        ambient_temp_f=90.0,
        wellhead_temp_f=92.0,  # Delta 2F
        observed_production_status="Planned Maintenance",
        is_missed=False,
        notes="Scheduled overhaul permit PM-100"
    )
    db_session.add(insp_pm)
    db_session.commit()

    res = DowntimeEngine.calculate_well_downtime(db_session, "WELL-PM")
    assert res["downtime_days"] == 0.0
