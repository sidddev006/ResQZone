# ResQZone — System Architecture

## 1. Overview
ResQZone is an intelligent disaster-management and carrying-capacity assessment decision-support platform designed for Smart India Hackathon 2026 (Problem Statement: SIH26191).

It addresses the fundamental operational questions for disaster authorities (NDRF, SDMA, DDMA):
1. **WHERE is the hazard?** (Multi-Hazard Identification & Red-Zone Mapping)
2. **WHO is vulnerable?** (Habitation & Cohort Vulnerability Profiling)
3. **CAN the surrounding shelters safely absorb them?** (Carrying Capacity & Limiting Bottleneck Analysis)
4. **WHAT should an authority do next, and why?** (Constrained Evacuation Optimization & ResQ Twin Counterfactual Simulation)

---

## 2. High-Level Architectural Diagram

```
+---------------------------------------------------------------------------------------+
|                                    PRESENTATION TIER                                   |
|  React 18 SPA + Tailwind CSS + Leaflet.js + Recharts (Port 5173 / Docker Port 3000)   |
|  - Command Center Dashboard    - Multi-Hazard Interactive GIS Map   - Habitations      |
|  - Carrying Capacity Matrix    - Relocation Optimization Planner    - ResQ Twin Twin  |
|  - Emergency Alerts & Push     - Official Briefs & Reports          - ResQ AI Copilot |
+-------------------------------------------+-------------------------------------------+
                                            | REST API & WebSocket (/api/v1/*, /ws/live)
                                            v
+---------------------------------------------------------------------------------------+
|                                    APPLICATION TIER                                   |
|                        FastAPI Modular Monolith (Python 3.11)                         |
|                                                                                       |
|  [ Hazard Intelligence Engine ]    [ Vulnerability Engine ]   [ Carrying Capacity ]   |
|  - Landslide / InSAR Fusion        - Dependency Ratio         - Sphere Standards      |
|  - Flood Inundation Corridor       - Physical Fragility       - Water Bottleneck      |
|  - Seismic Structural Buffer       - Distance Impedance       - Sanitation/Food/Beds  |
|                                                                                       |
|  [ Multi-Objective Routing ]       [ Relocation Optimizer ]   [ ResQ Twin Simulator ] |
|  - Fastest / Safest / Balanced     - NetworkX Assignment      - What-If Perturbation  |
|  - Blocked Detour Bypass           - Safe Capacity Boundary   - Baseline/Sim/Delta    |
|                                                                                       |
|  [ External Data Adapters ]        [ AI Copilot Engine ]      [ Security & RBAC ]     |
|  - IMD, Bhuvan, Sentinel, DEM      - Deterministic Fact SQL   - JWT + Bcrypt          |
|  - LIVE / DEMO / OFFLINE Modes     - Natural Language Expl.   - Audit Logging Trail   |
+-------------------------------------------+-------------------------------------------+
                                            | SQLAlchemy ORM
                                            v
+---------------------------------------------------------------------------------------+
|                                      DATA TIER                                        |
|                     PostgreSQL 15 + PostGIS 3.3 / SQLite Fallback                    |
|  - Habitations (SRID 4326)      - Hazard Polygons (SRID 4326) - Shelters & Resources  |
|  - Road Graph Topology Segments - Relocation Plans & Manifest - Operational Alerts    |
|  - Data Source Latency & Health - Immutable Audit Trails      - Incident Briefs       |
+---------------------------------------------------------------------------------------+
```

---

## 3. Core Principles
1. **Explainability Over Black-Box Claims:** Every risk output contains an Evidence Panel with contributing drivers, data freshness, model confidence, and operational warnings.
2. **Deterministic Constraint Satisfaction:** Shelters strictly respect their effective safe capacity; blocked routes cannot be traversed; highest-risk habitations are allocated first.
3. **Resilience to External API Outages:** Uses an Adapter Architecture supporting LIVE, DEMO, and OFFLINE fallback modes without crashing.
4. **Human Authority in the Loop:** System is decision support, not an autonomous emergency commander. Human override is supported and logged in the immutable audit trail.
