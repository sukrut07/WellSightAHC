from datetime import datetime
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.regulator_event import RegulatorEvent
from app.models.correction import Correction

class SpillEngine:
    @staticmethod
    def get_effective_spill_values(db: Session, event: RegulatorEvent) -> Dict[str, Any]:
        """
        Retrieves effective volume and timestamps after checking for accepted corrections.
        Preserves original values in returned dict.
        """
        effective_volume = event.volume_barrels
        effective_reported_at = event.reported_at
        corrections_applied = []

        # Check for accepted corrections on this record
        corrections = (
            db.query(Correction)
            .filter(
                Correction.scope == "record",
                Correction.target_id == event.id,
                Correction.status == "Accepted"
            )
            .order_by(Correction.created_at.asc())
            .all()
        )

        for corr in corrections:
            if corr.target_field == "volume_barrels":
                try:
                    effective_volume = float(corr.corrected_value)
                    corrections_applied.append(f"Volume adjusted from {corr.original_value} to {corr.corrected_value} bbl via {corr.id}")
                except ValueError:
                    pass
            elif corr.target_field == "reported_at":
                effective_reported_at = corr.corrected_value
                corrections_applied.append(f"Report timestamp adjusted from {corr.original_value} to {corr.corrected_value} via {corr.id}")

        return {
            "effective_volume": effective_volume,
            "effective_reported_at": effective_reported_at,
            "corrections_applied": corrections_applied
        }

    @classmethod
    def evaluate_spill_compliance(cls, db: Session, event: RegulatorEvent) -> Dict[str, Any]:
        """
        Evaluates regulatory compliance under SOP-ENV-004:
        - Volume >= 5.0 bbl: mandatory reporting to regulator within 24 hours.
        - If volume < 5.0 bbl: not reportable under 24-hour emergency rule.
        - If evidence missing (reported_at is missing): DO NOT declare violation -> 'Insufficient Data'.
        - If elapsed > 24 hours: 'Violation (Late Reporting)'.
        - If not reported and > 24h passed: 'Violation (Unreported)'.
        - If elapsed <= 24 hours: 'Compliant'.
        """
        eff = cls.get_effective_spill_values(db, event)
        volume = eff["effective_volume"]
        reported_at_str = eff["effective_reported_at"]
        occurred_at_str = event.occurred_at

        # Parse occurred_at
        try:
            occurred_at = datetime.fromisoformat(occurred_at_str.replace("Z", "+00:00"))
        except Exception:
            occurred_at = datetime.strptime(occurred_at_str, "%Y-%m-%dT%H:%M:%S")

        # Threshold check
        if volume < 5.0:
            return {
                "event_id": event.id,
                "well_id": event.well_id,
                "occurred_at": occurred_at_str,
                "volume_barrels": volume,
                "raw_volume_barrels": event.volume_barrels,
                "substance": event.substance,
                "status": "Compliant (Under 5 bbl Threshold)",
                "is_violation": False,
                "is_reportable": False,
                "elapsed_hours": None,
                "reason": f"Spill volume of {volume:.1f} bbl is below the 5.0 bbl 24-hour mandatory reporting threshold.",
                "corrections_applied": eff["corrections_applied"],
                "citation": "SOP-ENV-004 Section 2.3",
                "record_id": event.id
            }

        # Volume >= 5.0 bbl: Check evidence
        if not reported_at_str or reported_at_str.strip() == "":
            return {
                "event_id": event.id,
                "well_id": event.well_id,
                "occurred_at": occurred_at_str,
                "volume_barrels": volume,
                "raw_volume_barrels": event.volume_barrels,
                "substance": event.substance,
                "status": "Insufficient Data",
                "is_violation": False,  # Non-negotiable requirement: Do NOT declare violation when evidence is missing!
                "is_reportable": True,
                "elapsed_hours": None,
                "reason": "Spill >= 5.0 bbl is reportable, but the formal regulator notification timestamp is missing from the record. Cannot declare violation without dispatch evidence.",
                "corrections_applied": eff["corrections_applied"],
                "citation": "SOP-ENV-004 Section 3",
                "record_id": event.id
            }

        # Parse reported_at
        try:
            reported_at = datetime.fromisoformat(reported_at_str.replace("Z", "+00:00"))
        except Exception:
            reported_at = datetime.strptime(reported_at_str, "%Y-%m-%dT%H:%M:%S")

        elapsed_seconds = (reported_at - occurred_at).total_seconds()
        elapsed_hours = elapsed_seconds / 3600.0

        if elapsed_hours <= 24.0:
            return {
                "event_id": event.id,
                "well_id": event.well_id,
                "occurred_at": occurred_at_str,
                "reported_at": reported_at_str,
                "volume_barrels": volume,
                "raw_volume_barrels": event.volume_barrels,
                "substance": event.substance,
                "status": "Compliant",
                "is_violation": False,
                "is_reportable": True,
                "elapsed_hours": round(elapsed_hours, 2),
                "reason": f"Reported in {elapsed_hours:.1f} hours, safely within the 24-hour deadline.",
                "corrections_applied": eff["corrections_applied"],
                "citation": "SOP-ENV-004 Section 2.2",
                "record_id": event.id
            }
        else:
            return {
                "event_id": event.id,
                "well_id": event.well_id,
                "occurred_at": occurred_at_str,
                "reported_at": reported_at_str,
                "volume_barrels": volume,
                "raw_volume_barrels": event.volume_barrels,
                "substance": event.substance,
                "status": "Violation (Late Reporting)",
                "is_violation": True,
                "is_reportable": True,
                "elapsed_hours": round(elapsed_hours, 2),
                "reason": f"Reported {elapsed_hours:.1f} hours after occurrence, exceeding the mandatory 24.0-hour statutory limit by {elapsed_hours - 24.0:.1f} hours.",
                "corrections_applied": eff["corrections_applied"],
                "citation": "SOP-ENV-004 Section 3",
                "record_id": event.id
            }

    @classmethod
    def find_violations(
        cls,
        db: Session,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Scans all regulator spill records and returns evaluated compliance status."""
        query = db.query(RegulatorEvent).filter(RegulatorEvent.event_type == "Spill")
        if start_date:
            query = query.filter(RegulatorEvent.occurred_at >= start_date)
        if end_date:
            query = query.filter(RegulatorEvent.occurred_at <= end_date)
        
        events = query.order_by(RegulatorEvent.occurred_at.asc()).all()
        return [cls.evaluate_spill_compliance(db, ev) for ev in events]
