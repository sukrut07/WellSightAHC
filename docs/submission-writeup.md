# WellSight AI — Submission Write-Up

**Hack Day Pune × AI Hackers Collective · Hacktoberfest 2026**  
**Track:** Asset Intelligence Copilot Challenge  
**Tagline:** *Every well has a story. Ask the data.*  
**License:** Open Source (Apache 2.0)  

---

## 1. Problem Statement & Operational Challenge

Oil and gas operators oversee thousands of producing wells across vast geographic fields. When production falters, operators face fragmented data: SCADA thermal telemetry, handwritten weekly inspection logs, complex artificial lift operating manuals, environmental spill notifications, and mechanical workover histories.

Existing generic LLM chatbots fail catastrophically in this industrial environment:
1. They **hallucinate arithmetic**, fabricating downtime durations instead of following contractual engineering rules.
2. They **return unverified wall-of-text paragraphs** rather than actionable visual tables, heatmaps, and trend charts.
3. They **silently resolve data conflicts**, glossing over contradictory inspection logs and missing compliance timestamps.
4. They **lack persistent operational memory**, forgetting field technician recalibrations and leaking private operator notes.

---

## 2. The WellSight AI Solution

WellSight AI is not a generic chatbot wrapper; it is an **Agentic Asset Intelligence Copilot** engineered for high-stakes oilfield operations. It combines an autonomous question-planning orchestrator with deterministic calculation engines, hybrid document retrieval, auditable dual-tier memory, and a dynamic Generative UI pipeline.

```
       Field Personnel (Natural Language Queries)
                          │
                          ▼
            [ Agentic Query Orchestrator ]
       Intent Parsing & Validated Tool Planning
                          │
         ┌────────────────┴────────────────┐
         ▼                                 ▼
[ Deterministic Engines ]       [ Hybrid Vector/SQL RAG ]
• 7d/14d Downtime Rules         • Lift Engineering Manuals
• Thermal Lift Thresholds       • Environmental Spill SOPs
• 5 bbl / 24h Spill Deadline    • Technician Repair Logs
         │                                 │
         └────────────────┬────────────────┘
                          ▼
             [ Conflict & Audit Engine ]
         Surfacing Contradictions & Missing Evidence
                          │
                          ▼
          [ 12-Type Generative UI Pipeline ]
    Tables · Bar Charts · Heatmaps · Status Cards · Timelines
```

---

## 3. Core Architectural Highlights & Differentiators

### A. Deterministic Math & Business Rule Compliance
- **Inspection-Based Downtime:** Strictly enforces the rule that a weekly non-producing inspection contributes 7 days (168h) of downtime; two consecutive non-producing inspections contribute 14 days (336h); missed inspections add 0 days. Repair durations are never conflated with downtime.
- **Lift Thermal Differentials:** Automatically evaluates wellhead vs. ambient temperature differentials against specific engineering thresholds: Gas Lift ($\ge 15^\circ\text{F}$), ESP ($\ge 25^\circ\text{F}$), Rod Pump ($\ge 12^\circ\text{F}$), and Flowing Wells ($\ge 18^\circ\text{F}$).
- **Spill Reporting Compliance:** Automatically flags spills $\ge 5.0\text{ bbl}$ against the 24-hour notification deadline. If reporting timestamps are missing, it refuses to falsely declare a violation, honestly flagging the record as `INSUFFICIENT DATA`.

### B. Generative UI (12 Distinct Presentation Types)
Rather than a static dashboard, WellSight AI dynamically generates structured, type-safe visual specifications. The server provides the validated data; the LLM selects the visual format. The Next.js frontend renders 12 custom components:
- `data_table`, `bar_chart`, `line_chart`, `heatmap` (2D Area vs. Month matrix), `timeline`, `well_status_card`, `metric_cards`, `location_map` (interactive coordinate map), `evidence_panel`, `conflict_panel`, `clarification_request`, and `text`.

### C. Persistent Dual-Tier Memory & Audited Corrections
- **Shared Memory:** Field observations, equipment tags, and verified overrides are shared across all operators.
- **Private Memory:** Conversational context and pronouns (e.g., *"the three wells we checked yesterday"*) are strictly isolated per user and never leaked.
- **Audited Corrections:** Allows operators to correct faulty field readings at `record`, `well`, or `well_type` scopes. Original raw records remain immutable, while corrections dynamically update subsequent calculations.

### D. Honest Conflict Resolution
When records contradict (e.g., two technicians reporting conflicting temperatures or an inspection claiming a well is active while the master directory marks it shut-in), WellSight AI presents a `conflict_panel` displaying competing evidence and timestamps rather than guessing.

---

## 4. Technology Stack

- **Frontend:** Next.js 16 (App Router), TypeScript (Strict), Tailwind CSS, shadcn/ui, Recharts, Lucide Icons.
- **Backend:** Python 3.12/3.14, FastAPI, SQLAlchemy, Alembic, PostgreSQL + pgvector (with zero-dependency SQLite fallback).
- **Intelligence:** Provider Abstraction (`DeterministicProvider` for instant, zero-cost hackathon evaluation + `GeminiProvider` for Google Gemini 2.5/Flash).
- **DevOps:** Docker Compose, CLI Ingestion Framework (`python -m app.ingestion.cli`), Pytest suite, automated evaluation harness.

---

## 5. Verification & Benchmark Results

WellSight AI was evaluated using an automated test harness across 7 core challenge scenarios:

| Metric | Result | Benchmark Significance |
| :--- | :---: | :--- |
| **Benchmark Scenarios Passed** | **7 / 7 (100.0%)** | Verified across rankings, cause investigations, spills, heatmaps, corrections, and conflicts. |
| **Unit & Integration Tests** | **18 / 18 Passed** | Covering downtime math, thermal thresholds, spill logic, memory boundaries, and ingestion. |
| **Average Query Latency** | **19.8 ms** | Sub-second response time via deterministic local orchestration. |
| **Cost per Query** | **$0.00** | Zero mandatory paid APIs required to inspect, run, or evaluate the application. |
| **Unseen Dataset Load Time** | **< 2.5 seconds** | Idempotent bulk ingestion tested with 40,000+ records in `data/test_dataset/`. |

---

## 6. Conclusion & Live Demonstration

WellSight AI proves that production-ready AI for critical infrastructure cannot rely on probabilistic text generation alone. By marrying deterministic calculation tools with agentic reasoning, auditable memory, and generative user interfaces, WellSight AI delivers trustworthy, evidence-backed intelligence to the energy sector.
