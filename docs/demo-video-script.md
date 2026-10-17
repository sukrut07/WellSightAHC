# WellSight AI — 5-Minute Hackathon Demo Video Script

**Event:** Hack Day Pune × AI Hackers Collective · Hacktoberfest 2026  
**Track:** Asset Intelligence Copilot Challenge  
**Video Target Duration:** 5 minutes (300 seconds)  
**Presenter:** Production AI Lead / Full-Stack Engineer  

---

### Timing & Scene Breakdown

| Timestamp | Scene | Primary Feature Demonstrated |
| :---: | :--- | :--- |
| **00:00 – 00:45** | Intro & Overview Dashboard | Product identity, data ingestion stats, architecture summary |
| **00:45 – 01:30** | Scenario 1: Downtime Ranking | Natural language query $\rightarrow$ deterministic calculation $\rightarrow$ `data_table` Generative UI |
| **01:30 – 02:15** | Scenario 2: Root-Cause Investigation | Multi-tool hybrid RAG, lift manual thresholds, `well_status_card` |
| **02:15 – 03:00** | Scenario 3: Persistent Scoped Correction | Submitting sensor recalibration, preserving raw original, instant re-calculation |
| **03:00 – 03:50** | Scenario 4: User Switching & Dual Memory | Operator switching, shared well context visibility vs. private chat isolation |
| **03:50 – 04:35** | Scenario 5: Challenging the System | Missing regulatory timestamps $\rightarrow$ honest `conflict_panel` / zero hallucinations |
| **04:35 – 05:00** | Conclusion & GitHub Publish | Ingestion CLI demo, automated test harness, open-source summary |

---

### Step-by-Step Script & Narration

#### Scene 1: Introduction & Operational Dashboard (00:00 – 00:45)
- **Visual:** Screen opens on `http://localhost:3000/` showing the WellSight AI Overview Dashboard. Dark navy industrial theme, active well counts (12 assets), recent downtime charts, and quick-prompt launchers.
- **Audio / Narration:**  
  *"Hello judges and fellow hackers! Welcome to **WellSight AI**, our Asset Intelligence Copilot built for the Hacktoberfest 2026 Hack Day Pune. Oilfield operations generate tens of thousands of inspection logs, SCADA readings, and environmental reports. Generic chatbots fail here because they hallucinate numbers, output walls of text, and hide data contradictions. WellSight AI changes that: every well has a story, and we ask the data. Let’s jump directly into our live field copilot."*
- **Action:** Presenter clicks **"Launch Copilot"** in the top navigation, transitioning seamlessly to `/copilot`.

---

#### Scene 2: Natural Language Downtime Ranking (00:45 – 01:30)
- **Visual:** Copilot chat view. Active operator is set to **Sarah Chen (Production Lead)**.
- **Action:** Presenter clicks or types the prompt:  
  `"Which wells in Area A had the longest downtime this summer, and show me the results as a table."`
- **Visual:** Instant tool execution badge: `Invoking tool: calculate_well_downtime(area="Area A", date_range="Summer 2026")`. Sub-30ms response renders a rich **Generative UI `data_table`**:
  - `WELL-0007`: 14 days (336 hours) downtime $\rightarrow$ Status: High Downtime
  - `WELL-0002`: 7 days (168 hours) downtime $\rightarrow$ Status: Moderate Downtime
  - `WELL-0001` & `WELL-0004`: 0 days downtime
  - Record citations displayed below: `insp-007-1`, `insp-007-2`, `insp-002-2`.
- **Audio / Narration:**  
  *"Instead of an LLM guessing downtime, our orchestrator immediately dispatched our deterministic downtime engine. Under challenge rules, a weekly non-producing inspection counts as exactly 7 days of downtime; two consecutive non-producing inspections equal 14 days. Notice that WELL-0007 had two consecutive qualifying inspections on August 4th and 11th, totaling 14 days. And because I asked for a table, the copilot dynamically selected our Generative UI data table with record citations, not a static block of text."*

---

#### Scene 3: Investigating the Top Down Well (01:30 – 02:15)
- **Action:** Presenter clicks the citation badge or types:  
  `"Why was WELL-0007 not producing?"`
- **Visual:** Copilot executes `get_inspection_history`, `get_repair_history`, and `search_manuals`.  
  Renders a **Generative UI `well_status_card`** with thermal telemetry and maintenance history:
  - Wellhead Temp: $98^\circ\text{F}$ | Ambient Temp: $88^\circ\text{F}$ $\rightarrow \Delta T = 10^\circ\text{F}$.
  - Operating Manual Reference: `manuals/gas_lift_manual.md` (Section 3.2): *Gas Lift requires $\Delta T \ge 15^\circ\text{F}$*. Since $10^\circ\text{F} < 15^\circ\text{F}$, the well is classified as non-producing.
  - Mechanical Cause: Repair record `rep-007-1` documents a cracked gas injection valve.
- **Audio / Narration:**  
  *"Next, we investigate why WELL-0007 was down. WellSight AI combines hybrid vector retrieval with relational data. It pulled the Gas Lift engineering manual, which dictates a 15-degree thermal differential. The wellhead was only 10 degrees above ambient, failing the threshold. Furthermore, it identified repair record 007-1, citing a cracked gas injection valve. Everything is cited back to the exact paragraph and repair ID."*

