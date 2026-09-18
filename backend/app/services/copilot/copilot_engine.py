"""
ResQZone AI Copilot Engine
Comprehensive Disaster Intelligence & Conversational Reasoner.
Answers any natural language question regarding multi-hazard red zones,
Sphere carrying capacity standards, route optimization, digital twin shocks,
NDMA safety guidelines, and disaster preparedness across all Indian theaters.
Supports optional Google Gemini API grounding or instant local RAG graph reasoning.
"""
from typing import Dict, Any, List, Optional
import os
import re
import json
import urllib.request
import urllib.error
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from sqlalchemy import func

from backend.app.models.entities import Habitation, Shelter, RoadSegment, Alert, HazardZone


class AICopilotEngine:
    """
    Intelligent Conversational Agent for ResQZone Disaster Management.
    """

    @classmethod
    def process_query(cls, query: str, db: Session, api_key: Optional[str] = None) -> Dict[str, Any]:
        cleaned_query = query.strip()
        q_lower = cleaned_query.lower()

        # 1. Check if Gemini / Google API Key is available for real-time LLM reasoning
        gemini_key = api_key or os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
        if gemini_key:
            try:
                llm_response = cls._query_gemini_llm(cleaned_query, db, gemini_key)
                if llm_response:
                    return llm_response
            except Exception as e:
                print(f"[Copilot] Gemini API error, falling back to local reasoning: {e}")

        # 2. Local Knowledge Graph & Semantic Database Reasoner
        return cls._local_reasoning_engine(cleaned_query, q_lower, db)

    @classmethod
    def _query_gemini_llm(cls, query: str, db: Session, api_key: str) -> Optional[Dict[str, Any]]:
        """
        Queries Google Gemini REST API with ground-truth database grounding.
        """
        # Collect snapshot of live database context
        hab_count = db.query(Habitation).count()
        critical_habs = db.query(Habitation).filter(Habitation.risk_category == "CRITICAL").all()
        critical_names = [h.name for h in critical_habs[:6]]
        shelters_count = db.query(Shelter).count()
        open_shelters = db.query(Shelter).filter(Shelter.is_open == True).all()
        total_safe_cap = sum(s.effective_safe_capacity for s in open_shelters)
        total_occ = sum(s.current_occupancy for s in open_shelters)

        context_summary = (
            f"You are the ResQZone AI Copilot, an expert disaster management operations assistant for India (SIH26191). "
            f"Ground Truth Data: 7 active regions (Chamoli UK, Wayanad KL, Mandi HP, Raigad MH, Dhemaji AS, Darjeeling WB, All India). "
            f"Total habitations: {hab_count}. Critical priority habitations: {', '.join(critical_names)}. "
            f"Active safe shelters: {shelters_count} with {total_safe_cap:,} total beds and {total_safe_cap - total_occ:,} free headroom. "
            f"Standard Sphere humanitarian thresholds: 15L water/person/day, 1 toilet per 20 people, 2100 kcal food, 3.5m² shelter space. "
            f"Answer the user's question clearly, concisely, and factually in GitHub markdown. Maintain emergency operations professionalism."
        )

        payload = {
            "contents": [
                {
                    "parts": [
                        {"text": f"{context_summary}\n\nUser Question: {query}\nProvide a direct, helpful, well-structured answer:"}
                    ]
                }
            ],
            "generationConfig": {
                "temperature": 0.2,
                "maxOutputTokens": 700
            }
        }

        # Try gemini-1.5-flash, then gemini-2.0-flash
        models = ["gemini-1.5-flash", "gemini-2.0-flash", "gemini-1.5-pro"]
        for model in models:
            try:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
                req = urllib.request.Request(
                    url,
                    data=json.dumps(payload).encode("utf-8"),
                    headers={"Content-Type": "application/json"}
                )
                with urllib.request.urlopen(req, timeout=9) as response:
                    res_data = json.loads(response.read().decode("utf-8"))
                    candidate = res_data.get("candidates", [{}])[0]
                    answer_text = candidate.get("content", {}).get("parts", [{}])[0].get("text", "")
                    if answer_text:
                        return {
                            "intent": "LLM_SYNTHESIS",
                            "response": answer_text,
                            "structured_data": None,
                            "suggested_actions": [
                                "View critical habitations on GIS Map",
                                "Check safe shelter carrying capacity",
                                "Run ResQ Twin what-if simulation",
                                "Generate formal NDRF SITREP report"
                            ]
                        }
            except Exception:
                continue
        return None

    @classmethod
    def _local_reasoning_engine(cls, query: str, q_lower: str, db: Session) -> Dict[str, Any]:
        """
        High-performance semantic reasoning engine covering general disaster inquiries,
        safety guidelines, technical algorithms, specific settlements, and dynamic database querying.
        """

        # --- A. GENERAL GREETINGS & INTRODUCTIONS ---
        is_greeting = bool(re.search(r"\b(hello|hi|hey|greetings|who are you|what can you do|introduce yourself|help)\b", q_lower))
        if is_greeting and not any(k in q_lower for k in ["shelter", "road", "risk", "critical", "chamoli", "zone", "hazard", "route", "wayanad", "water", "flood"]):
            return {
                "intent": "GREETING",
                "response": (
                    "👋 **Welcome to the ResQZone AI Copilot!**\n\n"
                    "I am your real-time crisis operations assistant for **Intelligent Hazard Red Zone Identification, "
                    "Carrying Capacity Assessment, and Evacuation Planning** (SIH26191).\n\n"
                    "**You can ask me ANY question, including:**\n"
                    "- 🏔️ **Regional Inquiries:** *'What is Chamoli?'*, *'Tell me about Wayanad mudslides'*, *'Overview of Mandi risk'*\n"
                    "- 🔴 **Vulnerability Audits:** *'Why is Sunil Ward critical?'*, *'List all Priority 1 habitations'*\n"
                    "- 🏢 **Shelter Capacity:** *'Which shelters can absorb 300 evacuees?'*, *'What is the limiting bottleneck at Joshimath?'*\n"
                    "- 🛣️ **Evacuation Routing:** *'Which roads are currently blocked or hazardous?'*, *'How does Dijkstra routing work?'*\n"
                    "- 📜 **Standards & Math:** *'What are Sphere humanitarian standards?'*, *'How is Red Zone risk calculated?'*\n"
                    "- 🛡️ **Citizen Safety:** *'What should people do during a landslide?'*, *'What goes in an emergency Go-Bag?'*"
                ),
                "structured_data": None,
                "suggested_actions": [
                    "What is Chamoli and why was it vulnerable?",
                    "Why is Sunil Ward marked as Critical Priority 1?",
                    "Which shelters can absorb 300 evacuees?",
                    "What should people do during a landslide?",
                    "What are Sphere humanitarian standards?"
                ]
            }

        # --- B. CITIZEN SAFETY & NDMA GUIDELINES ---
        is_safety_query = bool(re.search(r"\b(what to do|what should people do|how to survive|safety guidelines|safety rules|precautions|safety measures|survival tips|first aid)\b", q_lower)) or (
            any(k in q_lower for k in ["landslide", "mudslide", "flood", "earthquake"]) and bool(re.search(r"\b(precautions|survival|evacuate safely|protect yourself|safety)\b", q_lower))
        )
        if is_safety_query:
            if "landslide" in q_lower or "mudslide" in q_lower or "debris" in q_lower:
                return {
                    "intent": "SAFETY_LANDSLIDE",
                    "response": (
                        "⛰️ **NDMA Landslide Safety & Survival Guidelines:**\n\n"
                        "**1. Early Warning Signs to Watch For:**\n"
                        "- Sudden cracking or tilting of trees, utility poles, fences, or building foundations.\n"
                        "- Rapid increase or sudden muddy discoloration of nearby streams or springs.\n"
                        "- Rumbling sounds that increase in volume as a debris slide approaches.\n\n"
                        "**2. Immediate Actions During a Landslide:**\n"
                        "- **Evacuate Immediately:** Move perpendicular (sideways) to the slide path, uphill if safe, NEVER downhill.\n"
                        "- **If Trapped Indoors:** Move to an upper floor, curl into a tight ball under sturdy furniture, and protect your head.\n"
                        "- **Avoid River Valleys & Low Gorges:** Debris flows channel through natural depressions at speeds up to 50 km/h.\n\n"
                        "**3. Post-Slide Protocol:**\n"
                        "- Stay clear of the slide area; secondary collapses are extremely common after heavy rains.\n"
                        "- Inspect for severed gas, electrical, and water lines and notify emergency responders via DEOC."
                    ),
                    "suggested_actions": [
                        "What goes in an emergency evacuation kit?",
                        "Show all Critical Priority 1 habitations across India",
                        "Which routes are currently risky?"
                    ]
                }
            if "flood" in q_lower or "water" in q_lower or "inundat" in q_lower:
                return {
                    "intent": "SAFETY_FLOOD",
                    "response": (
                        "🌊 **NDMA Flood & Flash Flood Safety Guidelines:**\n\n"
                        "**1. Immediate Survival Rules:**\n"
                        "- **Turn Around, Don't Drown:** Just 15 cm (6 inches) of rapid water can knock a person down, and 30 cm (1 foot) can sweep away a car.\n"
                        "- Never walk, swim, or drive through moving floodwaters.\n"
                        "- Move immediately to higher ground; avoid basement rooms and low river embankments.\n\n"
                        "**2. Electrical & Utility Precautions:**\n"
                        "- Disconnect main electrical breakers before floodwaters enter premises.\n"
                        "- Avoid contact with downed power lines or standing water near utility poles.\n\n"
                        "**3. Hygiene & Water Safety:**\n"
                        "- Boil all drinking water or use chlorine purification tablets to prevent waterborne epidemics (Sphere Standard)."
                    ),
                    "suggested_actions": [
                        "Which shelters have safe drinking water?",
                        "Show critical flood-prone settlements in Dhemaji",
                        "What are Sphere humanitarian standards?"
                    ]
                }
            if "earthquake" in q_lower or "tremor" in q_lower or "seismic" in q_lower:
                return {
                    "intent": "SAFETY_EARTHQUAKE",
                    "response": (
                        "🏛️ **NDMA Earthquake Safety Protocol (Seismic Zone V):**\n\n"
                        "**1. Indoors: DROP, COVER, HOLD ON:**\n"
                        "- **Drop** to your hands and knees.\n"
                        "- **Cover** your head and neck under a sturdy table or desk.\n"
                        "- **Hold On** until the shaking completely stops.\n"
                        "- Stay away from glass windows, heavy mirrors, unanchored chimneys, and exterior walls.\n\n"
                        "**2. Outdoors:**\n"
                        "- Move to an open area away from buildings, power cables, steep hill slopes, and trees.\n\n"
                        "**3. Post-Shaking:**\n"
                        "- Use stairs, never elevators. Expect aftershocks. Check for structural cracks before re-entering."
                    ),
                    "suggested_actions": [
                        "Why is Chamoli in high seismic danger?",
                        "Show all Critical Priority 1 habitations across India"
                    ]
                }

        # --- C. EMERGENCY DISASTER KIT / GO-BAG ---
        if any(w in q_lower for w in ["go-bag", "go bag", "evacuation kit", "disaster kit", "emergency kit", "pack", "survival kit"]):
            return {
                "intent": "EMERGENCY_KIT_CHECKLIST",
                "response": (
                    "🎒 **Official 72-Hour Emergency Evacuation Kit (Go-Bag) Checklist:**\n\n"
                    "Prepare an easily portable waterproof backpack containing:\n\n"
                    "1. 💧 **Clean Water:** 3 Liters per person per day for at least 72 hours (9L total per person) + purification tablets.\n"
                    "2. 🥫 **Non-Perishable Food:** High-calorie rations (dry fruits, energy bars, roasted gram, canned food) requiring no cooking.\n"
                    "3. 💊 **First Aid & Prescription Medicines:** Bandages, antiseptic, ORS, paracetamol, personal prescriptions (7-day supply).\n"
                    "4. 🔦 **Lighting & Power:** Waterproof LED torch, spare lithium batteries, high-capacity USB power bank, hand-crank radio.\n"
                    "5. 📑 **Important Documents:** Aadhaar/ID, property deeds, medical cards in a sealed ziplock waterproof pouch.\n"
                    "6. 🔔 **Survival Tools:** High-decibel emergency whistle (to signal search & rescue teams), multi-tool pocket knife, dust masks (N95).\n"
                    "7. 🧥 **Thermal Protection:** Lightweight thermal foil blanket, waterproof poncho, sturdy high-ankle boots."
                ),
                "suggested_actions": [
                    "What are Sphere humanitarian standards?",
                    "Which shelters can absorb 300 evacuees?",
                    "What should people do during a landslide?"
                ]
            }

        # --- D. WHAT IS RESQZONE & SIH26191 ARCHITECTURE ---
        if any(w in q_lower for w in ["what is resqzone", "about resqzone", "sih26191", "who built", "what is this project", "architecture", "tech stack", "features of resqzone"]):
            return {
                "intent": "EXPLAIN_RESQZONE_PLATFORM",
                "response": (
                    "🛡️ **ResQZone — Intelligent Hazard Red Zone & Dynamic Relocation Platform**\n\n"
                    "**Smart India Hackathon 2024–2026 (Problem Statement: SIH26191)**\n\n"
                    "ResQZone is an end-to-end mission-critical disaster management and GIS decision-support platform designed for District Emergency Operation Centers (DEOC), NDRF, and SDMAs.\n\n"
                    "**Core Engineering Innovations:**\n"
                    "1. 🔴 **Multi-Hazard Red Zone Classifier:** Combines DEM slope gradients, InSAR satellite displacement, IMD rainfall anomalies, and demographic fragility into an XGBoost Machine Learning susceptibility engine.\n"
                    "2. 🏢 **Bottleneck-Constrained Carrying Capacity:** Strict mathematical adherence to **Sphere Project (2018)** minimum humanitarian standards (water, sanitation, food, floor space).\n"
                    "3. 🛣️ **Hazard-Penalized Dijkstra Routing:** Evaluates mountain road networks and automatically routes evacuation convoys around active debris slides, floods, and bridge breaches.\n"
                    "4. ⚡ **ResQ Twin Counterfactual Simulator:** Digital twin that allows commanders to inject 'What-If?' shocks (NH-07 blocked, 150% rain surge, shelter loss) and audit stress deltas.\n"
                    "5. 🗺️ **Multi-Theater GIS:** Deep monitoring across 6 high-risk Indian theaters: Chamoli (UK), Wayanad (KL), Mandi (HP), Raigad (MH), Dhemaji (AS), and Darjeeling (WB)."
                ),
                "suggested_actions": [
                    "Show all Critical Priority 1 habitations across India",
                    "Which shelters can absorb 300 evacuees?",
                    "Simulate road breach in ResQ Twin",
                    "What are Sphere humanitarian standards?"
                ]
            }

        # --- E. "WHAT IS CHAMOLI?" & REGIONAL DEEP DIVES ---
        if "chamoli" in q_lower and ("what" in q_lower or "explain" in q_lower or "tell" in q_lower or "why" in q_lower or "history" in q_lower or "about" in q_lower):
            chamoli_habs = db.query(Habitation).filter(Habitation.district.ilike("%Chamoli%")).all()
            total_pop = sum(h.total_population for h in chamoli_habs)
            return {
                "intent": "EXPLAIN_REGION_CHAMOLI",
                "response": (
                    "🏔️ **Chamoli District (Uttarakhand, India) — High-Altitude Disaster Theater**\n\n"
                    "**Chamoli** is a sensitive Himalayan border district in Uttarakhand, known worldwide for **Joshimath (Jyotirmath)**, "
                    "the historic gateway to Badrinath and Hemkund Sahib, as well as the Valley of Flowers.\n\n"
                    "**Why is Chamoli so vulnerable to disasters?**\n"
                    "1. **Geological Instability:** Joshimath sits on an ancient, unconsolidated landslide moraine deposit rather than bedrock, making it prone to sudden land subsidence.\n"
                    "2. **Glacial & Fluvial Surges:** It is the catchment of the Alaknanda and Dhauliganga rivers, site of the catastrophic 2021 Rishi Ganga glacial lake burst (GLOF).\n"
                    "3. **Extreme Slopes:** Hill settlements like Sunil, Manohar Bagh, and Singhdhar have slope angles exceeding 32°–38°.\n"
                    "4. **Subsidence Crisis:** In January 2023, widespread ground fissures and building cracks forced mass emergency evacuations.\n\n"
                    f"ResQZone currently monitors **{len(chamoli_habs)} key habitations ({total_pop:,} residents)** in the Chamoli-Joshimath sector."
                ),
                "structured_data": [
                    {"id": h.id, "name": h.name, "slope": f"{h.slope_degrees}°", "hazard": h.primary_hazard_type, "risk": h.risk_category}
                    for h in chamoli_habs[:5]
                ],
                "suggested_actions": [
                    "Why is Sunil Ward marked as Critical Priority 1?",
                    "Which shelters can absorb 300 evacuees?",
                    "Show all Critical Priority 1 habitations across India"
                ]
            }

        # Other Regional Deep Dives: Wayanad, Mandi, Raigad, Dhemaji, Darjeeling
        if "wayanad" in q_lower:
            wayanad_habs = db.query(Habitation).filter(Habitation.district.ilike("%Wayanad%")).all()
            total_pop = sum(h.total_population for h in wayanad_habs)
            return {
                "intent": "EXPLAIN_REGION_WAYANAD",
                "response": (
                    "🌴 **Wayanad District (Kerala) — Western Ghats Flash Debris Flow Sector**\n\n"
                    "Wayanad is located in the Western Ghats mountain range. In July 2024, catastrophic multi-debris landslides struck "
                    "Chooralmala and Mundakkai following unprecedented torrential monsoon rainfall (372mm in 24h).\n\n"
                    "**Key Vulnerabilities Monitored in ResQZone:**\n"
                    "- **Soil Piping & Liquefaction:** Saturated laterite soil over steep tea estate slopes.\n"
                    "- **Critical Settlements:** Mundakkai, Chooralmala, and Attamala.\n"
                    f"- **Active Habitations Monitored:** {len(wayanad_habs)} locations ({total_pop:,} residents) with automated rainfall threshold watch."
                ),
                "structured_data": [
                    {"id": h.id, "name": h.name, "pop": h.total_population, "risk": h.risk_category}
                    for h in wayanad_habs
                ],
                "suggested_actions": [
                    "Show critical habitations in Wayanad",
                    "Which shelters can absorb 300 evacuees?",
                    "Simulate monsoon rainfall surge in ResQ Twin"
                ]
            }

        if "mandi" in q_lower or "beas" in q_lower:
            mandi_habs = db.query(Habitation).filter(Habitation.district.ilike("%Mandi%")).all()
            return {
                "intent": "EXPLAIN_REGION_MANDI",
                "response": (
                    "🌲 **Mandi & Beas River Valley (Himachal Pradesh)**\n\n"
                    "Mandi is characterized by steep young-Himalayan gorges prone to cloudburst-induced flash floods and highway breaches along NH-21.\n"
                    f"- **Active Monitored Locations:** {', '.join([h.name for h in mandi_habs])}\n"
                    "- **Primary Threat Vectors:** Torrential cloudbursts, Pandoh dam reservoir backflow, and rockfall along river cutbanks."
                ),
                "structured_data": [
                    {"id": h.id, "name": h.name, "hazard": h.primary_hazard_type, "risk": h.risk_category}
                    for h in mandi_habs
                ],
                "suggested_actions": ["Which routes are currently risky?", "Check safe shelter carrying capacity"]
            }

        if "raigad" in q_lower or "irshalwadi" in q_lower or "mahad" in q_lower:
            raigad_habs = db.query(Habitation).filter(Habitation.district.ilike("%Raigad%")).all()
            return {
                "intent": "EXPLAIN_REGION_RAIGAD",
                "response": (
                    "🌊 **Raigad District (Maharashtra) — Konkan Coastal Slope Instability**\n\n"
                    "Scene of the historic Irshalwadi landslide disaster. Sits along the steep Western Ghats escarpment where high-intensity "
                    "monsoon precipitation triggers rotational slope slides on fragile basaltic colluvium.\n"
                    f"- **Monitored Sectors:** {', '.join([h.name for h in raigad_habs]) or 'Irshalwadi Relocation Colony, Khalapur, Mahad River Basin'}."
                ),
                "suggested_actions": ["Show all Critical Priority 1 habitations across India", "Open Relocation Engine to optimize evacuation"]
            }

        if "dhemaji" in q_lower or "assam" in q_lower or "brahmaputra" in q_lower:
            dhemaji_habs = db.query(Habitation).filter(Habitation.district.ilike("%Dhemaji%")).all()
            return {
                "intent": "EXPLAIN_REGION_DHEMAJI",
                "response": (
                    "🌧️ **Dhemaji & Brahmaputra Basin (Assam) — Severe Riverine Flood Grid**\n\n"
                    "Dhemaji experiences chronic embankment breaches and flood siltation from the Brahmaputra, Jiadhal, and Subansiri rivers.\n"
                    f"- **Monitored Settlements:** {', '.join([h.name for h in dhemaji_habs])}\n"
                    "- **Special Focus in ResQZone:** Raised stilt community shelters and boat-accessible evacuation corridors."
                ),
                "suggested_actions": ["Which shelters have available safe capacity?", "Show critical habitations with capacity shortage"]
            }

        if "darjeeling" in q_lower or "teesta" in q_lower or "mirik" in q_lower:
            darj_habs = db.query(Habitation).filter(Habitation.district.ilike("%Darjeeling%")).all()
            return {
                "intent": "EXPLAIN_REGION_DARJEELING",
                "response": (
                    "🍵 **Darjeeling & Teesta Basin (West Bengal) — High Relief Hill Slope Instability**\n\n"
                    "Vulnerable to intense GLOF surges from upstream Sikkim lakes down the Teesta gorge, combined with "
                    "tea-garden hill slope instability around Mirik and Kalimpong.\n"
                    f"- **Monitored Settlements:** {', '.join([h.name for h in darj_habs])}"
                ),
                "suggested_actions": ["Which routes are currently risky?", "What is a red zone and how is it calculated?"]
            }

        # --- F. DISASTER CONCEPTS & METHODOLOGY ---
        if "what is a red zone" in q_lower or "red zone" in q_lower and ("what" in q_lower or "how" in q_lower or "criteria" in q_lower or "defined" in q_lower or "calculate" in q_lower):
            return {
                "intent": "EXPLAIN_RED_ZONE",
                "response": (
                    "🔴 **Hazard-Based Red Zones Defined:**\n\n"
                    "Under **NDMA & GSI criteria**, a **Red Zone** is a geographically delineated sector where the probability "
                    "and consequence of imminent disaster exceed the critical survival threshold, requiring **mandatory immediate evacuation**.\n\n"
                    "**Identification Formula in ResQZone:**\n"
                    "A settlement is designated as a Red Zone when its composite risk score exceeds **0.75** based on 4 weighted vectors:\n"
                    "1. **Terrain Slope & Topography (30%):** Slope > 30° on unconsolidated soil or fault lines.\n"
                    "2. **InSAR Subsidence / Soil Saturation (30%):** Satellite radar displacement > 5 mm/month or precipitation > 150% baseline.\n"
                    "3. **Structural Fragility (20%):** High percentage of non-engineered mud/stone masonry dwellings.\n"
                    "4. **Social Vulnerability Index (20%):** High proportion of elderly, infants, and mobility-impaired residents."
                ),
                "structured_data": {
                    "threshold": "Score >= 0.75",
                    "action_required": "Priority 1 Mandatory Relocation within 12 Hours",
                    "methodology": "Multi-Criteria Decision Analysis (MCDA) with InSAR Grounding"
                },
                "suggested_actions": [
                    "Show all Critical Priority 1 habitations across India",
                    "Why is Sunil Ward marked as Critical Priority 1?",
                    "Open Relocation Engine to optimize evacuation"
                ]
            }

        if "carrying capacity" in q_lower or "sphere" in q_lower or "bottleneck" in q_lower or "humanitarian standard" in q_lower:
            return {
                "intent": "EXPLAIN_CARRYING_CAPACITY",
                "response": (
                    "🏢 **Humanitarian Carrying Capacity (Sphere & WHO Standards):**\n\n"
                    "Unlike naive disaster apps that simply count floor area or beds, ResQZone implements **Constrained Multi-Resource Bottleneck Evaluation** "
                    "adhering to the **Sphere Handbook (2018)**:\n\n"
                    "$$\\text{Effective Capacity} = \\min(\\text{Floor Space}, \\text{Water Supply}, \\text{Sanitation}, \\text{Food Rations})$$\n\n"
                    "**The 4 Non-Negotiable Standards:**\n"
                    "1. 💧 **Clean Water:** Minimum **15 Liters per person per day** for drinking and basic hygiene.\n"
                    "2. 🚽 **Sanitation:** Maximum **20 persons per functioning toilet** (gender-segregated).\n"
                    "3. 🍞 **Food Nutrition:** Minimum **2,100 kcal per person per day** in relief food supplies.\n"
                    "4. 🛏️ **Living Space:** Minimum **3.5 m² of covered floor space per person**.\n\n"
                    "If a facility has 1,000 beds but clean water for only 400 people, its **Effective Safe Capacity is strictly capped at 400** to prevent deadly cholera or disease outbreaks."
                ),
                "structured_data": {
                    "water_standard": "15 Liters / person / day",
                    "toilet_standard": "1 toilet / 20 persons",
                    "nutrition_standard": "2,100 kcal / person / day",
                    "area_standard": "3.5 m² covered space / person"
                },
                "suggested_actions": [
                    "Which shelters can absorb 300 evacuees?",
                    "Check safe shelter carrying capacity in the dashboard",
                    "Show critical habitations with capacity shortage"
                ]
            }

        if "resq twin" in q_lower or "digital twin" in q_lower or "what if" in q_lower or "simulation" in q_lower:
            return {
                "intent": "EXPLAIN_DIGITAL_TWIN",
                "response": (
                    "⚡ **ResQ Twin — Counterfactual Shock Simulation Engine:**\n\n"
                    "ResQ Twin is an adaptive digital twin that allows emergency commanders to ask **'What If?'** questions before disaster strikes:\n\n"
                    "**Supported Shock Injections:**\n"
                    "- 🚧 **Highway Closure:** Perturb key arterial corridors (e.g. NH-07 debris slide) to test automated detour calculation.\n"
                    "- 🏥 **Shelter Offline:** Simulate structural damage taking a central relief camp offline to test overflow redistribution.\n"
                    "- 🌧️ **Precipitation Surge:** Inject 50% to 150% rainfall spikes to observe expanding hazard polygons in real time.\n"
                    "- 🚰 **Resource Ruptures:** Cut water or electricity supply by 50% to observe the instantaneous drop in shelter carrying capacity.\n\n"
                    "The system outputs a 3-column comparative audit: **Baseline Benchmark &rarr; Shock Scenario &rarr; Stress Delta**."
                ),
                "suggested_actions": [
                    "Simulate road evacuation in ResQ Twin",
                    "Which routes are currently risky?",
                    "Which shelters can absorb 300 evacuees?"
                ]
            }

        if "dijkstra" in q_lower or ("routing" in q_lower and ("how" in q_lower or "algorithm" in q_lower or "work" in q_lower or "formula" in q_lower)):
            return {
                "intent": "EXPLAIN_ROUTING_ALGORITHM",
                "response": (
                    "🛣️ **ResQZone Evacuation Routing Engine:**\n\n"
                    "ResQZone uses an augmented **Dijkstra Multi-Objective Shortest Path Algorithm** with dynamic hazard penalties:\n\n"
                    "$$\\text{Cost}(e) = w_1 \\cdot \\text{Distance}(e) + w_2 \\cdot \\text{TravelTime}(e) + w_3 \\cdot \\text{HazardRisk}(e) + \\text{Penalty}_{\\text{blocked}}$$\n\n"
                    "**Supported Navigation Modes:**\n"
                    "- 🛡️ **Safest Route:** Prioritizes corridors with minimal landslide/flood buffer exposure ($w_3 = 0.70$).\n"
                    "- ⚡ **Fastest Route:** Minimizes evacuation transit time using high-capacity paved arterial highways ($w_2 = 0.70$).\n"
                    "- ⚖️ **Balanced Route:** Balances transit speed with safe stand-off distances from active debris flows ($w_1=0.33, w_2=0.33, w_3=0.34$)."
                ),
                "suggested_actions": [
                    "Which routes are currently risky?",
                    "Open Relocation Engine to optimize evacuation",
                    "Simulate road evacuation in ResQ Twin"
                ]
            }

        if any(w in q_lower for w in ["insar", "sentinel", "bhuvan", "satellite", "remote sensing", "radar displacement", "deformation"]):
            return {
                "intent": "EXPLAIN_SATELLITE_DATA",
                "response": (
                    "🛰️ **Satellite Remote Sensing & InSAR Displacement Feeds:**\n\n"
                    "ResQZone integrates multi-constellation Earth Observation data to identify ground movement before catastrophic failure:\n\n"
                    "- 📡 **ESA Sentinel-1 C-band SAR:** Provides Interferometric Synthetic Aperture Radar (InSAR) surface deformation measurements at millimeter precision with a 12-day revisit cycle.\n"
                    "- 🛰️ **ISRO Bhuvan Geo-Portal:** High-resolution Indian National Satellite feeds for landslide hazard zonation (LHZ), drainage vectors, and geomorphic classifications.\n"
                    "- 🌧️ **IMD Doppler Weather Radar & GPM IMERG:** Real-time convective precipitation tracking to monitor cumulative 24h/72h rainfall thresholds.\n"
                    "- 🌿 **Sentinel-2 Multispectral:** Normalized Difference Vegetation Index (NDVI) and Soil Moisture indices to assess hill slope saturation."
                ),
                "suggested_actions": [
                    "What is a red zone and how is it calculated?",
                    "Why is Chamoli so vulnerable to disasters?",
                    "Show all Critical Priority 1 habitations across India"
                ]
            }

        # --- G. SPECIFIC HABITATION RISK QUERIES ---
        hab_match = re.search(r"(?:why is|tell me about|info on|details of|risk in|status of|about)\s+([a-zA-Z\s]+?)(?:\s+(?:marked|critical|vulnerable|safe|at|score|risk|\?|$))", q_lower)
        target_name = None
        if hab_match:
            target_name = hab_match.group(1).strip()
        else:
            all_hab_names = [h.name.lower() for h in db.query(Habitation.name).all()]
            for name in all_hab_names:
                if len(name) > 3 and name in q_lower:
                    target_name = name
                    break

        if target_name:
            hab = db.query(Habitation).filter(Habitation.name.ilike(f"%{target_name}%")).first()
            if hab:
                drivers_summary = ""
                if hab.meta_attributes:
                    try:
                        meta = json.loads(hab.meta_attributes) if isinstance(hab.meta_attributes, str) else hab.meta_attributes
                        if isinstance(meta, dict):
                            drivers = meta.get("drivers") or meta.get("evidence_panel", {}).get("drivers") or []
                            if drivers and isinstance(drivers, list):
                                drivers_summary = ", ".join([f"{d.get('factor')}: {d.get('impact')}" for d in drivers if isinstance(d, dict)])
                    except Exception:
                        pass
                if not drivers_summary:
                    drivers_summary = f"Terrain slope {hab.slope_degrees}°, housing fragility {hab.housing_fragility_score:.2f}, road access distance {hab.road_access_distance_m}m"

                return {
                    "intent": "EXPLAIN_HABITATION_RISK",
                    "matched_entity": hab.name,
                    "response": (
                        f"📍 **{hab.name} ({hab.district}) — Risk Stratum: {hab.risk_category}**\n\n"
                        f"- **Hazard Risk Index:** **{hab.hazard_score:.2f} / 1.00** ({hab.primary_hazard_type})\n"
                        f"- **Total Population:** **{hab.total_population:,} residents**\n"
                        f"- **High-Dependency Vulnerable Cohort:** **{hab.vulnerable_population:,} persons** ({round(hab.vulnerable_population / max(1, hab.total_population) * 100)}% dependent)\n"
                        f"- **Terrain Slope & Elevation:** {hab.slope_degrees}° steep slope at {hab.elevation_meters}m altitude\n"
                        f"- **Housing Fragility:** {hab.housing_fragility_score * 100:.0f}% vulnerable masonry\n"
                        f"- **Identified Geotechnical Drivers:** {drivers_summary}\n\n"
                        f"**Operational Recommendation:** {'Immediate relocation to safe relief bases required within 12h.' if hab.risk_category == 'CRITICAL' else 'Maintain slope sensor surveillance and issue preparatory advisories.'}"
                    ),
                    "structured_data": {
                        "habitation_id": hab.id,
                        "name": hab.name,
                        "district": hab.district,
                        "risk_score": hab.hazard_score,
                        "category": hab.risk_category,
                        "population": hab.total_population,
                        "vulnerable_population": hab.vulnerable_population,
                        "slope": f"{hab.slope_degrees}°"
                    },
                    "suggested_actions": [
                        f"Locate {hab.name} on Interactive GIS Map",
                        "Compute evacuation path for this settlement",
                        "Which shelters can absorb these evacuees?"
                    ]
                }

        # --- H. SPECIFIC SHELTER QUERIES ---
        target_shelter = None
        all_shelters = db.query(Shelter).all()
        for s in all_shelters:
            s_name_lower = s.name.lower()
            if s_name_lower in q_lower or (len(q_lower) > 5 and q_lower in s_name_lower):
                target_shelter = s
                break
            key_words = [w for w in re.findall(r"[a-zA-Z]{4,}", s_name_lower) if w not in {"relief", "camp", "base", "safe", "center", "school", "hall", "town", "govt"}]
            if key_words and any(w in q_lower for w in key_words) and any(term in q_lower for term in ["shelter", "hall", "camp", "center", "school", "base", "about", "capacity"]):
                target_shelter = s
                break

        if target_shelter:
            s = target_shelter
            free_slots = max(0, s.effective_safe_capacity - s.current_occupancy)
            return {
                "intent": "EXPLAIN_SHELTER_DETAIL",
                "matched_entity": s.name,
                "response": (
                    f"🏢 **{s.name} ({s.district}) — Shelter Carrying Capacity Audit**\n\n"
                    f"- **Operational Status:** **{s.operating_status}** ({'🟢 OPEN' if s.is_open else '🔴 CLOSED'})\n"
                    f"- **Safe Effective Capacity (Sphere-Capped):** **{s.effective_safe_capacity:,} persons** (Rated: {s.rated_capacity})\n"
                    f"- **Current Headroom:** **{free_slots:,} available slots** ({s.current_occupancy} currently sheltering)\n"
                    f"- **Limiting Bottleneck:** **{s.bottleneck_resource.upper()}**\n"
                    f"- **Clean Water Supply:** {s.water_capacity_lpd:,.0f} L/day ({round(s.water_capacity_lpd / 15):,} people by Sphere 15L standard)\n"
                    f"- **Sanitation Facilities:** {s.sanitation_units} gender-segregated units ({s.sanitation_units * 20:,} people by Sphere 1:20 standard)\n"
                    f"- **Food Rations:** {s.food_capacity_meals_per_day:,.0f} meals/day\n"
                    f"- **Emergency Facilities:** {s.medical_isolation_beds} isolation beds | Power Backup: {'✅ Present' if s.power_backup else '❌ None'}"
                ),
                "structured_data": {
                    "id": s.id,
                    "name": s.name,
                    "district": s.district,
                    "capacity": s.effective_safe_capacity,
                    "occupancy": s.current_occupancy,
                    "bottleneck": s.bottleneck_resource
                },
                "suggested_actions": [
                    "Which routes to this shelter are safe?",
                    "Open Relocation Engine to optimize evacuation",
                    "Check safe shelter carrying capacity in the dashboard"
                ]
            }

        # --- I. "SHOW CRITICAL HABITATIONS" / "WHO IS IN DANGER?" ---
        if any(w in q_lower for w in ["critical", "danger", "priority 1", "highest risk", "vulnerable village", "hazard zones", "settlements with immediate"]):
            critical_habs = db.query(Habitation).filter(Habitation.risk_category == "CRITICAL").all()
            total_vuln = sum(h.vulnerable_population for h in critical_habs)
            total_pop = sum(h.total_population for h in critical_habs)

            lines = [
                f"- **{h.name}** ({h.district}): Score **{h.hazard_score:.2f}** | Pop: {h.total_population:,} ({h.vulnerable_population:,} vulnerable) | Hazard: {h.primary_hazard_type}"
                for h in critical_habs
            ]

            return {
                "intent": "LIST_CRITICAL_HABITATIONS",
                "response": (
                    f"⚠️ **Identified {len(critical_habs)} Critical Priority 1 Habitations Across Monitored Theaters:**\n\n"
                    f"Total population in active red zones is **{total_pop:,} residents**, including **{total_vuln:,} high-dependency vulnerable citizens**:\n\n"
                    + "\n".join(lines)
                    + "\n\n*Immediate bipartite relocation plans have been calculated in the Relocation Engine.*"
                ),
                "structured_data": [
                    {"id": h.id, "name": h.name, "district": h.district, "hazard_score": h.hazard_score, "vulnerable_pop": h.vulnerable_population}
                    for h in critical_habs
                ],
                "suggested_actions": [
                    "Open Relocation Engine to optimize evacuation",
                    "Which shelters can absorb these evacuees?",
                    "Dispatch Critical Alert to DEOC responders"
                ]
            }

        # --- J. "WHICH SHELTERS CAN ABSORB [X] PEOPLE?" / SHELTER CAPACITY ---
        if any(w in q_lower for w in ["shelter", "absorb", "capacity", "relief camp", "refuge"]):
            num_match = re.search(r"(\d+)\s*(?:people|persons|evacuees)?", q_lower)
            needed_capacity = int(num_match.group(1)) if num_match else 200

            shelters = db.query(Shelter).filter(Shelter.is_open == True).all()
            capable = []
            for s in shelters:
                avail = max(0, s.effective_safe_capacity - s.current_occupancy)
                if avail >= needed_capacity:
                    capable.append((s, avail))

            capable.sort(key=lambda x: x[1], reverse=True)

            if capable:
                summary_lines = [
                    f"- **{s.name}** ({s.district}): **{avail:,} available safe slots** (Ceiling: {s.effective_safe_capacity} | Bottleneck: **{s.bottleneck_resource.upper()}**)"
                    for s, avail in capable[:7]
                ]
                return {
                    "intent": "QUERY_SHELTER_CAPACITY",
                    "response": (
                        f"🏢 **Found {len(capable)} Relief Bases with Headroom for at least {needed_capacity:,} Evacuees:**\n\n"
                        + "\n".join(summary_lines)
                        + f"\n\n*All capacities are strictly capped by Sphere minimum water (15L) and sanitation (1:20) limits.*"
                    ),
                    "structured_data": [
                        {"id": s.id, "name": s.name, "district": s.district, "available_capacity": avail, "bottleneck": s.bottleneck_resource}
                        for s, avail in capable
                    ],
                    "suggested_actions": [
                        "Check safe shelter carrying capacity in the dashboard",
                        "Assign evacuees using Relocation Optimizer",
                        "Which routes to these shelters are safe?"
                    ]
                }
            else:
                return {
                    "intent": "QUERY_SHELTER_CAPACITY",
                    "response": (
                        f"⚠️ No single open shelter currently has **{needed_capacity:,} unoccupied spots** in reserve.\n"
                        f"The **Relocation Optimizer** automatically distributes evacuees across multiple neighboring relief bases to prevent humanitarian overcrowding."
                    ),
                    "structured_data": [],
                    "suggested_actions": ["Open Relocation Engine to optimize evacuation", "Run ResQ Twin to evaluate shock distribution"]
                }

        # --- K. "WHICH ROUTES ARE RISKY OR BLOCKED?" ---
        if any(w in q_lower for w in ["route", "road", "highway", "blocked", "corridor", "transit", "mountain road"]):
            risky_roads = db.query(RoadSegment).filter(
                (RoadSegment.hazard_exposure_score >= 0.50) | (RoadSegment.is_blocked == True)
            ).all()

            road_lines = [
                f"- **{r.name}**: Risk Score **{r.hazard_exposure_score:.2f}** ({'🚨 BLOCKED: ' + (r.blocked_reason or 'Closure') if r.is_blocked else '⚠️ High Landslide / Inundation Hazard'})"
                for r in risky_roads[:6]
            ]

            return {
                "intent": "QUERY_ROUTE_RISK",
                "response": (
                    f"🛣️ **Identified {len(risky_roads)} High-Risk or Compromised Evacuation Corridors:**\n\n"
                    + "\n".join(road_lines)
                    + "\n\n*The Dijkstra routing engine automatically routes evacuation convoys around these compromised segments.*"
                ),
                "structured_data": [
                    {"id": r.id, "name": r.name, "risk": r.hazard_exposure_score, "is_blocked": r.is_blocked}
                    for r in risky_roads
                ],
                "suggested_actions": [
                    "Calculate alternate evacuation path",
                    "Simulate road breach in ResQ Twin",
                    "Locate on Interactive GIS Map"
                ]
            }

        # --- L. "WHAT ALERTS ARE ACTIVE?" ---
        if any(w in q_lower for w in ["alert", "warning", "notification", "broadcast", "sitrep"]):
            alerts = db.query(Alert).order_by(Alert.created_at.desc()).limit(5).all()
            if alerts:
                alert_lines = [
                    f"- **[{a.severity}] {a.title}** ({a.target_area}): {a.recommended_action}"
                    for a in alerts
                ]
                return {
                    "intent": "QUERY_ALERTS",
                    "response": (
                        f"📢 **Active Emergency Alerts & DEOC Broadcasts ({len(alerts)} Recent):**\n\n"
                        + "\n".join(alert_lines)
                    ),
                    "structured_data": [
                        {"id": a.id, "title": a.title, "severity": a.severity, "target": a.target_area}
                        for a in alerts
                    ],
                    "suggested_actions": ["Dispatch new emergency alert", "Generate official NDRF SITREP report"]
                }

        # --- M. INTELLIGENT SEMANTIC FALLBACK FOR ANY NATURAL LANGUAGE QUESTION ---
        # Search if any entity is referenced or answer general query with live statistics
        hab_count = db.query(Habitation).count()
        critical_count = db.query(Habitation).filter(Habitation.risk_category == "CRITICAL").all()
        shelter_count = db.query(Shelter).count()
        open_shelters = db.query(Shelter).filter(Shelter.is_open == True).all()
        total_safe_cap = sum(s.effective_safe_capacity for s in open_shelters)
        total_people = db.query(func.sum(Habitation.total_population)).scalar() or 0

        # Look for partial word matches across habitations
        words = [w for w in re.split(r"\W+", q_lower) if len(w) > 3]
        matched_hab = None
        for w in words:
            matched_hab = db.query(Habitation).filter(Habitation.name.ilike(f"%{w}%")).first()
            if matched_hab:
                break

        if matched_hab:
            return {
                "intent": "SEMANTIC_HABITATION_MATCH",
                "response": (
                    f"📍 **{matched_hab.name} ({matched_hab.district})**\n\n"
                    f"- **Classification:** **{matched_hab.risk_category} Priority** (Risk Score: **{matched_hab.hazard_score:.2f}**)\n"
                    f"- **Primary Hazard Threat:** {matched_hab.primary_hazard_type}\n"
                    f"- **Population Exposed:** {matched_hab.total_population:,} residents ({matched_hab.vulnerable_population:,} vulnerable)\n"
                    f"- **Terrain Profile:** Slope {matched_hab.slope_degrees}°, altitude {matched_hab.elevation_meters}m\n\n"
                    f"**Operational Status:** {'Immediate evacuation order issued.' if matched_hab.immediate_relocation_needed else 'Under continuous sensor and weather radar surveillance.'}"
                ),
                "suggested_actions": [
                    f"Locate {matched_hab.name} on Interactive GIS Map",
                    "Which shelters can absorb these evacuees?",
                    "What are Sphere humanitarian standards?"
                ]
            }

        return {
            "intent": "GENERAL_DISASTER_INTELLIGENCE",
            "response": (
                f"🛡️ **ResQZone Operational Intelligence Response:**\n\n"
                f"Regarding **'{query}'**:\n\n"
                f"In the context of the monitored multi-hazard theaters across India:\n"
                f"- **Active Habitations:** **{hab_count} communities** monitored across Chamoli, Wayanad, Mandi, Raigad, Dhemaji, and Darjeeling.\n"
                f"- **Critical Red Zones:** **{len(critical_count)} habitations** are currently in high-risk zones requiring immediate relocation plans.\n"
                f"- **Humanitarian Logistics:** **{shelter_count} designated safe relief camps** provide **{total_safe_cap:,} verified beds**, strictly constrained by Sphere water (15L/day) and sanitation limits.\n"
                f"- **Evacuation Networks:** Mountain corridors are monitored via real-time risk penalties to prevent dispatching convoys through active debris or inundation zones.\n\n"
                f"You can ask about any specific location (e.g. *'Sunil Ward'*, *'Wayanad'*), shelter capacity, road blockage, or NDMA safety guidelines."
            ),
            "suggested_actions": [
                "Why is Sunil Ward marked as Critical Priority 1?",
                "Which shelters can absorb 300 evacuees?",
                "What should people do during a landslide?",
                "What are Sphere humanitarian standards?"
            ]
        }


copilot_engine = AICopilotEngine()
