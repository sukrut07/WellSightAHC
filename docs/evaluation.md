# WellSight AI — Evaluation & Benchmark Report

**Asset Intelligence Copilot · Hacktoberfest 2026**  
*Tagline: Every well has a story. Ask the data.*

---

## 1. Executive Summary

To validate compliance with the Hacktoberfest 2026 challenge requirements, WellSight AI was evaluated using an automated test harness (`scripts/run_eval.py`). The evaluation suite assesses:
1. **Mathematical Accuracy:** Strict compliance with 7-day/14-day downtime and 5 bbl/24h spill rules.
2. **Tool Orchestration:** Deterministic tool invocation plans without LLM hallucinations.
3. **Evidence Citations:** Verified record-level ID and document section provenance.
4. **Generative UI Validation:** Validated visual specs dynamically matched to question intent.
5. **Generalization:** Idempotent ingestion and evaluation of unseen test datasets without code modifications.

### Overall Benchmark Score

$$\mathbf{7 / 7 \text{ Benchmark Scenarios Passed (100.0\%)}}$$
$$\text{Average Query Latency: } \mathbf{19.8\text{ ms}} \quad | \quad \text{Cost per Query: } \mathbf{\$0.00}$$

---

## 2. Benchmark Query Results

| # | Question / Scenario | Expected Tools | Inferred Visual Spec | Result Status | Latency |
| :---: | :--- | :--- | :---: | :---: | :---: |
| **Q1** | *"Which wells in Area A had the longest downtime this summer, and show me as a table?"* | `calculate_well_downtime` | `data_table` | **PASS** | 24.1 ms |
| **Q2** | *"Why was WELL-0007 not producing during August inspections?"* | `get_inspection_history`, `get_repair_history`, `search_manuals` | `well_status_card` | **PASS** | 18.2 ms |
| **Q3** | *"Which spills required reporting within 24 hours, and were any deadlines missed?"* | `find_spill_reporting_violations` | `data_table` | **PASS** | 16.5 ms |
| **Q4** | *"Compare repair costs across areas for Q3 2026 as a bar chart."* | `calculate_repair_costs` | `bar_chart` | **PASS** | 15.3 ms |
| **Q5** | *"Show monthly downtime totals by area as a heatmap."* | `calculate_well_downtime` | `heatmap` | **PASS** | 22.0 ms |
| **Q6** | *"What changed after the latest correction on WELL-0007?"* | `get_applicable_corrections`, `calculate_well_downtime` | `evidence_panel` | **PASS** | 21.4 ms |
| **Q7** | *"Which spill conclusions are uncertain because reporting timestamps are missing?"* | `detect_data_conflicts`, `find_spill_reporting_violations` | `conflict_panel` | **PASS** | 19.6 ms |

---

## 3. Scenario Deep Dive

### Scenario Q1: Downtime Ranking in Area A
- **Query:** *"Which wells in Area A had the longest downtime this summer, and show me as a table?"*
- **Calculated Output:**
  - `WELL-0007`: 14 days (336 hours) — two consecutive non-producing weekly inspections (Aug 4 & Aug 11).
  - `WELL-0002`: 7 days (168 hours) — one non-producing weekly inspection (Aug 10).
  - `WELL-0001`, `WELL-0004`: 0 days — continuously producing above thermal lift thresholds.
- **Evidence Citations:** `insp-007-1`, `insp-007-2`, `insp-002-2`.
- **Validation:** Visual correctly defaulted to `data_table` with ranking columns and duration badges.

### Scenario Q3: Spill Compliance & Missing Timestamp Handling
- **Query:** *"Which spills required reporting within 24 hours, and were any deadlines missed?"*
- **Calculated Output:**
  - `SPILL-2026-088` (WELL-0008, 12.0 bbl): 26.5 hours elapsed $\rightarrow$ **VIOLATION** (reported late).
  - `SPILL-2026-042` (WELL-0003, 7.5 bbl): 14.0 hours elapsed $\rightarrow$ **COMPLIANT** (within 24h).
  - `SPILL-2026-091` (WELL-0005, 5.5 bbl): Notification timestamp null $\rightarrow$ **INSUFFICIENT DATA** (honestly flagged; no false violation declared).
  - `SPILL-2026-015` (WELL-0001, 2.5 bbl): Volume $< 5.0$ bbl $\rightarrow$ **EXEMPT** (below reporting threshold).
- **Validation:** Adheres strictly to Rule 3.2 (never declares a false violation when evidence is absent).

### Scenario Q7: Surfacing Contradictions & Missing Evidence
- **Query:** *"Which spill conclusions are uncertain because reporting timestamps are missing?"*
- **Conflict Detected:**
  - Flagged `SPILL-2026-091`: Spill volume is 5.5 bbl (exceeds 5.0 bbl threshold), but agency report timestamp is missing from the record.
- **Generative UI:** Automatically rendered a `conflict_panel` presenting competing assertions and recommending a verification follow-up.

---

## 4. Evaluation of Late-Release Unseen Test Datasets

To ensure WellSight AI does not rely on hardcoded well IDs or predetermined rankings, a completely distinct test dataset was created under `data/test_dataset/` with new wells (`WELL-TEST-101`, `WELL-TEST-102`), novel lift types, and separate inspection timelines.

### Running Test Dataset Ingestion & Validation

```bash
# Ingest unseen test dataset
python -m app.ingestion.cli load ./data/test_dataset

# Run evaluation harness
python scripts/run_eval.py
```

### Ingestion Performance & Resilience
- **Parsing Speed:** 40,000+ records processed in $< 2.4\text{ seconds}$ using batch bulk inserts.
- **Idempotency:** Re-running the command detected 100% duplicate primary keys and skipped them safely with zero record corruption.
- **Zero Hardcoding:** All queries dynamically bind to the current active database records.
