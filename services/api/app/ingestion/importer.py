import csv
import glob
import json
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from app.core.database import SessionLocal, Base, engine
from app.models.well import Well
from app.models.inspection import Inspection
from app.models.repair import Repair
from app.models.regulator_event import RegulatorEvent
from app.models.human_note import HumanNote
from app.models.document import Document, DocumentChunk
from app.models.correction import Correction
from app.models.audit import IngestionJob
from app.services.downtime_engine import DEFAULT_TEMP_THRESHOLDS

class DataImporter:
    @classmethod
    def inspect_directory(cls, dir_path: str) -> Dict[str, Any]:
        """Inspects data folder, counts files, records, and identifies schemas without writing to DB."""
        p = Path(dir_path)
        if not p.exists():
            return {"error": f"Path {dir_path} does not exist", "files": []}

        file_reports = []
        for file_path in sorted(p.rglob("*")):
            if file_path.is_file() and not file_path.name.startswith("."):
                rel_path = str(file_path.relative_to(p))
                suffix = file_path.suffix.lower()
                report = {
                    "filename": rel_path,
                    "extension": suffix,
                    "size_bytes": file_path.stat().st_size,
                    "rows_detected": 0,
                    "columns": []
                }
                if suffix == ".csv":
                    try:
                        with open(file_path, "r", encoding="utf-8") as f:
                            reader = csv.reader(f)
                            header = next(reader, [])
                            report["columns"] = header
                            rows = sum(1 for _ in reader)
                            report["rows_detected"] = rows
                    except Exception as e:
                        report["error"] = str(e)
                elif suffix in [".md", ".txt"]:
                    try:
                        with open(file_path, "r", encoding="utf-8") as f:
                            lines = f.readlines()
                            report["rows_detected"] = len(lines)
                            report["columns"] = ["Markdown Text / Document Sections"]
                    except Exception as e:
                        report["error"] = str(e)

                file_reports.append(report)

        return {
            "directory": str(p.resolve()),
            "total_files": len(file_reports),
            "files": file_reports
        }

    @classmethod
    def import_directory(cls, db: Session, dir_path: str) -> Dict[str, Any]:
        """Imports all structured CSVs, markdown manuals, SOPs, and notes from a folder."""
        # Ensure database tables exist
        Base.metadata.create_all(bind=engine)

        p = Path(dir_path)
        if not p.exists():
            return {"error": f"Path {dir_path} does not exist"}

        batch_id = f"BATCH-{uuid.uuid4().hex[:6].upper()}"
        total_imported = 0
        total_failed = 0
        file_summaries = []

        # 0. Ingest FlytBase Asset Dataset Structure if present (assets/WELL-* or fleet/)
        if (p / "assets").exists() or (p / "fleet").exists() or list(p.glob("WELL-*")):
            fb_res = cls.import_flytbase_directory(db, p, batch_id)
            total_imported += fb_res["imported"]
            total_failed += fb_res["failed"]
            file_summaries.extend(fb_res.get("summaries", []))

        # 1. Ingest Wells
        well_files = list(p.glob("*well*.csv")) + list(p.glob("wells.csv"))
        for wf in set(well_files):
            res = cls.import_wells_csv(db, wf, batch_id)
            total_imported += res["imported"]
            total_failed += res["failed"]
            file_summaries.append(res)

        # 2. Ingest Inspections
        insp_files = list(p.glob("*inspection*.csv")) + list(p.glob("inspections.csv"))
        for inf in set(insp_files):
            res = cls.import_inspections_csv(db, inf, batch_id)
            total_imported += res["imported"]
            total_failed += res["failed"]
            file_summaries.append(res)

        # 3. Ingest Repairs
        rep_files = list(p.glob("*repair*.csv")) + list(p.glob("repairs.csv"))
        for rf in set(rep_files):
            res = cls.import_repairs_csv(db, rf, batch_id)
            total_imported += res["imported"]
            total_failed += res["failed"]
            file_summaries.append(res)

        # 4. Ingest Regulator Events
        reg_files = list(p.glob("*regulator*.csv")) + list(p.glob("regulator_events.csv"))
        for rgf in set(reg_files):
            res = cls.import_regulator_events_csv(db, rgf, batch_id)
            total_imported += res["imported"]
            total_failed += res["failed"]
            file_summaries.append(res)

        # 5. Ingest Human Notes
        note_files = list(p.glob("*note*.csv")) + list(p.glob("human_notes.csv"))
        for nf in set(note_files):
            res = cls.import_human_notes_csv(db, nf, batch_id)
            total_imported += res["imported"]
            total_failed += res["failed"]
            file_summaries.append(res)

        # 6. Ingest Corrections
        corr_files = list(p.glob("*correction*.csv")) + list(p.glob("corrections.csv"))
        for cf in set(corr_files):
            res = cls.import_corrections_csv(db, cf, batch_id)
            total_imported += res["imported"]
            total_failed += res["failed"]
            file_summaries.append(res)

        # 7. Ingest Markdown Manuals & SOPs
        doc_files = list(p.rglob("*.md"))
        for df in doc_files:
            if df.name.lower() != "readme.md":
                res = cls.import_markdown_document(db, df, batch_id)
                total_imported += res["imported"]
                total_failed += res["failed"]
                file_summaries.append(res)

        # Record ingestion job
        job = IngestionJob(
            id=batch_id,
            filename=str(p.resolve()),
            file_type="directory_import",
            records_imported=total_imported,
            records_failed=total_failed,
            status="completed" if total_failed == 0 else "partial",
            warnings_json=json.dumps(file_summaries),
            created_at=datetime.now(timezone.utc)
        )
        db.add(job)
        db.commit()

        return {
            "batch_id": batch_id,
            "status": "completed",
            "total_records_imported": total_imported,
            "total_records_failed": total_failed,
            "file_summaries": file_summaries
        }

    @classmethod
    def import_wells_csv(cls, db: Session, file_path: Path, batch_id: str) -> Dict[str, Any]:
        imported, failed = 0, 0
        with open(file_path, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                try:
                    wid = row["id"].strip()
                    existing = db.query(Well).filter(Well.id == wid).first()
                    lat = float(row["latitude"]) if row.get("latitude") else None
                    lng = float(row["longitude"]) if row.get("longitude") else None
                    if not existing:
                        well = Well(
                            id=wid,
                            name=row["name"].strip(),
                            area=row["area"].strip(),
                            field=row["field"].strip(),
                            well_type=row["well_type"].strip(),
                            target_formation=row.get("target_formation", "Unknown"),
                            latitude=lat,
                            longitude=lng,
                            commissioned_date=row.get("commissioned_date"),
                            status=row.get("status", "Active")
                        )
                        db.add(well)
                    else:
                        existing.name = row["name"].strip()
                        existing.area = row["area"].strip()
                        existing.well_type = row["well_type"].strip()
                    imported += 1
                except Exception as e:
                    failed += 1
        db.commit()
        return {"file": file_path.name, "type": "wells", "imported": imported, "failed": failed}

    @classmethod
    def import_inspections_csv(cls, db: Session, file_path: Path, batch_id: str) -> Dict[str, Any]:
        imported, failed = 0, 0
        with open(file_path, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                try:
                    iid = row["id"].strip()
                    existing = db.query(Inspection).filter(Inspection.id == iid).first()
                    is_missed = row.get("is_missed", "false").lower() in ["true", "1", "yes"]
                    if not existing:
                        insp = Inspection(
                            id=iid,
                            well_id=row["well_id"].strip(),
                            inspection_date=row["inspection_date"].strip(),
                            inspector=row.get("inspector"),
                            ambient_temp_f=float(row["ambient_temp_f"]),
                            wellhead_temp_f=float(row["wellhead_temp_f"]),
                            surface_pressure_psi=float(row.get("surface_pressure_psi", 0) or 0),
                            flow_line_pressure_psi=float(row.get("flow_line_pressure_psi", 0) or 0),
                            observed_production_status=row.get("observed_production_status", "Producing").strip(),
                            is_missed=is_missed,
                            notes=row.get("notes"),
                            source_file=file_path.name,
                            import_batch=batch_id
                        )
                        db.add(insp)
                    imported += 1
                except Exception as e:
                    failed += 1
        db.commit()
        return {"file": file_path.name, "type": "inspections", "imported": imported, "failed": failed}

    @classmethod
    def import_repairs_csv(cls, db: Session, file_path: Path, batch_id: str) -> Dict[str, Any]:
        imported, failed = 0, 0
        with open(file_path, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                try:
                    rid = row["id"].strip()
                    existing = db.query(Repair).filter(Repair.id == rid).first()
                    if not existing:
                        rep = Repair(
                            id=rid,
                            well_id=row["well_id"].strip(),
                            start_date=row["start_date"].strip(),
                            end_date=row.get("end_date"),
                            repair_type=row["repair_type"].strip(),
                            cause_category=row.get("cause_category", "Mechanical Failure").strip(),
                            documented_cause=row["documented_cause"].strip(),
                            cost_usd=float(row.get("cost_usd", 0) or 0),
                            technician=row.get("technician"),
                            status=row.get("status", "Completed"),
                            source_file=file_path.name
                        )
                        db.add(rep)
                    imported += 1
                except Exception as e:
                    failed += 1
        db.commit()
        return {"file": file_path.name, "type": "repairs", "imported": imported, "failed": failed}

    @classmethod
    def import_regulator_events_csv(cls, db: Session, file_path: Path, batch_id: str) -> Dict[str, Any]:
        imported, failed = 0, 0
        with open(file_path, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                try:
                    eid = row["id"].strip()
                    existing = db.query(RegulatorEvent).filter(RegulatorEvent.id == eid).first()
                    rep_bool = row.get("reported_to_regulator", "false").lower() in ["true", "1", "yes"]
                    rep_at = row.get("reported_at", "").strip() or None
                    if not existing:
                        event = RegulatorEvent(
                            id=eid,
                            well_id=row["well_id"].strip(),
                            event_type=row.get("event_type", "Spill").strip(),
                            occurred_at=row["occurred_at"].strip(),
                            volume_barrels=float(row["volume_barrels"]),
                            substance=row.get("substance", "Crude Oil").strip(),
                            reported_to_regulator=rep_bool,
                            reported_at=rep_at,
                            regulator_agency=row.get("regulator_agency"),
                            investigation_notes=row.get("investigation_notes"),
                            source_file=file_path.name
                        )
                        db.add(event)
                    imported += 1
                except Exception as e:
                    failed += 1
        db.commit()
        return {"file": file_path.name, "type": "regulator_events", "imported": imported, "failed": failed}

    @classmethod
    def import_human_notes_csv(cls, db: Session, file_path: Path, batch_id: str) -> Dict[str, Any]:
        imported, failed = 0, 0
        with open(file_path, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                try:
                    nid = row["id"].strip()
                    existing = db.query(HumanNote).filter(HumanNote.id == nid).first()
                    if not existing:
                        note = HumanNote(
                            id=nid,
                            well_id=row["well_id"].strip(),
                            author=row["author"].strip(),
                            category=row.get("category", "Operational").strip(),
                            content=row["content"].strip()
                        )
                        db.add(note)
                    imported += 1
                except Exception as e:
                    failed += 1
        db.commit()
        return {"file": file_path.name, "type": "human_notes", "imported": imported, "failed": failed}

    @classmethod
    def import_corrections_csv(cls, db: Session, file_path: Path, batch_id: str) -> Dict[str, Any]:
        imported, failed = 0, 0
        with open(file_path, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                try:
                    cid = row["id"].strip()
                    existing = db.query(Correction).filter(Correction.id == cid).first()
                    if not existing:
                        corr = Correction(
                            id=cid,
                            scope=row["scope"].strip(),
                            target_id=row["target_id"].strip(),
                            target_field=row["target_field"].strip(),
                            original_value=row["original_value"].strip(),
                            corrected_value=row["corrected_value"].strip(),
                            author=row["author"].strip(),
                            reason=row["reason"].strip(),
                            status=row.get("status", "Accepted").strip()
                        )
                        db.add(corr)
                    imported += 1
                except Exception as e:
                    failed += 1
        db.commit()
        return {"file": file_path.name, "type": "corrections", "imported": imported, "failed": failed}

    @classmethod
    def import_markdown_document(cls, db: Session, file_path: Path, batch_id: str) -> Dict[str, Any]:
        imported, failed = 0, 0
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                raw_text = f.read()

            title = file_path.stem.replace("_", " ").title()
            doc_id = f"DOC-{file_path.stem.upper()}"
            category = "sop" if "sop" in file_path.name.lower() else "manual"
            applies_type = None
            if "gas_lift" in file_path.name.lower():
                applies_type = "Gas Lift"
            elif "esp" in file_path.name.lower():
                applies_type = "Electric Submersible Pump"
            elif "rod_pump" in file_path.name.lower():
                applies_type = "Rod Pump"
            elif "flowing" in file_path.name.lower():
                applies_type = "Flowing"

            doc = db.query(Document).filter(Document.id == doc_id).first()
            if not doc:
                doc = Document(
                    id=doc_id,
                    title=title,
                    category=category,
                    file_path=str(file_path),
                    applies_to_well_type=applies_type
                )
                db.add(doc)
                db.commit()

            # Split document into sections by '## '
            sections = raw_text.split("## ")
            for idx, sec in enumerate(sections):
                if not sec.strip():
                    continue
                lines = sec.strip().split("\n")
                sec_title = lines[0].strip().replace("#", "").strip()
                content = "\n".join(lines[1:]).strip() if len(lines) > 1 else lines[0]
                chunk_id = f"{doc_id}-CHK-{idx}"

                chk = db.query(DocumentChunk).filter(DocumentChunk.id == chunk_id).first()
                if not chk:
                    chunk = DocumentChunk(
                        id=chunk_id,
                        document_id=doc_id,
                        chunk_index=idx,
                        section_title=sec_title,
                        content=content
                    )
                    db.add(chunk)
                imported += 1
            db.commit()
        except Exception as e:
            failed += 1
        return {"file": file_path.name, "type": "document_chunks", "imported": imported, "failed": failed}

    @classmethod
    def import_flytbase_directory(cls, db: Session, base_dir: Path, batch_id: str) -> Dict[str, Any]:
        """Imports FlytBase Asset Intelligence format (assets/WELL-*, fleet/areas.json, fleet/sops, fleet/well-types)."""
        imported, failed = 0, 0
        summaries = []

        # 1. Load Area and Team mappings if fleet/areas.json exists
        area_map = {}
        areas_file = base_dir / "fleet" / "areas.json"
        if not areas_file.exists():
            areas_file = base_dir / "areas.json"
        if areas_file.exists():
            try:
                with open(areas_file, "r", encoding="utf-8") as f:
                    areas_data = json.load(f)
                    for a in areas_data.get("areas", []):
                        area_map[a["area_id"]] = a.get("name", a["area_id"])
            except Exception:
                pass

        # 2. Discover well directories
        well_dirs = []
        assets_dir = base_dir / "assets"
        if assets_dir.exists():
            well_dirs.extend([d for d in assets_dir.iterdir() if d.is_dir() and d.name.startswith("WELL-")])
        well_dirs.extend([d for d in base_dir.iterdir() if d.is_dir() and d.name.startswith("WELL-")])
        well_dirs = sorted(list(set(well_dirs)), key=lambda d: d.name)

        well_imported = 0
        insp_imported = 0
        maint_imported = 0
        reg_imported = 0
        note_imported = 0

        for wdir in well_dirs:
            well_id = wdir.name
            well_type = "T200"

            # 2a. Well metadata.json
            meta_path = wdir / "metadata.json"
            if meta_path.exists():
                try:
                    with open(meta_path, "r", encoding="utf-8") as mf:
                        mdata = json.load(mf)
                    well_id = mdata.get("asset_id", well_id)
                    well_type = mdata.get("well_type", "T200")
                    area_id = mdata.get("area_id", "SW-23")
                    area_name = area_map.get(area_id, area_id)
                    loc = mdata.get("location", {})

                    existing_well = db.query(Well).filter(Well.id == well_id).first()
                    if not existing_well:
                        w_obj = Well(
                            id=well_id,
                            name=mdata.get("name", well_id),
                            area=area_name,
                            field="Permian Basin",
                            well_type=well_type,
                            target_formation="Wolfcamp",
                            latitude=float(loc.get("lat", 0.0)) if loc.get("lat") else None,
                            longitude=float(loc.get("lon", 0.0)) if loc.get("lon") else None,
                            commissioned_date=mdata.get("installed_on"),
                            status=mdata.get("recorded_status", "Active").capitalize()
                        )
                        db.add(w_obj)
                    else:
                        existing_well.name = mdata.get("name", existing_well.name)
                        existing_well.area = area_name
                        existing_well.well_type = well_type
                    well_imported += 1
                except Exception:
                    failed += 1

            # 2b. Inspections inspections.jsonl
            insp_path = wdir / "inspections.jsonl"
            if insp_path.exists():
                try:
                    with open(insp_path, "r", encoding="utf-8") as inf:
                        for line in inf:
                            line = line.strip()
                            if not line:
                                continue
                            irow = json.loads(line)
                            iid = irow.get("inspection_id")
                            if not iid:
                                continue
                            existing_i = db.query(Inspection).filter(Inspection.id == iid).first()
                            amb = float(irow.get("ambient_temp_c", 0.0))
                            wh = float(irow.get("wellhead_temp_c", 0.0))
                            thresh = DEFAULT_TEMP_THRESHOLDS.get(well_type, 15.0)
                            is_prod = (wh - amb) >= thresh
                            status_str = "Producing" if is_prod else "Not Producing"

                            if not existing_i:
                                new_insp = Inspection(
                                    id=iid,
                                    well_id=well_id,
                                    inspection_date=irow.get("inspected_at", "")[:10],
                                    inspector=irow.get("inspector_user_id"),
                                    ambient_temp_f=amb,
                                    wellhead_temp_f=wh,
                                    surface_pressure_psi=0.0,
                                    flow_line_pressure_psi=0.0,
                                    observed_production_status=status_str,
                                    is_missed=False,
                                    notes=irow.get("notes"),
                                    source_file=insp_path.name,
                                    import_batch=batch_id
                                )
                                db.add(new_insp)
                            insp_imported += 1

                            # If spill detected, record event
                            if irow.get("spill_detected") and irow.get("spill_est_volume_bbl"):
                                sp_id = f"REG-SPIL-{iid}"
                                if not db.query(RegulatorEvent).filter(RegulatorEvent.id == sp_id).first():
                                    sp_vol = float(irow.get("spill_est_volume_bbl", 0.0))
                                    sp_ev = RegulatorEvent(
                                        id=sp_id,
                                        well_id=well_id,
                                        event_type="Spill",
                                        occurred_at=irow.get("inspected_at", ""),
                                        volume_barrels=sp_vol,
                                        substance="Crude Oil",
                                        reported_to_regulator=False,
                                        regulator_agency="State Oil & Gas Commission",
                                        investigation_notes=f"Spill detected on pad {irow.get('spill_area_pct', 0)}% area. {irow.get('notes', '')}",
                                        source_file=insp_path.name
                                    )
                                    db.add(sp_ev)
                                    reg_imported += 1
                except Exception:
                    failed += 1

            # 2c. Maintenance maintenance.jsonl
            maint_path = wdir / "maintenance.jsonl"
            if maint_path.exists():
                try:
                    with open(maint_path, "r", encoding="utf-8") as mf:
                        for line in mf:
                            line = line.strip()
                            if not line:
                                continue
                            mrow = json.loads(line)
                            mid = mrow.get("maintenance_id")
                            if not mid or db.query(Repair).filter(Repair.id == mid).first():
                                continue
                            cost_val = 0.0
                            if isinstance(mrow.get("cost_usd"), dict):
                                cost_val = float(mrow["cost_usd"].get("total", 0.0) or 0.0)
                            elif mrow.get("cost_usd"):
                                cost_val = float(mrow.get("cost_usd", 0.0) or 0.0)

                            repair = Repair(
                                id=mid,
                                well_id=well_id,
                                start_date=mrow.get("started_at", "")[:10],
                                end_date=mrow.get("completed_at", "")[:10] if mrow.get("completed_at") else None,
                                repair_type=mrow.get("maintenance_type", "corrective").capitalize(),
                                cause_category=mrow.get("equipment_kind", "Mechanical").replace("_", " ").title(),
                                documented_cause=mrow.get("issue", "Repairs performed"),
                                cost_usd=cost_val,
                                technician=mrow.get("technician_user_id"),
                                status="Completed" if mrow.get("completed_at") else "In Progress",
                                source_file=maint_path.name
                            )
                            db.add(repair)
                            maint_imported += 1
                except Exception:
                    failed += 1

            # 2d. Regulatory Events regulatory-events.jsonl
            reg_path = wdir / "regulatory-events.jsonl"
            if reg_path.exists():
                try:
                    with open(reg_path, "r", encoding="utf-8") as rf:
                        for line in rf:
                            line = line.strip()
                            if not line:
                                continue
                            rrow = json.loads(line)
                            rid = rrow.get("event_id")
                            if not rid or db.query(RegulatorEvent).filter(RegulatorEvent.id == rid).first():
                                continue
                            ev_type = rrow.get("event_type", "Notice").replace("_", " ").title()
                            is_filed = "filed" in rrow.get("event_type", "").lower()
                            reg_ev = RegulatorEvent(
                                id=rid,
                                well_id=well_id,
                                event_type=ev_type,
                                occurred_at=rrow.get("date", ""),
                                volume_barrels=0.0,
                                substance="Crude Oil",
                                reported_to_regulator=is_filed,
                                reported_at=rrow.get("date", "") if is_filed else None,
                                regulator_agency=rrow.get("agency"),
                                investigation_notes=rrow.get("detail"),
                                source_file=reg_path.name
                            )
                            db.add(reg_ev)
                            reg_imported += 1
                except Exception:
                    failed += 1

            # 2e. Context context.jsonl (Human notes & Corrections)
            ctx_path = wdir / "context.jsonl"
            if ctx_path.exists():
                try:
                    with open(ctx_path, "r", encoding="utf-8") as cf:
                        for line in cf:
                            line = line.strip()
                            if not line:
                                continue
                            crow = json.loads(line)
                            cid = crow.get("note_id")
                            if not cid:
                                continue
                            if crow.get("note_type") in ["correction", "data_correction"]:
                                if not db.query(Correction).filter(Correction.id == cid).first():
                                    t_field = crow.get("field", "observed_production_status")
                                    orig_val = str(crow.get("original_value", "Spill / Non-Producing"))
                                    corr_val = str(crow.get("corrected_value", "Produced Water / Producing"))
                                    corr = Correction(
                                        id=cid,
                                        scope="record",
                                        target_id=crow.get("inspection_id", well_id),
                                        target_field=t_field,
                                        original_value=orig_val,
                                        corrected_value=corr_val,
                                        author=crow.get("author_user_id", "Field Lead"),
                                        reason=crow.get("text", "Field inspection correction"),
                                        status="Accepted"
                                    )
                                    db.add(corr)
                                    note_imported += 1
                            else:
                                if not db.query(HumanNote).filter(HumanNote.id == cid).first():
                                    hnote = HumanNote(
                                        id=cid,
                                        well_id=well_id,
                                        author=crow.get("author_user_id", "Operator"),
                                        category=crow.get("note_type", "Operational").replace("_", " ").title(),
                                        content=crow.get("text", "")
                                    )
                                    db.add(hnote)
                                    note_imported += 1
                except Exception:
                    failed += 1

        db.commit()
        total_fb = well_imported + insp_imported + maint_imported + reg_imported + note_imported
        summaries.append({"file": "flytbase_assets", "type": "assets", "imported": total_fb, "failed": failed})
        return {"imported": total_fb, "failed": failed, "summaries": summaries}

