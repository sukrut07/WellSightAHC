from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.well import Well
from app.models.inspection import Inspection
from app.models.repair import Repair
from app.models.regulator_event import RegulatorEvent
from app.models.correction import Correction
from app.services.downtime_engine import DowntimeEngine
from app.services.spill_engine import SpillEngine
from app.services.conflict_engine import ConflictEngine
from app.services.memory_service import MemoryService
from app.services.retrieval_service import RetrievalService
from app.schemas.generative_ui import VisualSpecUnion, CitationSource

class ToolRegistry:
    @staticmethod
    def get_well_details(db: Session, well_id: str) -> Dict[str, Any]:
        """Tool 1: Retrieve complete well attributes and status."""
        well = db.query(Well).filter(Well.id == well_id).first()
        if not well:
            return {"error": f"Well {well_id} not found", "found": False}
        return {
            "found": True,
            "id": well.id,
            "name": well.name,
            "area": well.area,
            "field": well.field,
            "well_type": well.well_type,
            "target_formation": well.target_formation,
            "status": well.status,
            "latitude": well.latitude,
            "longitude": well.longitude,
            "commissioned_date": well.commissioned_date
        }

    @staticmethod
    def get_inspection_history(
        db: Session,
        well_id: str,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None
    ) -> Dict[str, Any]:
        """Tool 2: Retrieve historical surface inspection logs with temperature deltas."""
        query = db.query(Inspection).filter(Inspection.well_id == well_id)
        if start_date:
            query = query.filter(Inspection.inspection_date >= start_date)
        if end_date:
            query = query.filter(Inspection.inspection_date <= end_date)
        inspections = query.order_by(Inspection.inspection_date.asc()).all()

        records = []
        for insp in inspections:
            delta_t = insp.wellhead_temp_f - insp.ambient_temp_f
            records.append({
                "id": insp.id,
                "date": insp.inspection_date,
                "inspector": insp.inspector,
                "ambient_temp_f": insp.ambient_temp_f,
                "wellhead_temp_f": insp.wellhead_temp_f,
                "delta_t_f": round(delta_t, 1),
                "surface_pressure_psi": insp.surface_pressure_psi,
                "observed_status": insp.observed_production_status,
                "is_missed": insp.is_missed,
                "notes": insp.notes
            })
        return {
            "well_id": well_id,
            "total_inspections": len(records),
            "inspections": records
        }

    @staticmethod
    def calculate_well_downtime(
        db: Session,
        area: Optional[str] = None,
        well_id: Optional[str] = None,
        date_range: Optional[str] = None
    ) -> Dict[str, Any]:
        """Tool 3: Deterministic downtime calculation per organiser rules."""
        # Parse date range if supplied (e.g. '2026-06-01 to 2026-08-31')
        start_date = "2026-06-01"
        end_date = "2026-08-31"
        if date_range and "to" in date_range:
            parts = [p.strip() for p in date_range.split("to")]
            start_date, end_date = parts[0], parts[1]

        if well_id:
            return DowntimeEngine.calculate_well_downtime(db, well_id, start_date, end_date)
        elif area:
            return DowntimeEngine.calculate_area_downtime(db, area, start_date, end_date)
        else:
            # Default to Area A if not specified
            return DowntimeEngine.calculate_area_downtime(db, "Area A", start_date, end_date)

    @staticmethod
    def compare_well_downtime(
        db: Session,
        well_ids: List[str],
        date_range: Optional[str] = None
    ) -> Dict[str, Any]:
        """Tool 4: Compare calculated downtime between specific wells."""
        start_date = "2026-06-01"
        end_date = "2026-08-31"
        if date_range and "to" in date_range:
            parts = [p.strip() for p in date_range.split("to")]
            start_date, end_date = parts[0], parts[1]

        summaries = [
            DowntimeEngine.calculate_well_downtime(db, wid, start_date, end_date)
            for wid in well_ids
        ]
        return {
            "comparison": summaries,
            "well_ids": well_ids,
            "date_range": f"{start_date} to {end_date}"
        }

    @staticmethod
    def get_repair_history(
        db: Session,
        well_id: str,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None
    ) -> Dict[str, Any]:
        """Tool 5: Retrieve work ticket repair records with documented causes and costs."""
        query = db.query(Repair).filter(Repair.well_id == well_id)
        if start_date:
            query = query.filter(Repair.start_date >= start_date)
        if end_date:
            query = query.filter(Repair.start_date <= end_date)
        repairs = query.order_by(Repair.start_date.asc()).all()

        return {
            "well_id": well_id,
            "repairs_count": len(repairs),
            "repairs": [
                {
                    "id": r.id,
                    "start_date": r.start_date,
                    "end_date": r.end_date,
                    "repair_type": r.repair_type,
                    "cause_category": r.cause_category,
                    "documented_cause": r.documented_cause,
                    "cost_usd": r.cost_usd,
                    "technician": r.technician,
                    "status": r.status
                }
                for r in repairs
            ]
        }

    @staticmethod
    def calculate_repair_costs(
        db: Session,
        area: Optional[str] = None,
        date_range: Optional[str] = None
    ) -> Dict[str, Any]:
        """Tool 6: Calculate total and categorized repair costs."""
        from sqlalchemy import func
        query = db.query(
            Repair.cause_category,
            func.sum(Repair.cost_usd),
            func.count(Repair.id)
        )
        if area:
            norm_area = area.strip().lower()
            AREA_ALIASES = {
                "area a": "Southwest Block 23",
                "area-a": "Southwest Block 23",
                "area_a": "Southwest Block 23",
                "area b": "Southwest Block 24",
                "area-b": "Southwest Block 24",
                "area_b": "Southwest Block 24",
                "area c": "Northeast Block 7",
                "area-c": "Northeast Block 7",
                "area_c": "Northeast Block 7",
                "area d": "Northeast Block 8",
                "area-d": "Northeast Block 8",
                "area_d": "Northeast Block 8",
            }
            target_area = AREA_ALIASES.get(norm_area, area)
            query = query.join(Well).filter(Well.area.ilike(f"%{target_area}%"))

        results = query.group_by(Repair.cause_category).all()
        by_category: Dict[str, float] = {}
        total_cost = 0.0
        repairs_count = 0
        for cat, cost_sum, cnt in results:
            cat_name = cat or "Uncategorized"
            cost_val = float(cost_sum or 0.0)
            by_category[cat_name] = cost_val
            total_cost += cost_val
            repairs_count += (cnt or 0)

        return {
            "area": area or "All Areas",
            "total_repair_cost_usd": total_cost,
            "repairs_count": repairs_count,
            "cost_by_category": by_category
        }

    @staticmethod
    def search_manuals(
        db: Session,
        query: str,
        well_type: Optional[str] = None
    ) -> List[CitationSource]:
        """Tool 7: Search standard operating manuals and temperature threshold rules."""
        return RetrievalService.search_documents(db, query, category="manual", well_type=well_type)

    @staticmethod
    def get_regulator_events(
        db: Session,
        well_id: Optional[str] = None,
        date_range: Optional[str] = None
    ) -> Dict[str, Any]:
        """Tool 8: Retrieve environmental incident logs."""
        query = db.query(RegulatorEvent)
        if well_id:
            query = query.filter(RegulatorEvent.well_id == well_id)
        events = query.order_by(RegulatorEvent.occurred_at.asc()).all()
        return {
            "events_count": len(events),
            "events": [
                {
                    "id": ev.id,
                    "well_id": ev.well_id,
                    "event_type": ev.event_type,
                    "occurred_at": ev.occurred_at,
                    "volume_barrels": ev.volume_barrels,
                    "substance": ev.substance,
                    "reported_to_regulator": ev.reported_to_regulator,
                    "reported_at": ev.reported_at
                }
                for ev in events
            ]
        }

    @staticmethod
    def find_spill_reporting_violations(
        db: Session,
        date_range: Optional[str] = None
    ) -> Dict[str, Any]:
        """Tool 9: Deterministically find spills requiring reporting and flag violations under 24h rule."""
        results = SpillEngine.find_violations(db)
        violations = [r for r in results if r["is_violation"]]
        compliant = [r for r in results if not r["is_violation"] and r["status"] == "Compliant"]
        insufficient = [r for r in results if r["status"] == "Insufficient Data"]
        under_threshold = [r for r in results if not r["is_reportable"]]

        return {
            "total_spills_evaluated": len(results),
            "violations_count": len(violations),
            "compliant_count": len(compliant),
            "insufficient_data_count": len(insufficient),
            "under_threshold_count": len(under_threshold),
            "violations": violations,
            "all_results": results
        }

    @staticmethod
    def get_area_performance(db: Session, area: str, date_range: Optional[str] = None) -> Dict[str, Any]:
        """Tool 10: Retrieve aggregated area performance metrics."""
        downtime_summary = DowntimeEngine.calculate_area_downtime(db, area, "2026-06-01", "2026-08-31")
        repair_summary = ToolRegistry.calculate_repair_costs(db, area)
        return {
            "area": area,
            "downtime_summary": downtime_summary,
            "repair_summary": repair_summary
        }

    @staticmethod
    def search_human_notes(db: Session, query: str, well_id: Optional[str] = None) -> List[CitationSource]:
        """Tool 11: Search operator commentary and field notes."""
        return RetrievalService.search_human_notes(db, query, well_id=well_id)

    @staticmethod
    def get_applicable_corrections(
        db: Session,
        record_id: Optional[str] = None,
        well_id: Optional[str] = None,
        well_type: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Tool 12: Retrieve active and historical corrections scoped to record, well, or well type."""
        query = db.query(Correction)
        filters = []
        if record_id:
            filters.append((Correction.scope == "record") & (Correction.target_id == record_id))
        if well_id:
            filters.append((Correction.scope == "well") & (Correction.target_id == well_id))
        if well_type:
            filters.append((Correction.scope == "well_type") & (Correction.target_id == well_type))

        if filters:
            from sqlalchemy import or_
            query = query.filter(or_(*filters))

        corrs = query.order_by(Correction.created_at.desc()).all()
        return [
            {
                "id": c.id,
                "scope": c.scope,
                "target_id": c.target_id,
                "target_field": c.target_field,
                "original_value": c.original_value,
                "corrected_value": c.corrected_value,
                "author": c.author,
                "status": c.status,
                "reason": c.reason,
                "created_at": c.created_at.isoformat() if c.created_at else None
            }
            for c in corrs
        ]

    @staticmethod
    def get_shared_well_context(db: Session, well_id: str) -> List[Dict[str, Any]]:
        """Tool 13: Get shared notes across users for a well."""
        return MemoryService.get_shared_well_context(db, well_id)

    @staticmethod
    def get_private_conversation_context(
        db: Session,
        user_id: str,
        conversation_id: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Tool 14: Get isolated private memory for a specific user."""
        return MemoryService.get_user_private_context(db, user_id)

    @staticmethod
    def record_user_correction(
        db: Session,
        scope: str,
        target_id: str,
        target_field: str,
        corrected_value: str,
        author: str,
        reason: str
    ) -> Dict[str, Any]:
        """Tool 15: Submit an explicit user correction preserving original value."""
        import uuid
        from datetime import datetime, timezone

        # Find original value
        orig_val = "Unknown"
        if scope == "record":
            if target_id.startswith("INSP"):
                insp = db.query(Inspection).filter(Inspection.id == target_id).first()
                if insp and hasattr(insp, target_field):
                    orig_val = str(getattr(insp, target_field))
            elif target_id.startswith("REG"):
                event = db.query(RegulatorEvent).filter(RegulatorEvent.id == target_id).first()
                if event and hasattr(event, target_field):
                    orig_val = str(getattr(event, target_field))
        elif scope == "well":
            well = db.query(Well).filter(Well.id == target_id).first()
            if well and hasattr(well, target_field):
                orig_val = str(getattr(well, target_field))
        elif scope == "well_type":
            orig_val = "Standard SOP default"

        corr = Correction(
            id=f"CORR-USR-{uuid.uuid4().hex[:6].upper()}",
            scope=scope,
            target_id=target_id,
            target_field=target_field,
            original_value=orig_val,
            corrected_value=corrected_value,
            author=author,
            reason=reason,
            status="Accepted",
            created_at=datetime.now(timezone.utc)
        )
        db.add(corr)
        db.commit()
        db.refresh(corr)
        return {
            "id": corr.id,
            "status": "Accepted",
            "scope": corr.scope,
            "target_id": corr.target_id,
            "target_field": corr.target_field,
            "original_value": corr.original_value,
            "corrected_value": corr.corrected_value,
            "message": "Correction recorded successfully and applied to downstream calculations."
        }

    @staticmethod
    def detect_data_conflicts(db: Session, well_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """Tool 16: Detect contradictions and contested records."""
        if well_id:
            conflicts = ConflictEngine.detect_conflicts_for_well(db, well_id)
        else:
            conflicts = ConflictEngine.detect_all_conflicts(db)
        return [c.model_dump() for c in conflicts]
