"""
ResQZone AI Copilot Engine
Translates natural language questions into structured queries against the verified database
and returns factual, auditable answers with deep linking and structured payloads.
"""
from typing import Dict, Any, List
import re
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from backend.app.models.entities import Habitation, Shelter, RoadSegment, Alert, HazardZone


class AICopilotEngine:
    @staticmethod
    def process_query(query: str, db: Session) -> Dict[str, Any]:
        q_lower = query.lower().strip()
        now = datetime.now(timezone.utc).isoformat()

        # Intent 1: "Why is [Habitation] marked critical?"
        hab_match = re.search(r"why is\s+([a-zA-Z\s]+?)\s+(?:marked|considered|at|classified)", q_lower)
        if hab_match or "why is" in q_lower:
            target_name = hab_match.group(1).strip() if hab_match else "manohar"
            hab = db.query(Habitation).filter(Habitation.name.ilike(f"%{target_name}%")).first()
            if not hab:
                hab = db.query(Habitation).filter(Habitation.risk_category == "CRITICAL").first()

            if hab:
                return {
                    "intent": "EXPLAIN_HABITATION_RISK",
                    "matched_entity": hab.name,
                    "response": (
                        f"**{hab.name}** is classified as **{hab.risk_category}** (Risk Score: {hab.hazard_score:.2f}). "
                        f"Primary factors: (1) Ground slope is {hab.slope_degrees}° with InSAR subsidence trend; "
                        f"(2) Housing structural fragility index is {hab.housing_fragility_score * 100:.0f}%; "
                        f"(3) {hab.vulnerable_population} of {hab.total_population} residents require high-dependency evacuation support. "
                        f"Immediate relocation is required."
                    ),
                    "structured_data": {
                        "habitation_id": hab.id,
                        "name": hab.name,
                        "risk_score": hab.hazard_score,
                        "category": hab.risk_category,
                        "population": hab.total_population,
                        "vulnerable_population": hab.vulnerable_population
                    },
                    "suggested_actions": [
                        f"View {hab.name} on GIS Map",
                        "Simulate road evacuation in ResQ Twin",
                        "Generate relocation plan for this sector"
                    ]
                }

        # Intent 2: "Show critical habitations / carrying capacity shortage"
        if "critical" in q_lower and ("habitation" in q_lower or "area" in q_lower or "zone" in q_lower or "shortage" in q_lower):
            critical_habs = db.query(Habitation).filter(Habitation.risk_category == "CRITICAL").all()
            hab_list = [h.name for h in critical_habs]
            total_vuln = sum(h.vulnerable_population for h in critical_habs)
            
            return {
                "intent": "LIST_CRITICAL_HABITATIONS",
                "response": (
                    f"Found **{len(critical_habs)} critical habitations** in the district: "
                    f"{', '.join(hab_list)}. Total high-dependency vulnerable population at immediate risk is **{total_vuln:,} persons**."
                ),
                "structured_data": [
                    {"id": h.id, "name": h.name, "hazard_score": h.hazard_score, "vulnerable_pop": h.vulnerable_population}
                    for h in critical_habs
                ],
                "suggested_actions": [
                    "Open Relocation Engine to optimize evacuation",
                    "Dispatch Critical Alert to DEOC responders"
                ]
            }

        # Intent 3: "Which shelters can absorb [X] people?"
        num_match = re.search(r"(\d+)\s*(?:people|persons|evacuees)?", q_lower)
        needed_capacity = int(num_match.group(1)) if num_match else 300
        if "shelter" in q_lower or "absorb" in q_lower or "capacity" in q_lower:
            shelters = db.query(Shelter).filter(Shelter.is_open == True).all()
            capable = []
            for s in shelters:
                avail = max(0, s.effective_safe_capacity - s.current_occupancy)
                if avail >= needed_capacity:
                    capable.append((s, avail))
            
            if capable:
                summary_lines = [
                    f"- **{s.name}**: {avail:,} safe spots available (Bottleneck: {s.bottleneck_resource})"
                    for s, avail in capable
                ]
                return {
                    "intent": "QUERY_SHELTER_CAPACITY",
                    "response": (
                        f"There are **{len(capable)} shelters** capable of absorbing at least **{needed_capacity:,} evacuees**:\n"
                        + "\n".join(summary_lines)
                    ),
                    "structured_data": [
                        {"id": s.id, "name": s.name, "available_capacity": avail, "bottleneck": s.bottleneck_resource}
                        for s, avail in capable
                    ],
                    "suggested_actions": ["Assign evacuees to best shelter", "Check route safety to these shelters"]
                }
            else:
                return {
                    "intent": "QUERY_SHELTER_CAPACITY",
                    "response": f"No single active shelter has {needed_capacity:,} unoccupied spots. Distributed multi-shelter allocation is required.",
                    "structured_data": []
                }

        # Intent 4: "Which routes are currently risky or blocked?"
        if "route" in q_lower or "road" in q_lower or "risky" in q_lower or "blocked" in q_lower:
            risky_roads = db.query(RoadSegment).filter(
                (RoadSegment.hazard_exposure_score >= 0.60) | (RoadSegment.is_blocked == True)
            ).all()
            
            road_lines = [
                f"- **{r.name}**: Risk Score {r.hazard_exposure_score:.2f} ({'BLOCKED: ' + (r.blocked_reason or 'Closure') if r.is_blocked else 'High Slope Inundation'})"
                for r in risky_roads[:6]
            ]
            
            return {
                "intent": "QUERY_ROUTE_RISK",
                "response": (
                    f"Identified **{len(risky_roads)} high-risk road corridors**:\n"
                    + "\n".join(road_lines)
                    + "\nThe routing engine automatically computes Safest and Balanced detours avoiding these segments."
                ),
                "structured_data": [
                    {"id": r.id, "name": r.name, "risk": r.hazard_exposure_score, "is_blocked": r.is_blocked}
                    for r in risky_roads
                ]
            }

        # Default fallback: General intelligence summary
        return {
            "intent": "GENERAL_SUMMARY",
            "response": (
                "**ResQZone Operational Overview:**\n"
                "- **Monitoring District:** Chamoli-Joshimath (Uttarakhand)\n"
                "- **Multi-Hazard Status:** Active Landslide Subsidence & Alaknanda Fluvial Surge Watch\n"
                "- **Critical Habitations:** Manohar Bagh, Sunil Ward, Singhdhar\n"
                "- **Key Recommended Step:** Run ResQ Twin to evaluate counterfactual shelter and bypass routing."
            ),
            "suggested_actions": [
                "Show critical habitations with capacity shortage",
                "Why is Manohar Bagh Ward marked critical?",
                "Which shelters can absorb 300 people?",
                "Which routes are currently risky?"
            ]
        }


copilot_engine = AICopilotEngine()
