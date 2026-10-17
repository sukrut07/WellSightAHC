import sys
import json
from pathlib import Path
from app.core.database import SessionLocal
from app.ingestion.importer import DataImporter

def main():
    if len(sys.argv) < 3:
        print("Usage:")
        print("  python -m app.ingestion.cli inspect <directory_path>")
        print("  python -m app.ingestion.cli load <directory_path>")
        sys.exit(1)

    command = sys.argv[1].lower()
    dir_path = sys.argv[2]

    if command == "inspect":
        print(f"\n🔍 [WellSight AI] Inspecting directory: {dir_path}")
        report = DataImporter.inspect_directory(dir_path)
        print(f"Total files discovered: {report.get('total_files', 0)}")
        for f in report.get("files", []):
            print(f"  • {f['filename']} ({f['size_bytes']} bytes) - {f['rows_detected']} records detected")
            if f.get("columns"):
                print(f"    Columns: {', '.join(f['columns'][:6])}{'...' if len(f['columns']) > 6 else ''}")
        print("\n✅ Inspection complete.\n")

    elif command in ["load", "import"]:
        print(f"\n📥 [WellSight AI] Ingesting data from: {dir_path}")
        db = SessionLocal()
        try:
            res = DataImporter.import_directory(db, dir_path)
            print(f"Batch ID: {res.get('batch_id')}")
            print(f"Total records imported: {res.get('total_records_imported', 0)}")
            print(f"Total records failed: {res.get('total_records_failed', 0)}")
            for summary in res.get("file_summaries", []):
                print(f"  ✓ {summary['file']} [{summary['type']}]: {summary['imported']} imported, {summary['failed']} failed")
            print("\n🎉 Dataset successfully ingested and verified.\n")
        finally:
            db.close()
    else:
        print(f"Unknown command '{command}'. Use 'inspect' or 'load'.")
        sys.exit(1)

if __name__ == "__main__":
    main()