---

#### Scene 4: Persistent Scoped Correction & Re-Query (02:15 – 03:00)
- **Visual:** Presenter clicks the **"Submit Correction"** button on the inspection citation.
- **Action:** Modal opens with fields:
  - Target: `Inspection #insp-007-2`
  - Field: `wellhead_temp_f`
  - Original Value: `98.0` (auto-filled, immutable)
  - Corrected Value: `108.0`
  - Reason: `Field infrared thermometer recalibrated; certified reading was 108°F.`
  - Scope: `Record-level`
- **Action:** Presenter clicks **"Save & Apply Correction"**.
- **Action:** Presenter re-runs: `"Which wells in Area A had the longest downtime this summer?"`
- **Visual:** The new calculation runs dynamically:
  - In inspection `insp-007-2`, Wellhead temp is now $108^\circ\text{F}$. Differential is $108 - 88 = 20^\circ\text{F} \ge 15^\circ\text{F}$ $\rightarrow$ Status flipped to **PRODUCING**.
  - Total downtime for `WELL-0007` drops from 14 days to **7 days**!
  - An **audit badge** indicates: *"Applied 1 record correction from Sarah Chen"*.
- **Audio / Narration:**  
  *"Now watch the differentiator: persistent memory with provenance. Field sensor drift is common. I submit a record-level correction indicating the thermometer was recalibrated to 108 degrees. The raw original is preserved in our immutable audit ledger. When I re-query, the engine dynamically applies the approved correction. The differential now exceeds 15 degrees, the second inspection flips to producing, and WELL-0007's downtime drops from 14 days to 7 days—automatically reflected in the live ranking!"*

---

#### Scene 5: Dual Memory Isolation — Switching Operators (03:00 – 03:50)
- **Action:** Presenter uses the operator switcher in the navigation bar to switch from **Sarah Chen** to **Marcus Vance (Safety Auditor)**.
- **Visual:** Chat history clears. Marcus's private conversation pane is clean.
- **Action:** Presenter types:  
  `"What is the status and shared context on WELL-0007?"`
- **Visual:** Copilot returns the **shared well context**:
  - Displays the accepted thermal correction submitted by Sarah Chen.
  - Displays shared tag: *"Valve rebuilt on Aug 14; monitoring gas injection pressure."*
- **Action:** Presenter types: `"What were the three wells we talked about earlier?"`
- **Visual:** Copilot answers: *"No prior conversation found in your session. Sarah Chen's private discussion from earlier is strictly isolated."*
- **Audio / Narration:**  
  *"A critical challenge requirement is dual-tier memory. Here, I switch to Marcus Vance, our safety auditor. When Marcus asks about WELL-0007, he immediately sees the verified shared notes and Sarah's accepted correction. But when he asks about prior conversation context, the copilot protects privacy: Marcus cannot access Sarah's private chats. Shared context is unified; private memory is strictly isolated."*

---

#### Scene 6: Challenging the System — Honest Conflict Resolution (03:50 – 04:35)
- **Action:** Marcus asks a compliance question:  
  `"Which spills required reporting within 24 hours, and were any deadlines missed?"`
- **Visual:** Generative UI renders both a compliance table and a **`conflict_panel`**:
  - Highlights `SPILL-2026-088` (12.0 bbl): 26.5 hours elapsed $\rightarrow$ **VIOLATION**.
  - Highlights `SPILL-2026-091` (5.5 bbl): Notification timestamp is null.
  - System flags: **INSUFFICIENT DATA** with an amber warning: *"Spill exceeds 5 bbl threshold, but regulatory notification timestamp is missing. The system will NOT declare a violation without verified dispatch evidence."*
- **Audio / Narration:**  
  *"Now we challenge the system. Under challenge rule 3.2, spills over 5 barrels must be reported within 24 hours. SPILL-088 was reported after 26.5 hours, correctly flagged as a violation. But look at SPILL-091: it was 5.5 barrels, but the notification timestamp is blank in the database. A generic LLM would guess or hallucinate a violation. WellSight AI refuses to guess: our conflict engine explicitly surfaces an 'Insufficient Data' warning and prompts the auditor for verification."*

---

#### Scene 7: Ingestion CLI & Conclusion (04:35 – 05:00)
- **Visual:** Presenter switches to the terminal.
- **Action:** Runs:
  ```bash
  python -m app.ingestion.cli load ./data/test_dataset
  python scripts/run_eval.py
  ```
- **Visual:** Terminal prints: `Ingested 3 wells, 6 inspections... Evaluation: 7/7 benchmark scenarios passed (100.0%) in 140ms total.`
- **Audio / Narration:**  
  *"Finally, generalizability: our CLI ingests any new test dataset instantly with zero code changes, and our evaluation suite passes 100% of benchmark queries. The entire project is open-sourced under Apache 2.0 with complete Docker Compose support. Thank you for your time, and enjoy exploring WellSight AI!"*
