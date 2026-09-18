# ResQZone — Judge Readiness & Technical Defense FAQ

### 1. What problem are we solving?
Disaster authorities face four critical challenges during monsoonal disasters (landslides, flash floods):
1. Determining which specific habitations are in imminent danger.
2. Knowing the demographic vulnerability (elderly, disabled, pediatric) of trapped communities.
3. Calculating real humanitarian carrying capacity (water/food/toilets/beds) of relief shelters to prevent secondary humanitarian collapse.
4. Routing and assigning evacuees along safe corridors rather than blindly taking the shortest high-hazard road.

### 2. Why is it technically difficult?
- Terrain in the Himalayas changes dynamically; roads block suddenly.
- Pure distance routing sends evacuees into landslide chutes.
- Relief camps collapse not from lack of floor space, but from water shortages or lack of sanitation units (Sphere standards).
- Hard combinatorial constraints must be solved in real-time under high uncertainty.

### 3. What data is used?
- **Meteorological:** IMD Automated Weather Station hourly rainfall and anomaly benchmarks.
- **Satellite InSAR:** Sentinel-1 C-Band SAR line-of-sight ground displacement trends (subsidence mm/month).
- **DEM:** Cartosat-3 10m Digital Elevation Model for slope angles, aspect, and drainage basins.
- **GIS Networks:** OpenStreetMap & Border Roads Organisation highway graphs.
- **Demographics:** SDMA household social vulnerability register.

### 4. How are red zones generated?
Through a multi-hazard fusion pipeline combining deterministic geotechnical mechanics (slope gradient $> 35^\circ$, pore pressure, rainfall anomaly $> 100\%$) and a calibrated Gradient Boosted Trees estimator. Polygons encompass contiguous high-risk territory with $R_{\text{fused}} \ge 0.75$.

### 5. How is carrying capacity calculated?
Using minimum-limiting resource constraints:
$\text{Effective Capacity} = \min(\text{Beds}, \frac{\text{Water}}{15\text{L}}, \text{Toilets} \times 20, \frac{\text{Meals}}{3}, \text{Medical Beds} \times 50)$.
The system always explicitly reports the limiting bottleneck resource.

### 6. How is relocation optimized?
NetworkX constrained minimum-cost bipartite graph matching minimizes travel time, route hazard risk, and unmet evacuation penalties, while strictly preserving shelter resource boundaries and priority ordering.

### 7. Why is ResQZone different from a normal GIS dashboard?
Traditional GIS tools (QGIS/ArcGIS) merely display static colored polygons. ResQZone includes:
1. **ResQ Twin:** A live counterfactual digital twin that simulates what happens when roads fail or shelters close.
2. **Carrying Capacity Bottleneck Engine:** Prevents overloading camps beyond water/sanitation limits.
3. **Evidence & Confidence Layer:** Transparently displays why an area is marked critical and provides a human override option.

### 8. What exactly does AI do?
- Gradient Boosted Trees estimator predicts hazard probability from multi-modal physical features.
- Local feature contribution attribution generates the Evidence Panel drivers.
- AI Copilot extracts user intent and queries verified spatial tables, preventing LLM hallucinations.

### 9. What happens when data is missing or an API fails?
The system utilizes decoupled Data Adapters that automatically fall back to cached physical baselines, mark the source as DEGRADED or STALE, and display warnings without crashing.

### 10. How is uncertainty handled?
Model scores are explicitly labeled as "model confidence" rather than pretending to be absolute probabilities. Operational uncertainty warnings are surfaced if inputs are stale or outside calibrated geographical bounds.

### 11. How do we prevent unsafe recommendations?
1. Blocked roads are strictly excluded from graph traversals ($x_{ij} = 0$).
2. Safest and Balanced routes weigh hazard exposure above raw speed.
3. Shelters that reach 100% capacity reject additional allocations.
4. Authority Human Override is permanently logged in the audit trail.

### 12. What is novel?
1. **ResQ Twin Adaptive Digital Twin:** Instant calculation of $\text{BASELINE} \to \text{WHAT-IF} \to \text{DELTA}$.
2. **Limiting Resource Bottleneck Quantification:** Distinguishing bed capacity from water/sanitation-safe capacity.
3. **Multi-Objective Evacuation Corridors:** Demonstrating the tradeoff between fastest and safest routes.

### 13. What is a known limitation?
- High-resolution InSAR satellite passes occur every 6–12 days and are not instantaneous real-time video streams.
- Relocation execution assumes road vehicles or foot evacuation; aerial airlift routing is not yet modeled.

### 14. What can be demonstrated live in 3 minutes?
1. Command Center KPIs & active red zones.
2. Habitation Evidence Panel showing 24h rainfall anomaly & slope drivers.
3. Shelter bottleneck inspection showing water supply limitation.
4. Relocation Planner executing constrained multi-shelter assignment.
5. ResQ Twin blocking Road R17, closing Shelter S3, and displaying the reassigned evacuee delta.
6. Generating and printing the official DEOC brief.
