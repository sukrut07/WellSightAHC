from datetime import datetime
from typing import List, Dict, Any, Optional, Tuple
from sqlalchemy.orm import Session
from app.models.well import Well
from app.models.inspection import Inspection
from app.models.correction import Correction
from app.models.repair import Repair

# Default thermal differential thresholds by well type per SOP manuals
DEFAULT_TEMP_THRESHOLDS: Dict[str, float] = {
    "Gas Lift": 15.0,
    "Electric Submersible Pump": 25.0,
    "ESP": 25.0,
    "Rod Pump": 12.0,
    "Flowing": 18.0,
    "Natural Flowing": 18.0,
}

class DowntimeEngine:
    @staticmethod
    def get_effective_threshold(db: Session, well_type: str) -> float:
        """Retrieves operating thermal threshold for well type, applying any accepted well_type corrections."""
        base_threshold = DEFAULT_TEMP_THRESHOLDS.get(well_type, 15.0)
        
        # Check for accepted well_type correction
        corr = (
            db.query(Correction)
            .filter(
                Correction.scope == "well_type",
                Correction.target_id == well_type,
                Correction.target_field == "standard_temperature_threshold_f",
                Correction.status == "Accepted"
            )
            .order_by(Correction.created_at.desc())
            .first()
        )
        if corr:
            try:
                return float(corr.corrected_value)
            except ValueError:
                pass
        return base_threshold

    @staticmethod
    def get_effective_inspection_status(
        db: Session, 
        inspection: Inspection, 
        well: Well, 
        threshold: float
    ) -> Tuple[str, bool, List[str]]:
        """
        Determines effective production status according to business rules:
        1. Checks for record-scoped accepted correction.
        2. Evaluates temperature differential Delta T = wellhead - ambient.
        3. Identifies planned maintenance exceptions.
        4. Identifies missed inspections.
        Returns (effective_status, is_non_producing, warnings)
        """
        warnings = []
        
        # 1. Check if an accepted correction exists for this inspection record
        corr = (
            db.query(Correction)
            .filter(
                Correction.scope == "record",
                Correction.target_id == inspection.id,
                Correction.status == "Accepted"
            )
            .order_by(Correction.created_at.desc())
            .first()
        )
        if corr:
            if corr.target_field == "observed_production_status":
                status = corr.corrected_value
                is_non_prod = (status.lower() in ["not producing", "non-producing", "down"])
                warnings.append(f"Status overridden by accepted correction {corr.id} ({corr.original_value} -> {corr.corrected_value})")
                return status, is_non_prod, warnings

        # 2. Check missed inspection
        if inspection.is_missed or "missed" in (inspection.observed_production_status or "").lower():
            return "Missed Inspection", False, ["Missed inspection adds 0 days downtime per business rules."]

        # 3. Check planned maintenance exemption
        if "planned maintenance" in (inspection.observed_production_status or "").lower():
            return "Planned Maintenance", False, ["Planned maintenance window exempt from unplanned downtime calculation."]

        # 4. Check explicit shut-in
        if "shut-in" in (inspection.observed_production_status or "").lower():
            # Check notes for planned vs unplanned
            if inspection.notes and "permit" in inspection.notes.lower():
                return "Planned Shut-In", False, ["Permitted shut-in exempt from downtime."]
            return "Unplanned Shut-In", True, warnings

        # 5. Evaluate Thermal Differential: Delta T = wellhead - ambient
        delta_t = inspection.wellhead_temp_f - inspection.ambient_temp_f
        if delta_t < threshold:
            # Below threshold -> Not Producing
            return "Not Producing", True, warnings
        else:
            return "Producing", False, warnings

    @classmethod
    def calculate_well_downtime(
        cls,
        db: Session,
        well_id: str,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Calculates exact downtime for a well using organiser rules:
        - Each weekly non-producing inspection = 7 days downtime (168 hours).
        - Consecutive weekly non-producing inspections = 14 days for the pair (7 + 7).
        - Missed inspections = 0 days downtime.
        - Repair duration is NOT used for downtime calculation.
        """
        well = db.query(Well).filter(Well.id == well_id).first()
        if not well:
            return {
                "error": f"Well {well_id} not found",
                "well_id": well_id,
                "downtime_days": 0.0,
                "downtime_hours": 0.0
            }

        threshold = cls.get_effective_threshold(db, well.well_type)

        query = db.query(Inspection).filter(Inspection.well_id == well_id)
        if start_date:
            query = query.filter(Inspection.inspection_date >= start_date)
        if end_date:
            query = query.filter(Inspection.inspection_date <= end_date)
        
        inspections = query.order_by(Inspection.inspection_date.asc()).all()

        total_downtime_days = 0.0
        non_producing_inspections: List[Dict[str, Any]] = []
        consecutive_pairs_count = 0
        missed_inspections_count = 0
        prev_was_non_producing = False
        all_warnings: List[str] = []

        for insp in inspections:
            status, is_non_prod, warnings = cls.get_effective_inspection_status(db, insp, well, threshold)
            all_warnings.extend(warnings)

            if insp.is_missed or status == "Missed Inspection":
                missed_inspections_count += 1
                prev_was_non_producing = False
                continue

            if is_non_prod:
                total_downtime_days += 7.0
                if prev_was_non_producing:
                    consecutive_pairs_count += 1
                
                delta_t = insp.wellhead_temp_f - insp.ambient_temp_f
                non_producing_inspections.append({
                    "inspection_id": insp.id,
                    "date": insp.inspection_date,
                    "ambient_temp_f": insp.ambient_temp_f,
                    "wellhead_temp_f": insp.wellhead_temp_f,
                    "delta_t_f": round(delta_t, 1),
                    "threshold_f": threshold,
                    "status": status,
                    "consecutive": prev_was_non_producing,
                    "notes": insp.notes
                })
                prev_was_non_producing = True
            else:
                prev_was_non_producing = False

        # Retrieve documented repair causes to separate facts from hypotheses
        repair_query = db.query(Repair).filter(Repair.well_id == well_id)
        if start_date:
            repair_query = repair_query.filter(Repair.start_date >= start_date)
        if end_date:
            repair_query = repair_query.filter(Repair.start_date <= end_date)
        repairs = repair_query.all()

        documented_causes = [
            f"{r.repair_type} ({r.start_date}): {r.documented_cause} [Cost: ${r.cost_usd:,.2f}]"
            for r in repairs
        ]

        return {
            "well_id": well.id,
            "well_name": well.name,
            "area": well.area,
            "well_type": well.well_type,
            "effective_threshold_f": threshold,
            "date_range": f"{start_date or 'Earliest'} to {end_date or 'Latest'}",
            "downtime_days": total_downtime_days,
            "downtime_hours": total_downtime_days * 24.0,
            "inspections_evaluated": len(inspections),
            "non_producing_inspections_count": len(non_producing_inspections),
            "consecutive_pairs_count": consecutive_pairs_count,
            "missed_inspections_count": missed_inspections_count,
            "non_producing_inspections": non_producing_inspections,
            "documented_causes": documented_causes,
            "citations": [insp["inspection_id"] for insp in non_producing_inspections] + [r.id for r in repairs],
            "warnings": list(set(all_warnings)),
            "methodology": "Weekly non-producing inspection accounts for 7 days (168h); consecutive non-producing counts 14 days (336h); missed inspections account for 0 days."
        }

    @classmethod
    def calculate_area_downtime(
        cls,
        db: Session,
        area: str,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None
    ) -> Dict[str, Any]:
        """Calculates and ranks downtime for all wells within an operational area."""
        wells = db.query(Well).filter(Well.area == area).all()
        results = []
        total_area_downtime = 0.0

        for well in wells:
            summary = cls.calculate_well_downtime(db, well.id, start_date, end_date)
            results.append(summary)
            total_area_downtime += summary["downtime_days"]

        # Sort descending by downtime_days
        results.sort(key=lambda x: x["downtime_days"], reverse=True)

        return {
            "area": area,
            "date_range": f"{start_date or '2026-06-01'} to {end_date or '2026-08-31'}",
            "total_area_downtime_days": total_area_downtime,
            "wells_count": len(wells),
            "ranked_wells": results,
            "all_citations": [cid for r in results for cid in r["citations"]]
        }
