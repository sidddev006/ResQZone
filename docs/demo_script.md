# ResQZone — 3 to 5 Minute Live Judge Demo Script

### STEP 1: Command Center Overview (30 seconds)
- **Action:** Open `http://localhost:5173`.
- **Script:**
  > "ResQZone addresses SIH26191: Intelligent identification of hazard red zones and relocation needs. Here in the Chamoli-Joshimath Command Center, the dashboard synthesizes IMD weather, Sentinel-1 InSAR ground deformation, Cartosat-3 DEM, and OpenStreetMap road graphs. Notice our 8 operational KPIs: 3 critical zones, 5,420 citizens exposed, and 7,200 resource-normalized safe spots across 8 relief camps."

---

### STEP 2: Interactive GIS Multi-Hazard Map (45 seconds)
- **Action:** Click **Multi-Hazard GIS Map** on sidebar.
- **Script:**
  > "Our interactive GIS layer renders the Joshimath Core Subsidence Red Zone and Alaknanda flash flood corridor. Let's toggle between layers: hazard polygons, habitations, relief shelters, and interconnected road segments. Clicking on the Manohar Bagh Ward reveals a critical hazard score of 0.94 on a steep 38.5° slope."

---

### STEP 3: Evidence & Confidence Panel (45 seconds)
- **Action:** Click **Evidence** on Manohar Bagh or open Habitations tab.
- **Script:**
  > "ResQZone never presents an unexplained 'AI score'. Our Evidence Layer reveals the exact drivers: +142% 24-hour rainfall anomaly from the IMD Joshimath station, 7.4 cm/month InSAR ground subsidence, and extreme structural fragility. It explicitly indicates data freshness timestamps and provides an auditable Human Override for the commanding authority."

---

### STEP 4: Carrying Capacity & Bottlenecks (45 seconds)
- **Action:** Click **Carrying Capacity** on sidebar.
- **Script:**
  > "A relief camp doesn't fail from lack of beds—it fails when water runs dry or toilets overflow. In Helang Mandir Community Center, notice that while 480 beds are safe, water supply only supports 366 persons at WHO 15L/day standards. Water is the bottleneck. ResQZone ensures no plan exceeds this effective safe threshold."

---

### STEP 5: Relocation Optimization (45 seconds)
- **Action:** Click **Relocation Planner**, switch between **BALANCED**, **SAFEST**, and **FASTEST**.
- **Script:**
  > "Clicking Optimize executes a constrained NetworkX assignment. Notice the tradeoff: Fastest route takes 14 minutes with high hazard exposure; Safest takes 19 minutes over reinforced bypasses. Every evacuee is allocated without violating safe camp capacities."

---

### STEP 6: ResQ Twin Digital Twin Simulation (60 seconds)
- **Action:** Click **ResQ Twin (Digital Twin)**.
- **Action:** Check **Road R17 Blocked**, check **Close Helang Shelter (S3)**, set **Rainfall Spike (+50%)**, and click **Execute What-If Simulation**.
- **Script:**
  > "Now our primary innovation: ResQ Twin. What happens if Road R17 is blocked by rockfall and Helang Shelter closes right now? Running the simulation immediately computes BASELINE -> WHAT-IF -> OPERATIONAL DELTA: 146 people reassigned, travel times increased by +4.8 minutes, and load redistributed to Pipalkoti. The narrative explains the exact cause-and-effect cascade."

---

### STEP 7: AI Copilot & Incident Brief (30 seconds)
- **Action:** Click **Ask ResQ Copilot** in navbar.
- **Action:** Click *"Why is Manohar Bagh Ward marked critical?"* or *"Which shelters can absorb 300 people?"*.
- **Action:** Open **Incident Reports** and click **Print Report**.
- **Script:**
  > "Finally, our AI Copilot extracts queries and executes deterministic spatial lookups without LLM hallucination. And in one click, DEOC officers generate a printable official incident brief with full data provenance."
