# WellSight AI — Asset Intelligence Copilot

<div align="center">

**Hacktoberfest 2026 | Hack Day Pune × AI Hackers Collective**  
*Asset Intelligence Copilot Challenge*

[![License: Apache-2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
[![Python](https://img.shields.io/badge/Python-3.12%20%7C%203.14-blue?logo=python&logoColor=white)](services/api/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?logo=fastapi&logoColor=white)](services/api/)
[![Next.js](https://img.shields.io/badge/Next.js-16%20(App%20Router)-black?logo=next.js&logoColor=white)](apps/web/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue?logo=typescript&logoColor=white)](apps/web/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?logo=tailwind-css&logoColor=white)](apps/web/)
[![Evaluation Benchmark](https://img.shields.io/badge/Benchmark%20Eval-7%2F7%20Passed%20(100%25)-brightgreen)](docs/evaluation.md)

### *“Every well has a story. Ask the data.”*

An Agentic AI operations assistant for oil and gas field personnel that retrieves real records, computes downtime deterministically, remembers sensor corrections with full audit trails, resolves conflicting data honestly, and dynamically generates interactive visualizations.

[System Architecture](docs/architecture.md) · [System Design](docs/system-design.md) · [Business Rules](docs/business-rules.md) · [Evaluation Report](docs/evaluation.md) · [Demo Video Script](docs/demo-video-script.md) · [Submission Write-up](docs/submission-writeup.md)

</div>

---

## 🌟 Why WellSight AI?

In complex oilfield operations, generic LLMs fail catastrophically: they hallucinate arithmetic, confuse repair duration with well downtime, leak private operator notes, and fabricate answers when records conflict.

**WellSight AI is architected differently:**
1. **Deterministic Calculation, Probabilistic Language:** Math, downtime rankings, and compliance evaluations are executed exclusively by verified Python and SQL engines—never guessed by an LLM.
2. **Generative UI (12 Visual Types):** The copilot dynamically renders interactive data tables, bar charts, line charts, heatmaps, timelines, status cards, and location maps directly in conversation.
3. **Persistent Dual-Tier Memory:** Verified well knowledge and field corrections are shared across all operators; conversational history and query context remain strictly isolated per user.
4. **Honest Conflict Resolution:** When records contradict or reporting evidence is missing, WellSight AI refuses to guess; it explicitly surfaces the ambiguity in a highlighted `conflict_panel`.
5. **Zero-Cost & Offline-First:** Runs immediately with zero paid API keys via a local `DeterministicProvider` (< 30ms latency), with seamless cloud fallback to Google Gemini when configured.

---

## 🏛️ System Architecture

```mermaid
flowchart TD
    subgraph Client["Next.js 16 Web Application"]
        UI[Copilot Multi-Modal Chat]
        GenUI[Generative UI Renderer\n(12 Visual Types)]
        EvidenceDrawer[Evidence & Citation Drawer]
        CorrectionModal[Correction Submission Form]
        UserSwitcher[Operator Context Switcher]
    end

    subgraph API["FastAPI Backend Service"]
        Router[API Gateway & Router]
        Orchestrator[Agent Orchestrator]
        Planner[Validated Query Planner]
        ToolRegistry[16 Typed Tools]
        ConflictEngine[Conflict Detection Engine]
    end

    subgraph Engines["Deterministic Core Engines"]
        DowntimeEngine[Downtime Engine\n(7d / 14d / Thermal Thresholds)]
        SpillEngine[Spill Compliance Engine\n(5 bbl / 24h Deadline)]
        MemoryService[Dual Memory Service\n(Shared vs Private)]
        RetrievalService[Hybrid RAG & Chunk Matcher]
    end

    subgraph Storage["Persistence Layer"]
        DB[(Relational DB: SQLite / PostgreSQL)]
        Docs[(Document Chunks & Embeddings)]
        Corrections[(Immutable Raw Records & Corrections)]
        Memory[(Shared Well Context & Private Chats)]
    end

    UI -->|Query + User ID| Router
    Router --> Orchestrator
    Orchestrator --> MemoryService
    Orchestrator --> ToolRegistry
    ToolRegistry --> Engines
    Engines --> Storage
    Engines --> ConflictEngine
    ConflictEngine --> Orchestrator
    Orchestrator -->|Answer + Citations + Validated Spec| Router
    Router --> GenUI
    Router --> EvidenceDrawer
    CorrectionModal -->|Submit Scoped Override| Router
```

---

## 📊 12 Generative UI Types

Rather than static text, WellSight AI dynamically selects and generates structured visualization specifications:

| Visual Type | Description | Trigger Example |
| :--- | :--- | :--- |
| `data_table` | Sortable, paginated tabular view with record badges | *"Which wells in Area A had the longest downtime?"* |
| `bar_chart` | Categorical bar chart with formatted units | *"Compare repair costs across areas for Q3."* |
| `line_chart` | Temporal metric trend with operational threshold markers | *"Show wellhead temperature trends over August."* |
| `heatmap` | 2D matrix (e.g., Area vs. Month) with gradient intensity | *"Show monthly downtime by area as a heatmap."* |
| `timeline` | Chronological operational lifecycle with status badges | *"Show the full repair and inspection timeline for WELL-0007."* |
| `well_status_card` | Asset telemetry card with live thermal differential | *"Why was WELL-0007 not producing?"* |
| `metric_cards` | KPI metric grid with delta comparisons | *"Give me an executive summary of Area A performance."* |
| `location_map` | Interactive SVG field map with coordinate pins | *"Show the spatial distribution of wells in South Basin."* |
| `evidence_panel` | Document excerpt drawer with source file links | *"What is the operating manual rule for Gas Lift wells?"* |
| `conflict_panel` | Highlighted comparison of contradictory records | *"Which records conflict regarding the August spill?"* |
| `clarification_request` | Follow-up action cards for ambiguous queries | *"Check downtime" (ambiguous area/dates)* |
| `text` | Clean Markdown fallback with citations | General rule explanations and operational queries |

---

## 🚀 Quick Start Guide

### Prerequisites
- Python 3.12+ (or 3.14)
- Node.js 18+ and `npm`
- (Optional) Docker & Docker Compose

### Option 1: One-Click Development Launcher (Recommended)

Clone the repository and launch both the backend API and Next.js frontend with the automated launcher:

```bash
git clone https://github.com/sukrutdusane/wellsight-ai.git
cd wellsight-ai

# Make script executable and launch
chmod +x scripts/dev.sh
./scripts/dev.sh
```

- **Frontend:** [http://localhost:3000](http://localhost:3000)
- **Backend API Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)
- **Health Check:** [http://localhost:8000/api/health](http://localhost:8000/api/health)

---

### Option 2: Docker Compose

```bash
docker-compose up --build
```

---

### Option 3: Manual Step-by-Step Setup

#### 1. Backend Setup
```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r services/api/requirements.txt

# Inspect and load initial production dataset
cd services/api
python -m app.ingestion.cli inspect ../../data
python -m app.ingestion.cli load ../../data

# Start FastAPI server
uvicorn app.main:app --reload --port 8000
```

#### 2. Frontend Setup
```bash
cd apps/web
npm install
npm run dev -- --port 3000
```

---

## 🛠️ CLI Ingestion Pipeline & Test Datasets

WellSight AI includes an extensible CLI for inspecting and loading arbitrary datasets (including the late-release unseen test dataset):

```bash
# Activate Python environment
source .venv/bin/activate
export PYTHONPATH=$PYTHONPATH:$(pwd)/services/api

# 1. Inspect any dataset directory (schema, row counts, null checks)
python -m app.ingestion.cli inspect ./data

# 2. Ingest the primary dataset
python -m app.ingestion.cli load ./data

# 3. Ingest late-release test datasets without changing any application code
python -m app.ingestion.cli load ./data/test_dataset
```

---

## 🧪 Automated Benchmark Evaluation

We provide a repeatable evaluation harness (`scripts/run_eval.py`) that tests all 7 core challenge scenarios:

```bash
python scripts/run_eval.py
```

### Evaluation Output:
```text
================================================================================
WELLSIGHT AI — BENCHMARK EVALUATION HARNESS
Asset Intelligence Copilot · Hacktoberfest 2026
================================================================================

[PASS] Q1: Area A Downtime Ranking (Table)
       Plan: calculate_well_downtime (area='Area A', date_range='Summer 2026')
       Visual: data_table (valid=True) | Citations: 3 | Latency: 24.1ms

[PASS] Q2: Root Cause Investigation for WELL-0007 (Status Card)
       Plan: get_inspection_history, get_repair_history, search_manuals
       Visual: well_status_card (valid=True) | Citations: 4 | Latency: 18.2ms

[PASS] Q3: 24h Spill Reporting Compliance (Table)
       Plan: find_spill_reporting_violations (date_range='Last 90 days')
       Visual: data_table (valid=True) | Citations: 4 | Latency: 16.5ms

[PASS] Q4: Repair Costs Cross-Area Comparison (Bar Chart)
       Plan: calculate_repair_costs (area='All', group_by='area')
       Visual: bar_chart (valid=True) | Citations: 1 | Latency: 15.3ms

[PASS] Q5: Monthly Downtime by Area (Heatmap)
       Plan: calculate_well_downtime (area='All')
       Visual: heatmap (valid=True) | Citations: 1 | Latency: 22.0ms

[PASS] Q6: Persistent Audited Correction Impact (Evidence Panel)
       Plan: get_applicable_corrections, calculate_well_downtime
       Visual: evidence_panel (valid=True) | Citations: 2 | Latency: 21.4ms

[PASS] Q7: Surfacing Contradictions & Missing Evidence (Conflict Panel)
       Plan: detect_data_conflicts, find_spill_reporting_violations
       Visual: conflict_panel (valid=True) | Citations: 2 | Latency: 19.6ms

--------------------------------------------------------------------------------
Benchmark Summary: 7 / 7 passed (100.0%) | Total Time: 137.1ms | Cost: $0.00
================================================================================
```

---

## 🧪 Backend Unit & Integration Tests

Run the complete pytest test suite:

```bash
pytest tests/backend/ -v
```

All **18 test suites pass**, covering:
- 7-day rule for non-producing weekly inspections
- 14-day rule for consecutive non-producing inspections
- 0-day rule for missed inspections
- Lift-specific thermal thresholds (Gas Lift 15°F, ESP 25°F, Rod Pump 12°F, Flowing 18°F)
- Spill compliance ($\ge 5$ bbl in 24h, handling of missing reporting timestamps)
- Correction scoping (record vs well vs well-type) and raw immutability
- Strict private memory isolation across operators

---

## 🖥️ Application Pages Overview

| Route | Page Name | Purpose & Capabilities |
| :--- | :--- | :--- |
| `/` | **Operations Overview** | Real-time asset health KPIs, fleet downtime trends, and quick query launchers. |
| `/copilot` | **Copilot Chat** | Multi-modal conversation panel with tool traces, citations, and 12 Generative UI types. |
| `/wells` | **Asset Directory** | Searchable directory with area/lift-type filters, production statuses, and CSV export. |
| `/wells/[id]` | **Well Profile** | Comprehensive profile with thermal telemetry, maintenance logs, and shared notes. |
| `/analytics` | **Analytics Hub** | Query-driven downtime comparisons, repair expenditure analysis, and 2D heatmaps. |
| `/evidence` | **Evidence Browser** | Searchable document database (Gas Lift/ESP manuals, Spill SOPs, repair reports). |
| `/corrections` | **Correction Registry** | Immutable audit log of all sensor overrides with author, reason, and status. |
| `/audit` | **System & Conflict Audit** | Tool execution traces, ingestion batch logs, and active conflict reports. |
| `/settings` | **Settings & Providers** | Active provider configuration, demo operator switcher, and re-ingest controls. |

---

## 📁 Repository Monorepo Structure

```text
wellsight-ai/
├── apps/
│   └── web/                         # Next.js 16 + TypeScript Frontend
│       ├── src/
│       │   ├── app/                 # 9 App Router pages
│       │   ├── components/          # Shell, Navigation, Modals, Evidence Drawer
│       │   │   └── generative-ui/   # 12 Type-Safe Generative UI Renderers
│       │   ├── lib/                 # Typed API client
│       │   └── types/               # TypeScript Discriminated Unions
│       ├── package.json
│       └── Dockerfile
├── services/
│   └── api/                         # FastAPI Python Backend
│       ├── app/
│       │   ├── api/routes/          # Modular endpoints (health, copilot, wells, etc.)
│       │   ├── core/                # Database config & settings
│       │   ├── models/              # SQLAlchemy models (Wells, Inspections, etc.)
│       │   ├── schemas/             # Pydantic schemas (Generative UI, Copilot)
│       │   ├── services/            # DowntimeEngine, SpillEngine, ConflictEngine
│       │   ├── tools/               # 16 Typed Analytical & Retrieval Tools
│       │   ├── providers/           # Provider Abstraction (Deterministic + Gemini)
│       │   └── ingestion/           # Data Importer & CLI (`inspect`/`load`)
│       ├── requirements.txt
│       └── Dockerfile
├── data/                            # Production Data & Test Fixtures
│   ├── manuals/                     # Operating manuals (Gas Lift, ESP, etc.)
│   ├── sops/                        # Spill Reporting SOPs
│   ├── sample_*.csv                 # Realistic production datasets
│   └── test_dataset/                # Late-release unseen test dataset fixture
├── docs/                            # Comprehensive Documentation
│   ├── architecture.md              # System Architecture & Mermaid Diagrams
│   ├── system-design.md             # Data Models, Tools & Ingestion Design
│   ├── business-rules.md            # Exact Mathematical & Compliance Rules
│   ├── evaluation.md                # Benchmark Evaluation & Test Results
│   ├── submission-writeup.md         # 2-Page Hackathon Submission Write-up
│   └── demo-video-script.md         # 5-Minute Timed Video Script (6 Scenarios)
├── scripts/
│   ├── dev.sh                       # One-click dev launcher
│   └── run_eval.py                  # Evaluation benchmark harness
├── tests/
│   └── backend/                     # 18 Pytest unit & integration tests
├── docker-compose.yml
├── .env.example
├── LICENSE                          # Apache 2.0
└── README.md
```

---

## 📜 Open Source License

This project is licensed under the **Apache License 2.0**. See the [LICENSE](LICENSE) file for complete terms.

---

<div align="center">
Built with passion for <b>Hacktoberfest 2026 | Hack Day Pune × AI Hackers Collective</b>.
</div>
