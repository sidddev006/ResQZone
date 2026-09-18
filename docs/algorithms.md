# ResQZone — Core Algorithms & Mathematical Formulations

## 1. Multi-Hazard Intelligence Engine

The hazard pipeline employs a hybrid deterministic-stochastic fusion architecture:

### A. Landslide Subsidence Risk Model
For a given spatial point $(x, y)$, deterministic geotechnical risk $R_{\text{geo}}$ is evaluated as:
$$R_{\text{geo}} = w_{\text{slope}} \cdot S_{\text{norm}} + w_{\text{rf24}} \cdot RF_{24,\text{norm}} + w_{\text{anom}} \cdot A_{\text{norm}} + w_{\text{def}} \cdot D_{\text{insar}} + w_{\text{frag}} \cdot F_{\text{struct}} + w_{\text{hist}} \cdot H_{\text{hist}}$$

Where:
- $S_{\text{norm}} = \text{clamp}\left(\frac{\theta - 15^\circ}{30^\circ}, 0, 1\right)$ (slopes $> 15^\circ$ increase shear stress)
- $RF_{24,\text{norm}} = \text{clamp}\left(\frac{\text{Rainfall}_{24\text{h}}}{150\text{ mm}}, 0, 1\right)$
- $D_{\text{insar}} = \text{clamp}\left(\frac{\text{Velocity}_{\text{subsidence}}}{8\text{ cm/month}}, 0, 1\right)$
- Default weights: Slope (0.25), 24h Rain (0.20), Anomaly (0.15), InSAR Deformation (0.15), Structural Fragility (0.15), Historical Proximity (0.10).

Hybrid fusion with the calibrated Gradient Boosted Trees estimator:
$$R_{\text{fused}} = 0.70 \cdot R_{\text{geo}} + 0.30 \cdot P_{\text{ML}}(\text{hazard} \mid \mathbf{x})$$

---

## 2. Carrying Capacity & Bottleneck Determination

Carrying capacity is **never** treated merely as the number of cots. ResQZone enforces the Humanitarian Charter and Minimum Standards in Disaster Response (Sphere Standards & WHO guidelines):

For each shelter $j$:
- Water-limited capacity: $C_{\text{water}} = \lfloor \frac{\text{WaterSupply}_{\text{LPD}}}{15\text{ L/person/day}} \rfloor$
- Sanitation-limited capacity: $C_{\text{san}} = \text{Toilets} \times 20\text{ persons/unit}$
- Food-limited capacity: $C_{\text{food}} = \lfloor \frac{\text{MealsDaily}}{3\text{ meals/person}} \rfloor$
- Bed-limited capacity: $C_{\text{beds}} = \text{SafeOccupancy}$
- Medical-limited capacity: $C_{\text{med}} = \text{MedicalIsolationBeds} \times 50$

### Effective Safe Capacity:
$$C_{\text{effective}}(j) = \min(C_{\text{water}}, C_{\text{san}}, C_{\text{food}}, C_{\text{beds}}, C_{\text{med}})$$

### Bottleneck Identification:
$$\text{BottleneckResource}(j) = \arg\min_{r \in \{\text{water, san, food, beds, med}\}} C_r(j)$$

Utilization:
$$U(j) = \frac{\text{CurrentOccupancy} + \text{AssignedPopulation}}{C_{\text{effective}}(j)} \times 100\%$$

---

## 3. Multi-Objective Route Risk Engine

On road network graph $G = (V, E)$, edge $e = (u, v)$ has distance $d_e$, base travel time $t_e$, and hazard exposure $h_e \in [0, 1]$.

Three routing objectives are evaluated:
1. **FASTEST ROUTE:** $\min \sum_{e \in P} t_e$
2. **SAFEST ROUTE:** $\min \sum_{e \in P} (50 \cdot h_e + 0.5 \cdot t_e)$
3. **BALANCED ROUTE (Pareto Compromise):** $\min \sum_{e \in P} (t_e + 15 \cdot h_e)$

Blocked edges are removed dynamically from the graph: $E' = E \setminus \{e_{\text{blocked}}\}$.

---

## 4. Constrained Relocation Assignment Solver

Let $I$ be the set of vulnerable habitations needing evacuation and $J$ be the set of active shelters.

$$\min \sum_{i \in I} \sum_{j \in J} x_{ij} \cdot \left[ t_{ij} + 30 \cdot h_{ij} \right] + M \sum_{i \in I} u_i$$

Subject to:
1. **Capacity Limit:** $\sum_{i \in I} x_{ij} \le C_{\text{effective}}(j) - \text{CurrentOccupancy}(j), \quad \forall j \in J$
2. **Demand Conservation:** $\sum_{j \in J} x_{ij} + u_i = \text{Population}(i), \quad \forall i \in I$
3. **Route Feasibility:** $x_{ij} = 0 \text{ if no path exists between } i \text{ and } j$
4. **Priority Ordering:** Critical habitations ($P_{\text{priority}} \ge 0.75$) are solved with higher penalty weights $M$.

---

## 5. ResQ Twin Counterfactual Simulation Engine

ResQ Twin executes two-phase deterministic delta evaluation:
$$\text{Scenario}(\mathbf{\theta}) \to \Delta = \text{Plan}(\mathbf{\theta}) - \text{Plan}(\mathbf{\theta}_{\text{baseline}})$$

Calculates:
- Reassigned citizens: $\sum_{i} |x_{ij}(\mathbf{\theta}) - x_{ij}(\mathbf{\theta}_{\text{baseline}})|$
- Transit time delta: $\bar{T}(\mathbf{\theta}) - \bar{T}(\mathbf{\theta}_{\text{baseline}})$
- Spillover unassigned deficit: $\Delta U = U(\mathbf{\theta}) - U(\mathbf{\theta}_{\text{baseline}})$
- Shelter load shift: $\Delta L_j = L_j(\mathbf{\theta}) - L_j(\mathbf{\theta}_{\text{baseline}})$
