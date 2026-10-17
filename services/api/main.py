import os
import sys
from pathlib import Path

# Ensure services/api root is in sys.path so 'from app.main import app' works reliably in Vercel
current_dir = Path(__file__).resolve().parent
if str(current_dir) not in sys.path:
    sys.path.insert(0, str(current_dir))

from app.main import app

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
