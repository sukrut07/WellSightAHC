# Electric Submersible Pump (ESP) Systems Operating Manual
**Document ID:** SOP-OPS-ESP-002  
**Category:** Standard Operating Manual  
**Applies To:** Electric Submersible Pump (ESP) Wells  
**Revision:** 3.1  
**Author:** Artificial Lift Engineering  

---

## 1. Scope & System Overview
Electric Submersible Pumps lift high-volume liquid streams from deep horizons. Due to electrical energy dissipated by downhole motor coils and high mechanical friction during fluid ascent, ESP operations generate distinct thermal signatures at surface.

## 2. Thermal Production Verification Rule
- **Wellhead Temperature ($T_{wellhead}$)**
- **Ambient Air Temperature ($T_{ambient}$)**
- **Thermal Differential ($\Delta T$):** $\Delta T = T_{wellhead} - T_{ambient}$.

### 2.1 Threshold for ESP Wells
- **Threshold Limit:** **25.0°F**.
- **Classification Criteria:**
  - If $\Delta T \ge 25.0^\circ\text{F}$: Motor and pump are circulating high-temperature fluids. Status is **PRODUCING**.
  - If $\Delta T < 25.0^\circ\text{F}$: ESP downhole system has tripped, stalled, or flow is blocked. Status is **NOT PRODUCING**.
  - **Exception - Planned Shut-in:** If scheduled for transformer check or surface variable frequency drive (VFD) maintenance, classified as **PLANNED SHUT-IN**.

## 3. Downtime Accounting Rules
- Weekly inspection showing non-producing = 7 days downtime.
- Two consecutive inspections showing non-producing = 14 days downtime.
- Missed inspection = 0 days additional downtime.
