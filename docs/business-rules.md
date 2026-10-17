# WellSight AI — Business Rules & Calculation Engine

**Asset Intelligence Copilot · Hacktoberfest 2026**  
*Tagline: Every well has a story. Ask the data.*

---

## 1. Overview

A critical distinction of WellSight AI is that **arithmetic, compliance classifications, and data overrides are executed deterministically in code, never guessed by an LLM**.

This document outlines the exact business rules supplied for the Asset Intelligence Copilot challenge and their formal algorithmic implementation.

---

## 2. Downtime Calculation Rules

### Rule 2.1 — Inspection-Based Downtime Accumulation

In the operations model, wellhead status is evaluated via regular weekly field inspections:

$$\text{Downtime per non-producing inspection} = 7 \text{ days } (168 \text{ hours})$$

- **Single Non-Producing Inspection:** If an inspection classifies a well as `non-producing`, it contributes **exactly 7 days** of downtime.
- **Consecutive Non-Producing Inspections:** Two consecutive weekly non-producing inspections contribute **exactly 14 days** (336 hours) of downtime.
- **Missed Inspections:** A missed or skipped weekly inspection contributes **zero days (0 hours)** of downtime. The engine never extrapolates or fabricates downtime for missing inspection dates.
- **Repair Duration Independence:** The duration of mechanical repairs (`hours_to_repair` or workover days) is **NOT** used to calculate well downtime. Repair duration reflects maintenance effort, whereas production downtime is governed strictly by inspection status.

### Rule 2.2 — Thermal Differential Producing Classification

Whether a well is actively producing is determined by comparing the **Wellhead Temperature ($T_{\text{wellhead}}$)** to the **Ambient Air Temperature ($T_{\text{ambient}}$)** against the lift-specific threshold specified in the engineering manual:

$$\Delta T = T_{\text{wellhead}} - T_{\text{ambient}}$$

$$\text{Status} = \begin{cases} \text{producing} & \text{if } \Delta T \ge \theta_{\text{lift}} \\ \text{non-producing} & \text{if } \Delta T < \theta_{\text{lift}} \end{cases}$$

Where $\theta_{\text{lift}}$ is defined by the asset's artificial lift system:

| Artificial Lift System | Thermal Threshold ($\theta_{\text{lift}}$) | Governing Operating Manual |
| :--- | :---: | :--- |
| **Gas Lift** | $\ge 15^\circ\text{F}$ | `manuals/gas_lift_manual.md` (Section 3.2) |
| **Electric Submersible Pump (ESP)** | $\ge 25^\circ\text{F}$ | `manuals/esp_manual.md` (Section 4.1) |
| **Rod Pump (Beam Lift)** | $\ge 12^\circ\text{F}$ | `manuals/rod_pump_manual.md` (Section 2.4) |
| **Flowing Well (Natural Lift)** | $\ge 18^\circ\text{F}$ | `manuals/flowing_well_manual.md` (Section 1.5) |

### Rule 2.3 — Planned Maintenance & Shut-in Exclusions

- If a well has an active status of `planned-maintenance` or `shut-in` documented in the inspection notes or master record, thermal non-production is classified as operational standby rather than unplanned equipment downtime.

---

## 3. Spill Reporting Compliance Rules

### Rule 3.1 — The 5-Barrel / 24-Hour Regulatory Mandate

Governed by State Environmental SOP `SOP-ENV-004`:

$$\text{Mandate Trigger: } \text{Spill Volume} \ge 5.0 \text{ bbl}$$

$$\text{Elapsed Time} = t_{\text{notification}} - t_{\text{incident}}$$

$$\text{Compliance Status} = \begin{cases} 
\text{COMPLIANT} & \text{if Elapsed Time} \le 24.0 \text{ hours} \\
\text{VIOLATION} & \text{if Elapsed Time} > 24.0 \text{ hours} \\
\text{INSUFFICIENT DATA} & \text{if } t_{\text{notification}} \text{ is missing or null}
\end{cases}$$

### Rule 3.2 — Honest Missing Evidence Handling

- **Never Declare False Violations:** If a spill exceeds 5.0 bbl but the regulatory agency notification timestamp ($t_{\text{notification}}$) is absent from the records, the system **MUST NOT** classify the event as a regulatory violation.
- Instead, the event is marked as `INSUFFICIENT DATA`, and the copilot explicitly notes the lack of notification evidence to the operator.

### Rule 3.3 — Impact of Data Corrections on Spill Compliance

- If an operator submits an audited correction reducing a recorded spill volume from $6.2 \text{ bbl}$ to $4.1 \text{ bbl}$, the event drops below the 5.0 bbl threshold and is immediately re-classified as exempt from the 24-hour mandatory reporting rule.
- If an operator updates the notification timestamp to demonstrate that reporting occurred within 18 hours, the compliance status dynamically flips from `VIOLATION` to `COMPLIANT`.

---

## 4. Persistent Correction Engine Rules

### Rule 4.1 — Immutable Raw Source Records

- Source inspection logs, spill reports, and repair records imported from disk or field SCADA are **immutable**.
- Accepted corrections are stored in an independent `corrections` ledger. At runtime, analytical queries evaluate active corrections and apply overrides dynamically.

### Rule 4.2 — Correction Scopes

| Scope Level | Target Identifier | Description & Impact Boundary |
| :--- | :--- | :--- |
| `record` | `inspection_id` or `event_id` | Overrides a single specific reading (e.g., recalibrated thermometer on Inspection #4). |
| `well` | `well_id` (e.g., `WELL-0007`) | Overrides an asset-wide property (e.g., reclassified lift type from Gas Lift to ESP). |
| `well_type` | `lift_type` (e.g., `Gas Lift`) | Adjusts field-wide operating baseline (e.g., revised thermal differential threshold across all Gas Lift wells). |

### Rule 4.3 — Conflict Detection

When competing corrections are submitted by different users (e.g., User A submits $105^\circ\text{F}$ while User B submits $92^\circ\text{F}$ for the same inspection), the engine marks the status as `CONTESTED`. Contested records are flagged in the Generative UI `conflict_panel` and excluded from silent automatic application until explicitly confirmed by a lead operator.
