#!/bin/bash
set -e

echo "=================================================="
echo "⚡ Starting WellSight AI Full-Stack Platform"
echo "=================================================="

# Ensure database is initialized
echo "1. Checking database and initial dataset..."
PYTHONPATH=services/api .venv/bin/python3 -m app.ingestion.cli load ./data

# Function to kill child processes on exit
cleanup() {
  echo ""
  echo "Shutting down WellSight AI servers..."
  kill $(jobs -p) 2>/dev/null || true
  exit 0
}
trap cleanup SIGINT SIGTERM EXIT

# Start FastAPI backend
echo "2. Launching FastAPI Backend on http://localhost:8000..."
(
  PYTHONPATH=services/api .venv/bin/python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
) &

# Start Next.js frontend
echo "3. Launching Next.js Frontend on http://localhost:3000..."
(
  cd apps/web && npm run dev -- -p 3000
) &

echo "=================================================="
echo "✨ WellSight AI is running!"
echo "   Frontend Web UI:   http://localhost:3000"
echo "   FastAPI Swagger:   http://localhost:8000/docs"
echo "   Health Endpoint:   http://localhost:8000/api/health"
echo "=================================================="
echo "Press Ctrl+C to stop both servers."

wait
