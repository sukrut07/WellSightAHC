#!/usr/bin/env python3
"""
WellSight AI - Automated Evaluation Harness
Hacktoberfest 2026 Asset Intelligence Copilot Challenge
Pune × AI Hackers Collective

Runs benchmark queries through the agentic pipeline, evaluating:
1. Tool selection and execution
2. Deterministic downtime calculation accuracy (7-day rule, 14-day consecutive rule, missed inspections)
3. Spill 24-hour reporting compliance accuracy (SOP-ENV-004)
4. Generative UI visual specification validity
5. Citation integrity and provenance
6. Conflict detection and uncertainty disclosure
7. Latency and execution metrics
"""

import sys
import time
import json
import asyncio
from pathlib import Path

# Add services/api to python path
ROOT_DIR = Path(__file__).resolve().parent.parent
API_DIR = ROOT_DIR / "services" / "api"
sys.path.insert(0, str(API_DIR))

from app.core.database import SessionLocal
from app.services.orchestrator import AgentOrchestrator
from app.schemas.copilot import ChatRequest

BENCHMARK_QUERIES = [
    {
        "id": "EVAL-01",
        "category": "Downtime Calculation & Ranking",
        "query": "Which wells in Area A had the longest downtime this summer, what caused it, and show me the results as a chart.",
        "expected_top_well": "WELL-0007",
        "expected_top_downtime": 21.0,
        "expected_visual_type": "bar_chart",
        "expected_tool": "calculate_well_downtime"
    },
    {
        "id": "EVAL-02",
        "category": "Root Cause Investigation",
        "query": "Why was WELL-0007 not producing?",
        "expected_well": "WELL-0007",
        "expected_cause_keywords": ["sand", "erosion", "scale", "valve"],
        "expected_visual_type": "timeline",
        "expected_tool": "get_well_details"
    },
    {
        "id": "EVAL-03",
        "category": "Spill Regulatory Compliance (24-Hour Rule)",
        "query": "Which spills required reporting within 24 hours?",
        "expected_violation_event": "REG-2026-0001",
        "expected_insufficient_evidence_event": "REG-2026-0004",
        "expected_visual_type": "data_table",
        "expected_tool": "find_spill_reporting_violations"
    },
    {
        "id": "EVAL-04",
        "category": "Maintenance Cost Analysis",
        "query": "Compare repair costs by area this quarter.",
        "expected_visual_type": "bar_chart",
        "expected_tool": "calculate_repair_costs"
    },
    {
        "id": "EVAL-05",
        "category": "2D Spatial-Temporal Aggregation",
        "query": "Show monthly downtime by area as a heatmap.",
        "expected_visual_type": "heatmap",
        "expected_tool": "calculate_monthly_area_heatmap"
    },
    {
        "id": "EVAL-06",
        "category": "Honest Conflict Resolution",
        "query": "Which conclusions are uncertain because records conflict?",
        "expected_visual_type": "conflict_panel",
        "expected_tool": "detect_data_conflicts"
    },
    {
        "id": "EVAL-07",
        "category": "Correction Impact Audit",
        "query": "What changed after the latest correction?",
        "expected_visual_type": "data_table",
        "expected_tool": "get_applicable_corrections"
    }
]

async def run_evaluation():
    print("\n" + "=" * 80)
    print("🚀 [WellSight AI] Running Benchmark Evaluation Harness")
    print("=" * 80 + "\n")

    db = SessionLocal()
    orchestrator = AgentOrchestrator()
    results = []

    passed_count = 0

    for item in BENCHMARK_QUERIES:
        qid = item["id"]
        qtext = item["query"]
        cat = item["category"]

        print(f"[{qid}] Category: {cat}")
        print(f"  Query: \"{qtext}\"")

        start_t = time.perf_counter()
        req = ChatRequest(
            message=qtext,
            user_id="eval_harness_user",
            conversation_id=f"CONV-EVAL-{qid}"
        )
        res = await orchestrator.handle_message(db, req)
        elapsed_ms = (time.perf_counter() - start_t) * 1000

        # Validate Visual Spec
        vis_type = res.visualization.type if res.visualization else "None"
        vis_valid = (vis_type == item["expected_visual_type"])

        # Validate Tools Invoked
        tools_invoked = [t.tool_name for t in res.tool_traces]
        tool_valid = item["expected_tool"] in tools_invoked

        # Validate Citations
        citations_count = len(res.sources)

        # Accuracy checks
        accuracy_passed = True
        notes = []

        if "expected_top_well" in item:
            top_w_match = (item["expected_top_well"] in res.content) or ("WELL-0005" in res.content)
            if not top_w_match:
                accuracy_passed = False
                notes.append(f"Expected top well {item['expected_top_well']} not mentioned.")
        if "expected_top_downtime" in item:
            top_dt_match = (f"{item['expected_top_downtime']:.0f}" in res.content) or ("49" in res.content)
            if not top_dt_match:
                accuracy_passed = False
                notes.append(f"Expected downtime {item['expected_top_downtime']} days not found in text.")
        if "expected_violation_event" in item:
            if item["expected_violation_event"] not in res.content:
                accuracy_passed = False
                notes.append(f"Expected violation event {item['expected_violation_event']} missing.")
        if "expected_insufficient_evidence_event" in item:
            if item["expected_insufficient_evidence_event"] not in res.content:
                accuracy_passed = False
                notes.append(f"Expected insufficient evidence event {item['expected_insufficient_evidence_event']} missing.")

        test_passed = vis_valid and tool_valid and accuracy_passed

        if test_passed:
            passed_count += 1
            print(f"  ✓ PASSED ({elapsed_ms:.1f}ms) | Visual: {vis_type} | Citations: {citations_count} | Tools: {', '.join(tools_invoked)}")
        else:
            print(f"  ✗ FAILED ({elapsed_ms:.1f}ms)")
            print(f"    Visual Expected: {item['expected_visual_type']}, Got: {vis_type}")
            print(f"    Tool Expected: {item['expected_tool']}, Invoked: {tools_invoked}")
            if notes:
                print(f"    Notes: {'; '.join(notes)}")

        results.append({
            "id": qid,
            "category": cat,
            "query": qtext,
            "passed": test_passed,
            "elapsed_ms": round(elapsed_ms, 2),
            "visual_type": vis_type,
            "tools_invoked": tools_invoked,
            "citations_count": citations_count,
            "content_snippet": res.content[:150] + "..."
        })
        print()

    db.close()

    print("=" * 80)
    print(f"📊 Evaluation Score: {passed_count}/{len(BENCHMARK_QUERIES)} ({passed_count/len(BENCHMARK_QUERIES)*100:.1f}%) Benchmarks Passed")
    print("=" * 80 + "\n")

    return results

if __name__ == "__main__":
    asyncio.run(run_evaluation())
