import pytest
from app.models.well import Well
from app.services.memory_service import MemoryService

def test_private_memory_isolated_per_user(db_session):
    # User Alpha saves a context note
    MemoryService.save_user_private_context(
        db_session,
        user_id="user_alpha",
        context_key="discussed_wells",
        context_value="WELL-0001, WELL-0007"
    )

    # User Beta saves a different context note
    MemoryService.save_user_private_context(
        db_session,
        user_id="user_beta",
        context_key="discussed_wells",
        context_value="WELL-0005"
    )

    # Alpha's query strictly returns Alpha's context
    alpha_ctx = MemoryService.get_user_private_context(db_session, "user_alpha")
    assert len(alpha_ctx) == 1
    assert "WELL-0007" in alpha_ctx[0]["value"]
    assert "WELL-0005" not in alpha_ctx[0]["value"]

    # Beta's query strictly returns Beta's context
    beta_ctx = MemoryService.get_user_private_context(db_session, "user_beta")
    assert len(beta_ctx) == 1
    assert "WELL-0005" in beta_ctx[0]["value"]
    assert "WELL-0007" not in beta_ctx[0]["value"]

def test_shared_well_context_visible_across_users(db_session):
    well = Well(id="WELL-SH1", name="Shared Well", area="Area A", field="Midland", well_type="Gas Lift", target_formation="Wolfcamp")
    db_session.add(well)
    db_session.commit()

    # User Alpha adds shared context
    MemoryService.add_shared_well_context(
        db_session,
        well_id="WELL-SH1",
        author="Operator Alpha",
        key="compressor_vibration",
        value="Vibration dampers replaced on intake line"
    )

    # Both Alpha and Beta can read the shared context
    shared_notes = MemoryService.get_shared_well_context(db_session, "WELL-SH1")
    assert len(shared_notes) == 1
    assert shared_notes[0]["author"] == "Operator Alpha"
    assert "Vibration dampers" in shared_notes[0]["value"]
