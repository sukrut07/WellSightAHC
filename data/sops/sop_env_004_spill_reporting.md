# Standard Operating Procedure: Spill & Release Regulatory Notification
**Document ID:** SOP-ENV-004  
**Category:** Health, Safety & Environmental (HSE) Compliance  
**Applies To:** All Production Facilities, Wellpads, Battery Storage & Gathering Systems  
**Effective Date:** January 1, 2025 (Renewed 2026)  
**Governing Regulation:** State Oil & Gas Conservation Commission Rule 906 / Federal CWA  

---

## 1. Purpose & Thresholds
This Standard Operating Procedure governs the immediate escalation and formal reporting of liquid hydrocarbon and produced fluid releases occurring at any well site or production station.

## 2. Mandatory Reporting Criteria
1. **Reportable Volume Threshold:** Any unauthorized discharge, leak, or spill of crude oil, condensate, or produced water measuring **equal to or greater than 5.0 barrels (5.0 bbl)**.
2. **Notification Deadline:** The operator must submit formal initial notice to the state regulatory environmental hotline within exactly **24 hours (1,440 minutes)** of the recorded event start time.
3. **Minor Spills (< 5.0 bbl):** Must be documented in internal field containment logs within 5 business days, but do **NOT** mandate 24-hour regulatory emergency reporting unless reaching a natural watercourse.

## 3. Compliance and Violation Logic
- **Elapsed Time Calculation:**
  $$\text{Elapsed Hours} = \frac{\text{Reported Timestamp} - \text{Occurred Timestamp}}{3600 \text{ seconds}}$$
- **Determinations:**
  - **COMPLIANT:** Spill $\ge 5.0$ bbl, and $\text{Elapsed Hours} \le 24.0$ hours.
  - **VIOLATION (Late Reporting):** Spill $\ge 5.0$ bbl, and $\text{Elapsed Hours} > 24.0$ hours.
  - **VIOLATION (Unreported):** Spill $\ge 5.0$ bbl, and $\text{reported\_to\_regulator} = \text{False}$, where more than 24 hours have elapsed since the event.
  - **NOT APPLICABLE:** Spill $< 5.0$ bbl (below the 24-hour notification threshold).
  - **INSUFFICIENT DATA / PENDING EVIDENCE:** If the spill volume is $\ge 5.0$ bbl, but the record is missing the notification timestamp (`reported_at`), **DO NOT declare a violation**. The system must report status as "Insufficient Data" pending audit verification.

## 4. Corrections and Provenance
If an HSE incident review or subsequent survey indicates an incorrect initial estimate (e.g. initial gauge read 6.2 bbl but containment survey showed 3.8 bbl), an explicit correction may be submitted with engineering justification. Accepted corrections supersede raw estimates for downstream compliance calculations while preserving the original record and audit trail.
