from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.well import Well
from app.models.inspection import Inspection
from app.models.correction import Correction
from app.models.human_note import HumanNote
from app.models.regulator_event import RegulatorEvent
from app.schemas.generative_ui import ConflictNotice

class ConflictEngine:
    @classmethod
    def detect_conflicts_for_well(cls, db: Session, well_id: str) -> List[ConflictNotice]:
        """Scans well data, inspections, notes, and corrections for genuine contradictions."""
        conflicts: List[ConflictNotice] = []
        well = db.query(Well).filter(Well.id == well_id).first()
        if not well:
            return conflicts

        # 1. Contested / Unresolved Corrections
        contested_corrs = (
            db.query(Correction)
            .filter(
                Correction.status.in_(["Contested", "Pending"]),
                (Correction.target_id == well_id) | (Correction.scope == "record")
            )
            .all()
        )
        for corr in contested_corrs:
            # Check if this correction targets an inspection of this well
            insp = db.query(Inspection).filter(Inspection.id == corr.target_id, Inspection.well_id == well_id).first()
            if insp or corr.target_id == well_id:
                conflicts.append(ConflictNotice(
                    target_id=corr.target_id,
                    issue=f"Contested Correction on field '{corr.target_field}'",
                    primary_source=f"Raw Record (Original: '{corr.original_value}')",
                    competing_source=f"Correction by {corr.author} ('{corr.corrected_value}')",
                    competing_values={
                        "original_value": corr.original_value,
                        "contested_value": corr.corrected_value,
                        "author": corr.author,
                        "reason": corr.reason,
                        "status": corr.status
                    },
                    uncertainty_explanation=(
                        f"Correction {corr.id} submitted by {corr.author} proposes changing "
                        f"{corr.target_field} to '{corr.corrected_value}', but has status '{corr.status}' "
                        f"due to operational dispute. Until formally accepted, calculation uses verified rules."
                    ),
                    precedence_rule="Raw verified source record holds precedence over unaccepted/contested corrections.",
                    status="Unresolved"
                ))

        # 2. Stale Well Directory Status vs Recent Inspections
        recent_insp = (
            db.query(Inspection)
            .filter(Inspection.well_id == well_id)
            .order_by(Inspection.inspection_date.desc())
            .first()
        )
        if recent_insp and well.status == "Active":
            # If well directory says "Active" but latest inspection is non-producing
            delta_t = recent_insp.wellhead_temp_f - recent_insp.ambient_temp_f
            if recent_insp.observed_production_status.lower() in ["not producing", "down"]:
                conflicts.append(ConflictNotice(
                    target_id=well_id,
                    issue="Directory Status vs Field Observation Discrepancy",
                    primary_source=f"Well Master Table: status='{well.status}'",
                    competing_source=f"Latest Inspection {recent_insp.id} ({recent_insp.inspection_date}): status='{recent_insp.observed_production_status}'",
                    competing_values={
                        "directory_status": well.status,
                        "inspection_status": recent_insp.observed_production_status,
                        "delta_t_f": round(delta_t, 1),
                        "inspection_date": recent_insp.inspection_date
                    },
                    uncertainty_explanation=(
                        f"The well master directory lists {well.id} as 'Active', but the most recent inspection on "
                        f"{recent_insp.inspection_date} measured a Delta T of {delta_t:.1f}°F and recorded status '{recent_insp.observed_production_status}'."
                    ),
                    precedence_rule="Field measurement takes temporal precedence for real-time production analytics.",
                    status="Unresolved"
                ))

        # 3. Missing Evidence for Reportable Spills
        spills = (
            db.query(RegulatorEvent)
            .filter(
                RegulatorEvent.well_id == well_id,
                RegulatorEvent.event_type == "Spill",
                RegulatorEvent.volume_barrels >= 5.0,
                (RegulatorEvent.reported_at == None) | (RegulatorEvent.reported_at == "")
            )
            .all()
        )
        for sp in spills:
            conflicts.append(ConflictNotice(
                target_id=sp.id,
                issue="Missing Regulatory Notice Timestamp for Spill >= 5 bbl",
                primary_source=f"Spill Event {sp.id} ({sp.volume_barrels} bbl on {sp.occurred_at})",
                competing_source="Regulatory Notification Log (Missing)",
                competing_values={
                    "event_volume_bbl": sp.volume_barrels,
                    "occurred_at": sp.occurred_at,
                    "reported_at": "MISSING_FROM_RECORDS"
                },
                uncertainty_explanation=(
                    f"Spill of {sp.volume_barrels} bbl exceeds the 5.0 bbl mandatory 24-hour notification threshold, "
                    f"but no regulator dispatch timestamp is recorded. Under SOP-ENV-004 rules, a violation cannot be declared without evidence."
                ),
                precedence_rule="Presumption of insufficient evidence: require formal field audit rather than assuming late report.",
                status="Investigating"
            ))

        return conflicts

    @classmethod
    def detect_all_conflicts(cls, db: Session) -> List[ConflictNotice]:
        """Scans the entire database for active discrepancies and contested records."""
        wells = db.query(Well).all()
        all_conflicts = []
        for w in wells:
            all_conflicts.extend(cls.detect_conflicts_for_well(db, w.id))
        return all_conflicts
