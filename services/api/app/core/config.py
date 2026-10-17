import os
import shutil
import gzip
from pathlib import Path
from pydantic import BaseModel

BASE_DIR = Path(__file__).resolve().parent.parent.parent

# Resolve data directory (handles both local repo root and docker/package layouts)
DATA_DIR = BASE_DIR.parent / "data"
if not DATA_DIR.exists():
    DATA_DIR = BASE_DIR.parent.parent / "data"

# Auto-load .env files
def _load_env():
    # 1. Try python-dotenv if available
    try:
        from dotenv import load_dotenv
        for p in [BASE_DIR / ".env", BASE_DIR.parent / ".env", Path.cwd() / ".env"]:
            if p.exists():
                load_dotenv(p)
    except ImportError:
        pass

    # 2. Builtin fallback parser to guarantee .env is read even before dependencies install
    for p in [BASE_DIR / ".env", BASE_DIR.parent / ".env", Path.cwd() / ".env"]:
        if p.exists():
            try:
                with open(p, "r", encoding="utf-8") as f:
                    for line in f:
                        line = line.strip()
                        if not line or line.startswith("#") or "=" not in line:
                            continue
                        key, val = line.split("=", 1)
                        key = key.strip()
                        val = val.strip().strip("'\"")
                        if key and key not in os.environ:
                            os.environ[key] = val
            except Exception:
                pass

_load_env()

def resolve_database_url() -> str:
    custom_url = os.getenv("DATABASE_URL")
    if custom_url:
        return custom_url

    # Check for Serverless / Read-Only environment (Vercel, AWS Lambda, etc.)
    is_serverless = bool(os.getenv("VERCEL") or os.getenv("AWS_LAMBDA_FUNCTION_NAME") or os.getenv("SERVERLESS"))

    if is_serverless:
        tmp_db = Path("/tmp/wellsight.db")
        # If /tmp/wellsight.db doesn't exist or is empty, unpack from wellsight.db.gz
        if not tmp_db.exists() or tmp_db.stat().st_size == 0:
            gz_path = BASE_DIR / "wellsight.db.gz"
            raw_db_path = BASE_DIR / "wellsight.db"
            if gz_path.exists():
                try:
                    with gzip.open(gz_path, "rb") as f_in, open(tmp_db, "wb") as f_out:
                        shutil.copyfileobj(f_in, f_out)
                except Exception as e:
                    print(f"⚠️ [WellSight AI] Error unpacking database: {e}")
            elif raw_db_path.exists():
                try:
                    shutil.copy2(raw_db_path, tmp_db)
                except Exception as e:
                    print(f"⚠️ [WellSight AI] Error copying database: {e}")
        return f"sqlite:///{tmp_db}"
    else:
        # Local development / Docker
        local_db = BASE_DIR / "wellsight.db"
        if not local_db.exists() or local_db.stat().st_size == 0:
            gz_path = BASE_DIR / "wellsight.db.gz"
            if gz_path.exists():
                try:
                    with gzip.open(gz_path, "rb") as f_in, open(local_db, "wb") as f_out:
                        shutil.copyfileobj(f_in, f_out)
                except Exception as e:
                    print(f"⚠️ [WellSight AI] Error unpacking local database: {e}")
        return f"sqlite:///{local_db}"

class Settings(BaseModel):
    PROJECT_NAME: str = "WellSight AI"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    
    # Database
    DATABASE_URL: str = resolve_database_url()
    
    # AI Providers (Google Gemini & Gemma via Google AI Studio API)
    GEMINI_API_KEY: str = os.getenv(
        "GEMINI_API_KEY", 
        os.getenv("GOOGLE_API_KEY", os.getenv("GEMMA_API_KEY", ""))
    )
    GEMINI_MODEL: str = os.getenv(
        "GEMINI_MODEL", 
        os.getenv("GEMMA_MODEL", "gemini-2.5-flash")
    )
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    OPENAI_MODEL: str = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    AI_PROVIDER: str = os.getenv("AI_PROVIDER", "auto")  # 'gemini', 'openai', 'deterministic', 'auto'
    
    # Paths
    BASE_DIR: Path = BASE_DIR
    DATA_DIR: Path = DATA_DIR

settings = Settings()
